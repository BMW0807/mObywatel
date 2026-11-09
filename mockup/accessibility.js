/* ---------- mObywatel.ai - Ułatwienia dostępu, Szybki Pulpit i UPO ---------- */

// --- 1. Magazyn Stanu Użytkownika (LocalStorage) ---
const MobStore = {
  prefix: () => `mob_${OS.id}_`,
  get(key, fallback) {
    try {
      const v = localStorage.getItem(this.prefix() + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(this.prefix() + key, JSON.stringify(val));
    } catch (e) {}
  },
  reset() {
    try {
      const p = this.prefix();
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(p)) localStorage.removeItem(k);
      });
      localStorage.removeItem('mob_large_text');
      localStorage.removeItem('mob_high_contrast');
    } catch (e) {}
  },

  // Stan PESEL: domyślnie jak w rejestrze tej osoby (Jan ma PESEL zastrzeżony od 02.2025, pozostali nie)
  isPeselBlocked() {
    return this.get('pesel_blocked', !!(typeof OS !== 'undefined' && OS.pesel_zastrz));
  },
  setPeselBlocked(val) {
    this.set('pesel_blocked', !!val);
    if (typeof updateDashboard === 'function') updateDashboard();
  },

  // Stan Podatków: domyślnie false (nieopłacony)
  isTaxPaid() {
    return this.get('tax_paid', false);
  },
  setTaxPaid(val) {
    this.set('tax_paid', !!val);
    if (typeof updateDashboard === 'function') updateDashboard();
  },

  // Historia urzędowa (UPO)
  getHistory() {
    return this.get('upo_history', []);
  },
  addUPO(item) {
    const hist = this.getHistory();
    const upoCode = 'UPO/' + new Date().getFullYear() + '/' + 
      String(new Date().getMonth() + 1).padStart(2, '0') + '/' + 
      String(new Date().getDate()).padStart(2, '0') + '/' + 
      Math.floor(100000 + Math.random() * 900000);
    const entry = {
      id: 'case_' + Date.now(),
      upo: upoCode,
      ts: Date.now(),
      dateStr: today() + ' ' + nowS(),
      title: item.title || 'Załatwiona sprawa urzędowa',
      source: item.source || 'Ministerstwo Cyfryzacji / Rejestry Państwowe',
      rows: item.rows || [],
      details: item.details || ''
    };
    hist.unshift(entry);
    this.set('upo_history', hist.slice(0, 30));
    return entry;
  },

  // Historia błędów asystenta AI (wspólna w przeglądarce)
  getAiErrors() {
    try {
      const raw = localStorage.getItem('mob_ai_errors');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  },
  addAiError(item) {
    const list = this.getAiErrors();
    const cleanPrompt = String(item.prompt || '').replace(/\b\d{11}\b/g, '[PESEL]').slice(0, 90);
    const entry = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      ts: Date.now(),
      dateStr: today() + ' ' + nowS(),
      code: item.code || 'Błąd połączenia',
      message: String(item.message || 'Nie udało się połączyć z asystentem AI.').slice(0, 240),
      endpoint: item.endpoint || '/api/agent',
      osoba: (typeof OS !== 'undefined' && OS) ? `${OS.imie} ${OS.nazwisko}` : '',
      prompt: cleanPrompt
    };
    list.unshift(entry);
    try {
      localStorage.setItem('mob_ai_errors', JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
    if (typeof updateErrorBadge === 'function') updateErrorBadge();
    return entry;
  },
  clearAiErrors() {
    try { localStorage.removeItem('mob_ai_errors'); } catch (e) {}
    if (typeof updateErrorBadge === 'function') updateErrorBadge();
  }
};

// --- 1b. Czytniki ekranu (aria-live) oraz zarządzanie fokusem i klawiaturą ---
function announceSR(msg, assertive = false) {
  if (!msg) return;
  const elSr = document.getElementById(assertive ? 'srAlert' : 'srPolite');
  if (!elSr) return;
  elSr.textContent = '';
  requestAnimationFrame(() => { elSr.textContent = String(msg); });
}

const _focusReturn = {};
const FOCUSABLE_SEL = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openDialogFocus(key, container, initialSel) {
  if (document.activeElement && document.activeElement !== document.body) {
    _focusReturn[key] = document.activeElement;
  }
  requestAnimationFrame(() => {
    if (!container) return;
    const target = (initialSel && container.querySelector(initialSel)) || container.querySelector(FOCUSABLE_SEL);
    if (target && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }
  });
}

function restoreDialogFocus(key) {
  const prev = _focusReturn[key];
  delete _focusReturn[key];
  if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
    requestAnimationFrame(() => {
      try { prev.focus({ preventScroll: true }); } catch (e) { prev.focus(); }
    });
  }
}

function getActiveTrapContainer() {
  const upo = document.getElementById('upoModal');
  if (upo && upo.classList.contains('open')) return upo.querySelector('.upo-sheet');
  const errM = document.getElementById('errModal');
  if (errM && errM.classList.contains('open')) return errM.querySelector('.modal-box');
  const glM = document.getElementById('glossaryModal');
  if (glM && glM.classList.contains('open')) return glM.querySelector('.modal-box');
  const ptM = document.getElementById('pointsModal');
  if (ptM && ptM.classList.contains('open')) return ptM.querySelector('.modal-box');
  const qrx = document.querySelector('.qrx.on');
  if (qrx) return qrx;
  const sheet = topOpenSheetModal();
  if (sheet) return sheet.querySelector('.modal-box') || sheet;
  const det = document.getElementById('detail');
  if (det && det.classList.contains('on')) return det;
  if (app.classList.contains('todo')) return document.querySelector('#todo .tpanel');
  if (app.classList.contains('menu')) return document.querySelector('#lmenu .panel');
  if (app.classList.contains('hist')) return document.querySelector('#hmenu .panel');
  return null;
}

// Najwyższy otwarty arkusz .sheet-modal (e-usługi, poczta, BLIK, mandaty…): przy równym z-index wygrywa późniejszy w DOM
function topOpenSheetModal() {
  let top = null, topZ = -Infinity;
  document.querySelectorAll('.sheet-modal.open').forEach(m => {
    const z = parseInt(getComputedStyle(m).zIndex, 10) || 0;
    if (z >= topZ) { top = m; topZ = z; }
  });
  return top;
}

// Arkusz otwarty z innego arkusza (np. ekran apteczny z IKP, EKUZ z eWUŚ) ma być na wierzchu: arkusze mają ten sam z-index,
// więc decyduje kolejność w DOM. Otwierany arkusz przenosimy na koniec rodzica (Face ID ma wyższy z-index i zostaje nad nim).
(function () {
  const root = document.getElementById('app') || document.body;
  if (!root || typeof MutationObserver === 'undefined') return;
  new MutationObserver(ms => ms.forEach(m => {
    const el = m.target;
    if (!el.classList || !el.classList.contains('sheet-modal') || !el.classList.contains('open')) return;
    if ((m.oldValue || '').split(/\s+/).includes('open')) return;
    const par = el.parentNode;
    if (par && el !== par.lastElementChild) par.appendChild(el);
  })).observe(root, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
})();

// --- 2. Dostępność (WCAG, Duży Tekst, Wysoki Kontrast) ---
const A11Y = {
  largeText: false,
  highContrast: false,
  darkMode: false,

  init() {
    try {
      this.largeText = localStorage.getItem('mob_large_text') === '1';
      this.highContrast = localStorage.getItem('mob_high_contrast') === '1';
      this.darkMode = localStorage.getItem('mob_dark_mode') === '1';
    } catch (e) {}
    this.apply();
  },

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    try { localStorage.setItem('mob_dark_mode', this.darkMode ? '1' : '0'); } catch (e) {}
    this.apply();
    showToast(this.darkMode ? '🌙 Włączono elegancki tryb ciemny (Dark Mode)' : '☀️ Włączono standardowy tryb jasny');
  },

  toggleLargeText() {
    this.largeText = !this.largeText;
    try { localStorage.setItem('mob_large_text', this.largeText ? '1' : '0'); } catch (e) {}
    this.apply();
    if (typeof layout === 'function') layout();
    showToast(this.largeText ? 'Włączono powiększony tekst (tryb czytelny)' : 'Standardowy rozmiar tekstu');
  },

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    try { localStorage.setItem('mob_high_contrast', this.highContrast ? '1' : '0'); } catch (e) {}
    this.apply();
    showToast(this.highContrast ? 'Włączono tryb wysokiego kontrastu' : 'Standardowe kolory');
  },

  setLang(code) {
    if (typeof haptic === 'function') haptic('toggle');
    try { localStorage.setItem('mobLang', code); } catch (e) {}
    const u = new URL(location.href);
    if (code === 'pl') {
      u.searchParams.delete('lang');
    } else {
      u.searchParams.set('lang', code);
    }
    location.href = u.toString();
  },

  apply() {
    document.body.classList.toggle('large-text', this.largeText);
    document.body.classList.toggle('high-contrast', this.highContrast);
    document.body.classList.toggle('dark-mode', this.darkMode);
    document.documentElement.classList.toggle('dark-mode', this.darkMode);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.classList.toggle('large-text', this.largeText);
      appEl.classList.toggle('high-contrast', this.highContrast);
      appEl.classList.toggle('dark-mode', this.darkMode);
    }
    const f = document.getElementById('apFont'), c = document.getElementById('apContrast'), d = document.getElementById('apDark');
    if (f) { f.classList.toggle('on', this.largeText); f.setAttribute('aria-checked', this.largeText); }
    if (c) { c.classList.toggle('on', this.highContrast); c.setAttribute('aria-checked', this.highContrast); }
    if (d) { d.classList.toggle('on', this.darkMode); d.setAttribute('aria-checked', this.darkMode); }
    const curLang = new URLSearchParams(location.search).get('lang') || (function() { try { return localStorage.getItem('mobLang'); } catch (e) { return null; } })() || 'pl';
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === curLang.toLowerCase());
    });
  }
};

// Panel "Aa" w nagłówku
function toggleA11yPanel(e) {
  if (e) e.stopPropagation();
  const p = document.getElementById('a11yPanel'), b = document.getElementById('a11yBtn');
  const open = !p.classList.contains('open');
  if (open) openDialogFocus('a11y', p, '#apFont');
  p.classList.toggle('open', open);
  if (b) b.setAttribute('aria-expanded', open);
  if (!open) restoreDialogFocus('a11y');
}
function closeA11yPanel() {
  const p = document.getElementById('a11yPanel'), b = document.getElementById('a11yBtn');
  if (!p || !p.classList.contains('open')) return;
  p.classList.remove('open');
  if (b) b.setAttribute('aria-expanded', 'false');
  restoreDialogFocus('a11y');
}
document.addEventListener('click', e => { const p = document.getElementById('a11yPanel'); if (p && p.classList.contains('open') && !p.contains(e.target)) closeA11yPanel(); });

// Globalna obsługa klawiatury: pułapka fokusu (Tab) i zamykanie najwyższej warstwy (Escape)
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    const trap = getActiveTrapContainer();
    if (!trap) return;
    const nodes = [...trap.querySelectorAll(FOCUSABLE_SEL)].filter(n => n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || !trap.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
    return;
  }
  if (e.key !== 'Escape' || e.defaultPrevented) return;   // defaultPrevented: Escape obsłużył już np. Spotlight
  // zaświadczenie i UPO (z-index 100) są nad arkuszami
  const cert = document.getElementById('certModal');
  if (cert && cert.classList.contains('open')) { e.preventDefault(); closeCertModal(); return; }
  const upo = document.getElementById('upoModal');
  if (upo && upo.classList.contains('open')) { e.preventDefault(); closeUPO(); return; }
  // wierzchni arkusz (IKP, apteka, PESEL, BLIK, poczta, mandaty, słowniczek…): wcześniej sprawdzane w stałej kolejności,
  // więc np. Escape na ekranie aptecznym zamykał IKP pod spodem, a przy arkuszach spoza listy rozmowę albo dokument
  const sheet = topOpenSheetModal();
  if (sheet) {
    e.preventDefault();
    const closer = sheet.querySelector('.tx-close') || sheet.querySelector('.scrim');
    if (closer) closer.click(); else sheet.classList.remove('open');
    return;
  }
  const a11yP = document.getElementById('a11yPanel');
  if (a11yP && a11yP.classList.contains('open')) { e.preventDefault(); closeA11yPanel(); return; }
  if (document.querySelector('.qrx.on')) return; // obsługiwane w znak.js
  if (app.classList.contains('menu') && typeof closeMenu === 'function') { e.preventDefault(); closeMenu(); return; }
  if (app.classList.contains('todo') && typeof closeTodo === 'function') { e.preventDefault(); closeTodo(); return; }
  if (app.classList.contains('hist') && typeof closeHist === 'function') { e.preventDefault(); closeHist(); return; }
  const det = document.getElementById('detail');
  if (det && det.classList.contains('on')) { e.preventDefault(); if (typeof closeDoc === 'function') closeDoc(); else det.classList.remove('on'); return; }
  if (typeof VOICE !== 'undefined' && VOICE && typeof exitVoice === 'function') { e.preventDefault(); exitVoice(); return; }
  if (app.classList.contains('chatting') && typeof exitChat === 'function') { e.preventDefault(); exitChat(); }
});

// --- 3. Komunikaty Toast ---
function showToast(msg) {
  let t = document.getElementById('mobToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'mobToast';
    t.className = 'mob-toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  announceSR(msg);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

// --- 4. Słowniczek „Po ludzku” (Plain Language Glossary) ---
const GLOSSARY_TERMS = [
  {
    term: 'Zastrzeżenie numeru PESEL',
    badge: 'Bezpieczeństwo',
    simple: 'Blokada przed zaciągnięciem kredytu, pożyczki lub zakupem ratalnym na Twoje dane. Możesz ją włączyć i wyłączyć w kilka sekund w aplikacji.',
    faq: 'Czy z zastrzeżonym PESEL pójdę do lekarza lub odbiorę receptę? Tak! Zastrzeżenie dotyczy banków i notariuszy, nie wpływa na opiekę zdrowotną ani załatwianie spraw w urzędzie.'
  },
  {
    term: 'Zawieszenie a Unieważnienie dowodu',
    badge: 'Ważne',
    simple: 'Zawieszenie to tymczasowa blokada na 14 dni (np. gdy zawieruszysz portfel). Jeśli dowód się znajdzie – odblokujesz go bez opłat. Unieważnienie jest na zawsze (np. kradzież) i wymaga wyrobienia nowego dowodu.',
    faq: 'Co jeśli minie 14 dni zawieszenia? Dowód zostanie unieważniony automatycznie.'
  },
  {
    term: 'UPO (Urzędowe Poświadczenie Odbioru)',
    badge: 'Dokument',
    simple: 'Elektroniczny dowód z pieczęcią państwową, że Twój wniosek lub oświadczenie dotarły do urzędu. Ma taką samą moc prawną jak papierowe potwierdzenie z pieczątką.',
    faq: 'Czy muszę drukować UPO? Nie musisz, jest trwale zapisane w Twojej skrzynce, ale możesz je pobrać w PDF lub wydrukować.'
  },
  {
    term: 'Znak mObywatela (zamiast kodu QR)',
    badge: 'Prywatność',
    simple: 'Dynamiczny, bezpieczny kod na ekranie telefonu. Pozwala przekazać tylko niezbędne dane (np. wiek w sklepie lub dane do umowy) bez pokazywania całego dowodu obcej osobie.',
    faq: 'Czy ktoś może zrobić zdjęcie kodu i go użyć? Nie, kod zmienia się co kilkadziesiąt sekund.'
  },
  {
    term: 'Punkty karne i terminy',
    badge: 'Kierowca',
    simple: 'Limit to 24 punkty (lub 20 punktów w pierwszym roku posiadania prawa jazdy). Punkty kasują się automatycznie po 1 roku od daty opłacenia mandatu.',
    faq: 'Gdzie sprawdzę szczegóły? Kliknij kafelek „Punkty karne” na pulpicie mObywatela.'
  }
];

function openGlossary() {
  const modal = document.getElementById('glossaryModal');
  if (!modal) return;
  const list = modal.querySelector('.glossary-list');
  if (list) {
    list.innerHTML = GLOSSARY_TERMS.map(g => `
      <div class="glossary-item">
        <div class="glossary-head">
          <b>${g.term}</b>
          <span class="glossary-badge">${g.badge}</span>
        </div>
        <p class="glossary-simple">${g.simple}</p>
        <div class="glossary-faq"><b>Częste pytanie:</b> ${g.faq}</div>
      </div>
    `).join('');
  }
  openDialogFocus('glossary', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto słowniczek Po ludzku');
}

function closeGlossary() {
  const modal = document.getElementById('glossaryModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('glossary');
}

// --- 4b. Historia błędów asystenta AI ---
function updateErrorBadge() {
  const errs = MobStore.getAiErrors();
  const cnt = errs.length;
  const badge = document.getElementById('errBadge');
  const btn = document.getElementById('errBtn');
  const sub = document.getElementById('apErrSub');
  if (badge) {
    badge.hidden = cnt === 0;
    badge.textContent = cnt > 9 ? '9+' : String(cnt);
  }
  if (btn) {
    btn.classList.toggle('has-err', cnt > 0);
    btn.setAttribute('aria-label', cnt > 0
      ? `Historia błędów asystenta AI (${cnt} ${cnt === 1 ? 'błąd' : cnt < 5 ? 'błędy' : 'błędów'})`
      : 'Historia błędów asystenta AI — brak błędów');
  }
  if (sub) {
    sub.textContent = cnt > 0 ? `Zapisano błędów: ${cnt}` : 'Brak błędów — asystent działa prawidłowo';
  }
}

function renderErrorHistory() {
  const meta = document.getElementById('errAgentMeta');
  const listEl = document.getElementById('errList');
  const foot = document.getElementById('errFoot');
  if (!listEl) return;

  const info = window.AGENT_INFO;
  if (meta) {
    const active = info && info.agent;
    const modelName = (info && info.model) ? esc(String(info.model)) : 'tryb demonstracyjny (scenariusze)';
    meta.innerHTML = `<div class="err-status-pill ${active ? 'ok' : 'demo'}">
      <span class="dot" aria-hidden="true"></span>
      <span>${active ? 'Połączono z modelem:' : 'Tryb offline / demo:'} <b>${modelName}</b></span>
    </div>`;
  }

  const errs = MobStore.getAiErrors();
  if (foot) foot.hidden = errs.length === 0;
  if (!errs.length) {
    listEl.innerHTML = `<div class="err-empty">
      <b>Brak zarejestrowanych błędów</b>
      <p>Wszystkie zapytania do asystenta AI w tej przeglądarce przebiegły bez zakłóceń. Gdy wystąpi przekroczenie czasu lub błąd połączenia, zobaczysz tutaj pełny dziennik.</p>
    </div>`;
    return;
  }

  listEl.innerHTML = errs.map(e => `
    <div class="err-item">
      <div class="err-item-head">
        <span class="err-code">${esc(e.code || 'Błąd')}</span>
        <time class="err-time">${esc(e.dateStr || '')}</time>
      </div>
      <p class="err-msg">${esc(e.message || '')}</p>
      ${e.prompt ? `<div class="err-ctx">Zapytanie: <span>„${esc(e.prompt)}”</span></div>` : ''}
    </div>
  `).join('');
}

function openErrorHistory() {
  const modal = document.getElementById('errModal');
  if (!modal) return;
  renderErrorHistory();
  openDialogFocus('err', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto historię błędów asystenta AI');
}

function closeErrorHistory() {
  const modal = document.getElementById('errModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('err');
}

function clearErrorHistory() {
  MobStore.clearAiErrors();
  renderErrorHistory();
  showToast('Wyczyszczono historię błędów asystenta');
}

// --- 5. Urzędowe Poświadczenie Odbioru (UPO) - Podgląd i Druk ---
function openUPO(entry) {
  if (!entry) return;
  let modal = document.getElementById('upoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'upoModal';
    modal.className = 'upo-modal-wrap';
    document.body.appendChild(modal);
  }

  const rowsHtml = (entry.rows || []).map(([k, v]) => `
    <div class="upo-row">
      <span class="upo-label">${k}</span>
      <b class="upo-val">${v}</b>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="upo-scrim" onclick="closeUPO()"></div>
    <div class="upo-sheet" role="dialog" aria-modal="true" aria-labelledby="upoTitle">
      <div class="upo-header-bar">
        <button class="upo-close-btn" type="button" onclick="closeUPO()">✕ Zamknij</button>
        <button class="upo-print-btn" type="button" onclick="window.print()">🖨️ Drukuj / Zapisz PDF</button>
      </div>
      <div class="upo-document" id="printableUPO">
        <div class="upo-doc-head">
          <div class="upo-eagle" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#dc143c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M24 4l4 8 8-2-4 8 8 4-8 4 4 8-8-2-4 8-4-8-8 2 4-8-8-4 8-4-4-8 8 2z"/>
              <circle cx="24" cy="24" r="6"/>
            </svg>
          </div>
          <div class="upo-doc-title">
            <h2>RZECZPOSPOLITA POLSKA</h2>
            <h1 id="upoTitle">URZĘDOWE POŚWIADCZENIE ODBIORU (UPO)</h1>
            <p>Identyfikator poświadczenia: <b>${entry.upo}</b></p>
          </div>
        </div>
        
        <div class="upo-meta-box">
          <div class="upo-meta-item"><span>Organ rejestrujący:</span> <b>${entry.source || 'Ministerstwo Cyfryzacji / Rejestr Państwowy'}</b></div>
          <div class="upo-meta-item"><span>Data i czas złożenia:</span> <b>${entry.dateStr || today()}</b></div>
          <div class="upo-meta-item"><span>Wnioskodawca:</span> <b>${OS.imie} ${OS.nazwisko} (PESEL: ${OS.moje.pesel})</b></div>
          <div class="upo-meta-item"><span>Tytuł czynności:</span> <b>${entry.title}</b></div>
          <div class="upo-meta-item"><span>Status prawny:</span> <b class="upo-status-ok">PRZYJĘTO ZE SKUTKIEM PRAWNYM</b></div>
        </div>

        <div class="upo-data-box">
          <h3>Dane zarejestrowane w rejestrze:</h3>
          <div class="upo-rows">${rowsHtml}</div>
        </div>

        <div class="upo-footer-legal">
          <div class="upo-stamp" aria-hidden="true">
            <div class="upo-stamp-circle">
              <span>PODPIS KWALIFIKOWANY</span>
              <b>MINISTERSTWO CYFRYZACJI</b>
              <small>PIECZĘĆ ELEKTRONICZNA RP</small>
            </div>
          </div>
          <div class="upo-note">
            Dokument wygenerowany automatycznie w systemie mObywatel. Niniejsze poświadczenie stanowi dowód doręczenia zgodnie z art. 39[1] Kodeksu postępowania administracyjnego.
          </div>
        </div>
      </div>
    </div>
  `;

  openDialogFocus('upo', modal.querySelector('.upo-sheet'), '.upo-close-btn');
  modal.classList.add('open');
  announceSR('Otwarto Urzędowe Poświadczenie Odbioru: ' + entry.upo);
}

function closeUPO() {
  const modal = document.getElementById('upoModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('upo');
}

// --- 6. Pulpit Szybkich Spraw (Direct Dashboard) ---
/* Lekkie kafelki: cały kafelek jest przyciskiem, bez dodatkowych guzików w środku. */
function dashData() {
  const pj = OS.docs.find(d => d.id === 'pj');
  let pkt = 0;
  if (pj) { const f = pj.f.find(x => /Punkt/.test(x[0])); if (f) pkt = parseInt(f[1], 10) || 0; }
  const limit = OS.id === 'kacper' ? 20 : 24;
  const auto = OS.docs.find(d => d.id === 'auto');
  const tax = OS.tiles.find(t => t.k === 'pay' && /podatek/i.test(t.h)) || OS.tiles.find(t => t.k === 'pay');
  const kwota = tax ? (tax.d.match(/[\d\s]+(,\d+)?\s*zł/) || [''])[0].trim() : '';
  const termin = tax ? (tax.d.match(/do\s+[\d.]+/) || [''])[0] : '';
  return { pkt, limit, auto, tax, kwota, termin };
}

function renderDashboard() {
  const host = document.getElementById('quickGrid');
  if (!host) return;
  const { pkt, limit, auto, tax, kwota, termin } = dashData();
  const pesel = MobStore.isPeselBlocked();
  const unlockUntil = MobStore.get('pesel_unlock_until', 0);
  const isTempUnlocked = unlockUntil > Date.now();
  const paid = MobStore.isTaxPaid();

  let peselSub = pesel ? 'Zastrzeżony' : 'Niezastrzeżony';
  let peselTone = pesel ? 'ok' : 'warn';
  let peselIcon = pesel ? 'shield' : 'alert';
  if (isTempUnlocked) {
    const remM = Math.max(1, Math.ceil((unlockUntil - Date.now()) / 60000));
    peselSub = `Odbezp. (${remM} min)`;
    peselTone = 'warn';
    peselIcon = 'clock';
  }

  const tile = (id, tone, icon, title, sub) =>
    `<button type="button" class="qt ${tone}" data-q="${id}" aria-label="${title}: ${sub}">
      <span class="qt-ic">${svg(icon)}</span>
      <span class="qt-tx"><b>${title}</b><small>${sub}</small></span>
    </button>`;

  host.innerHTML = [
    tile('pesel', peselTone, peselIcon, 'PESEL', peselSub),
    tile('pkt', pkt === 0 ? 'ok' : pkt >= limit * 0.75 ? 'warn' : 'info', 'clock', 'Punkty karne',
      `${pkt} z ${limit}`),
    auto ? tile('auto', auto.alert ? 'warn' : 'ok', 'car', auto.model ? auto.model.split(' ')[0] : 'Pojazd',
      auto.alert || 'OC i badanie ważne') : '',
    tax ? tile('pay', paid ? 'ok' : 'warn', 'coin', paid ? 'Opłacone' : (kwota || 'Do zapłaty'),
      paid ? 'Brak zaległości' : (termin ? 'Podatek ' + termin : tax.h)) : ''
  ].join('');

  host.querySelectorAll('.qt').forEach(b => b.onclick = () => ({
    pesel: () => { if (typeof openZastrzezPeselModal === 'function') openZastrzezPeselModal(); else togglePeselDirect(); },
    pkt: openPointsDetail,
    auto: () => openDoc('auto'),
    pay: () => { if (typeof openEPlatnosciModal === 'function') openEPlatnosciModal(); else directPaymentClick(); }
  })[b.dataset.q]());

  if (typeof layout === 'function') setTimeout(layout, 10);
}

function updateDashboard() {
  renderDashboard();
}

// Szybka akcja PESEL z pulpitu: otwiera rozmowę, żeby karta potwierdzenia była widoczna od razu
function togglePeselDirect() {
  const willBlock = !MobStore.isPeselBlocked();
  startTopic(willBlock ? 'Zastrzeż mój PESEL' : 'Cofnij zastrzeżenie PESEL', () => confirmCard({
    icon: 'shield',
    title: willBlock ? 'Zastrzeżenie numeru PESEL' : 'Cofnięcie zastrzeżenia PESEL',
    source: 'Rejestr Zastrzeżeń PESEL',
    rows: [
      ['PESEL', OS.moje.pesel],
      ['Od', 'teraz'],
      ['Do', willBlock ? 'do odwołania' : '-']
    ],
    note: willBlock
      ? 'Bank czy firma pożyczkowa muszą sprawdzić zastrzeżenie przed udzieleniem kredytu. Do lekarza, apteki czy urzędu pójdziesz jak dotąd.'
      : 'Po cofnięciu zastrzeżenia ktoś mógłby wziąć kredyt na Twoje dane. Zastrzeżesz go ponownie w kilka sekund.',
    label: willBlock ? 'Zastrzeż PESEL' : 'Cofnij zastrzeżenie',
    then: async () => {
      MobStore.setPeselBlocked(willBlock);
      await result({
        title: willBlock ? 'PESEL zastrzeżony' : 'Zastrzeżenie PESEL cofnięte',
        source: 'Rejestr Zastrzeżeń PESEL, godz. ' + now(),
        rows: [['Status', willBlock ? 'zastrzeżony' : 'niezastrzeżony']]
      });
    }
  }), true);
}

// Szybka akcja płatności z pulpitu
function directPaymentClick() {
  const { tax, kwota, termin } = dashData();
  if (MobStore.isTaxPaid()) {
    const hist = MobStore.getHistory().find(x => /Zapłacono|opłacony|Podatek/i.test(x.title));
    if (hist) openUPO(hist); else showToast('Wszystko opłacone.');
    return;
  }
  if (!tax) return;
  startTopic(tax.q || tax.h, () => confirmCard({
    icon: 'coin',
    title: tax.h,
    source: 'ePłatności' + (tax.s ? ', ' + tax.s.split(',').slice(-2).join(',').trim() : ''),
    rows: [['Kwota', kwota || '-'], ['Termin', termin.replace(/^do\s+/, '') || '-'], ['Płatność', 'BLIK, bez prowizji']],
    label: 'Zapłać ' + (kwota || ''),
    then: async () => {
      MobStore.setTaxPaid(true);
      await result({ title: 'Zapłacono', source: 'ePłatności, godz. ' + now(), rows: [['Kwota', kwota], ['Prowizja', 'brak']] });
    }
  }), true);
}

// Szczegóły punktów karnych
function openPointsDetail() {
  const pjDoc = OS.docs.find(d => d.id === 'pj');
  let pkt = 0;
  if (pjDoc) {
    const fPkt = pjDoc.f.find(x => x[0].includes('Punkt'));
    if (fPkt) pkt = parseInt(fPkt[1], 10) || 0;
  }
  const maxPkt = OS.id === 'kacper' ? 20 : 24;

  const modal = document.getElementById('pointsModal');
  if (!modal) return;
  modal.querySelector('.pts-num').textContent = pkt;
  modal.querySelector('.pts-max').textContent = '/ ' + maxPkt + ' punktów';
  modal.querySelector('.pts-desc').textContent = pkt === 0 
    ? 'Gratulacje! Jeździsz bezpiecznie – brak punktów karnych.'
    : `Posiadasz ${pkt} aktywnych punktów karnych. Punkty kasują się po roku od opłacenia mandatu.`;

  const btnAsk = modal.querySelector('.pts-ask');
  if (btnAsk) {
    btnAsk.onclick = () => {
      closePointsDetail();
      startTopic('Ile mam punktów karnych i kiedy wygasną?');
    };
  }
  openDialogFocus('points', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR(`Punkty karne: ${pkt} z ${maxPkt}`);
}

function closePointsDetail() {
  const modal = document.getElementById('pointsModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('points');
}

// --- 7. Kategoryzowane Podpowiedzi Asystenta (Topic Hub) ---
const TOPIC_CATEGORIES = [
  {
    id: 'kierowca',
    icon: '🚗',
    name: 'Kierowca',
    questions: [
      ['Miałam stłuczkę', 'wspólne oświadczenie bez policji'],
      ['Ile mam punktów karnych?', 'sprawdzenie ewidencji CEPiK'],
      ['Kiedy kończy się OC auta?', 'termin polisy i badanie techniczne'],
      ['Kupuję używane auto', 'sprawdzenie historii pojazdu i umowa']
    ]
  },
  {
    id: 'bezpieczenstwo',
    icon: '🛡️',
    name: 'Bezpieczeństwo',
    questions: [
      ['Zgubiłam portfel', 'blokada dowodu i banków'],
      ['Zastrzeż mój PESEL', 'ochrona przed kredytem'],
      ['Dostałam dziwnego SMS-a', 'sprawdzenie i zgłoszenie do CERT'],
      ['Kto sprawdzał mój PESEL?', 'historia weryfikacji przez banki']
    ]
  },
  {
    id: 'rodzina',
    icon: '👶',
    name: 'Rodzina',
    questions: [
      ['Urodziło nam się dziecko', 'zgłoszenie narodzin do USC'],
      ['Chcę złożyć wniosek o 800+', 'świadczenie wychowawcze'],
      ['Karta Dużej Rodziny', 'zniżki i partnerzy KDR']
    ]
  },
  {
    id: 'platnosci',
    icon: '💰',
    name: 'Płatności',
    questions: [
      ['Chcę zapłacić podatek', 'ePłatności BLIK'],
      ['Ile mam do zapłaty w ZUS?', 'składki i termin płatności'],
      ['Pismo z Urzędu Skarbowego', 'co zawiera korespondencja']
    ]
  },
  {
    id: 'dokumenty',
    icon: '🆔',
    name: 'Dokumenty',
    questions: [
      ['Kiedy mój dowód traci ważność?', 'termin ważności mDowodu'],
      ['Paszport dla dziecka', 'wniosek online do 12 lat'],
      ['Potwierdź moje dane', 'przekaż dane znakiem mObywatela']
    ]
  },
  {
    id: 'zdrowie',
    icon: '🏥',
    name: 'Zdrowie (IKP)',
    questions: [
      ['Moje e-Recepty w IKP', 'kody PIN i kody kreskowe leków'],
      ['e-Rejestracja wizyty NFZ', 'wybór lekarza i rezerwacja terminu'],
      ['Karta DiLO (onkologiczna)', 'szybka terapia onkologiczna i koordynator'],
      ['Ubezpieczenie zdrowotne eWUŚ', 'potwierdzenie prawa do świadczeń']
    ]
  },
  {
    id: 'firma',
    icon: '🏢',
    name: 'Moja Firma',
    questions: [
      ['Poświadcz za firmę (CEIDG)', 'certyfikat reprezentacji z kodem QR'],
      ['Podpisz dokument e-dowodem', 'podpis osobisty i pieczęć urzędowa'],
      ['Biała Lista Podatników VAT', 'weryfikacja statusu i konta bankowego'],
      ['Zaświadczenie CEIDG PDF', 'odpis z rejestru przedsiębiorców']
    ]
  }
];

let activeTopicCategory = 'kierowca';

function renderTopicHub(container) {
  if (!container) return;
  const catsHtml = TOPIC_CATEGORIES.map(c => `
    <button type="button" class="topic-cat-pill ${c.id === activeTopicCategory ? 'active' : ''}" aria-pressed="${c.id === activeTopicCategory ? 'true' : 'false'}" onclick="selectTopicCategory('${c.id}')">
      <span class="topic-cat-icon" aria-hidden="true">${c.icon}</span>
      <span class="topic-cat-name">${c.name}</span>
    </button>
  `).join('');

  const cur = TOPIC_CATEGORIES.find(c => c.id === activeTopicCategory) || TOPIC_CATEGORIES[0];
  const qHtml = cur.questions.map(([q, desc]) => `
    <button type="button" class="topic-q-item" onclick="send('${q}')">
      <span class="tq-text"><b>${q}</b><small>${desc}</small></span>
      <span class="tq-arr">${svg('chev')}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="topic-hub">
      <div class="topic-cat-bar" role="group" aria-label="Kategorie spraw">${catsHtml}</div>
      <div class="topic-questions-list">${qHtml}</div>
    </div>
  `;
}

function selectTopicCategory(catId) {
  activeTopicCategory = catId;
  const hub = document.querySelector('.topic-hub-wrap');
  if (hub) renderTopicHub(hub);
}

// --- 8. Haptyka / Wibracje telefonu (Web Vibration API) ---
function haptic(type = 'tap') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'tap': navigator.vibrate(12); break;
      case 'card': navigator.vibrate([16, 35, 16]); break;
      case 'toggle': navigator.vibrate(22); break;
      case 'success': navigator.vibrate([25, 40, 35, 40, 50]); break;
      case 'warn': navigator.vibrate([40, 60, 40, 60, 40]); break;
      case 'error': navigator.vibrate([80, 50, 80]); break;
      default: navigator.vibrate(15);
    }
  } catch (e) {}
}

// --- 9. Eksport zdarzeń do Kalendarza (.ics) ---
function exportToCalendar({ title, desc = '', date, daysBefore = 3 }) {
  if (!date) return;
  haptic('tap');
  try {
    let y, m, d;
    if (date.includes('-')) {
      [y, m, d] = date.split('-').map(Number);
    } else if (date.includes('.')) {
      [d, m, y] = date.split('.').map(Number);
    }
    if (!y || !m || !d) {
      showToast('Niepoprawny format daty: ' + date);
      return;
    }
    const pad = n => String(n).padStart(2, '0');
    const dtStart = `${y}${pad(m)}${pad(d)}T090000`;
    const dtEnd = `${y}${pad(m)}${pad(d)}T100000`;
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = 'mob-' + Date.now() + '@mobywatel.gov.pl';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ministerstwo Cyfryzacji//mObywatel 2.0//PL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, '\\n')} - Przypomnienie z mObywatela`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P' + daysBefore + 'D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Przypomnienie: ${title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('Pobrano przypomnienie do kalendarza (.ics)');
    announceSR('Pobrano plik kalendarza dla: ' + title);
  } catch (err) {
    showToast('Błąd eksportu do kalendarza');
  }
}

// --- 10. Oficjalne Zaświadczenie Urzędowe PDF z pieczęcią RP ---
function openOfficialCertificate(type = 'pesel') {
  haptic('card');
  let modal = document.getElementById('certModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'certModal';
    modal.className = 'upo-modal-wrap';
    document.body.appendChild(modal);
  }

  let certTitle = 'ZAŚWIADCZENIE Z REJESTRU';
  let certNumber = 'MC-RP/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random() * 900000);
  let rows = [];
  let legal = '';

  if (type === 'pesel') {
    certTitle = 'ZAŚWIADCZENIE O STANIE ZASTRZEŻENIA NUMERU PESEL';
    const isBlocked = MobStore.isPeselBlocked();
    rows = [
      ['Imię i nazwisko', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Data i godzina stanu', now() + ' ' + today()],
      ['Status zastrzeżenia', isBlocked ? 'ZASTRZEŻONY' : 'NIEZASTRZEŻONY'],
      ['Podstawa prawna', 'art. 23 ust. 1 ustawy z dnia 24 września 2010 r. o ewidencji ludności'],
      ['Organ wydający', 'Ministerstwo Cyfryzacji']
    ];
    legal = 'Zaświadczenie wydane w postaci elektronicznej opatrzone zaawansowaną pieczęcią elektroniczną Ministra Cyfryzacji. Ważne na terenie całego kraju we wszystkich instytucjach finansowych i urzędach.';
  } else if (type === 'punkty') {
    certTitle = 'ZAŚWIADCZENIE O WPISACH W EWIDENCJI KIEROWCÓW (CEPiK)';
    const pj = OS.docs.find(d => d.id === 'pj');
    let pkt = '0';
    if (pj) { const f = pj.f.find(x => /Punkt/.test(x[0])); if (f) pkt = f[1]; }
    rows = [
      ['Kierowca', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Numer prawa jazdy', (pj && pj.f.find(x => /numer|nr\b|blankiet/i.test(x[0]))?.[1]) || '—'],
      ['Liczba aktywnych punktów karnych', pkt],
      ['Ewidencja', 'Centralna Ewidencja Kierowców (CEPiK)'],
      ['Data weryfikacji', today()]
    ];
    legal = 'Zaświadczenie stanowi odpis stanu konta kierowcy z Centralnej Ewidencji Kierowców na dzień sporządzenia dokumentu.';
  } else if (type === 'pojazd') {
    certTitle = 'ODPIS DANYCH POJAZDU Z CENTRALNEJ EWIDENCJI POJAZDÓW';
    // dane pojazdu tej osoby (wcześniej pola szukane po nazwach, których karta nie ma, więc każdy dostawał ten sam, zmyślony pojazd)
    const auto = OS.docs.find(d => d.id === 'auto') || {};
    const pole = re => (auto.rows || []).find(x => re.test(x[0]))?.[1] || (auto.f || []).find(x => re.test(x[0]))?.[1] || '—';
    rows = [
      ['Właściciel', `${OS.imie} ${OS.nazwisko}`],
      ['Marka i model', pole(/^Pojazd/i) !== '—' ? pole(/^Pojazd/i) : (auto.model || '—')],
      ['Numer rejestracyjny', auto.plate || pole(/rejestr/i)],
      ['Numer VIN', auto.vin || '—'],
      ['Badanie techniczne', pole(/Badanie/i)],
      ['Polisa OC', pole(/^OC/)]
    ];
    legal = 'Dokument potwierdza aktualne dane techniczne pojazdu i stan ubezpieczenia OC zarejestrowany w CEPiK i Ubezpieczeniowym Funduszu Gwarancyjnym.';
  } else if (type === 'ceidg' || type === 'firma') {
    certTitle = 'ZAŚWIADCZENIE O WPISIE W CEIDG (DZIAŁALNOŚĆ GOSPODARCZA)';
    const f = (OS.docs && OS.docs.find(d => d.id === 'firma')) || {};
    certNumber = 'MRIT/CEIDG/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random() * 900000);
    rows = [
      ['Przedsiębiorca', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Firma przedsiębiorcy', f.rows?.find(x => x[0] === 'Firma')?.[1] || 'Wiśniewski Instalacje Jan Wiśniewski'],
      ['Numer NIP', '679 234 56 79'],
      ['Numer REGON', '381920145'],
      ['Adres do doręczeń', OS.moje.adres],
      ['Przeważająca działalność (PKD 2025)', '43.22.Z – Instalacje wodno-kanalizacyjne i gazowe'],
      ['Status wpisu w CEIDG', 'AKTYWNY – Przedsiębiorca wykonuje działalność gospodarczą'],
      ['Wykaz Podatników VAT (Biała Lista)', 'Czynny podatnik VAT (rachunek rozliczeniowy zweryfikowany)']
    ];
    legal = 'Zaświadczenie o wpisie w CEIDG stanowi dokument urzędowy potwierdzający status przedsiębiorcy zgodnie z ustawą o Centralnej Ewidencji i Informacji o Działalności Gospodarczej. Opatrzone kwalifikowaną pieczęcią elektroniczną Ministra Rozwoju i Technologii.';
  } else if (type === 'nfz' || type === 'ikp') {
    certTitle = 'ZAŚWIADCZENIE O PRAWIE DO ŚWIADCZEŃ OPIEKI ZDROWOTNEJ (NFZ / eWUŚ)';
    certNumber = 'NFZ-eWUS/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random() * 900000);
    rows = [
      ['Ubezpieczony', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Status ubezpieczenia (eWUŚ)', 'PRAWO DO ŚWIADCZEŃ MEDYCZNYCH POTWIERDZONE (ZIELONY)'],
      ['Podstawa ubezpieczenia', 'Ubezpieczenie zdrowotne obowiązkowe (ZUS)'],
      ['Oddział Wojewódzki NFZ', OS.id === 'marta' ? 'Mazowiecki OW NFZ' : (OS.id === 'jan' ? 'Małopolski OW NFZ' : (OS.id === 'ewa' ? 'Lubelski OW NFZ' : 'Pomorski OW NFZ'))],
      ['Data weryfikacji', today() + ', godz. ' + now()]
    ];
    legal = 'Niniejszy dokument potwierdza prawo do bezpłatnych świadczeń opieki zdrowotnej finansowanych ze środków publicznych na podstawie art. 50 ustawy o świadczeniach opieki zdrowotnej finansowanych ze środków publicznych.';
  } else if (type === 'dilo') {
    certTitle = 'URZĘDOWY ODPIS KARTY DIAGNOSTYKI I LECZENIA ONKOLOGICZNEGO (KARTA DiLO)';
    certNumber = 'DILO/NFZ/2026/' + Math.floor(10000 + Math.random() * 90000);
    rows = [
      ['Pacjent', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Numer Karty DiLO', certNumber],
      ['Status karty', 'AKTYWNA – SZYBKA ŚCIEŻKA ONKOLOGICZNA'],
      ['Etap leczenia', 'Etap II: Diagnostyka pogłębiona (zgodnie z Pakietem Onkologicznym)'],
      ['Wyznaczony Koordynator', 'mgr Anna Wójcik (tel. +48 22 546 20 00)'],
      ['Placówka prowadząca', 'Narodowy Instytut Onkologii im. Marii Skłodowskiej-Curie'],
      ['Data wystawienia karty', '04.10.2026']
    ];
    legal = 'Karta DiLO uprawnia pacjenta do diagnostyki i leczenia onkologicznego w trybie pilnym, bez limitów finansowych NFZ, z zachowaniem ustawowych terminów maksymalnych.';
  } else {
    certTitle = 'ODPIS DANYCH DOWODU TOŻSAMOŚCI Z REJESTRU DOWODÓW';
    rows = [
      ['Imię i nazwisko', `${OS.imie} ${OS.nazwisko}`],
      ['Numer PESEL', OS.moje.pesel],
      ['Seria i numer dowodu', OS.moje.nr_dowodu],
      ['Data urodzenia', OS.moje.data_urodzenia],
      ['Obywatelstwo', 'Polskie (POL)'],
      ['Status mDowodu', 'AKTYWNY I WAŻNY']
    ];
    legal = 'Dokument elektroniczny mDowód jest prawnie równoważny z tradycyjnym plastikowym dowodem osobistym na podstawie ustawy o aplikacji mObywatel.';
  }

  const rowsHtml = rows.map(([k, v]) => `
    <div class="upo-row">
      <span class="upo-label">${k}</span>
      <b class="upo-val">${v}</b>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="upo-scrim" onclick="closeCertModal()"></div>
    <div class="upo-sheet" role="dialog" aria-modal="true" aria-labelledby="certDocTitle">
      <div class="upo-header-bar">
        <button class="upo-close-btn" type="button" onclick="closeCertModal()">✕ Zamknij</button>
        <button class="upo-print-btn" type="button" onclick="window.print()">🖨️ Drukuj / Zapisz PDF</button>
      </div>
      <div class="upo-document" id="printableCert">
        <div class="upo-doc-head">
          <div class="upo-eagle" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="52" height="52" fill="none" stroke="#dc143c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M24 4l4 8 8-2-4 8 8 4-8 4 4 8-8-2-4 8-4-8-8 2 4-8-8-4 8-4-4-8 8 2z"/>
              <circle cx="24" cy="24" r="6"/>
            </svg>
          </div>
          <div class="upo-doc-title">
            <h2>RZECZPOSPOLITA POLSKA</h2>
            <h1 id="certDocTitle">${certTitle}</h1>
            <p>Nr zaświadczenia: <b>${certNumber}</b></p>
          </div>
        </div>
        
        <div class="upo-meta-box">
          <div class="upo-meta-item"><span>Organ wydający:</span> <b>Ministerstwo Cyfryzacji / Rejestry Państwowe</b></div>
          <div class="upo-meta-item"><span>Data sporządzenia:</span> <b>${today()}, godz. ${now()}</b></div>
          <div class="upo-meta-item"><span>Weryfikacja autentyczności:</span> <b class="upo-status-ok">PIECZĘĆ KWALIFIKOWANA RP – WAŻNA</b></div>
        </div>

        <div class="upo-data-box">
          <h3>Dane urzędowe:</h3>
          <div class="upo-rows">${rowsHtml}</div>
        </div>

        <div class="upo-footer-legal">
          <div class="upo-stamp" aria-hidden="true">
            <div class="upo-stamp-circle">
              <span>PIECZĘĆ CYFROWA</span>
              <b>MINISTERSTWO CYFRYZACJI</b>
              <small>RZECZPOSPOLITA POLSKA</small>
            </div>
          </div>
          <div class="upo-note">${legal}</div>
        </div>
      </div>
    </div>
  `;

  openDialogFocus('cert', modal.querySelector('.upo-sheet'), '.upo-close-btn');
  modal.classList.add('open');
  announceSR('Otwarto zaświadczenie urzędowe: ' + certTitle);
}

function closeCertModal() {
  const modal = document.getElementById('certModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('cert');
}

// --- 10b. Internetowe Konto Pacjenta (IKP): e-Recepty, e-Skierowania, eWUŚ ---
function openIkpModal(defaultTab = 'recepty') {
  haptic('card');
  let modal = document.getElementById('ikpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ikpModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Internetowe Konto Pacjenta (IKP)');
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  const recipes = [
    { id: 'rx1', person: 'Zofia Kowalska (córka)', name: 'Amoksiklav 875 mg + 125 mg', form: '14 tabl. powl. (2 op.)', pin: '4821', barcode: '2801948210948215', doc: 'lek. med. Anna Jabłońska', exp: '12.12.2026', status: 'Do wykupienia' },
    { id: 'rx2', person: 'Marta Kowalska', name: 'Paracetamol Hasco 500 mg', form: '20 tabl. (1 op.)', pin: '1194', barcode: '2801911940911942', doc: 'lek. med. Tomasz Lis', exp: '30.11.2026', status: 'Do wykupienia' }
  ];

  function render(tab) {
    let tabHtml = '';
    if (tab === 'recepty') {
      tabHtml = `
        <div class="ikp-sec">
          <div class="ikp-sec-head">
            <b>Aktywne e-Recepty (${recipes.length})</b>
            <small>Podaj w aptece numer PESEL oraz 4-cyfrowy kod PIN lub pokaż kod kreskowy.</small>
          </div>
          <div class="rx-list">
            ${recipes.map(r => `
              <div class="rx-card">
                <div class="rx-card-top">
                  <div>
                    <span class="rx-badge">${r.status}</span>
                    <b class="rx-name">${r.name}</b>
                    <span class="rx-sub">${r.form} • Pacjent: ${r.person}</span>
                  </div>
                  <div class="rx-pin-wrap">
                    <span class="rx-pin-lbl">KOD PIN</span>
                    <div class="rx-pin-val">${r.pin}</div>
                  </div>
                </div>
                <div class="rx-barcode-wrap" aria-label="Kod kreskowy e-recepty: ${r.barcode}">
                  <svg class="rx-barcode-svg" viewBox="0 0 240 40" preserveAspectRatio="none">
                    <rect x="0" y="0" width="4" height="40" fill="#111"/>
                    <rect x="7" y="0" width="2" height="40" fill="#111"/>
                    <rect x="12" y="0" width="6" height="40" fill="#111"/>
                    <rect x="22" y="0" width="3" height="40" fill="#111"/>
                    <rect x="28" y="0" width="5" height="40" fill="#111"/>
                    <rect x="36" y="0" width="2" height="40" fill="#111"/>
                    <rect x="42" y="0" width="7" height="40" fill="#111"/>
                    <rect x="52" y="0" width="3" height="40" fill="#111"/>
                    <rect x="58" y="0" width="5" height="40" fill="#111"/>
                    <rect x="66" y="0" width="2" height="40" fill="#111"/>
                    <rect x="71" y="0" width="6" height="40" fill="#111"/>
                    <rect x="80" y="0" width="4" height="40" fill="#111"/>
                    <rect x="88" y="0" width="3" height="40" fill="#111"/>
                    <rect x="94" y="0" width="6" height="40" fill="#111"/>
                    <rect x="103" y="0" width="2" height="40" fill="#111"/>
                    <rect x="108" y="0" width="5" height="40" fill="#111"/>
                    <rect x="116" y="0" width="7" height="40" fill="#111"/>
                    <rect x="126" y="0" width="3" height="40" fill="#111"/>
                    <rect x="132" y="0" width="4" height="40" fill="#111"/>
                    <rect x="139" y="0" width="2" height="40" fill="#111"/>
                    <rect x="144" y="0" width="6" height="40" fill="#111"/>
                    <rect x="153" y="0" width="4" height="40" fill="#111"/>
                    <rect x="160" y="0" width="5" height="40" fill="#111"/>
                    <rect x="168" y="0" width="3" height="40" fill="#111"/>
                    <rect x="174" y="0" width="7" height="40" fill="#111"/>
                    <rect x="184" y="0" width="2" height="40" fill="#111"/>
                    <rect x="189" y="0" width="6" height="40" fill="#111"/>
                    <rect x="198" y="0" width="4" height="40" fill="#111"/>
                    <rect x="205" y="0" width="3" height="40" fill="#111"/>
                    <rect x="211" y="0" width="5" height="40" fill="#111"/>
                    <rect x="219" y="0" width="6" height="40" fill="#111"/>
                    <rect x="228" y="0" width="3" height="40" fill="#111"/>
                    <rect x="234" y="0" width="4" height="40" fill="#111"/>
                  </svg>
                  <span class="rx-num">${r.barcode}</span>
                </div>
                <div class="rx-card-bot">
                  <span>Wystawił: <b>${r.doc}</b></span>
                  <span>Ważna do: <b>${r.exp}</b></span>
                </div>
                <div class="rx-card-actions">
                  <button type="button" class="btn ghost btn-sm" onclick="navigator.clipboard.writeText('${r.pin}');showToast('Skopiowano kod PIN: ${r.pin}')">Kopiuj PIN</button>
                  <button type="button" class="btn ghost btn-sm" onclick="showToast('Powiększono kod kreskowy do skanowania')">Powiększ kod</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tab === 'skierowania') {
      tabHtml = `
        <div class="ikp-sec">
          <div class="ikp-sec-head">
            <b>Aktywne e-Skierowania (1)</b>
            <small>Skierowanie ważne w całym kraju w poradniach mających umowę z NFZ.</small>
          </div>
          <div class="rx-card">
            <div class="rx-card-top">
              <div>
                <span class="rx-badge">Aktywne do realizacji</span>
                <b class="rx-name">Badanie USG jamy brzusznej</b>
                <span class="rx-sub">Cel: Diagnostyka bólów brzucha • Pacjent: Marta Kowalska</span>
              </div>
              <div class="rx-pin-wrap">
                <span class="rx-pin-lbl">KOD</span>
                <div class="rx-pin-val">7712</div>
              </div>
            </div>
            <div class="rx-card-bot" style="margin-top:10px">
              <span>Wystawił: <b>lek. med. Anna Jabłońska (POZ Mokotów)</b></span>
              <span>Data wystawienia: <b>28.10.2026</b></span>
            </div>
            <div class="rx-card-actions">
              <button type="button" class="btn primary btn-sm" onclick="closeIkpModal();openERejestracjaModal()">Zapisz na wizytę (e-Rejestracja)</button>
              <button type="button" class="btn ghost btn-sm" onclick="navigator.clipboard.writeText('7712');showToast('Skopiowano kod skierowania: 7712')">Kopiuj kod</button>
            </div>
          </div>
        </div>
      `;
    } else {
      tabHtml = `
        <div class="ikp-sec">
          <div class="ikp-sec-head">
            <b>Status ubezpieczenia i profilaktyka NFZ</b>
            <small>System Elektronicznej Weryfikacji Uprawnień Świadczeniobiorców (eWUŚ).</small>
          </div>
          <div class="ewus-hero-box">
            <div class="ewus-status-tag ok">● eWUŚ: ZIELONY — PRAWO DO ŚWIADCZEŃ MEDYCZNYCH</div>
            <b>Prawo do bezpłatnego leczenia w ramach NFZ potwierdzone.</b>
            <p>Zgłoszenie do ubezpieczenia zdrowotnego: ZUS (tytuł pracowniczy / zlecenie). Oddział: Mazowiecki OW NFZ.</p>
          </div>
          <div class="ikp-action-grid">
            <button type="button" class="ikp-grid-btn" onclick="closeIkpModal();openOfficialCertificate('nfz')">
              <span class="ikp-gb-ic">📜</span>
              <span class="ikp-gb-tx"><b>Zaświadczenie NFZ (PDF)</b><small>Urzędowy odpis uprawnień z pieczęcią RP</small></span>
            </button>
            <button type="button" class="ikp-grid-btn" onclick="closeIkpModal();openDiloModal()">
              <span class="ikp-gb-ic">🛡️</span>
              <span class="ikp-gb-tx"><b>Karta DiLO (Onkologia)</b><small>Szybka ścieżka terapii onkologicznej</small></span>
            </button>
          </div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="scrim" onclick="closeIkpModal()"></div>
      <div class="modal-box">
        <div class="modal-head">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">🏥</span>
            <div>
              <h2 id="ikpTitle">Internetowe Konto Pacjenta</h2>
              <small style="color:var(--ink2)">Konto zdrowotne NFZ • ${OS.imie} ${OS.nazwisko}</small>
            </div>
          </div>
          <button class="tx-close" onclick="closeIkpModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
        </div>
        <div class="ikp-tab-bar" role="tablist">
          <button type="button" class="ikp-tab-btn ${tab === 'recepty' ? 'active' : ''}" data-tab="recepty">e-Recepty</button>
          <button type="button" class="ikp-tab-btn ${tab === 'skierowania' ? 'active' : ''}" data-tab="skierowania">e-Skierowania</button>
          <button type="button" class="ikp-tab-btn ${tab === 'ewus' ? 'active' : ''}" data-tab="ewus">eWUŚ i Profilaktyka</button>
        </div>
        <div class="ikp-tab-content">${tabHtml}</div>
      </div>
    `;

    modal.querySelectorAll('.ikp-tab-btn').forEach(btn => {
      btn.onclick = () => render(btn.dataset.tab);
    });
  }

  render(defaultTab);
  openDialogFocus('ikp', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto Internetowe Konto Pacjenta');
}

function closeIkpModal() {
  const modal = document.getElementById('ikpModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('ikp');
}

// --- 10c. e-Rejestracja przez system NFZ ---
function openERejestracjaModal() {
  haptic('card');
  let modal = document.getElementById('erejestracjaModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'erejestracjaModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'e-Rejestracja wizyty NFZ');
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  // terminy w mieście tej osoby, wizyta POZ u jej lekarza z IKP (wcześniej warszawskie przychodnie u wszystkich)
  const miasto = (OS.opis || '').split(',')[0] || 'Warszawa';
  const poz = (typeof getIkpData === 'function' && getIkpData().poz) || null;
  const slots = [
    { id: 's1', date: '14.11.2026', time: '10:30', doc: poz ? poz.doctor.replace(/\s*\(.*\)\s*$/, '') : 'lek. med. Anna Jabłońska', spec: 'Lekarz POZ / Rodzinny', clinic: poz ? `${poz.clinic}, ${miasto}` : `Przychodnia rodzinna, ${miasto}` },
    { id: 's2', date: '15.11.2026', time: '14:15', doc: 'dr hab. n. med. Marek Szymański', spec: 'Kardiologia (NFZ)', clinic: `Szpital Kliniczny, ${miasto}` },
    { id: 's3', date: '18.11.2026', time: '09:00', doc: 'lek. med. Karolina Dudek', spec: 'Okulistyka (NFZ)', clinic: `Centrum Medyczne NFZ, ${miasto}` }
  ];

  let selectedSlot = slots[0];

  function renderView(booked = false) {
    if (booked) {
      modal.innerHTML = `
        <div class="scrim" onclick="closeERejestracjaModal()"></div>
        <div class="modal-box">
          <div class="modal-head">
            <h2 id="erejSuccessTitle">Wizyta zarejestrowana!</h2>
            <button class="tx-close" onclick="closeERejestracjaModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
          </div>
          <div class="erej-success-hero">
            <div class="erej-ok-icon">✓</div>
            <b>Potwierdzenie rezerwacji w systemie NFZ</b>
            <span class="erej-code">Numer zgłoszenia: NFZ-REZ-2026-${Math.floor(10000 + Math.random() * 90000)}</span>
          </div>
          <div class="erej-summary-box">
            <div class="erej-row"><span>Lekarz:</span> <b>${selectedSlot.doc}</b></div>
            <div class="erej-row"><span>Specjalizacja:</span> <b>${selectedSlot.spec}</b></div>
            <div class="erej-row"><span>Termin:</span> <b>${selectedSlot.date}, godz. ${selectedSlot.time}</b></div>
            <div class="erej-row"><span>Placówka:</span> <b>${selectedSlot.clinic}</b></div>
            <div class="erej-row"><span>Finansowanie:</span> <b>NFZ (Bezpłatnie, 0 zł)</b></div>
          </div>
          <div class="modal-actions" style="margin-top:16px">
            <button type="button" class="btn primary" id="erejCalBtn" style="flex:1">Dodaj do kalendarza (.ics)</button>
            <button type="button" class="btn ghost" onclick="closeERejestracjaModal()" style="flex:1">Gotowe</button>
          </div>
        </div>
      `;
      const calBtn = modal.querySelector('#erejCalBtn');
      if (calBtn) {
        calBtn.onclick = () => {
          exportToCalendar({
            title: `Wizyta NFZ: ${selectedSlot.spec}`,
            date: selectedSlot.date,
            desc: `Wizyta u lekarza: ${selectedSlot.doc} (${selectedSlot.clinic}). Pamiętaj o dowodzie osobistym mDowód!`
          });
        };
      }
      return;
    }

    modal.innerHTML = `
      <div class="scrim" onclick="closeERejestracjaModal()"></div>
      <div class="modal-box">
        <div class="modal-head">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">🗓️</span>
            <div>
              <h2 id="erejTitle">e-Rejestracja NFZ</h2>
              <small style="color:var(--ink2)">Bezpośredni zapis na wizytę lekarską</small>
            </div>
          </div>
          <button class="tx-close" onclick="closeERejestracjaModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
        </div>
        <p class="modal-sub">Wybierz dogodny bezpłatny termin z puli centralnego systemu e-Rejestracji NFZ:</p>
        <div class="erej-list">
          ${slots.map(s => `
            <div class="erej-item ${s.id === selectedSlot.id ? 'active' : ''}" data-id="${s.id}">
              <div class="erej-slot-top">
                <span class="erej-time">${s.date} • ${s.time}</span>
                <span class="erej-badge">NFZ</span>
              </div>
              <b class="erej-doc">${s.doc}</b>
              <small class="erej-clinic">${s.spec} • ${s.clinic}</small>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions" style="margin-top:16px">
          <button type="button" class="btn primary" id="erejConfirmBtn" style="flex:1.4">Zarezerwuj wizytę (Face ID)</button>
          <button type="button" class="btn ghost" onclick="closeERejestracjaModal()" style="flex:1">Anuluj</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.erej-item').forEach(item => {
      item.onclick = () => {
        selectedSlot = slots.find(s => s.id === item.dataset.id);
        renderView(false);
      };
    });

    const confBtn = modal.querySelector('#erejConfirmBtn');
    if (confBtn) {
      confBtn.onclick = () => {
        haptic('success');
        showToast('Potwierdzono biometrią Face ID. Trwa rezerwacja w NFZ...');
        setTimeout(() => renderView(true), 600);
      };
    }
  }

  renderView(false);
  openDialogFocus('erej', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto e-Rejestrację wizyty NFZ');
}

function closeERejestracjaModal() {
  const modal = document.getElementById('erejestracjaModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('erej');
}

// --- 10d. Karta DiLO (Diagnostyki i Leczenia Onkologicznego) ---
function openDiloModal() {
  haptic('card');
  let modal = document.getElementById('diloModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'diloModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Karta DiLO - Diagnostyka i Leczenie Onkologiczne');
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  const diloNumber = 'DILO/NFZ/2026/84102';

  modal.innerHTML = `
    <div class="scrim" onclick="closeDiloModal()"></div>
    <div class="modal-box">
      <div class="modal-head">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">🎗️</span>
          <div>
            <h2 id="diloTitle">Karta DiLO</h2>
            <small style="color:var(--ink2)">Szybka terapia onkologiczna NFZ</small>
          </div>
        </div>
        <button class="tx-close" onclick="closeDiloModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>

      <div class="dilo-hero">
        <div class="dilo-badge">KARTA AKTYWNA — TRYB SZYBKIEJ ŚCIEŻKI</div>
        <b>Karta Diagnostyki i Leczenia Onkologicznego: ${diloNumber}</b>
        <p>Karta uprawnia do natychmiastowej diagnostyki i leczenia bez limitów finansowych NFZ, z gwarancją terminów ustawowych.</p>
      </div>

      <div class="dilo-coord-card">
        <div class="dilo-coord-head">
          <span>👩‍⚕️ Twój Wyznaczony Koordynator DiLO:</span>
          <b>mgr Anna Wójcik</b>
        </div>
        <div class="dilo-coord-body">
          <p>Narodowy Instytut Onkologii im. Marii Skłodowskiej-Curie w Warszawie</p>
          <div class="dilo-coord-contacts">
            <a href="tel:+48225462000" class="btn ghost btn-sm">📞 +48 22 546 20 00</a>
            <button type="button" class="btn ghost btn-sm" onclick="showToast('Koordynator dostępny pon-pt 8:00 - 15:00')">Godziny dyżuru</button>
          </div>
        </div>
      </div>

      <div class="dilo-stages-wrap">
        <b>Etapy ścieżki onkologicznej:</b>
        <div class="dilo-stage-item done">
          <span class="dilo-st-dot">✓</span>
          <div class="dilo-st-info">
            <b>Etap 1: Wystawienie karty DiLO</b>
            <small>Lekarz POZ • 04.10.2026</small>
          </div>
        </div>
        <div class="dilo-stage-item done">
          <span class="dilo-st-dot">✓</span>
          <div class="dilo-st-info">
            <b>Etap 2: Diagnostyka wstępna</b>
            <small>Badania obrazowe i laboratoryjne zakończone • 18.10.2026</small>
          </div>
        </div>
        <div class="dilo-stage-item current">
          <span class="dilo-st-dot">●</span>
          <div class="dilo-st-info">
            <b>Etap 3: Diagnostyka pogłębiona & Konsylium</b>
            <small>Konsylium lekarskie wyznaczone na: 12.11.2026, godz. 11:00</small>
          </div>
        </div>
        <div class="dilo-stage-item wait">
          <span class="dilo-st-dot">○</span>
          <div class="dilo-st-info">
            <b>Etap 4: Realizacja planu leczenia</b>
            <small>Oczekiwanie na decyzję konsylium wielodyscyplinarnego</small>
          </div>
        </div>
      </div>

      <div class="modal-actions" style="margin-top:16px">
        <button type="button" class="btn primary" onclick="closeDiloModal();openOfficialCertificate('dilo')" style="flex:1.4">Pobierz Kartę DiLO (PDF)</button>
        <button type="button" class="btn ghost" onclick="closeDiloModal();startTopic('Jak wygląda ścieżka leczenia z Kartą DiLO?')" style="flex:1">Zapytaj asystenta</button>
      </div>
    </div>
  `;

  openDialogFocus('dilo', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto Kartę Diagnostyki i Leczenia Onkologicznego');
}

function closeDiloModal() {
  const modal = document.getElementById('diloModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('dilo');
}

// --- 10e. Poświadczenie reprezentacji firmy (CEIDG / KRS) z e-dowodem ---
function openFirmaPoswiadczModal() {
  haptic('card');
  let modal = document.getElementById('firmaPoswiadczModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'firmaPoswiadczModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Poświadczenie reprezentacji firmy');
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  const token = 'CEIDG-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);

  modal.innerHTML = `
    <div class="scrim" onclick="closeFirmaPoswiadczModal()"></div>
    <div class="modal-box">
      <div class="modal-head">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">🏢</span>
          <div>
            <h2 id="fPosTitle">Poświadcz za firmę</h2>
            <small style="color:var(--ink2)">Cyfrowe umocowanie przedsiębiorcy CEIDG</small>
          </div>
        </div>
        <button class="tx-close" onclick="closeFirmaPoswiadczModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>

      <div class="firma-hero">
        <div class="firma-badge">REPREZENTACJA POTWIERDZONA e-DOWODEM</div>
        <b>Wiśniewski Instalacje Jan Wiśniewski</b>
        <p>NIP: 679 234 56 79 • REGON: 381920145 • PKD: 43.22.Z</p>
      </div>

      <div class="firma-qr-card">
        <div class="firma-qr-box">
          <svg viewBox="0 0 100 100" class="firma-qr-svg" width="130" height="130">
            <rect width="100" height="100" fill="#fff"/>
            <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" fill="#111"/>
            <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" fill="#111"/>
            <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" fill="#111"/>
            <rect x="50" y="15" width="5" height="15" fill="#111"/>
            <rect x="50" y="35" width="5" height="5" fill="#111"/>
            <rect x="45" y="45" width="10" height="10" fill="#111"/>
            <rect x="60" y="50" width="15" height="5" fill="#111"/>
            <rect x="80" y="50" width="10" height="10" fill="#111"/>
            <rect x="50" y="65" width="10" height="10" fill="#111"/>
            <rect x="65" y="65" width="10" height="10" fill="#111"/>
            <rect x="80" y="70" width="10" height="20" fill="#111"/>
            <rect x="50" y="85" width="20" height="5" fill="#111"/>
          </svg>
        </div>
        <div class="firma-token-tag">Jednorazowy token weryfikacyjny: <b>${token}</b></div>
        <small class="firma-token-sub">Ważny przez 3 minuty. Zeskanuj w banku, urzędzie lub u kontrahenta.</small>
      </div>

      <div class="firma-rows-box">
        <div class="firma-row"><span>Status CEIDG:</span> <b style="color:var(--ok)">Aktywny przedsiębiorca</b></div>
        <div class="firma-row"><span>Biała Lista VAT:</span> <b>Czynny podatnik VAT (Konto OK)</b></div>
        <div class="firma-row"><span>Uprawnienie:</span> <b>Właściciel / Reprezentacja jednoosobowa</b></div>
        <div class="firma-row"><span>Adres doręczeń:</span> <b>ul. Floriańska 12/4, 31-021 Kraków</b></div>
      </div>

      <div class="modal-actions" style="margin-top:16px">
        <button type="button" class="btn primary" id="copyFirmaBtn" style="flex:1.4">Kopiuj dane do faktury</button>
        <button type="button" class="btn ghost" onclick="closeFirmaPoswiadczModal();openOfficialCertificate('ceidg')" style="flex:1">Odpis CEIDG (PDF)</button>
      </div>
    </div>
  `;

  const copyBtn = modal.querySelector('#copyFirmaBtn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const txt = 'Wiśniewski Instalacje Jan Wiśniewski\nNIP: 6792345679\nREGON: 381920145\nul. Floriańska 12/4, 31-021 Kraków';
      navigator.clipboard.writeText(txt);
      showToast('Skopiowano kompletne dane firmy do schowka');
    };
  }

  openDialogFocus('fpos', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto poświadczenie tożsamości i reprezentacji firmy');
}

function closeFirmaPoswiadczModal() {
  const modal = document.getElementById('firmaPoswiadczModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('fpos');
}

// --- 10f. Podpisanie dokumentu firmowego e-dowodem ---
function openFirmaPodpisModal() {
  haptic('card');
  let modal = document.getElementById('firmaPodpisModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'firmaPodpisModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Podpisanie dokumentu e-dowodem');
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  function renderView(signed = false) {
    if (signed) {
      modal.innerHTML = `
        <div class="scrim" onclick="closeFirmaPodpisModal()"></div>
        <div class="modal-box">
          <div class="modal-head">
            <h2 id="fPodSuccess">Dokument podpisany!</h2>
            <button class="tx-close" onclick="closeFirmaPodpisModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
          </div>
          <div class="erej-success-hero">
            <div class="erej-ok-icon">✍️</div>
            <b>Podpis osobisty certyfikatem z dowodu osobistego</b>
            <span class="erej-code">Sygnatura: XADES-BES/RP-${Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <div class="erej-summary-box">
            <div class="erej-row"><span>Podpisujący:</span> <b>Jan Wiśniewski (PESEL 81051939871)</b></div>
            <div class="erej-row"><span>W imieniu:</span> <b>Wiśniewski Instalacje (NIP 679 234 56 79)</b></div>
            <div class="erej-row"><span>Dokument:</span> <b>Umowa o współpracy B2B (Instalacje Sanitarne)</b></div>
            <div class="erej-row"><span>Znacznik czasu:</span> <b>${today()}, ${now()} (GUM RP)</b></div>
            <div class="erej-row"><span>Moc prawna:</span> <b>Równoważny z podpisem własnoręcznym (art. 78¹ KC)</b></div>
          </div>
          <div class="modal-actions" style="margin-top:16px">
            <button type="button" class="btn primary" onclick="showToast('Pobrano podpisany dokument XML (XAdES) wraz z UPO');closeFirmaPodpisModal()" style="flex:1">Pobierz dokument z pieczęcią</button>
            <button type="button" class="btn ghost" onclick="closeFirmaPodpisModal()" style="flex:1">Zamknij</button>
          </div>
        </div>
      `;
      return;
    }

    modal.innerHTML = `
      <div class="scrim" onclick="closeFirmaPodpisModal()"></div>
      <div class="modal-box">
        <div class="modal-head">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">✍️</span>
            <div>
              <h2 id="fPodTitle">Podpisz dokument e-dowodem</h2>
              <small style="color:var(--ink2)">Certyfikat podpisu osobistego z mDowodu</small>
            </div>
          </div>
          <button class="tx-close" onclick="closeFirmaPodpisModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
        </div>

        <p class="modal-sub">Wybierz dokument do złożenia podpisu kwalifikowanego w imieniu firmy:</p>

        <div class="firma-doc-picker">
          <label class="f-doc-opt active">
            <input type="radio" name="fDoc" checked>
            <div class="f-doc-tx">
              <b>Umowa o współpracy B2B (Wiśniewski Instalacje)</b>
              <small>Kontrahent: TechBuild Polska Sp. z o.o. • PDF 142 KB</small>
            </div>
          </label>
          <label class="f-doc-opt">
            <input type="radio" name="fDoc">
            <div class="f-doc-tx">
              <b>Oświadczenie do Urzędu Skarbowego</b>
              <small>Zgłoszenie aktualizacyjne NIP-B • PDF 98 KB</small>
            </div>
          </label>
        </div>

        <div class="f-cert-info-box">
          <span>Certyfikat: <b>Podpis osobisty RP (Jan Wiśniewski)</b></span>
          <small>Certyfikat aktywny w bezpiecznym module Secure Enclave urządzenia.</small>
        </div>

        <div class="modal-actions" style="margin-top:16px">
          <button type="button" class="btn primary" id="fSignBtn" style="flex:1.4">Złóż podpis (Face ID)</button>
          <button type="button" class="btn ghost" onclick="closeFirmaPodpisModal()" style="flex:1">Anuluj</button>
        </div>
      </div>
    `;

    const signBtn = modal.querySelector('#fSignBtn');
    if (signBtn) {
      signBtn.onclick = () => {
        haptic('success');
        showToast('Weryfikacja biometryczna Face ID... Składanie podpisu cyfrowego.');
        setTimeout(() => renderView(true), 700);
      };
    }
  }

  renderView(false);
  openDialogFocus('fpod', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  announceSR('Otwarto moduł podpisywania dokumentów firmowych e-dowodem');
}

function closeFirmaPodpisModal() {
  const modal = document.getElementById('firmaPodpisModal');
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  restoreDialogFocus('fpod');
}

// --- 11. Inteligentne podpowiedzi w czasie rzeczywistym ---
const SEARCH_DATABASE = [
  { text: 'Zastrzeż mój PESEL', cat: 'Bezpieczeństwo', icon: 'shield', desc: 'Blokada wyłudzeń kredytów' },
  { text: 'Ile mam punktów karnych?', cat: 'Kierowca', icon: 'clock', desc: 'Stan konta CEPiK' },
  { text: 'Kiedy kończy się OC auta?', cat: 'Kierowca', icon: 'car', desc: 'Termin ubezpieczenia i przegląd' },
  { text: 'Miałam stłuczkę', cat: 'Kierowca', icon: 'car', desc: 'Oświadczenie sprawcy kolizji' },
  { text: 'Chcę zapłacić podatek', cat: 'Płatności', icon: 'coin', desc: 'ePłatności BLIK bez prowizji' },
  { text: 'Zgubiłam portfel i dowód', cat: 'Dokumenty', icon: 'alert', desc: 'Zastrzeżenie dowodu i kart' },
  { text: 'Paszport dla dziecka', cat: 'Rodzina', icon: 'doc', desc: 'Wniosek online' },
  { text: 'Wniosek o 800+', cat: 'Rodzina', icon: 'doc', desc: 'Świadczenie wychowawcze ZUS' },
  { text: 'Urodziło nam się dziecko', cat: 'Rodzina', icon: 'doc', desc: 'Zgłoszenie narodzin w USC' },
  { text: 'Dostałam podejrzanego SMS-a', cat: 'Bezpieczeństwo', icon: 'alert', desc: 'Zgłoszenie do CSIRT NASK' },
  { text: 'Kto sprawdzał mój PESEL?', cat: 'Bezpieczeństwo', icon: 'shield', desc: 'Historia weryfikacji' },
  { text: 'Kupuję używane auto', cat: 'Kierowca', icon: 'car', desc: 'Historia pojazdu z CEPiK' },
  { text: 'Moje e-Recepty w IKP', cat: 'Zdrowie', icon: 'doc', desc: 'Kody PIN i kod kreskowy w aptece' },
  { text: 'e-Rejestracja wizyty NFZ', cat: 'Zdrowie', icon: 'clock', desc: 'Zapis do lekarza POZ / specjalisty' },
  { text: 'Karta DiLO onkologiczna', cat: 'Zdrowie', icon: 'shield', desc: 'Szybka terapia onkologiczna NFZ' },
  { text: 'Poświadcz za firmę (CEIDG)', cat: 'Firma', icon: 'shield', desc: 'Certyfikat reprezentacji i NIP' },
  { text: 'Podpisz dokument e-dowodem', cat: 'Firma', icon: 'doc', desc: 'Podpis elektroniczny z certyfikatem' },
  { text: 'Biała Lista Podatników VAT', cat: 'Firma', icon: 'coin', desc: 'Wykaz MF i status przedsiębiorcy' }
];

let selectedSuggestIndex = -1;

function initLiveSearch() {
  const input = document.getElementById('prompt');
  const suggest = document.getElementById('searchSuggest');
  if (!input || !suggest) return;

  function hideSuggest() {
    suggest.hidden = true;
    suggest.innerHTML = '';
    selectedSuggestIndex = -1;
  }

  function renderMatches(matches) {
    if (!matches.length) { hideSuggest(); return; }
    selectedSuggestIndex = -1;
    suggest.innerHTML = matches.slice(0, 4).map((m, idx) => `
      <button type="button" class="ss-item" role="option" data-idx="${idx}" data-val="${m.text}">
        <span class="ss-ic">${svg(m.icon || 'chev')}</span>
        <span class="ss-tx">
          <b>${m.text}</b>
          <small>${m.desc}</small>
        </span>
        <span class="ss-badge">${m.cat}</span>
      </button>
    `).join('');
    suggest.hidden = false;

    suggest.querySelectorAll('.ss-item').forEach(btn => {
      btn.onclick = () => {
        haptic('tap');
        const val = btn.dataset.val;
        hideSuggest();
        send(val);
      };
    });
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      hideSuggest();
      return;
    }
    const matches = SEARCH_DATABASE.filter(item =>
      item.text.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.cat.toLowerCase().includes(query)
    );
    renderMatches(matches);
  });

  input.addEventListener('keydown', e => {
    if (suggest.hidden) return;
    const items = suggest.querySelectorAll('.ss-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestIndex = (selectedSuggestIndex + 1) % items.length;
      items.forEach((it, i) => it.classList.toggle('active', i === selectedSuggestIndex));
      if (items[selectedSuggestIndex]) items[selectedSuggestIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestIndex = (selectedSuggestIndex - 1 + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('active', i === selectedSuggestIndex));
      if (items[selectedSuggestIndex]) items[selectedSuggestIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && selectedSuggestIndex >= 0) {
      e.preventDefault();
      if (items[selectedSuggestIndex]) items[selectedSuggestIndex].click();
    } else if (e.key === 'Escape') {
      hideSuggest();
    }
  });

  document.addEventListener('click', e => {
    if (!suggest.contains(e.target) && e.target !== input) {
      hideSuggest();
    }
  });
}

// Inicjalizacja przy załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  A11Y.init();
  renderDashboard();
  updateErrorBadge();
  initLiveSearch();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('mObywatel PWA SW registered:', reg.scope);
    }).catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
  const skip = document.getElementById('skipToChat');
  if (skip) {
    skip.addEventListener('click', e => {
      e.preventDefault();
      if (typeof enterChat === 'function') enterChat();
      const pr = document.getElementById('prompt');
      if (pr) pr.focus();
    });
  }
});
