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
  }
};

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
  p.classList.toggle('open', open);
  if (b) b.setAttribute('aria-expanded', open);
}
function closeA11yPanel() {
  const p = document.getElementById('a11yPanel'), b = document.getElementById('a11yBtn');
  if (p) p.classList.remove('open');
  if (b) b.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', e => { const p = document.getElementById('a11yPanel'); if (p && p.classList.contains('open') && !p.contains(e.target)) closeA11yPanel(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeA11yPanel(); if (typeof closeGlossary === 'function') closeGlossary(); if (typeof closePointsDetail === 'function') closePointsDetail(); if (typeof closeUPO === 'function') closeUPO(); } });

// --- 3. Komunikaty Toast ---
function showToast(msg) {
  let t = document.getElementById('mobToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'mobToast';
    t.className = 'mob-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
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
  modal.classList.add('open');
}

function closeGlossary() {
  const modal = document.getElementById('glossaryModal');
  if (modal) modal.classList.remove('open');
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
        <button class="upo-close-btn" onclick="closeUPO()">✕ Zamknij</button>
        <button class="upo-print-btn" onclick="window.print()">🖨️ Drukuj / Zapisz PDF</button>
      </div>
      <div class="upo-document" id="printableUPO">
        <div class="upo-doc-head">
          <div class="upo-eagle">
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
          <div class="upo-stamp">
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

  modal.classList.add('open');
}

function closeUPO() {
  const modal = document.getElementById('upoModal');
  if (modal) modal.classList.remove('open');
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

  const tile = (id, tone, icon, title, sub, label) =>
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

// Szybka akcja PESEL z pulpitu: otwiera rozmowę, żeby karta potwierdzenia była widoczna
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
  }));
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
  }));
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
      modal.classList.remove('open');
      startTopic('Ile mam punktów karnych i kiedy wygasną?');
    };
  }
  modal.classList.add('open');
}

function closePointsDetail() {
  const modal = document.getElementById('pointsModal');
  if (modal) modal.classList.remove('open');
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
    <button type="button" class="topic-cat-pill ${c.id === activeTopicCategory ? 'active' : ''}" onclick="selectTopicCategory('${c.id}')">
      <span class="topic-cat-icon">${c.icon}</span>
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
      <div class="topic-cat-bar">${catsHtml}</div>
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
});
