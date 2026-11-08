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

  // Stan PESEL: domyślnie niezastrzeżony (false)
  isPeselBlocked() {
    return this.get('pesel_blocked', false);
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
  const det = document.getElementById('detail');
  if (det && det.classList.contains('on')) return det;
  if (app.classList.contains('todo')) return document.querySelector('#todo .tpanel');
  if (app.classList.contains('menu')) return document.querySelector('#lmenu .panel');
  if (app.classList.contains('hist')) return document.querySelector('#hmenu .panel');
  return null;
}

// --- 2. Dostępność (WCAG, Duży Tekst, Wysoki Kontrast) ---
const A11Y = {
  largeText: false,
  highContrast: false,

  init() {
    try {
      this.largeText = localStorage.getItem('mob_large_text') === '1';
      this.highContrast = localStorage.getItem('mob_high_contrast') === '1';
    } catch (e) {}
    this.apply();
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

  apply() {
    document.body.classList.toggle('large-text', this.largeText);
    document.body.classList.toggle('high-contrast', this.highContrast);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.classList.toggle('large-text', this.largeText);
      appEl.classList.toggle('high-contrast', this.highContrast);
    }
    const f = document.getElementById('apFont'), c = document.getElementById('apContrast');
    if (f) { f.classList.toggle('on', this.largeText); f.setAttribute('aria-checked', this.largeText); }
    if (c) { c.classList.toggle('on', this.highContrast); c.setAttribute('aria-checked', this.highContrast); }
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
  if (e.key !== 'Escape') return;
  const upo = document.getElementById('upoModal');
  if (upo && upo.classList.contains('open')) { e.preventDefault(); closeUPO(); return; }
  const errM = document.getElementById('errModal');
  if (errM && errM.classList.contains('open')) { e.preventDefault(); closeErrorHistory(); return; }
  const glM = document.getElementById('glossaryModal');
  if (glM && glM.classList.contains('open')) { e.preventDefault(); closeGlossary(); return; }
  const ptM = document.getElementById('pointsModal');
  if (ptM && ptM.classList.contains('open')) { e.preventDefault(); closePointsDetail(); return; }
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
  const paid = MobStore.isTaxPaid();

  const tile = (id, tone, icon, title, sub) =>
    `<button type="button" class="qt ${tone}" data-q="${id}" aria-label="${title}: ${sub}">
      <span class="qt-ic">${svg(icon)}</span>
      <span class="qt-tx"><b>${title}</b><small>${sub}</small></span>
    </button>`;

  host.innerHTML = [
    tile('pesel', pesel ? 'ok' : 'warn', pesel ? 'shield' : 'alert', 'PESEL',
      pesel ? 'Zastrzeżony' : 'Niezastrzeżony'),
    tile('pkt', pkt === 0 ? 'ok' : pkt >= limit * 0.75 ? 'warn' : 'info', 'clock', 'Punkty karne',
      `${pkt} z ${limit}`),
    auto ? tile('auto', auto.alert ? 'warn' : 'ok', 'car', auto.model ? auto.model.split(' ')[0] : 'Pojazd',
      auto.alert || 'OC i badanie ważne') : '',
    tax ? tile('pay', paid ? 'ok' : 'warn', 'coin', paid ? 'Opłacone' : (kwota || 'Do zapłaty'),
      paid ? 'Brak zaległości' : (termin ? 'Podatek ' + termin : tax.h)) : ''
  ].join('');

  host.querySelectorAll('.qt').forEach(b => b.onclick = () => ({
    pesel: togglePeselDirect, pkt: openPointsDetail, auto: () => openDoc('auto'), pay: directPaymentClick
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

// Inicjalizacja przy załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  A11Y.init();
  renderDashboard();
  updateErrorBadge();
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
