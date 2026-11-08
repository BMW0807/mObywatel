/* ==========================================================================
   mObywatel 2.0 - Katalog Dokumentów Publicznych (+ Dodaj dokument)
   (katalog-kart.js)
   ========================================================================== */

const KATALOG_KART = {
  katalog: [
    {
      id: 'zus_emeryt',
      name: 'mLegitymacja emeryta/rencisty',
      sub: 'ZUS • Emerytura powszechna',
      cat: 'Spółeczne i emerytalne',
      icon: '🛡️',
      source: 'Zakład Ubezpieczeń Społecznych (ZUS)',
      badge: 'ZUS',
      color: '#065f46',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)',
      docData: (os) => ({
        id: 'zus_emeryt',
        name: 'mLegitymacja emeryta/rencisty',
        img: 'assets/card-emeryt.svg',
        sub: 'ZUS • Ważna bezterminowo',
        holder: `${os.imie} ${os.nazwisko}`.toUpperCase(),
        line: 'Nr legitymacji: EL/2026/89412',
        f: [
          ['Nr legitymacji', 'EL/2026/89412'],
          ['Świadczenie', 'Emerytura'],
          ['Wydana przez', 'ZUS I O/Warszawa'],
          ['Status', 'Ważna']
        ],
        rows: [
          ['Posiadacz', `${os.imie} ${os.nazwisko}`],
          ['PESEL', os.moje.pesel || '83051203455'],
          ['Numer legitymacji', 'EL/2026/89412'],
          ['Rodzaj świadczenia', 'Emerytura powszechna'],
          ['Organ wydający', 'Zakład Ubezpieczeń Społecznych, Oddział I'],
          ['Data wydania', '12.01.2024'],
          ['Ważność', 'Bezterminowo'],
          ['Uprawnienia', 'Ulga na przejazdy PKP/KM, zniżki komunalne, apteczne']
        ]
      })
    },
    {
      id: 'karta_nauczyciela',
      name: 'Karta Nauczyciela',
      sub: 'MEN • Nauczyciel mianowany',
      cat: 'Karty zawodowe i edukacja',
      icon: '🎓',
      source: 'Ministerstwo Edukacji Narodowej (MEN)',
      badge: 'MEN',
      color: '#1e3a8a',
      gradient: 'linear-gradient(135deg, #172554 0%, #1e40af 50%, #1d4ed8 100%)',
      docData: (os) => ({
        id: 'karta_nauczyciela',
        name: 'Karta Nauczyciela',
        img: 'assets/card-legitymacja-bez.webp',
        sub: 'MEN • Legitymacja służbowa',
        holder: `${os.imie} ${os.nazwisko}`.toUpperCase(),
        line: 'Szkoła Podstawowa nr 15 w Krakowie',
        f: [
          ['Nr legitymacji', 'KN/2025/0412'],
          ['Stopień', 'Nauczyciel mianowany'],
          ['Ważna do', '31.08.2028'],
          ['Ulga', '33% przejazdy kolejowe']
        ],
        rows: [
          ['Nauczyciel', `${os.imie} ${os.nazwisko}`],
          ['Szkoła', 'Szkoła Podstawowa nr 15 im. Jana III Sobieskiego'],
          ['Numer służbowy', 'KN/2025/0412'],
          ['Stopień awansu', 'Nauczyciel mianowany'],
          ['Ważność', 'Ważna do 31.08.2028'],
          ['Uprawnienia', 'Zniżki na przejazdy kolejowe 33%, ulgi do muzeów państwowych']
        ]
      })
    },
    {
      id: 'pwz_lekarza',
      name: 'Prawo Wykonywania Zawodu Lekarza',
      sub: 'NIL • Naczelna Izba Lekarska',
      cat: 'Karty zawodowe i edukacja',
      icon: '🩺',
      source: 'Naczelna Izba Lekarska (NIL)',
      badge: 'PWZ',
      color: '#0f766e',
      gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)',
      docData: (os) => ({
        id: 'pwz_lekarza',
        name: 'PWZ Lekarza',
        img: 'assets/card-ikp.svg',
        sub: 'Naczelna Izba Lekarska • Aktywne',
        holder: `LEK. MED. ${os.imie} ${os.nazwisko}`.toUpperCase(),
        line: 'PWZ nr 3829104, OIL Warszawa',
        f: [
          ['Nr PWZ', '3829104'],
          ['Izba', 'OIL w Warszawie'],
          ['Tytuł', 'Lekarz medycyny'],
          ['Status', 'Prawo stałe']
        ],
        rows: [
          ['Lekarz', `${os.imie} ${os.nazwisko}`],
          ['Numer PWZ', '3829104'],
          ['Okręgowa Izba', 'Okręgowa Izba Lekarska w Warszawie'],
          ['Data przyznania prawa', '24.10.2010'],
          ['Specjalizacja', 'Medycyna rodzinna (w trakcie certyfikacji)'],
          ['Status prawa', 'Wykonywanie zawodu aktywne, bez ograniczeń']
        ]
      })
    },
    {
      id: 'karta_polaka',
      name: 'Karta Polaka',
      sub: 'MSZ • Przynależność do Narodu Polskiego',
      cat: 'Tożsamość i obywatelstwo',
      icon: '🇵🇱',
      source: 'Ministerstwo Spraw Zagranicznych (MSZ)',
      badge: 'MSZ',
      color: '#831843',
      gradient: 'linear-gradient(135deg, #500724 0%, #9d174d 50%, #be185d 100%)',
      docData: (os) => ({
        id: 'karta_polaka',
        name: 'Karta Polaka',
        img: 'assets/card-mdowod-bez.webp',
        sub: 'MSZ • Ważna 10 lat',
        holder: `${os.imie} ${os.nazwisko}`.toUpperCase(),
        line: 'Decyzja Konsula RP, seria KP 002148',
        f: [
          ['Seria i numer', 'KP 002148'],
          ['Obywatelstwo', 'Polskie pochodzenie'],
          ['Wydana przez', 'Konsulat Generalny RP'],
          ['Ważna do', '14.05.2034']
        ],
        rows: [
          ['Posiadacz', `${os.imie} ${os.nazwisko}`],
          ['Numer Karty Polaka', 'KP 002148'],
          ['Organ wydający', 'Konsulat Generalny Rzeczypospolitej Polskiej'],
          ['Ważność', 'Ważna do 14.05.2034 (10 lat od wydania)'],
          ['Uprawnienia', 'Zwolnienie z opłat za wizy, legalna praca bez zezwolenia, ulga 37% PKP']
        ]
      })
    },
    {
      id: 'leg',
      name: 'mLegitymacja studencka',
      sub: 'MEiN • Szkolnictwo wyższe',
      cat: 'Karty zawodowe i edukacja',
      icon: '📚',
      source: 'Ministerstwo Nauki i Szkolnictwa Wyższego',
      badge: 'STUDENT',
      color: '#4c1d95',
      gradient: 'linear-gradient(135deg, #2e1065 0%, #5b21b6 50%, #7c3aed 100%)',
      docData: (os) => ({
        id: 'leg',
        name: 'mLegitymacja studencka',
        img: 'assets/card-legitymacja-bez.webp',
        sub: 'Uniwersytet Jagielloński • Ważna',
        holder: `${os.imie} ${os.nazwisko}`.toUpperCase(),
        line: 'Nr albumu 194821, UJ Kraków',
        f: [
          ['Nr albumu', '194821'],
          ['Ważna do', '31.03.2027'],
          ['Uczelnia', 'UJ Kraków'],
          ['Ulga PKP', '51%']
        ],
        rows: [
          ['Student', `${os.imie} ${os.nazwisko}`],
          ['Uczelnia', 'Uniwersytet Jagielloński w Krakowie'],
          ['Wydział', 'Wydział Prawa i Administracji'],
          ['Numer albumu', '194821'],
          ['Ważność', 'Ważna do 31.03.2027 (hologram semestralny ważny)'],
          ['Uprawnienia', 'Ustawowa ulga 51% na przejazdy PKP, 50% komunikacja miejska']
        ]
      })
    }
  ]
};

// ----------------- MODAL KATALOGU DOKUMENTÓW -----------------
function openKatalogKartModal() {
  if (typeof haptic === 'function') haptic('tap');
  let modal = document.getElementById('katalogKartModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'katalogKartModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'katalogKartTitle');
    document.getElementById('app').appendChild(modal);
  }

  const activeDocIds = (typeof DOCS !== 'undefined') ? DOCS.map(d => d.id) : [];

  const itemsHtml = KATALOG_KART.katalog.map(item => {
    const isAdded = activeDocIds.includes(item.id);
    return `
      <div class="katalog-item ${isAdded ? 'added' : ''}">
        <div class="kat-item-badge" style="background:${item.gradient}">${item.badge}</div>
        <div class="kat-item-meta">
          <b>${item.name}</b>
          <small>${item.source}</small>
          <span class="kat-cat-tag">${item.cat}</span>
        </div>
        <div class="kat-item-act">
          ${isAdded ? `
            <span class="kat-added-pill">${typeof svg === 'function' ? svg('check') : '✓'} W portfelu</span>
          ` : `
            <button type="button" class="btn primary kat-add-btn" onclick="dodajDokumentDoPortfela('${item.id}')">
              + Dodaj
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  modal.innerHTML = `
    <div class="scrim" onclick="closeKatalogKartModal()"></div>
    <div class="modal-box">
      <div class="modal-head">
        <h2 id="katalogKartTitle">+ Dodaj dokument do mObywatela</h2>
        <button class="tx-close" onclick="closeKatalogKartModal()" aria-label="Zamknij">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
        </button>
      </div>
      <p class="modal-sub">Wybierz dokument państwowy, aby pobrać go z rejestru i przypiąć do portfela.</p>

      <div class="katalog-list">
        ${itemsHtml}
      </div>

      <div class="modal-actions" style="margin-top:16px">
        <button type="button" class="btn ghost wide" onclick="closeKatalogKartModal()">Zamknij</button>
      </div>
    </div>
  `;

  if (typeof openDialogFocus === 'function') openDialogFocus('katalog', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  if (typeof announceSR === 'function') announceSR('Otwarto katalog dokumentów do dodania');
}

function closeKatalogKartModal() {
  const modal = document.getElementById('katalogKartModal');
  if (modal && modal.classList.contains('open')) {
    modal.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('katalog');
  }
}

// ----------------- DODAWANIE DOKUMENTU DO PORTFELA -----------------
function dodajDokumentDoPortfela(docId) {
  const entry = KATALOG_KART.katalog.find(k => k.id === docId);
  if (!entry) return;

  if (typeof haptic === 'function') haptic('confirm');

  // Sprawdź czy już jest w DOCS
  if (DOCS.some(d => d.id === docId)) {
    if (typeof showToast === 'function') showToast(`Dokument "${entry.name}" znajduje się już w portfelu.`);
    return;
  }

  // Wygeneruj strukturę dokumentu dla aktywnej osoby
  const newDoc = entry.docData(OS);

  // Dodaj na początek lub odpowiednie miejsce w stosie
  DOCS.unshift(newDoc);
  if (OS.docs && !OS.docs.some(d => d.id === docId)) {
    OS.docs.unshift(newDoc);
  }

  // Odśwież renderowanie stosu kart i przelicz layout
  if (typeof renderStack === 'function') renderStack();
  if (typeof layout === 'function') layout();

  closeKatalogKartModal();

  if (typeof showToast === 'function') {
    showToast(`Pobrano z rejestru i dodano dokument: ${entry.name}`);
  }

  if (typeof showSystemPush === 'function') {
    showSystemPush({
      title: 'Nowy dokument w mObywatelu',
      body: `Dokument "${entry.name}" został zweryfikowany w rejestrze państwowym i dodany do portfela.`,
      icon: '🛡️',
      badge: 'REJESTR',
      onClick: () => { if (typeof openDoc === 'function') openDoc(docId); }
    });
  }

  // Otwórz podgląd nowo dodanego dokumentu z animacją
  setTimeout(() => {
    if (typeof openDoc === 'function') openDoc(docId);
  }, 350);
}

// Pomocnicze podpięcie przycisku "+ Dodaj dokument"
function injectDodajBtn() {
  const pbar = document.getElementById('personBtn');
  if (!pbar || document.getElementById('btnAddDocGlobal')) return;

  const btn = document.createElement('button');
  btn.id = 'btnAddDocGlobal';
  btn.type = 'button';
  btn.className = 'btn-add-doc-top';
  btn.setAttribute('aria-label', 'Dodaj nowy dokument do portfela');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    <span>Dodaj</span>
  `;
  btn.onclick = openKatalogKartModal;
  pbar.parentElement.insertBefore(btn, pbar.nextSibling);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectDodajBtn);
} else {
  setTimeout(injectDodajBtn, 50);
}
