/* ---------- mObywatel 2.0 - Centrum Powiadomień i e-Doręczenia (poczta.js) ---------- */

// Pisma w skrzynce zależą od osoby: wcześniej wszyscy widzieli listy do Jana („Szanowny Panie Janie…”, US w Krakowie).
// Dla Marty, Ewy i Kacpra te same pisma, które asystent zna z rejestru (serwer/persony.py, pole skrzynka).
const POCZTA_LISTY_OSOB = {
  marta: [
    {
      id: 'let_marta_us',
      sender: 'Urząd Skarbowy Warszawa-Mokotów',
      subject: 'Wezwanie do złożenia wyjaśnień',
      date: '17.10.2026, 09:12',
      badge: 'Urząd Skarbowy',
      read: false,
      upo: 'UPO/2026/10/17/418230',
      content: `Urząd prosi o udokumentowanie ulgi termomodernizacyjnej z zeznania PIT-37 za 2025 r. (odliczono 32 520 zł) za dom jednorodzinny przy ul. Kwiatowej 12. Wymagane faktury za materiały i usługi.\n\nTermin odpowiedzi: 26.10.2026.`
    },
    {
      id: 'let_marta_zus',
      sender: 'Zakład Ubezpieczeń Społecznych (ZUS)',
      subject: 'Informacja o stanie konta ubezpieczonego',
      date: '30.09.2026, 08:30',
      badge: 'ZUS',
      read: true,
      upo: 'UPO/2026/09/30/207714',
      content: `Roczna informacja o zgromadzonych składkach.`
    }
  ],
  ewa: [
    {
      id: 'let_ewa_zus',
      sender: 'Zakład Ubezpieczeń Społecznych (ZUS)',
      subject: 'Informacja o stanie konta ubezpieczonego',
      date: '15.10.2026, 08:30',
      badge: 'ZUS',
      read: false,
      upo: 'UPO/2026/10/15/530981',
      content: `Wiek emerytalny osiągniesz 03.02.2029. Wniosek o emeryturę (EMP) złożysz najwcześniej 30 dni przed tą datą, czyli od 04.01.2029. Kapitał początkowy: 98 700 zł.`
    },
    {
      id: 'let_ewa_um',
      sender: 'Urząd Miasta Lublin',
      subject: 'Decyzja w sprawie podatku od nieruchomości na 2026 r.',
      date: '10.02.2026, 11:05',
      badge: 'Urząd Miasta',
      read: true,
      upo: 'UPO/2026/02/10/118402',
      content: `Podatek na 2026 r.: 656 zł w 4 ratach.`
    }
  ],
  kacper: [
    {
      id: 'let_kacper_pg',
      sender: 'Politechnika Gdańska',
      subject: 'Decyzja o przyznaniu stypendium rektora',
      date: '14.10.2026, 12:40',
      badge: 'Uczelnia',
      read: false,
      upo: 'UPO/2026/10/14/662105',
      content: `Stypendium rektora na rok akademicki 2026/2027: 1 100 zł miesięcznie, od października 2026.`
    }
  ]
};

const POCZTA = {
  currentTab: 'inbox',

  letters: (typeof OS !== 'undefined' && POCZTA_LISTY_OSOB[OS.id]) || [
    {
      id: 'let_us_01',
      sender: 'Pierwszy Urząd Skarbowy w Krakowie',
      subject: 'Decyzja o zwrocie nadpłaty podatku dochodowego (PIT-37)',
      date: '05.11.2026, 10:14',
      badge: 'Urząd Skarbowy',
      read: false,
      upo: 'UPO/2026/11/05/982143',
      content: `Szanowny Panie Janie,\n\nNaczelnik Pierwszego Urzędu Skarbowego w Krakowie informuje, że w wyniku weryfikacji zeznania podatkowego PIT-37 za rok 2025 stwierdzono nadpłatę podatku w wysokości 1 482,00 zł.\n\nŚrodki zostały przekazane na Pana rachunek bankowy zgłoszony w formularzu ZAP-3.\n\nNiniejsze pismo stanowi oficjalne powiadomienie doręczone w trybie Ustawy o e-Doręczeniach.`
    },
    {
      id: 'let_zus_02',
      sender: 'Zakład Ubezpieczeń Społecznych (ZUS)',
      subject: 'Informacja o stanie konta ubezpieczonego i składkach emerytalnych',
      date: '12.10.2026, 08:30',
      badge: 'ZUS',
      read: true,
      upo: 'UPO/2026/10/12/341908',
      content: `ZUS informuje o zewidencjonowaniu składek emerytalnych za III kwartał 2026 r. dla Pana działalności gospodarczej Wiśniewski Instalacje. Składki opłacone terminowo w pełnej wysokości.`
    },
    {
      id: 'let_star_03',
      sender: 'Wydział Ewidencji Pojazdów i Kierowców',
      subject: 'Zawiadomienie o wpisie adnotacji HAK w dowodzie rejestracyjnym',
      date: '18.09.2026, 14:02',
      badge: 'Komunikacja',
      read: true,
      upo: 'UPO/2026/09/18/771249',
      content: `Wprowadzono pomyślnie zmianę danych w Centralnej Ewidencji Pojazdów (CEPiK) na podstawie zaświadczenia z okręgowej stacji kontroli pojazdów.`
    }
  ],

  defaultSent: [
    {
      id: 'sent_01',
      recipient: 'Urząd Miasta Krakowa',
      subject: 'Wniosek o wydanie odpisu aktu urodzenia dziecka',
      date: '28.10.2026, 12:45',
      badge: 'Urząd Stanu Cywilnego',
      upp: 'UPP/2026/10/28/554192',
      sha256: 'a4f9b8c2d1e7845f0912ab345cd678ef1234567890abcdef1234567890abcdef',
      content: 'Wnoszę o wydanie wielojęzycznego odpisu skróconego aktu urodzenia...'
    }
  ],

  getSent() {
    const dflt = (typeof OS === 'undefined' || OS.id === 'jan') ? this.defaultSent : [];   // pismo do UM Krakowa wysłał Jan
    if (typeof MobStore !== 'undefined') {
      return MobStore.get('poczta_sent', dflt);
    }
    return dflt;
  },

  addSent(pismo) {
    const list = this.getSent();
    list.unshift(pismo);
    if (typeof MobStore !== 'undefined') {
      MobStore.set('poczta_sent', list);
    }
  },

  notifications: [
    {
      id: 'notif_rcb',
      type: 'rcb',
      title: 'ALERT RCB – SILNY WIATR',
      desc: 'Uwaga! Dziś w nocy i jutro silny wiatr w porywach do 85 km/h. Możliwe przerwy w dostawie prądu. Zabezpiecz luźne przedmioty.',
      date: 'Dzisiaj, 13:45',
      unread: true
    },
    {
      id: 'notif_auto',
      type: 'car',
      title: 'Badanie techniczne pojazdu',
      desc: 'Zbliża się termin badania technicznego dla pojazdu Fiat Panda (LU 5521P) – upływa za 21 dni.',
      date: 'Wczoraj, 09:00',
      unread: true
    },
    {
      id: 'notif_rx',
      type: 'health',
      title: 'Aktywna e-Recepta',
      desc: 'Recepta na Amoksiklav dla Zofii Wiśniewskiej czeka na realizację w aptece. Kod PIN: 4821.',
      date: '06.11.2026',
      unread: false
    },
    {
      id: 'notif_sec',
      type: 'sec',
      title: 'Bezpieczeństwo konta',
      desc: 'Logowanie za pomocą biometrii (Face ID) zakończone pomyślnie z urządzenia iPhone 15 Pro.',
      date: '04.11.2026',
      unread: false
    }
  ]
};

// ----------------- MODAL: E-DORĘCZENIA (SKRZYNKA POCZTOWA) -----------------
function openPocztaModal(tab) {
  const m = document.getElementById('pocztaModal');
  if (!m) return;
  POCZTA.currentTab = tab || POCZTA.currentTab || 'inbox';

  const unreadCount = POCZTA.letters.filter(x => !x.read).length;
  const sentList = POCZTA.getSent();

  const listEl = m.querySelector('.poczta-list');
  if (listEl) {
    listEl.innerHTML = `
      <div class="poczta-bar-row">
        <div class="poczta-tabs">
          <button type="button" class="ptab-btn ${POCZTA.currentTab === 'inbox' ? 'active' : ''}" onclick="openPocztaModal('inbox')">
            Odebrane ${unreadCount ? `<span class="ptab-badge">${unreadCount}</span>` : ''}
          </button>
          <button type="button" class="ptab-btn ${POCZTA.currentTab === 'sent' ? 'active' : ''}" onclick="openPocztaModal('sent')">
            Wysłane (${sentList.length})
          </button>
        </div>
        <button type="button" class="btn-xs primary poczta-new-btn" onclick="openNowePismoModal()">
          + Nowe pismo
        </button>
      </div>

      <div class="poczta-items-container">
        ${POCZTA.currentTab === 'inbox' ? renderInboxLetters() : renderSentLetters()}
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('pocztaModal', m);
}

function renderInboxLetters() {
  if (!POCZTA.letters.length) {
    return '<div class="poczta-empty">Brak wiadomości w skrzynce odbiorczej.</div>';
  }
  return POCZTA.letters.map(l => `
    <div class="letter-card ${l.read ? 'read' : 'unread'}" onclick="openLetterDetail('${l.id}')">
      <div class="lc-head">
        <span class="lc-badge">${l.badge}</span>
        <small class="lc-date">${l.date}</small>
      </div>
      <b class="lc-subject">${l.subject}</b>
      <div class="lc-sender">${l.sender}</div>
      <div class="lc-foot">
        <span class="lc-upo">📜 ${l.upo}</span>
        ${!l.read ? '<span class="lc-new-dot">Nowe</span>' : ''}
      </div>
    </div>
  `).join('');
}

function renderSentLetters() {
  const sent = POCZTA.getSent();
  if (!sent.length) {
    return '<div class="poczta-empty">Brak wysłanych pism. Użyj przycisku „+ Nowe pismo”, aby nadać pismo do urzędu.</div>';
  }
  return sent.map(s => `
    <div class="letter-card sent-card" onclick="openSentDetail('${s.id}')">
      <div class="lc-head">
        <span class="lc-badge sent">${s.badge || 'Podmiot Publiczny'}</span>
        <small class="lc-date">${s.date}</small>
      </div>
      <b class="lc-subject">${s.subject}</b>
      <div class="lc-sender">Do: <b>${s.recipient}</b></div>
      <div class="lc-foot">
        <span class="lc-upo upp-badge">🛡️ ${s.upp}</span>
        <span class="lc-status-signed">✓ Podpisane mDowodem</span>
      </div>
    </div>
  `).join('');
}

function closePocztaModal() {
  const m = document.getElementById('pocztaModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('pocztaModal');
  }
}

function openLetterDetail(letterId) {
  const l = POCZTA.letters.find(x => x.id === letterId);
  if (!l) return;
  l.read = true;
  updateBadges();

  const msg = `📬 ${l.sender}\n\nTemat: ${l.subject}\nData: ${l.date}\nUPO: ${l.upo}\n\n${l.content.replace(/\\n/g, '\n')}\n\nCzy chcesz pobrać oficjalne Urzędowe Poświadczenie Odbioru (UPO .xml)?`;
  if (confirm(msg)) {
    if (typeof exportUpoToFile === 'function') {
      exportUpoToFile({
        tytul: l.subject,
        nadawca: l.sender,
        dataDoreczenia: l.date,
        sumaKontrolna: l.upo
      });
    }
  }
  openPocztaModal('inbox');
}

function openSentDetail(sentId) {
  const s = POCZTA.getSent().find(x => x.id === sentId);
  if (!s) return;
  const msg = `📤 Pismo wysłane do: ${s.recipient}\n\nTemat: ${s.subject}\nData nadania: ${s.date}\nUPP: ${s.upp}\nSkrót SHA-256: ${s.sha256 || 'a4f9...8ef'}\n\nTreść:\n${s.content}\n\nCzy chcesz pobrać Urzędowe Poświadczenie Przedłożenia (UPP)?`;
  if (confirm(msg)) {
    if (typeof exportUpoToFile === 'function') {
      exportUpoToFile({
        tytul: s.subject,
        nadawca: typeof OS !== 'undefined' ? OS.nazwisko : 'Obywatel',
        odbiorca: s.recipient,
        dataDoreczenia: s.date,
        sumaKontrolna: s.upp
      });
    }
  }
}

// ----------------- MODAL: KREATOR NOWEGO PISMA I E-PODPIS -----------------
function openNowePismoModal() {
  const m = document.getElementById('nowePismoModal');
  if (!m) return;

  const wrap = m.querySelector('#pismoFormWrap');
  if (wrap) {
    wrap.innerHTML = `
      <div class="pismo-form">
        <div class="pf-group">
          <label for="pismoRecipient">Wybierz urząd lub instytucję (adresat):</label>
          <select id="pismoRecipient" class="pf-select">
            <option value="Pierwszy Urząd Skarbowy w Krakowie">Pierwszy Urząd Skarbowy w Krakowie</option>
            <option value="Urząd Miasta Krakowa">Urząd Miasta Krakowa (Wydział Spraw Administracyjnych)</option>
            <option value="Zakład Ubezpieczeń Społecznych (ZUS)">Zakład Ubezpieczeń Społecznych (Oddział w Krakowie)</option>
            <option value="Narodowy Fundusz Zdrowia (NFZ)">Małopolski Oddział Wojewódzki NFZ</option>
            <option value="Komenda Miejska Policji">Komenda Miejska Policji w Krakowie</option>
            <option value="Główny Inspektorat Ochrony Środowiska (GIOŚ)">Główny Inspektorat Ochrony Środowiska</option>
          </select>
        </div>

        <div class="pf-group">
          <label for="pismoType">Rodzaj pisma:</label>
          <select id="pismoType" class="pf-select">
            <option value="Pismo ogólne do podmiotu publicznego">Pismo ogólne do podmiotu publicznego</option>
            <option value="Wniosek o wydanie zaświadczenia">Wniosek o wydanie zaświadczenia</option>
            <option value="Odwołanie od decyzji administracyjnej">Odwołanie od decyzji administracyjnej</option>
            <option value="Zawiadomienie / Zgłoszenie">Zawiadomienie / Zgłoszenie</option>
          </select>
        </div>

        <div class="pf-group">
          <label for="pismoSubject">Tytuł pisma / sprawy:</label>
          <input type="text" id="pismoSubject" class="pf-input" placeholder="np. Wniosek o wydanie zaświadczenia o niezaleganiu" value="Wniosek o wydanie zaświadczenia o niezaleganiu">
        </div>

        <div class="pf-group">
          <label for="pismoContent">Treść pisma:</label>
          <textarea id="pismoContent" class="pf-textarea" rows="4" placeholder="Wpisz treść pisma urzędowego...">Wnoszę o wydanie urzędowego zaświadczenia potwierdzającego brak zaległości podatkowych na dzień złożenia niniejszego wniosku. Zaświadczenie jest wymagane do celów procedury kredytowej.</textarea>
        </div>

        <div class="pf-attachment-box">
          <span class="pab-lbl">📎 Załączniki (opcjonalnie):</span>
          <div class="pab-chip">
            <span>📄 Pelnomocnictwo_2026.pdf (142 KB)</span>
            <button type="button" class="pab-del" onclick="this.parentElement.remove()">✕</button>
          </div>
          <button type="button" class="btn-xs ghost" onclick="if(typeof showToast==='function')showToast('Dodano załącznik do pisma.')">+ Dodaj kolejny plik</button>
        </div>

        <div class="pf-signature-banner">
          <span class="psb-ic">✍️</span>
          <div>
            <b>Kwalifikowany podpis elektroniczny mDowód</b>
            <p>Pismo zostanie opatrzone urzędowym podpisem elektronicznym potwierdzającym Twoją tożsamość biometryczną.</p>
          </div>
        </div>

        <div class="pf-actions">
          <button type="button" class="btn ghost" onclick="closeNowePismoModal()">Anuluj</button>
          <button type="button" class="btn primary pf-sign-btn" onclick="submitAndSignPismo()">
            🔐 Podpisz biometrią i wyślij
          </button>
        </div>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('nowePismoModal', m);
}

function closeNowePismoModal() {
  const m = document.getElementById('nowePismoModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('nowePismoModal');
  }
}

function submitAndSignPismo() {
  const subj = (document.getElementById('pismoSubject') || {}).value || 'Pismo ogólne';
  const rec = (document.getElementById('pismoRecipient') || {}).value || 'Urząd Miasta';
  const type = (document.getElementById('pismoType') || {}).value || 'Pismo ogólne';
  const cont = (document.getElementById('pismoContent') || {}).value || 'Treść pisma...';

  // Animacja biometrii Face ID
  const faceEl = document.getElementById('faceid');
  if (faceEl) {
    faceEl.classList.add('active');
    setTimeout(() => faceEl.classList.add('ok'), 600);
    setTimeout(() => {
      faceEl.classList.remove('active', 'ok');
      finalizePismoSubmission(rec, subj, type, cont);
    }, 1300);
  } else {
    finalizePismoSubmission(rec, subj, type, cont);
  }
}

function finalizePismoSubmission(recipient, subject, type, content) {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const uppCode = `UPP/2026/11/${randNum}`;
  const nowStr = new Date().toLocaleString('pl-PL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

  const newPismo = {
    id: `sent_${Date.now()}`,
    recipient: recipient,
    subject: subject,
    date: nowStr,
    badge: type.split(' ')[0],
    upp: uppCode,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    content: content
  };

  POCZTA.addSent(newPismo);
  closeNowePismoModal();

  if (typeof showToast === 'function') {
    showToast(`✓ Pismo wysłane! Wygenerowano ${uppCode}`);
  }

  // Otwarcie skrzynki w zakładce Wysłane
  openPocztaModal('sent');
}

// ----------------- MODAL: CENTRUM POWIADOMIEŃ -----------------
function powiadomieniaOsoby() {
  if (POCZTA._osoby) return POCZTA._osoby;
  const lista = [];
  POCZTA.notifications.forEach(n => {
    if (n.id === 'notif_auto') {
      const t = (typeof OS !== 'undefined' && OS.tiles || []).find(x => x.i === 'car');
      if (t) lista.push(Object.assign({}, n, { title: t.h, desc: `${t.s}. ${t.d}.` }));
    } else if (n.id === 'notif_rx') {
      const ikp = (typeof getIkpData === 'function') ? getIkpData() : null;
      const r = ikp && (ikp.recepty || [])[0];
      const prof = r && (ikp.profiles || []).find(p => p.id === r.forProfile);
      if (r) lista.push(Object.assign({}, n, { desc: `Recepta na ${r.drug.split(' (')[0]} dla: ${prof ? prof.name : 'Ciebie'} czeka na realizację w aptece. Kod PIN: ${r.pin}.` }));
    } else {
      lista.push(n);
    }
  });
  POCZTA._osoby = lista;
  return lista;
}

function openPowiadomieniaModal() {
  const m = document.getElementById('notifModal');
  if (!m) return;

  const listEl = m.querySelector('.notif-list');
  if (listEl) {
    listEl.innerHTML = powiadomieniaOsoby().map(n => `
      <div class="notif-item ${n.type} ${n.unread ? 'unread' : ''}">
        <div class="ni-icon">${n.type === 'rcb' ? '🚨' : (n.type === 'car' ? '🚗' : (n.type === 'health' ? '💊' : '🔒'))}</div>
        <div class="ni-body">
          <div class="ni-head">
            <b class="ni-title">${n.title}</b>
            <small class="ni-date">${n.date}</small>
          </div>
          <p class="ni-desc">${n.desc}</p>
        </div>
      </div>
    `).join('');
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('notifModal', m);
}

function closePowiadomieniaModal() {
  const m = document.getElementById('notifModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('notifModal');
  }
}

function markAllNotificationsRead() {
  POCZTA.notifications.forEach(n => n.unread = false);
  powiadomieniaOsoby().forEach(n => n.unread = false);
  POCZTA.letters.forEach(l => l.read = true);
  updateBadges();
  openPowiadomieniaModal();
  if (typeof showToast === 'function') showToast('Wszystkie powiadomienia oznaczone jako odczytane');
}

function updateBadges() {
  const mailDot = document.querySelector('#mailBtn .dot');
  const unreadLetters = POCZTA.letters.filter(x => !x.read).length;
  if (mailDot) mailDot.style.display = unreadLetters > 0 ? 'block' : 'none';
  const mailBtn = document.getElementById('mailBtn');
  if (mailBtn) mailBtn.setAttribute('aria-label', unreadLetters === 0 ? 'Skrzynka, brak nowych wiadomości'
    : `Skrzynka, ${unreadLetters} ${unreadLetters === 1 ? 'nowa wiadomość' : (unreadLetters < 5 ? 'nowe wiadomości' : 'nowych wiadomości')}`);

  const bnavMailBadge = document.getElementById('bnavMailBadge');
  if (bnavMailBadge) {
    bnavMailBadge.textContent = unreadLetters;
    bnavMailBadge.hidden = (unreadLetters === 0);
  }
}

// Podpięcie kliknięcia ikon nagłówka
document.addEventListener('DOMContentLoaded', () => {
  const mb = document.getElementById('mailBtn');
  if (mb) mb.onclick = () => openPocztaModal('inbox');
  const bb = document.getElementById('bellBtn');
  if (bb) bb.onclick = openPowiadomieniaModal;
  updateBadges();
});
