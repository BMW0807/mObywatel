# -*- coding: utf-8 -*-
"""Testy automatyczne endpointów /api/health, /api/agent, limitu żądań, anonimizacji logów i kompresji/cache assetów.
Uruchomienie: python3 -m unittest discover -s serwer -p "test_*.py" -v"""
import gzip
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import server
import agent


class ApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmpdir = tempfile.TemporaryDirectory()
        cls.orig_log = server.LOG
        cls.orig_blokada = server.BLOKADA
        cls.orig_provider = agent.PROVIDER
        cls.orig_zgodny_model = agent.ZGODNY_MODEL
        cls.orig_rate_ai = server.RATE_LIMIT_AI
        cls.orig_rate_api = server.RATE_LIMIT_API

        server.LOG = os.path.join(cls._tmpdir.name, 'test_agent.log')
        server.BLOKADA = os.path.join(cls._tmpdir.name, 'BLOKADA_BRAK')

        cls.httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.H)
        cls.port = cls.httpd.server_address[1]
        cls.base = f'http://127.0.0.1:{cls.port}'
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        server.LOG = cls.orig_log
        server.BLOKADA = cls.orig_blokada
        agent.PROVIDER = cls.orig_provider
        agent.ZGODNY_MODEL = cls.orig_zgodny_model
        server.RATE_LIMIT_AI = cls.orig_rate_ai
        server.RATE_LIMIT_API = cls.orig_rate_api
        cls._tmpdir.cleanup()

    def setUp(self):
        server.RATE_BUCKETS.clear()
        server.RATE_LIMIT_AI = 50
        server.RATE_LIMIT_API = 200
        server.BLOKADA = os.path.join(self._tmpdir.name, 'BLOKADA_BRAK')
        if os.path.exists(server.LOG):
            os.remove(server.LOG)
        agent.PROVIDER = 'zgodny'
        agent.ZGODNY_MODEL = 'test-model'

    def request(self, path, method='GET', data=None, headers=None):
        hdrs = dict(headers or {})
        raw = None
        if data is not None:
            if isinstance(data, (dict, list)):
                raw = json.dumps(data, ensure_ascii=False).encode('utf-8')
                hdrs.setdefault('Content-Type', 'application/json')
            elif isinstance(data, str):
                raw = data.encode('utf-8')
            else:
                raw = data
        req = urllib.request.Request(self.base + path, data=raw, headers=hdrs, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, dict(r.headers), r.read()
        except urllib.error.HTTPError as e:
            with e:
                return e.code, dict(e.headers), e.read()

    def test_health_get_and_head(self):
        status, headers, body = self.request('/api/health')
        self.assertEqual(status, 200)
        self.assertIn('application/json', headers.get('Content-Type', ''))
        self.assertEqual(headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(headers.get('Referrer-Policy'), 'same-origin')
        payload = json.loads(body.decode('utf-8'))
        self.assertTrue(payload.get('ok'))
        self.assertEqual(payload.get('status'), 'ok')
        self.assertEqual(payload.get('provider'), 'zgodny')
        self.assertEqual(payload.get('model'), 'test-model')
        self.assertTrue(payload.get('agent'))
        self.assertIn('stt', payload)
        self.assertIn('tts', payload)

        h_status, h_headers, h_body = self.request('/api/health', method='HEAD')
        self.assertEqual(h_status, 200)
        self.assertEqual(h_body, b'')
        self.assertGreater(int(h_headers.get('Content-Length', '0')), 10)

    def test_health_and_agent_blokada(self):
        blok = os.path.join(self._tmpdir.name, 'BLOKADA_AKTYWNA')
        with open(blok, 'w', encoding='utf-8') as f:
            f.write('1')
        server.BLOKADA = blok

        status, _, body = self.request('/api/health')
        self.assertEqual(status, 200)
        h = json.loads(body.decode('utf-8'))
        self.assertTrue(h.get('ok'))
        self.assertTrue(h.get('blokada'))

        a_status, _, a_body = self.request(
            '/api/agent',
            method='POST',
            data={'messages': [{'role': 'user', 'content': 'Cześć'}], 'osoba': 'marta'},
        )
        self.assertEqual(a_status, 200)
        resp = json.loads(a_body.decode('utf-8'))
        self.assertEqual(resp['events'][0]['plain'], server.ODDAJ)

    def test_agent_missing_key_returns_503(self):
        agent.ZGODNY_MODEL = ''  # wymusza brak klucza dla providera 'zgodny'
        status, _, body = self.request(
            '/api/agent',
            method='POST',
            data={'messages': [{'role': 'user', 'content': 'Sprawdź dowód'}], 'osoba': 'marta'},
        )
        self.assertEqual(status, 503)
        err = json.loads(body.decode('utf-8'))
        self.assertIn('brak klucza', err.get('error', ''))

    def test_agent_conversation_tool_confirm_and_no_pii_in_logs(self):
        secret_pesel = '91071427765'
        secret_phrase = f'Tajna wiadomość z numerem PESEL {secret_pesel} i mailem jan.kowalski@example.com'
        call_idx = {'n': 0}

        def fake_llm(messages, keys, log_fn):
            call_idx['n'] += 1
            if call_idx['n'] == 1:
                return {
                    'content': [
                        {'type': 'text', 'text': 'Przygotowałam kartę zastrzeżenia numeru PESEL.'},
                        {'type': 'tool_use', 'id': 'tu_pesel_1', 'name': 'zastrzez_pesel', 'input': {}},
                    ]
                }
            return {
                'content': [
                    {'type': 'text', 'text': 'Twój numer PESEL został **zastrzeżony**.'},
                ]
            }

        with mock.patch.object(agent, 'llm', side_effect=fake_llm):
            # Krok 1: prośba użytkownika -> karta potwierdzenia
            st1, _, b1 = self.request(
                '/api/agent',
                method='POST',
                data={
                    'conv': 1,
                    'osoba': 'marta',
                    'messages': [{'role': 'user', 'content': secret_phrase}],
                },
            )
            self.assertEqual(st1, 200)
            r1 = json.loads(b1.decode('utf-8'))
            self.assertEqual(r1.get('czeka'), 'potwierdzenie')
            typy1 = [e.get('t') for e in r1.get('events', [])]
            self.assertIn('text', typy1)
            self.assertIn('confirm', typy1)

            # Krok 2: potwierdzenie Face ID -> wykonanie akcji w rejestrze
            st2, _, b2 = self.request(
                '/api/agent',
                method='POST',
                data={
                    'conv': 1,
                    'osoba': 'marta',
                    'messages': r1['messages'],
                    'stan': r1['stan'],
                    'confirm': {'id': 'tu_pesel_1', 'ok': True},
                },
            )
            self.assertEqual(st2, 200)
            r2 = json.loads(b2.decode('utf-8'))
            self.assertIsNone(r2.get('czeka'))
            self.assertTrue(str(r2['stan'].get('pesel', '')).startswith('zastrzeżony'))
            typy2 = [e.get('t') for e in r2.get('events', [])]
            self.assertIn('card', typy2)
            self.assertIn('text', typy2)

        # Weryfikacja bezpieczeństwa logów: brak treści wiadomości i PESEL w agent.log
        with open(server.LOG, encoding='utf-8') as f:
            log_txt = f.read()
        self.assertNotIn(secret_pesel, log_txt)
        self.assertNotIn('Tajna wiadomość', log_txt)
        self.assertNotIn('jan.kowalski@example.com', log_txt)

    def test_agent_validation_400_and_413(self):
        st_bad, _, _ = self.request(
            '/api/agent',
            method='POST',
            data='{niepoprawny-json',
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(st_bad, 400)

        st_list, _, _ = self.request('/api/agent', method='POST', data=[1, 2, 3])
        self.assertEqual(st_list, 400)

        orig_max = server.MAX_JSON_BODY
        server.MAX_JSON_BODY = 128
        try:
            st_big, _, _ = self.request(
                '/api/agent',
                method='POST',
                data={'messages': [{'role': 'user', 'content': 'x' * 500}]},
            )
            self.assertEqual(st_big, 413)
        finally:
            server.MAX_JSON_BODY = orig_max

    def test_rate_limit_returns_429_and_retry_after(self):
        server.RATE_LIMIT_AI = 2
        agent.ZGODNY_MODEL = ''  # szybki 503 bez wywołania zewnętrznego LLM
        s1, _, _ = self.request('/api/agent', method='POST', data={'messages': []})
        s2, _, _ = self.request('/api/agent', method='POST', data={'messages': []})
        s3, h3, b3 = self.request('/api/agent', method='POST', data={'messages': []})
        self.assertEqual(s1, 503)
        self.assertEqual(s2, 503)
        self.assertEqual(s3, 429)
        self.assertTrue(int(h3.get('Retry-After', '0')) >= 1)
        err = json.loads(b3.decode('utf-8'))
        self.assertIn('Zbyt wiele żądań', err.get('error', ''))

    def test_static_gzip_cache_etag_and_aplikacja(self):
        # /aplikacja serwuje index.html skompresowany gzip
        st_app, h_app, b_app = self.request('/aplikacja', headers={'Accept-Encoding': 'gzip'})
        self.assertEqual(st_app, 200)
        self.assertEqual(h_app.get('Content-Encoding'), 'gzip')
        self.assertEqual(h_app.get('Cache-Control'), 'no-cache')
        html_txt = gzip.decompress(b_app).decode('utf-8')
        self.assertIn('<title>mObywatel</title>', html_txt)

        # Wersjonowany CSS dostaje immutable cache + ETag + 304 Not Modified
        st_css, h_css, b_css = self.request('/style.css?v=27', headers={'Accept-Encoding': 'gzip'})
        self.assertEqual(st_css, 200)
        self.assertEqual(h_css.get('Content-Encoding'), 'gzip')
        self.assertIn('immutable', h_css.get('Cache-Control', ''))
        etag = h_css.get('ETag')
        self.assertTrue(etag)
        self.assertIn(':root', gzip.decompress(b_css).decode('utf-8'))

        st_304, _, b_304 = self.request('/style.css?v=27', headers={'If-None-Match': etag})
        self.assertEqual(st_304, 304)
        self.assertEqual(b_304, b'')

        # Lekki obraz WebP z nagłówkiem cache
        st_wp, h_wp, b_wp = self.request('/assets/mdowod-ekran.webp')
        self.assertEqual(st_wp, 200)
        self.assertEqual(h_wp.get('Content-Type'), 'image/webp')
        self.assertIn('max-age=604800', h_wp.get('Cache-Control', ''))
        self.assertLess(len(b_wp), 100 * 1024)

    def test_zanonimizuj_scrubs_sensitive_tokens(self):
        raw = {
            'msg': 'PESEL 91071427765, dowód ABC 123456, tel +48 600 700 800, mail a@b.pl, klucz nvapi-1234567890abcdef'
        }
        clean = server.zanonimizuj(raw)['msg']
        self.assertNotIn('91071427765', clean)
        self.assertNotIn('ABC 123456', clean)
        self.assertNotIn('600 700 800', clean)
        self.assertNotIn('a@b.pl', clean)
        self.assertNotIn('nvapi-1234567890abcdef', clean)
        self.assertIn('[PESEL]', clean)
        self.assertIn('[KLUCZ]', clean)


if __name__ == '__main__':
    unittest.main()
