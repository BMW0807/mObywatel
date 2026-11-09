# -*- coding: utf-8 -*-
"""Serwer prototypu: pliki statyczne z ../mockup + API agenta, rozpoznawania mowy i syntezy mowy.
Uruchomienie: python3 server.py [port]   (domyślnie 8790)"""
import gzip, ipaddress, mimetypes, re, json, os, sys, time, uuid, threading, urllib.request, urllib.error, traceback
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, unquote
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('application/manifest+json', '.webmanifest')
mimetypes.add_type('application/manifest+json', '.json')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

def wczytaj_env(sciezka):
    """Wczytuje plik .env (KLUCZ=wartość) do zmiennych środowiskowych; nie nadpisuje już ustawionych."""
    if not os.path.exists(sciezka): return
    with open(sciezka, encoding='utf-8') as f:
        for linia in f:
            linia = linia.strip()
            if not linia or linia.startswith('#') or '=' not in linia: continue
            nazwa, wartosc = linia.split('=', 1)
            nazwa, wartosc = nazwa.strip(), wartosc.strip().strip('"').strip("'")
            if nazwa and wartosc and nazwa not in os.environ: os.environ[nazwa] = wartosc
wczytaj_env(os.path.join(os.path.dirname(HERE), '.env'))   # przed importem agenta, bo on czyta zmienne przy starcie

import agent, tlumacz

ROOT = os.environ.get('MOCKUP') or os.path.join(os.path.dirname(HERE), 'mockup')
LOG = os.environ.get('AGENT_LOG') or os.path.join(HERE, 'agent.log')
_lock = threading.Lock()
KEYS = {}
TTS_CACHE = {}
BLOKADA = os.path.join(HERE, 'BLOKADA')
ODDAJ = 'Oddaj klucz'
def zablokowane(): return os.path.exists(BLOKADA)
def k(name):
    if name == 'zgodny':
        if zablokowane() or not agent.ZGODNY_MODEL: return None
        return os.environ.get('MODEL_API_KEY') or (k('openai') if agent.ZGODNY_BAZA == agent.OPENAI_BAZA_DOMYSLNA else None) or 'bez-klucza'
    if zablokowane():
        KEYS.clear(); return None
    if name not in KEYS or (not KEYS[name] and time.time() - KEYS.get(name + '@t', 0) > 60):   # brak klucza sprawdzamy raz na minutę
        KEYS[name + '@t'] = time.time()
        KEYS[name] = agent.klucz({'anthropic': 'anthropic_api_key', 'openai': 'openai_api_key', 'elevenlabs': 'elevenlabs_api_key'}[name], {'anthropic': 'ANTHROPIC_API_KEY', 'openai': 'OPENAI_API_KEY', 'elevenlabs': 'ELEVENLABS_API_KEY'}[name])
    return KEYS[name]

_RE_PESEL = re.compile(r'\b\d{11}\b')
_RE_EMAIL = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')
_RE_DOWOD = re.compile(r'\b[A-Z]{3}\s?\d{6}\b')
_RE_KLUCZ = re.compile(r'\b(?:nvapi-|sk-)[A-Za-z0-9_-]{8,}')
_RE_TEL = re.compile(r'(?<!\d)(?:\+?48[\s-]?)?(?:\d{3}[\s-]?){2}\d{3}(?!\d)')

def zanonimizuj(w):
    """Usuwa z wartości potencjalne dane osobowe i klucze przed zapisem do dziennika."""
    if os.environ.get('LOG_DEBUG_PII') == '1': return w
    if isinstance(w, str):
        s = _RE_KLUCZ.sub('[KLUCZ]', w)
        s = _RE_PESEL.sub('[PESEL]', s)
        s = _RE_EMAIL.sub('[EMAIL]', s)
        s = _RE_DOWOD.sub('[DOWOD]', s)
        s = _RE_TEL.sub('[TEL]', s)
        return s
    if isinstance(w, dict): return {k_: zanonimizuj(v_) for k_, v_ in w.items()}
    if isinstance(w, list): return [zanonimizuj(v_) for v_ in w]
    return w

def log(x):
    x = zanonimizuj(dict(x, ts=time.strftime('%Y-%m-%d %H:%M:%S')))
    with _lock:
        with open(LOG, 'a', encoding='utf-8') as f: f.write(json.dumps(x, ensure_ascii=False) + '\n')

# --- limit żądań API (ochrona przed przeciążeniem i nadużyciem klucza) ---
RATE_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW') or 60)
RATE_LIMIT_AI = int(os.environ.get('RATE_LIMIT_AI') or 25)
RATE_LIMIT_API = int(os.environ.get('RATE_LIMIT_API') or 120)
# znak mObywatela odpytuje serwer co ok. 1 s z każdej karty (telefon i ekran komputera w jednej sieci to już ~110/min),
# a nie korzysta z kluczy API, więc ma osobny, wyższy limit zamiast zjadać wspólny
RATE_LIMIT_ZNAK = int(os.environ.get('RATE_LIMIT_ZNAK') or 600)
_rate_lock = threading.Lock()
RATE_BUCKETS = {}

def sprawdz_limit(ip, koszyk='api'):
    limit = {'ai': RATE_LIMIT_AI, 'znak': RATE_LIMIT_ZNAK}.get(koszyk, RATE_LIMIT_API)
    if limit <= 0: return True, 0
    now = time.time()
    klucz_ip = '%s:%s' % (koszyk, ip or 'local')
    with _rate_lock:
        if len(RATE_BUCKETS) > 2000:
            stare = [k_ for k_, czasy in RATE_BUCKETS.items() if not czasy or now - czasy[-1] > RATE_WINDOW]
            for k_ in stare: RATE_BUCKETS.pop(k_, None)
        czasy = [t for t in RATE_BUCKETS.get(klucz_ip, []) if now - t < RATE_WINDOW]
        if len(czasy) >= limit:
            RATE_BUCKETS[klucz_ip] = czasy
            retry = max(1, int(RATE_WINDOW - (now - czasy[0])) + 1)
            return False, retry
        czasy.append(now)
        RATE_BUCKETS[klucz_ip] = czasy
        return True, 0

MAX_JSON_BODY = int(os.environ.get('MAX_JSON_BODY') or 262144)
MAX_AUDIO_BODY = int(os.environ.get('MAX_AUDIO_BODY') or 6 * 1024 * 1024)
GZIP_EXTS = {'.html', '.css', '.js', '.svg', '.json', '.txt', '.webmanifest', '.xml'}
CACHE_LONG_EXTS = {'.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff2', '.woff'}
GZIP_CACHE = {}

class PayloadZaDuzy(Exception): pass
class ZlyJSON(Exception): pass
class BrakKlucza(Exception): pass

ROLE = ('user', 'assistant')
def _blok_ok(b):
    if not isinstance(b, dict): return False
    t = b.get('type')
    if t == 'text': return isinstance(b.get('text'), str)
    if t == 'tool_use': return isinstance(b.get('id'), str) and isinstance(b.get('name'), str) and isinstance(b.get('input', {}), dict)
    if t == 'tool_result': return isinstance(b.get('tool_use_id'), str)
    return False
def wiadomosci(x):
    """Historia rozmowy od klienta: tylko obiekty {role, content} z tekstem albo listą poprawnych bloków (inaczej agent wywraca się na KeyError)."""
    if not isinstance(x, list): return []
    out = []
    for m in x:
        if not isinstance(m, dict) or m.get('role') not in ROLE: continue
        c = m.get('content')
        if isinstance(c, list): c = [b for b in c if _blok_ok(b)]
        elif not isinstance(c, str): continue
        out.append(dict(role=m['role'], content=c))
    return out

# --- znak mObywatela: każde urządzenie pokazuje zmieniający się żeton; kto go zeskanuje, przekazuje dane jego właścicielowi ---
ZN = {'devs': {}, 'skrz': {}, 'skan': {}}
def zn_clean():
    t = time.time()
    for d in [d for d, v in ZN['devs'].items() if t - v['t'] > 120]:
        ZN['devs'].pop(d, None); ZN['skrz'].pop(d, None); ZN['skan'].pop(d, None)
def zn_kto(tok, dev):
    now = time.time()
    for d, v in ZN['devs'].items():
        if d == dev or now - v['t'] > 15: continue
        if v['token'] == tok or (v.get('prev') == tok and now - v['tt'] < 60): return d, v
    return None, None

STT_MODEL = os.environ.get('STT_MODEL', 'gpt-4o-mini-transcribe')
TTS_MODEL = os.environ.get('TTS_MODEL', 'gpt-4o-mini-tts')
TTS_VOICE = os.environ.get('TTS_VOICE', 'coral')
TTS_INSTR = ('Mów po polsku, z naturalną polską wymową i akcentem, bez obcego akcentu. Ton: spokojna, życzliwa urzędniczka, '
             'która konkretnie pomaga. Tempo umiarkowane, wyraźnie wymawiaj liczby, daty i numery.')
STT_PROMPT = 'Rozmowa z asystentem mObywatel. Słownictwo: mObywatel, mDowód, PESEL, KDR, Karta Dużej Rodziny, OC, CEPiK, e-Doręczenia, ZUS, 800 plus, mStłuczka, PCC, Face ID, Toyota, Warta, Skoda, Transporter, Fiat Panda, Golf, legitymacja, mandat, VAT, JPK.'

# ElevenLabs: głos i rozpoznawanie mowy; bez klucza, bez głosu albo po błędzie (np. skończone kredyty) wracamy do OpenAI
EL_VOICE = os.environ.get('EL_VOICE', 'H3IcxEgdFxIEJAqMc0Bc')   # Joanna (Voice Library, polski); wymaga doładowanego konta
EL_TTS_MODEL = os.environ.get('EL_TTS_MODEL', 'eleven_flash_v2_5')   # Flash: najtańszy i najszybszy; jakość: eleven_multilingual_v2
EL_STT_MODEL = os.environ.get('EL_STT_MODEL', 'scribe_v2')
EL_KEYTERMS = ['mObywatel', 'mDowód', 'PESEL', 'Karta Dużej Rodziny', 'CEPiK', 'e-Doręczenia', 'ZUS', '800 plus', 'mStłuczka', 'Face ID']
EL_PRZERWA = 900   # po błędzie ElevenLabs tyle sekund idziemy prosto do OpenAI
EL_STOP = {}
def el_ok(co): return bool(k('elevenlabs')) and time.time() > EL_STOP.get(co, 0) and (co != 'tts' or EL_VOICE)
def el_pobierz(req):
    for i in range(2):   # połączenie z ElevenLabs potrafi się zerwać przy nawiązywaniu, wtedy jedna ponowna próba
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read()
        except urllib.error.HTTPError: raise
        except (urllib.error.URLError, ConnectionError, OSError):
            if i: raise
def el_blad(co, e):
    EL_STOP[co] = time.time() + EL_PRZERWA
    msg = e.read().decode('utf-8', 'replace')[:300] if isinstance(e, urllib.error.HTTPError) else str(e)
    log(dict(t='el_err', co=co, code=getattr(e, 'code', None), msg=msg))

def multipart(fields, files):
    b = uuid.uuid4().hex
    out = b''
    for n, v in fields.items():
        for v in (v if isinstance(v, list) else [v]):
            out += ('--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, n, v)).encode()
    for n, (fn, ct, data) in files.items():
        out += ('--%s\r\nContent-Disposition: form-data; name="%s"; filename="%s"\r\nContent-Type: %s\r\n\r\n' % (b, n, fn, ct)).encode() + data + b'\r\n'
    out += ('--%s--\r\n' % b).encode()
    return out, 'multipart/form-data; boundary=' + b

def stt(data, ctype, lang='pl'):
    """Zwraca (tekst, dostawca)."""
    c = ctype.lower()
    ext = next((e for k_, e in [('webm', 'webm'), ('mp4', 'mp4'), ('m4a', 'm4a'), ('aac', 'm4a'), ('ogg', 'ogg'), ('mpeg', 'mp3'), ('mp3', 'mp3'), ('wav', 'wav')] if k_ in c), 'webm')
    kod = (tlumacz.JEZYKI.get(lang) or tlumacz.JEZYKI['pl'])[2]
    plik = {'file': ('nagranie.' + ext, ctype.split(';')[0] or 'audio/webm', data)}
    if el_ok('stt'):
        pola = {'model_id': EL_STT_MODEL, 'tag_audio_events': 'false', 'keyterms': EL_KEYTERMS}
        if kod: pola['language_code'] = kod
        body, ct = multipart(pola, plik)
        req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': k('elevenlabs'), 'Content-Type': ct})
        try:
            return json.loads(el_pobierz(req)).get('text', '').strip(), 'elevenlabs'
        except Exception as e: el_blad('stt', e)
    klucz = k('openai')
    if not klucz: raise BrakKlucza('rozpoznawanie mowy jest chwilowo niedostępne (błąd ElevenLabs, brak klucza OpenAI)')
    pola = {'model': STT_MODEL, 'prompt': STT_PROMPT if lang == 'pl' else 'mObywatel, mDowód, PESEL, ZUS, CEPiK, Face ID', 'response_format': 'json'}
    if kod: pola['language'] = kod
    body, ct = multipart(pola, plik)
    req = urllib.request.Request('https://api.openai.com/v1/audio/transcriptions', data=body, headers={'Authorization': 'Bearer ' + klucz, 'Content-Type': ct})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read()).get('text', '').strip(), 'openai'

def tts(text, lang='pl'):
    """Zwraca (mp3, dostawca)."""
    if el_ok('tts'):
        d = dict(text=text[:3500], model_id=EL_TTS_MODEL, apply_text_normalization='on')
        if 'multilingual_v2' not in EL_TTS_MODEL: d['language_code'] = lang
        req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_64' % EL_VOICE, data=json.dumps(d).encode(),
                                     headers={'xi-api-key': k('elevenlabs'), 'Content-Type': 'application/json'})
        try:
            return el_pobierz(req), 'elevenlabs'
        except Exception as e: el_blad('tts', e)
    klucz = k('openai')
    if not klucz: raise BrakKlucza('synteza mowy jest chwilowo niedostępna (błąd ElevenLabs, brak klucza OpenAI)')
    ins = TTS_INSTR if lang == 'pl' or lang not in tlumacz.JEZYKI else ('Speak %s with natural native pronunciation and accent. Tone: calm, friendly public-service clerk who helps concretely. Moderate pace; pronounce numbers, dates and codes clearly. Polish names and addresses: pronounce them the Polish way.' % tlumacz.JEZYKI[lang][0])
    body = json.dumps(dict(model=TTS_MODEL, voice=TTS_VOICE, input=text[:3500], instructions=ins, response_format='mp3')).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, headers={'Authorization': 'Bearer ' + klucz, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read(), 'openai'

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=ROOT, **kw)
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        if not getattr(self, '_cc_set', False) and not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def klient_ip(self):
        raw_ip = (self.client_address[0] if self.client_address else '') or 'local'
        try:
            ip_obj = ipaddress.ip_address(raw_ip)
            zaufany = ip_obj.is_loopback or ip_obj.is_private
        except ValueError:
            zaufany = raw_ip in ('localhost', 'local')
        if zaufany:
            xff = (self.headers.get('X-Forwarded-For') or '').split(',')[0].strip()
            if xff: return xff[:64]
            xri = (self.headers.get('X-Real-IP') or '').strip()
            if xri: return xri[:64]
        return raw_ip[:64]
    def _write_safe(self, data):
        try: self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError): pass
    def js(self, obj, code=200, extra_headers=None, head_only=False):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self._cc_set = True
        if extra_headers:
            for hk, hv in extra_headers.items(): self.send_header(hk, str(hv))
        self.end_headers()
        if not head_only: self._write_safe(b)
    def body(self, limit=None):
        lim = MAX_JSON_BODY if limit is None else limit
        try: n = int(self.headers.get('Content-Length') or 0)
        except ValueError: raise ZlyJSON('Nieprawidłowy nagłówek Content-Length')
        if n < 0: n = 0
        if lim and n > lim: raise PayloadZaDuzy('Przekroczono dopuszczalny rozmiar żądania (%d B)' % lim)
        return self.rfile.read(n) if n else b''
    def json_body(self, limit=None):
        raw = self.body(limit)
        if not raw: return {}
        try: d = json.loads(raw)
        except (ValueError, UnicodeDecodeError): raise ZlyJSON('Nieprawidłowy format JSON')
        if not isinstance(d, dict): raise ZlyJSON('Oczekiwano obiektu JSON')
        return d
    def serwer_statyczny(self, rel_path, query='', head_only=False):
        root_real = os.path.realpath(ROOT)
        clean = os.path.normpath(unquote(rel_path).lstrip('/\\'))
        if clean in ('', '.'): clean = 'index.html'
        fpath = os.path.realpath(os.path.join(root_real, clean))
        if fpath != root_real and not fpath.startswith(root_real + os.sep):
            return self.js(dict(error='brak dostępu'), 403, head_only=head_only)
        if os.path.isdir(fpath):
            fpath = os.path.join(fpath, 'index.html')
        if not os.path.isfile(fpath):
            return self.js(dict(error='nie znaleziono pliku'), 404, head_only=head_only)
        st = os.stat(fpath)
        ext = os.path.splitext(fpath)[1].lower()
        etag = '"%x-%x"' % (st.st_mtime_ns, st.st_size)
        has_v = 'v=' in (query or '')
        if ext == '.html':
            cache_ctl = 'no-cache'
        elif ext in CACHE_LONG_EXTS:
            cache_ctl = 'public, max-age=31536000, immutable' if has_v else 'public, max-age=604800, stale-while-revalidate=86400'
        else:
            cache_ctl = 'public, max-age=604800, immutable' if has_v else 'public, max-age=3600, stale-while-revalidate=86400'
        inm = self.headers.get('If-None-Match') or ''
        if inm:
            tagi = [t.strip().removeprefix('W/') for t in inm.split(',') if t.strip()]
            if '*' in tagi or etag in tagi:
                self.send_response(304)
                self.send_header('ETag', etag)
                self.send_header('Cache-Control', cache_ctl)
                self._cc_set = True
                if ext in GZIP_EXTS: self.send_header('Vary', 'Accept-Encoding')
                self.end_headers()
                return
        with open(fpath, 'rb') as f: data = f.read()
        accept_gz = 'gzip' in (self.headers.get('Accept-Encoding') or '').lower()
        use_gz = False
        if accept_gz and ext in GZIP_EXTS and len(data) >= 256:
            ck = (fpath, st.st_mtime_ns, st.st_size)
            gz = GZIP_CACHE.get(ck)
            if gz is None:
                gz = gzip.compress(data, compresslevel=6)
                if len(GZIP_CACHE) > 256: GZIP_CACHE.clear()
                GZIP_CACHE[ck] = gz
            if len(gz) < len(data):
                data = gz
                use_gz = True
        ctype = mimetypes.guess_type(fpath)[0] or 'application/octet-stream'
        if ctype.startswith('text/') or ctype in ('application/javascript', 'text/javascript', 'application/json', 'image/svg+xml'):
            if 'charset=' not in ctype: ctype += '; charset=utf-8'
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        if use_gz: self.send_header('Content-Encoding', 'gzip')
        if ext in GZIP_EXTS: self.send_header('Vary', 'Accept-Encoding')
        self.send_header('ETag', etag)
        self.send_header('Cache-Control', cache_ctl)
        self._cc_set = True
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        if not head_only: self._write_safe(data)
    def _obsluz_get(self, head_only=False):
        u = urlparse(self.path)
        p, q = u.path, u.query
        if p == '/api/health':
            if zablokowane():
                return self.js(dict(ok=True, status='ok', agent=True, stt=True, tts=False, provider='brak', model='brak', blokada=True), head_only=head_only)
            prov = agent.PROVIDER
            glos = bool(k('openai') or k('elevenlabs'))
            return self.js(dict(ok=True, status='ok', agent=bool(k(prov)), stt=glos, tts=bool(k('openai') or el_ok('tts')), provider=prov,
                                glos=dict(stt='elevenlabs' if el_ok('stt') else 'openai', tts='elevenlabs' if el_ok('tts') else 'openai'),
                                model=agent.OPENAI_MODEL if prov == 'openai' else agent.ZGODNY_MODEL if prov == 'zgodny' else (agent._model_ok or agent.MODELE[0])), head_only=head_only)
        if p in ('/api/i18n', '/api/i18n.js'):
            from urllib.parse import parse_qs
            lang = (parse_qs(q).get('lang') or ['pl'])[0]
            d = tlumacz.slownik(lang) if lang in tlumacz.JEZYKI and lang != 'pl' else {}
            if p == '/api/i18n': return self.js(dict(lang=lang, t=d), head_only=head_only)
            b = ('window.I18N=%s;window.__i18nStart&&window.__i18nStart();' % json.dumps(d, ensure_ascii=False)).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self._cc_set = True
            self.send_header('Content-Length', str(len(b)))
            self.end_headers()
            if not head_only: self._write_safe(b)
            return
        if p == '/api/znak/kto':
            from urllib.parse import parse_qs
            qp = parse_qs(q)
            try: tok = int((qp.get('t') or ['-1'])[0])
            except ValueError: tok = -1
            dev = (qp.get('dev') or [''])[0]
            with _lock:
                d, v = zn_kto(tok, dev)
                if d: ZN['skan'][d] = time.time()
            log(dict(t='znak_kto', ok=bool(d), kind=v and v['kind'], cel=v and v.get('cel')))
            if not d: return self.js(dict(dev=None), head_only=head_only)
            return self.js(dict(dev=d, kind=v['kind'], kto=v.get('kto'), cel=v.get('cel'), zakres=v.get('zakres')), head_only=head_only)
        if p == '/v2' or p.startswith('/v2/'):
            self.send_response(301); self.send_header('Location', '/'); self.end_headers(); return
        if p in ('/komputer', '/komputer/'): p = '/komputer.html'
        elif p in ('/aplikacja', '/aplikacja/'): p = '/index.html'
        return self.serwer_statyczny(p, q, head_only=head_only)
    def _get_bezpiecznie(self, head_only):
        try: return self._obsluz_get(head_only=head_only)
        except ValueError:   # np. bajt NUL w ścieżce pliku: os.path i open() zgłaszają ValueError
            return self.js(dict(error='nieprawidłowy adres'), 400, head_only=head_only)
    def do_GET(self): return self._get_bezpiecznie(False)
    def do_HEAD(self): return self._get_bezpiecznie(True)
    def do_POST(self):
        p = urlparse(self.path).path
        try:
            koszyk = 'ai' if p in ('/api/agent', '/api/stt', '/api/tts') else ('znak' if p.startswith('/api/znak/') else 'api')
            ok_lim, retry = sprawdz_limit(self.klient_ip(), koszyk)
            if not ok_lim:
                log(dict(t='rate_limit', path=p, koszyk=koszyk, retry=retry))
                return self.js(dict(error='Zbyt wiele żądań — odczekaj %d s i spróbuj ponownie.' % retry, retry_after=retry), 429, extra_headers={'Retry-After': str(retry)})
            if p == '/api/agent':
                req = self.json_body(MAX_JSON_BODY)
                msgs_in = wiadomosci(req.get('messages'))
                if not isinstance(req.get('stan'), dict): req['stan'] = None
                if not isinstance(req.get('confirm'), dict) or not isinstance(req['confirm'].get('id'), str): req['confirm'] = None
                if not isinstance(req.get('osoba'), str): req['osoba'] = None
                if not isinstance(req.get('lang'), str): req['lang'] = 'pl'
                if zablokowane():
                    msgs = msgs_in + [{'role': 'assistant', 'content': [{'type': 'text', 'text': ODDAJ}]}]
                    log(dict(t='blokada', path=p))
                    return self.js(dict(messages=msgs, stan=req.get('stan'), events=[dict(t='text', html=ODDAJ, plain=ODDAJ)], czeka=None))
                if not k(agent.PROVIDER): return self.js(dict(error='brak klucza API modelu'), 503)
                if not msgs_in: return self.js(dict(error='brak wiadomości w rozmowie'), 400)
                t0 = time.time()
                user = msgs_in[-1] if msgs_in and isinstance(msgs_in[-1], dict) else None
                u_txt = user.get('content') if user and isinstance(user.get('content'), str) else ''
                log(dict(t='req', osoba=req.get('osoba'), conv=req.get('conv'), msgs_n=len(msgs_in), user_chars=len(u_txt), has_confirm=bool(req.get('confirm'))))
                msgs, stan, events, czeka = agent.run(msgs_in, req.get('stan'), req.get('confirm'), {'anthropic': k('anthropic') if agent.PROVIDER == 'anthropic' else None, 'openai': k('openai'), 'zgodny': k('zgodny') if agent.PROVIDER == 'zgodny' else None}, lambda x: log(dict(x, conv=req.get('conv'))), osoba=req.get('osoba'), jezyk=req.get('lang') or 'pl')
                log(dict(t='resp', conv=req.get('conv'), ms=int((time.time() - t0) * 1000), events=[e.get('t') for e in events], czeka=czeka))
                return self.js(dict(messages=msgs, stan=stan, events=events, czeka=czeka))
            if p == '/api/i18n/brak':
                req = self.json_body(60000); lang = req.get('lang')
                if not isinstance(lang, str) or lang not in tlumacz.JEZYKI or lang == 'pl': return self.js(dict(t={}))
                teksty = req.get('teksty') if isinstance(req.get('teksty'), list) else []
                teksty = [str(x)[:700] for x in teksty][:150]
                d = tlumacz.przetlumacz(lang, teksty)   # tylko słownik; braki trafiają do rejestru, bez tłumaczenia maszynowego
                log(dict(t='i18n', lang=lang, n=len(teksty), brak=len(teksty) - len(d)))
                return self.js(dict(t=d))
            if p == '/api/znak/beat':
                req = self.json_body(16384); dev = str(req.get('dev', ''))[:40]
                try: tok = int(req.get('token')) & 0xffff
                except (TypeError, ValueError, OverflowError): return self.js(dict(error='zly zeton'), 400)
                with _lock:
                    zn_clean(); now = time.time(); v = ZN['devs'].get(dev)
                    zajety = any(d != dev and now - w['t'] < 15 and tok in (w['token'], w.get('prev')) for d, w in ZN['devs'].items())
                    if v is None: v = ZN['devs'][dev] = dict(token=tok, prev=None, tt=now)
                    elif v['token'] != tok: v['prev'], v['token'], v['tt'] = v['token'], tok, now
                    v.update(t=now, kind='web' if req.get('kind') == 'web' else 'telefon', kto=str(req.get('kto') or '')[:80], cel=req.get('cel'), zakres=req.get('zakres'))
                    otrz = ZN['skrz'].pop(dev, [])
                    skanuje = now - ZN['skan'].get(dev, 0) < 45
                    if otrz: ZN['skan'].pop(dev, None)
                return self.js(dict(otrzymane=otrz, skanuje=skanuje and not otrz, zmien=zajety))
            if p == '/api/znak/przekaz':
                req = self.json_body(20000); to = req.get('to')
                if not isinstance(to, str): return self.js(dict(ok=False, error='odbiorca niedostepny'), 404)
                with _lock:
                    if to not in ZN['devs']: return self.js(dict(ok=False, error='odbiorca niedostepny'), 404)
                    ZN['skrz'].setdefault(to, []).append(dict(ok=bool(req.get('ok')), dane=req.get('dane') if req.get('ok') else None, t=time.time()))
                    kind = ZN['devs'][to].get('kind')   # odczyt pod blokadą: urządzenie może zniknąć po zn_clean() w innym wątku
                log(dict(t='znak_przekaz', ok=bool(req.get('ok')), kind=kind))
                return self.js(dict(ok=True))
            if p == '/api/glos':   # diagnostyka nagrań porzuconych w przeglądarce (cisza, brak mikrofonu)
                raw = self.body(4096)[:2000]
                try: d = json.loads(raw or b'{}')
                except ValueError: d = {}
                if not isinstance(d, dict): d = {}
                log(dict({k_: d[k_] for k_ in list(d)[:12] if isinstance(k_, str) and k_ not in ('t', 'ts')}, t='glos_diag'))
                return self.js(dict(ok=True))
            if p == '/api/stt':
                data = self.body(MAX_AUDIO_BODY)
                if zablokowane(): return self.js(dict(text='Nagranie głosowe'))
                if not (k('openai') or el_ok('stt')): return self.js(dict(error='brak klucza do rozpoznawania mowy'), 503)
                if not data: return self.js(dict(error='puste nagranie'), 400)
                from urllib.parse import parse_qs
                lang = (parse_qs(urlparse(self.path).query).get('lang') or ['pl'])[0]
                t0 = time.time(); txt, kto = stt(data, self.headers.get('Content-Type') or 'audio/webm', lang if lang in tlumacz.JEZYKI else 'pl')
                try: diag = json.loads(self.headers.get('X-Glos') or '{}')
                except ValueError: diag = None
                log(dict(t='stt', ms=int((time.time() - t0) * 1000), bytes=len(data), chars=len(txt), kto=kto, ctype=self.headers.get('Content-Type'), diag=diag))
                return self.js(dict(text=txt))
            if p == '/api/tts':
                req = self.json_body(32768)
                if zablokowane(): return self.js(dict(error='blokada'), 503)
                if not (k('openai') or el_ok('tts')): return self.js(dict(error='brak klucza do syntezy mowy'), 503)
                t0 = time.time(); txt = str(req.get('text') or '').strip()
                if not txt: return self.js(dict(error='brak tekstu do odczytania'), 400)
                lang = req.get('lang') if isinstance(req.get('lang'), str) and req.get('lang') in tlumacz.JEZYKI else 'pl'
                data, kto = TTS_CACHE.get((lang, txt)), 'cache'
                if data is None:
                    data, kto = tts(txt, lang)
                    if len(TTS_CACHE) > 300: TTS_CACHE.clear()
                    TTS_CACHE[(lang, txt)] = data
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Cache-Control', 'no-store')
                self._cc_set = True
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self._write_safe(data)
                log(dict(t='tts', ms=int((time.time() - t0) * 1000), chars=len(txt), bytes=len(data), kto=kto))
                return
            self.js(dict(error='nie ma takiego adresu'), 404)
        except PayloadZaDuzy as e:
            log(dict(t='payload_limit', path=p, msg=str(e)))
            self.js(dict(error=str(e)), 413)
        except ZlyJSON as e:
            self.js(dict(error=str(e)), 400)
        except BrakKlucza as e:
            self.js(dict(error=str(e)), 503)
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:400]; log(dict(t='err', path=p, code=e.code, msg=msg)); self.js(dict(error=msg), 502)
        except Exception as e:
            log(dict(t='err', path=p, msg=str(e), tb=traceback.format_exc()[-800:])); self.js(dict(error=str(e)), 500)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT') or 8790)
    host = os.environ.get('HOST') or '127.0.0.1'
    try:
        import wiedza; threading.Thread(target=wiedza._wczytaj, daemon=True).start()   # baza kart gov.pl wczytuje się w tle (kilka sekund)
    except Exception as e: print('wiedza:', e)
    srv = ThreadingHTTPServer((host, port), H)
    print('mObywatel: http://%s:%d  (pliki: %s)' % ('127.0.0.1' if host in ('0.0.0.0', '::') else host, port, ROOT), flush=True)
    srv.serve_forever()
