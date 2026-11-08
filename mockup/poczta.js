/* ---------- mObywatel 2.0 - Centrum Powiadomień i e-Doręczenia (poczta.js) ---------- */

const POCZTA = {
  letters: [
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
function openPocztaModal() {
  const m = document.getElementById('pocztaModal');
  if (!m) return;

  const listEl = m.querySelector('.poczta-list');
  if (listEl) {
    listEl.innerHTML = POCZTA.letters.map(l => `
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

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('pocztaModal', m);
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

  alert(`📨 ${l.sender}\n\nTemat: ${l.subject}\nData: ${l.date}\nUPO: ${l.upo}\n\n${l.content}`);
  openPocztaModal();
}

// ----------------- MODAL: CENTRUM POWIADOMIEŃ -----------------
function openPowiadomieniaModal() {
  const m = document.getElementById('notifModal');
  if (!m) return;

  const listEl = m.querySelector('.notif-list');
  if (listEl) {
    listEl.innerHTML = POCZTA.notifications.map(n => `
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
  POCZTA.letters.forEach(l => l.read = true);
  updateBadges();
  openPowiadomieniaModal();
  if (typeof showToast === 'function') showToast('Wszystkie powiadomienia oznaczone jako odczytane');
}

function updateBadges() {
  const mailDot = document.querySelector('#mailBtn .dot');
  const unreadLetters = POCZTA.letters.filter(x => !x.read).length;
  if (mailDot) mailDot.style.display = unreadLetters > 0 ? 'block' : 'none';

  const bnavMailBadge = document.getElementById('bnavMailBadge');
  if (bnavMailBadge) {
    bnavMailBadge.textContent = unreadLetters;
    bnavMailBadge.hidden = (unreadLetters === 0);
  }
}

// Podpięcie kliknięcia ikon nagłówka
document.addEventListener('DOMContentLoaded', () => {
  const mb = document.getElementById('mailBtn');
  if (mb) mb.onclick = openPocztaModal;
  const bb = document.getElementById('bellBtn');
  if (bb) bb.onclick = openPowiadomieniaModal;
  updateBadges();
});
