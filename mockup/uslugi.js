/* ---------- mObywatel 2.0 - Moduł e-Usług Publicznych (uslugi.js) ---------- */

const USLUGI = {
  // 1. Zastrzeż PESEL & Czasowe odbezpieczenie
  peselData: {
    tempUnlockTimer: null,
    history: [
      { who: 'PKO Bank Polski S.A.', reason: 'Wniosek o kredyt hipoteczny', date: '08.11.2026, 14:10', status: 'blocked', note: 'Zastrzeżenie aktywne – wniosek wstrzymany (art. 105a Prawa Bankowego)', icon: '🏛️' },
      { who: 'mBank S.A.', reason: 'Wniosek o kartę kredytową', date: '04.11.2026, 11:24', status: 'blocked', note: 'Zastrzeżenie aktywne – odrzucono zapytanie BIK', icon: '🏦' },
      { who: 'Kancelaria Notarialna, Kraków', reason: 'Akt notarialny – sprzedaż lokalu mieszkalnego', date: '18.10.2026, 09:15', status: 'ok', note: 'Weryfikacja tożsamości udana (czasowe odbezpieczenie)', icon: '📜' },
      { who: 'P4 Sp. z o.o. (Play)', reason: 'Zawarcie nowej umowy abonamentowej (eSIM)', date: '02.09.2026, 16:40', status: 'ok', note: 'Zezwolono na weryfikację tożsamości klienta', icon: '📱' },
      { who: 'Alior Bank S.A.', reason: 'Weryfikacja tożsamości przy otwarciu konta', date: '21.08.2026, 12:05', status: 'blocked', note: 'Zapytanie zablokowane z mocy ustawy', icon: '🏦' },
      { who: 'ING Bank Śląski', reason: 'Cykliczny audyt antywyłudzeniowy klientów', date: '15.08.2026, 03:00', status: 'ok', note: 'Weryfikacja rutynowa zakończona pomyślnie', icon: '🛡️' }
    ]
  },

  // 2. Bezpieczny autobus & Pełna historia CEPiK
  buses: {
    'KR 12345': {
      plate: 'KR 12345',
      brand: 'Setra S 515 HD ComfortClass',
      year: 2020,
      vin: 'VNE4100000184291',
      seats: 53,
      inspectionValid: true,
      inspectionDate: '15.04.2027',
      ocValid: true,
      ocCompany: 'PZU S.A. (Polisa Komunikacyjna)',
      ocDate: '20.08.2027',
      mileage: '241 850 km',
      stolenStatus: 'Pojazd NIE FIGURUJE w bazie pojazdów utraconych Policji i SIS',
      license: 'Ważna licencja GITD na międzynarodowy przewóz osób (nr 014829/2020)',
      carrier: 'Trans-Małopolska Sp. z o.o.',
      lastCheck: 'Stacja Kontroli Pojazdów Kraków-Nowa Huta (SKP/KR/042)',
      timeline: [
        { date: '15.04.2026', odo: '241 850 km', result: 'Pozytywny', skp: 'SKP Kraków-Nowa Huta' },
        { date: '14.04.2025', odo: '209 100 km', result: 'Pozytywny', skp: 'SKP Kraków-Nowa Huta' },
        { date: '10.04.2024', odo: '172 400 km', result: 'Pozytywny', skp: 'Okręgowa SKP Wieliczka' },
        { date: '12.04.2023', odo: '128 900 km', result: 'Pozytywny', skp: 'Okręgowa SKP Wieliczka' }
      ]
    },
    'WWA 8821': {
      plate: 'WWA 8821',
      brand: 'Mercedes-Benz Tourismo 15 RHD',
      year: 2022,
      vin: 'WDB6320341398124',
      seats: 59,
      inspectionValid: true,
      inspectionDate: '10.11.2026',
      alert: 'Badanie techniczne upływa za 2 dni!',
      ocValid: true,
      ocCompany: 'TUiR Warta S.A.',
      ocDate: '05.03.2027',
      mileage: '185 200 km',
      stolenStatus: 'Pojazd NIE FIGURUJE w rejestrze utraconych Policji',
      license: 'Ważna licencja GITD na krajowy przewóz osób (nr 009211/2022)',
      carrier: 'Mazovia Express Warszawa',
      lastCheck: 'Okręgowa Stacja Kontroli Pojazdów Warszawa-Włochy',
      timeline: [
        { date: '10.11.2025', odo: '185 200 km', result: 'Pozytywny', skp: 'OSKP Warszawa-Włochy' },
        { date: '08.11.2024', odo: '120 400 km', result: 'Pozytywny', skp: 'OSKP Warszawa-Włochy' },
        { date: '05.11.2023', odo: '62 100 km', result: 'Pozytywny', skp: 'OSKP Warszawa-Włochy' }
      ]
    },
    'GD 4490': {
      plate: 'GD 4490',
      brand: 'Scania Touring HD 13.7m',
      year: 2019,
      vin: 'YS4K4X20001923841',
      seats: 49,
      inspectionValid: true,
      inspectionDate: '22.09.2027',
      ocValid: true,
      ocCompany: 'Ergo Hestia S.A.',
      ocDate: '18.06.2027',
      mileage: '312 400 km',
      stolenStatus: 'Pojazd NIE FIGURUJE w rejestrze utraconych Policji',
      license: 'Ważna licencja GITD na przewóz turystyczny',
      carrier: 'Pomerania Bus Sp. k.',
      lastCheck: 'SKP Gdańsk-Osowa',
      timeline: [
        { date: '22.09.2026', odo: '312 400 km', result: 'Pozytywny', skp: 'SKP Gdańsk-Osowa' },
        { date: '20.09.2025', odo: '264 100 km', result: 'Pozytywny', skp: 'SKP Gdańsk-Osowa' },
        { date: '18.09.2024', odo: '210 500 km', result: 'Pozytywny', skp: 'SKP Gdynia-Chylonia' }
      ]
    },
    'LU 9012A': {
      plate: 'LU 9012A',
      brand: 'Solaris Urbino 12 Electric',
      year: 2021,
      vin: 'SUA123419082194',
      seats: 85,
      inspectionValid: true,
      inspectionDate: '01.07.2027',
      ocValid: true,
      ocCompany: 'TUW TUW',
      ocDate: '12.12.2026',
      mileage: '142 600 km',
      stolenStatus: 'Pojazd NIE FIGURUJE w bazie skradzionych Policji',
      license: 'Pojazd komunikacji miejskiej ZTM Lublin',
      carrier: 'MPK Lublin Sp. z o.o.',
      lastCheck: 'SKP MPK Lublin',
      timeline: [
        { date: '01.07.2026', odo: '142 600 km', result: 'Pozytywny', skp: 'SKP MPK Lublin' },
        { date: '28.06.2025', odo: '98 400 km', result: 'Pozytywny', skp: 'SKP MPK Lublin' },
        { date: '25.06.2024', odo: '51 200 km', result: 'Pozytywny', skp: 'SKP MPK Lublin' }
      ]
    }
  },

  // 3. ePłatności
  payments: {
    jan: [
      { id: 'pay_j1', title: 'Podatek od nieruchomości – IV rata 2026', recipient: 'Urząd Miasta Krakowa', amount: 184.00, due: '15.11.2026', status: 'unpaid', acc: '68 1020 2892 0000 8102 0001 9283' },
      { id: 'pay_j2', title: 'Opłata za gospodarowanie odpadami komunalnymi', recipient: 'MPO Kraków Sp. z o.o.', amount: 85.00, due: '20.11.2026', status: 'unpaid', acc: '12 1020 2892 0000 4502 0001 7721' }
    ],
    marta: [
      { id: 'pay_m1', title: 'Podatek od nieruchomości – mieszkanie', recipient: 'Urząd m.st. Warszawy', amount: 128.00, due: '15.11.2026', status: 'unpaid', acc: '44 1030 1508 0000 0005 5000 0055' }
    ],
    kacper: [
      { id: 'pay_k1', title: 'Opłata skarbowa – wniosek o prawo jazdy', recipient: 'Urząd Miejski w Gdańsku', amount: 100.00, due: 'Opłacono 14.01.2026', status: 'paid', acc: '31 1240 1268 1111 0010 3877 3935' }
    ],
    ewa: [
      { id: 'pay_e1', title: 'Łączne zobowiązanie pieniężne (rolno-leśne)', recipient: 'Urząd Gminy Niemce k. Lublina', amount: 64.00, due: '15.11.2026', status: 'unpaid', acc: '92 8689 0007 0000 0212 2000 0010' }
    ]
  },

  // 4. Jakość Powietrza (GIOŚ)
  air: {
    krakow: { city: 'Kraków', station: 'Kraków, al. Krasińskiego', index: 'Umiarkowana', color: '#f59e0b', bg: '#fef3c7', pm25: 38, pm25Norm: 152, pm10: 52, pm10Norm: 104, no2: 24, o3: 32, so2: 8, co: 0.6, advice: 'Osoby wrażliwe, starsze i dzieci powinny ograniczyć intensywny wysiłek na zewnątrz.' },
    warszawa: { city: 'Warszawa', station: 'Warszawa, ul. Marszałkowska', index: 'Dobra', color: '#10b981', bg: '#d1fae5', pm25: 18, pm25Norm: 72, pm10: 28, pm10Norm: 56, no2: 19, o3: 40, so2: 5, co: 0.4, advice: 'Jakość powietrza jest dobra. Możesz bez przeszkód spędzać czas na świeżym powietrzu.' },
    lublin: { city: 'Lublin', station: 'Lublin, ul. Obywatelska', index: 'Dobra', color: '#10b981', bg: '#d1fae5', pm25: 21, pm25Norm: 84, pm10: 31, pm10Norm: 62, no2: 16, o3: 36, so2: 6, co: 0.4, advice: 'Powietrze nie stanowi zagrożenia dla zdrowia.' },
    gdansk: { city: 'Gdańsk', station: 'Gdańsk, ul. Wyzwolenia', index: 'Bardzo dobra', color: '#059669', bg: '#a7f3d0', pm25: 9, pm25Norm: 36, pm10: 14, pm10Norm: 28, no2: 11, o3: 48, so2: 3, co: 0.3, advice: 'Świetna jakość powietrza. Idealne warunki do aktywności i spacerów nad morzem.' },
    katowice: { city: 'Katowice', station: 'Katowice, ul. Plebiscytowa', index: 'Dostateczna', color: '#ea580c', bg: '#ffedd5', pm25: 46, pm25Norm: 184, pm10: 68, pm10Norm: 136, no2: 38, o3: 25, so2: 14, co: 0.9, advice: 'Zaleca się unikanie wietrzenia mieszkań oraz ograniczenie wysiłku fizycznego na powietrzu.' },
    wroclaw: { city: 'Wrocław', station: 'Wrocław, ul. Wiśniowa', index: 'Dobra', color: '#10b981', bg: '#d1fae5', pm25: 22, pm25Norm: 88, pm10: 34, pm10Norm: 68, no2: 21, o3: 38, so2: 7, co: 0.5, advice: 'Jakość powietrza jest zadowalająca, zanieczyszczenia nie stwarzają zagrożenia.' },
    zakopane: { city: 'Zakopane', station: 'Zakopane, ul. Sienkiewicza', index: 'Bardzo dobra', color: '#059669', bg: '#a7f3d0', pm25: 8, pm25Norm: 32, pm10: 12, pm10Norm: 24, no2: 7, o3: 54, so2: 2, co: 0.2, advice: 'Czyste górskie powietrze, sprzyjające rekreacji i wędrówkom.' }
  },

  // 5. Centralny Rejestr Wyborców (CRW)
  crw: {
    jan: {
      persona: 'Jan Wiśniewski',
      okreg: 'Okręg wyborczy nr 13 (Kraków)',
      obwod: 'Obwód głosowania nr 42',
      komisja: 'Szkoła Podstawowa nr 26 im. Andrzeja Struga',
      adres: 'ul. Krasickiego 34, 30-501 Kraków (Dzielnica XIII Podgórze)',
      dostepna: true,
      cechy: ['Lokal przystosowany dla osób z niepełnosprawnościami', 'Podjazd i winda na parter', 'Karty do głosowania z nakładką w alfabecie Braille’a', 'Pętla indukcyjna dla osób słabosłyszących'],
      spis: 'Ujęty z urzędu w stałym obwodzie głosowania'
    },
    marta: {
      persona: 'Marta Kowalczyk',
      okreg: 'Okręg wyborczy nr 19 (Warszawa)',
      obwod: 'Obwód głosowania nr 105',
      komisja: 'LXXV Liceum Ogólnokształcące im. Jana III Sobieskiego',
      adres: 'ul. Czerniakowska 128, 00-453 Warszawa (Mokotów)',
      dostepna: true,
      cechy: ['Lokal parterowy, brak barier architektonicznych', 'Wydzielone stanowisko z dobrym oświetleniem', 'Dostępny tłumacz PJM (Polski Język Migowy)'],
      spis: 'Ujęta z urzędu w stałym obwodzie głosowania'
    },
    ewa: {
      persona: 'Ewa Dąbrowska',
      okreg: 'Okręg wyborczy nr 6 (Lublin)',
      obwod: 'Obwód głosowania nr 18',
      komisja: 'Zespół Szkół Ogólnokształcących nr 4',
      adres: 'ul. Tumidajskiego 6a, 20-247 Lublin (Kalinowszczyzna)',
      dostepna: true,
      cechy: ['Podjazd dla wózków inwalidzkich', 'Nakładki Braille’a na karty'],
      spis: 'Ujęta z urzędu w stałym obwodzie głosowania'
    },
    kacper: {
      persona: 'Kacper Lewandowski',
      okreg: 'Okręg wyborczy nr 25 (Gdańsk)',
      obwod: 'Obwód głosowania nr 31',
      komisja: 'Szkoła Podstawowa nr 52 im. Kombatantów Polskich',
      adres: 'ul. Kościuszki 111, 80-442 Gdańsk (Wrzeszcz Dolny)',
      dostepna: true,
      cechy: ['Lokal dostępny z poziomu chodnika', 'Miejsca parkingowe dla osób uprawnionych'],
      spis: 'Ujęty z urzędu w stałym obwodzie głosowania'
    }
  }
};

// Pobieranie stacji jakości powietrza dla persony
function getAirForPersona(cityKey) {
  if (cityKey && USLUGI.air[cityKey]) return USLUGI.air[cityKey];
  const city = (typeof OS !== 'undefined' && OS.opis) ? OS.opis.toLowerCase() : '';
  if (city.includes('warszaw')) return USLUGI.air.warszawa;
  if (city.includes('gdań') || city.includes('gdansk')) return USLUGI.air.gdansk;
  if (city.includes('lublin')) return USLUGI.air.lublin;
  return USLUGI.air.krakow;
}

// ----------------- MODAL: ZASTRZEŻ PESEL & CZASOWE ODBEZPIECZENIE -----------------
function openZastrzezPeselModal(filter) {
  const m = document.getElementById('peselModal');
  if (!m) return;
  const isBlocked = (typeof MobStore !== 'undefined') ? MobStore.isPeselBlocked() : false;
  const unlockUntil = (typeof MobStore !== 'undefined') ? (MobStore.get('pesel_unlock_until', 0)) : 0;
  const isTempUnlocked = unlockUntil > Date.now();
  const peselRaw = (typeof OS !== 'undefined' && OS.docs && OS.docs[0] && OS.docs[0].f) 
    ? (OS.docs[0].f.find(x => x[0] === 'PESEL') || ['','91071427765'])[1] 
    : '91071427765';
  const peselMasked = peselRaw.slice(0, 6) + '••••' + peselRaw.slice(-1);

  const hero = m.querySelector('.pesel-hero-box');
  if (hero) {
    let stateTitle = isBlocked ? 'PESEL ZASTRZEŻONY' : 'PESEL NIEZASTRZEŻONY';
    let stateDesc = isBlocked 
      ? 'Ochrona przed wyłudzeniem pożyczek i kredytów jest w pełni aktywna.' 
      : 'Możesz paść ofiarą zaciągnięcia zobowiązań na Twoje dane osobowe.';
    let badgeClass = isBlocked ? 'blocked' : 'active';
    let icon = isBlocked ? '🔒' : '🔓';

    if (isTempUnlocked) {
      const remSec = Math.max(0, Math.floor((unlockUntil - Date.now()) / 1000));
      const mStr = String(Math.floor(remSec / 60)).padStart(2, '0');
      const sStr = String(remSec % 60).padStart(2, '0');
      stateTitle = `CZASOWO ODBEZPIECZONY (${mStr}:${sStr})`;
      stateDesc = `Ochrona zostanie automatycznie wznowiona po upływie czasu.`;
      badgeClass = 'warn';
      icon = '⏳';
    }

    hero.innerHTML = `
      <div class="pesel-badge-state ${badgeClass}">
        <span class="pesel-state-ic">${icon}</span>
        <div>
          <b class="pesel-state-title">${stateTitle}</b>
          <small class="pesel-state-desc">${stateDesc}</small>
        </div>
      </div>

      <div class="pesel-action-toggle">
        <button type="button" class="btn ${isBlocked ? 'secondary' : 'primary'} pesel-btn-toggle" onclick="USLUGI.togglePeselState()">
          ${isBlocked ? '🔓 Cofnij zastrzeżenie PESEL' : '🔒 Zastrzeż numer PESEL'}
        </button>
      </div>

      ${isBlocked ? `
        <div class="pesel-temp-box">
          <div class="ptb-head">
            <b>⏱️ Czasowe odbezpieczenie PESEL</b>
            <small>Idziesz do banku lub notariusza? Zdejmij blokadę na określony czas – zastrzeżenie włączy się samo:</small>
          </div>
          <div class="ptb-actions">
            <button type="button" class="btn-xs ghost" onclick="USLUGI.startTempUnlock(15)">15 minut</button>
            <button type="button" class="btn-xs ghost" onclick="USLUGI.startTempUnlock(30)">30 minut</button>
            <button type="button" class="btn-xs ghost" onclick="USLUGI.startTempUnlock(60)">1 godzina</button>
          </div>
        </div>
      ` : (isTempUnlocked ? `
        <div class="pesel-temp-box active">
          <div class="ptb-head">
            <b style="color:var(--warn)">⏳ Aktywne czasowe odbezpieczenie</b>
            <small>PESEL pozostanie odbezpieczony jeszcze przez chwilę. Możesz zakończyć wizytę i zablokować go od razu:</small>
          </div>
          <div class="ptb-actions">
            <button type="button" class="btn-xs primary" onclick="USLUGI.togglePeselState()">Zablokuj teraz natychmiast</button>
          </div>
        </div>
      ` : '')}

      <div class="pesel-info-grid">
        <div class="p-item"><span>Twój numer PESEL:</span><b>${peselMasked}</b></div>
        <div class="p-item"><span>Status w Rejestrze:</span><b style="color:${isBlocked ? '#10b981' : (isTempUnlocked ? '#f59e0b' : '#dc143c')}">${isBlocked ? 'Chroniony (aktywny)' : (isTempUnlocked ? 'Odbezpieczony (czasowo)' : 'Niezabezpieczony')}</b></div>
        <div class="p-item"><span>Podstawa prawna:</span><b>Ustawa o zmianie ustaw w celu ograniczania skutków kradzieży tożsamości</b></div>
      </div>
    `;
  }

  // Filtrowanie historii weryfikacji
  const currentFilter = filter || 'all';
  const histEl = m.querySelector('.pesel-hist-list');
  if (histEl) {
    let items = USLUGI.peselData.history;
    if (currentFilter === 'blocked') items = items.filter(x => x.status === 'blocked');
    if (currentFilter === 'ok') items = items.filter(x => x.status === 'ok');

    histEl.innerHTML = `
      <div class="hist-filter-tabs" role="tablist" aria-label="Filtruj historię weryfikacji">
        <button type="button" class="hft-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="openZastrzezPeselModal('all')">Wszystkie (${USLUGI.peselData.history.length})</button>
        <button type="button" class="hft-btn ${currentFilter === 'blocked' ? 'active' : ''}" onclick="openZastrzezPeselModal('blocked')">Zablokowane próby (${USLUGI.peselData.history.filter(x=>x.status==='blocked').length})</button>
        <button type="button" class="hft-btn ${currentFilter === 'ok' ? 'active' : ''}" onclick="openZastrzezPeselModal('ok')">Zezwolone (${USLUGI.peselData.history.filter(x=>x.status==='ok').length})</button>
      </div>
      <div class="hist-items-wrap">
        ${items.map(h => `
          <div class="pesel-hist-item">
            <div class="phi-head">
              <b>${h.icon || '🏛️'} ${h.who}</b>
              <span class="phi-badge ${h.status}">${h.status === 'blocked' ? '🚫 Zablokowano' : '✓ Zezwolono'}</span>
            </div>
            <div class="phi-reason">${h.reason}</div>
            <div class="phi-foot">
              <small>${h.date}</small>
              <small class="phi-note">${h.note}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('peselModal', m);

  // Uruchomienie pętli odświeżania timera jeśli aktywny
  if (isTempUnlocked && !USLUGI.peselData.tempUnlockTimer) {
    USLUGI.peselData.tempUnlockTimer = setInterval(() => {
      const u = (typeof MobStore !== 'undefined') ? MobStore.get('pesel_unlock_until', 0) : 0;
      if (u <= Date.now()) {
        clearInterval(USLUGI.peselData.tempUnlockTimer);
        USLUGI.peselData.tempUnlockTimer = null;
        if (typeof MobStore !== 'undefined') {
          MobStore.set('pesel_unlock_until', 0);
          MobStore.setPeselBlocked(true);
        }
        if (typeof showToast === 'function') showToast('🔒 Czas minął – Twój PESEL został automatycznie ponownie zastrzeżony!');
        openZastrzezPeselModal();
      } else {
        openZastrzezPeselModal(currentFilter);
      }
    }, 1000);
  }
}

function closeZastrzezPeselModal() {
  const m = document.getElementById('peselModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('peselModal');
  }
}

USLUGI.togglePeselState = function() {
  if (typeof MobStore === 'undefined') return;
  if (USLUGI.peselData.tempUnlockTimer) {
    clearInterval(USLUGI.peselData.tempUnlockTimer);
    USLUGI.peselData.tempUnlockTimer = null;
  }
  MobStore.set('pesel_unlock_until', 0);
  const current = MobStore.isPeselBlocked();
  const next = !current;
  MobStore.setPeselBlocked(next);
  if (typeof showToast === 'function') {
    showToast(next ? '🔒 Numer PESEL został pomyślnie zastrzeżony!' : '🔓 Zastrzeżenie numeru PESEL zostało cofnięte.');
  }
  openZastrzezPeselModal();
  if (typeof updateDashboard === 'function') updateDashboard();
};

USLUGI.startTempUnlock = function(minutes) {
  if (typeof MobStore === 'undefined') return;
  const until = Date.now() + (minutes * 60 * 1000);
  MobStore.set('pesel_unlock_until', until);
  MobStore.setPeselBlocked(false);
  if (typeof showToast === 'function') {
    showToast(`⏱️ PESEL odbezpieczony na ${minutes} min. Ochrona włączy się automatycznie.`);
  }
  openZastrzezPeselModal();
  if (typeof updateDashboard === 'function') updateDashboard();
};

// ----------------- MODAL: BEZPIECZNY AUTOBUS & CEPiK -----------------
function openBezpiecznyAutobusModal(presetPlate) {
  const m = document.getElementById('busModal');
  if (!m) return;
  const input = m.querySelector('#busSearchInput');
  if (input && presetPlate) input.value = presetPlate;
  const targetPlate = presetPlate || (input ? input.value.trim().toUpperCase() : 'KR 12345');
  renderBusDetails(targetPlate || 'KR 12345');
  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('busModal', m);
}

function closeBezpiecznyAutobusModal() {
  const m = document.getElementById('busModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('busModal');
  }
}

function renderBusDetails(plate) {
  const m = document.getElementById('busModal');
  if (!m) return;
  const cleanPlate = (plate || 'KR 12345').toUpperCase().trim();
  const data = USLUGI.buses[cleanPlate] || {
    plate: cleanPlate,
    brand: 'Autokar Turystyczny (baza CEPiK)',
    year: 2021,
    vin: 'VNE' + Math.floor(100000000000 + Math.random() * 900000000000),
    seats: 51,
    inspectionValid: true,
    inspectionDate: '18.08.2027',
    ocValid: true,
    ocCompany: 'PZU S.A.',
    ocDate: '12.09.2027',
    mileage: '198 400 km',
    stolenStatus: 'Pojazd NIE FIGURUJE w rejestrze utraconych Policji',
    license: 'Ważna licencja na krajowy przewóz osób',
    carrier: 'Przewozy Autokarowe Sp. z o.o.',
    lastCheck: 'Okręgowa Stacja Kontroli Pojazdów',
    timeline: [
      { date: '18.08.2026', odo: '198 400 km', result: 'Pozytywny', skp: 'OSKP' },
      { date: '16.08.2025', odo: '154 200 km', result: 'Pozytywny', skp: 'OSKP' }
    ]
  };

  const resEl = m.querySelector('.bus-result-box');
  if (resEl) {
    resEl.innerHTML = `
      <div class="bus-hero-card ${data.alert ? 'warn' : 'ok'}">
        <div class="bh-head">
          <div>
            <span class="bh-plate">${data.plate}</span>
            <b class="bh-model">${data.brand}</b>
          </div>
          <span class="bh-badge ${data.inspectionValid ? 'ok' : 'err'}">${data.inspectionValid ? '✓ SPRAWNY' : '⚠️ ZAGROŻENIE'}</span>
        </div>

        ${data.alert ? `<div class="bh-alert">⚠️ ${data.alert}</div>` : ''}

        <div class="bh-police-status">
          <span class="bps-ic">🛡️</span>
          <div>
            <b>Weryfikacja w bazie Policji:</b>
            <p>${data.stolenStatus}</p>
          </div>
        </div>

        <div class="bh-grid">
          <div class="bh-row"><span>Badanie techniczne:</span><b>Ważne do ${data.inspectionDate}</b></div>
          <div class="bh-row"><span>Polisa OC:</span><b>${data.ocCompany} (do ${data.ocDate})</b></div>
          <div class="bh-row"><span>Odczyt drogomierza:</span><b>${data.mileage}</b></div>
          <div class="bh-row"><span>Liczba miejsc:</span><b>${data.seats} siedzących</b></div>
          <div class="bh-row"><span>Numer VIN:</span><b class="vin-mono">${data.vin}</b></div>
          <div class="bh-row"><span>Rok produkcji:</span><b>${data.year}</b></div>
          <div class="bh-row"><span>Przewoźnik:</span><b>${data.carrier || 'Krajowy przewóz osób'}</b></div>
          <div class="bh-row"><span>Uprawnienia GITD:</span><b style="color:#059669">${data.license}</b></div>
        </div>

        ${data.timeline && data.timeline.length ? `
          <div class="bus-timeline-box">
            <b class="bt-title">📈 Historia odczytów licznika i badań (CEPiK)</b>
            <div class="bt-list">
              ${data.timeline.map(t => `
                <div class="bt-item">
                  <div class="bt-dot"></div>
                  <div class="bt-row">
                    <span class="bt-date">${t.date}</span>
                    <b class="bt-odo">${t.odo}</b>
                  </div>
                  <small class="bt-skp">${t.skp} — wynik: <span style="color:#059669">${t.result}</span></small>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="bus-actions-row">
        <button type="button" class="btn secondary" onclick="downloadBusCert('${data.plate}')">📜 Pobierz raport CEPiK (PDF)</button>
        <button type="button" class="btn primary" onclick="closeBezpiecznyAutobusModal();if(typeof askAssistantWithPrompt==='function')askAssistantWithPrompt('Czy autobus ${data.plate} ma ważne badania i polisę OC?')">Zapytaj asystenta AI</button>
      </div>
    `;
  }
}

function downloadBusCert(plate) {
  if (typeof showToast === 'function') showToast(`Pobrano oficjalny raport CEPiK dla ${plate} (PDF)`);
}

// ----------------- MODAL: ePŁATNOŚCI & INTERAKTYWNY BLIK -----------------
function openEPlatnosciModal() {
  const m = document.getElementById('platnosciModal');
  if (!m) return;
  const pList = (USLUGI.payments[OS.id] || USLUGI.payments.jan);
  const isPaid = (typeof MobStore !== 'undefined') ? MobStore.isTaxPaid() : false;

  const box = m.querySelector('.eplat-list');
  if (box) {
    box.innerHTML = pList.map(p => {
      const actuallyPaid = isPaid || p.status === 'paid';
      return `
        <div class="eplat-item ${actuallyPaid ? 'paid' : 'due'}">
          <div class="ep-head">
            <div>
              <b class="ep-title">${p.title}</b>
              <small class="ep-rec">${p.recipient}</small>
            </div>
            <div class="ep-price">${p.amount.toFixed(2)} zł</div>
          </div>
          <div class="ep-foot">
            <span class="ep-status ${actuallyPaid ? 'ok' : 'wait'}">${actuallyPaid ? '✓ Opłacono przez mObywatel' : `Termin: ${p.due}`}</span>
            ${actuallyPaid ? 
              `<button type="button" class="btn-xs ghost" onclick="openPaymentReceipt('${p.id}')">Pobierz UPO</button>` : 
              `<button type="button" class="btn-xs primary" onclick="openBlikSheet('${p.id}', ${p.amount}, '${p.title}', '${p.recipient}')">Zapłać BLIK</button>`}
          </div>
        </div>
      `;
    }).join('');
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('platnosciModal', m);
}

function closeEPlatnosciModal() {
  const m = document.getElementById('platnosciModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('platnosciModal');
  }
}

// Interaktywny arkusz BLIK
let blikTimerInterval = null;
let blikRemainingSeconds = 120;

function openBlikSheet(payId, amount, title, recipient) {
  const m = document.getElementById('blikModal');
  if (!m) {
    // Fallback jeśli modal nie został dodany do DOM
    startBlikFallback(payId, amount, title);
    return;
  }
  blikRemainingSeconds = 120;
  clearInterval(blikTimerInterval);

  const box = m.querySelector('#blikFlowBox');
  if (box) {
    box.innerHTML = `
      <div class="blik-amount-banner">
        <span class="bab-lbl">Do zapłaty:</span>
        <b class="bab-amt">${amount.toFixed(2)} zł</b>
        <small class="bab-rec">${title} • ${recipient || 'Urząd Miasta'}</small>
      </div>

      <div class="blik-timer-wrap">
        <span class="blik-timer-txt">Kod ważny: <b id="blikTimeDisplay">02:00</b></span>
        <div class="blik-timer-bar"><div class="blik-timer-progress" id="blikTimerProgress" style="width:100%"></div></div>
      </div>

      <div class="blik-inputs-box">
        <label for="bcode0" class="bib-lbl">Wpisz 6-cyfrowy kod z aplikacji Twojego banku:</label>
        <div class="blik-digits-row" id="blikDigitsRow">
          <input type="tel" maxlength="1" class="b-digit" id="bcode0" autofocus>
          <input type="tel" maxlength="1" class="b-digit" id="bcode1">
          <input type="tel" maxlength="1" class="b-digit" id="bcode2">
          <span class="b-sep"></span>
          <input type="tel" maxlength="1" class="b-digit" id="bcode3">
          <input type="tel" maxlength="1" class="b-digit" id="bcode4">
          <input type="tel" maxlength="1" class="b-digit" id="bcode5">
        </div>
      </div>

      <div class="blik-keypad" id="blikKeypad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" class="bk-key" onclick="USLUGI.pressBlikKey('${n}')">${n}</button>`).join('')}
        <button type="button" class="bk-key action" onclick="USLUGI.fillSampleBlik()">Demo 777</button>
        <button type="button" class="bk-key" onclick="USLUGI.pressBlikKey('0')">0</button>
        <button type="button" class="bk-key action" onclick="USLUGI.backspaceBlik()">⌫</button>
      </div>

      <div class="blik-actions-box">
        <button type="button" class="btn primary blik-submit-btn" id="blikSubmitBtn" onclick="USLUGI.confirmBlik('${payId}', ${amount}, '${title}')" disabled>
          Zatwierdź i zapłać
        </button>
      </div>
    `;
  }

  m.classList.add('open');
  setupBlikDigitInputs();

  blikTimerInterval = setInterval(() => {
    blikRemainingSeconds--;
    const d = document.getElementById('blikTimeDisplay');
    const p = document.getElementById('blikTimerProgress');
    if (d) {
      const min = String(Math.floor(blikRemainingSeconds / 60)).padStart(2, '0');
      const sec = String(blikRemainingSeconds % 60).padStart(2, '0');
      d.textContent = `${min}:${sec}`;
    }
    if (p) {
      p.style.width = `${(blikRemainingSeconds / 120) * 100}%`;
    }
    if (blikRemainingSeconds <= 0) {
      clearInterval(blikTimerInterval);
      if (typeof showToast === 'function') showToast('⚠️ Kod BLIK wygasł. Wygeneruj nowy kod w banku.');
      closeBlikModal();
    }
  }, 1000);
}

function closeBlikModal() {
  clearInterval(blikTimerInterval);
  const m = document.getElementById('blikModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('blikModal');
  }
}

function setupBlikDigitInputs() {
  const inputs = document.querySelectorAll('.b-digit');
  inputs.forEach((inp, idx) => {
    inp.oninput = (e) => {
      if (inp.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      checkBlikCompletion();
    };
    inp.onkeydown = (e) => {
      if (e.key === 'Backspace' && !inp.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    };
  });
}

function checkBlikCompletion() {
  const inputs = Array.from(document.querySelectorAll('.b-digit'));
  const code = inputs.map(i => i.value).join('');
  const btn = document.getElementById('blikSubmitBtn');
  if (btn) btn.disabled = (code.length < 6);
}

USLUGI.pressBlikKey = function(digit) {
  const inputs = Array.from(document.querySelectorAll('.b-digit'));
  const empty = inputs.find(i => !i.value);
  if (empty) {
    empty.value = digit;
    checkBlikCompletion();
    const nextIdx = inputs.indexOf(empty) + 1;
    if (nextIdx < inputs.length) inputs[nextIdx].focus();
  }
};

USLUGI.backspaceBlik = function() {
  const inputs = Array.from(document.querySelectorAll('.b-digit'));
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i].value) {
      inputs[i].value = '';
      inputs[i].focus();
      break;
    }
  }
  checkBlikCompletion();
};

USLUGI.fillSampleBlik = function() {
  const sample = '741852';
  const inputs = Array.from(document.querySelectorAll('.b-digit'));
  inputs.forEach((inp, idx) => inp.value = sample[idx] || '');
  checkBlikCompletion();
};

USLUGI.confirmBlik = function(payId, amount, title) {
  const box = document.getElementById('blikFlowBox');
  if (!box) return;
  clearInterval(blikTimerInterval);

  box.innerHTML = `
    <div class="blik-step-state">
      <div class="blik-pulse-ring">
        <svg viewBox="0 0 50 50" class="spinner-svg"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4"></circle></svg>
      </div>
      <b class="bss-title">Potwierdź płatność w aplikacji banku</b>
      <p class="bss-sub">Wysłano prośbę o autoryzację na Twój telefon. Otwórz powiadomienie push z banku i potwierdź kwotę <b>${amount.toFixed(2)} zł</b> kodem PIN banku.</p>
      
      <div class="bank-push-sim">
        <div class="bps-head">
          <span>🏛️ PKO Bank Polski • IKO</span>
          <small>teraz</small>
        </div>
        <b>Prośba o płatność BLIK: ${amount.toFixed(2)} zł</b>
        <p>Odbiorca: ePłatności gov.pl (${title})</p>
      </div>

      <button type="button" class="btn primary" onclick="USLUGI.finishBlikSuccess('${payId}', ${amount}, '${title}')">
        ✓ Symuluj potwierdzenie w banku
      </button>
    </div>
  `;
};

USLUGI.finishBlikSuccess = function(payId, amount, title) {
  const box = document.getElementById('blikFlowBox');
  if (typeof MobStore !== 'undefined') {
    MobStore.setTaxPaid(true);
    MobStore.addUPO({
      title: `ePłatności: ${title}`,
      source: 'Krajowa Izba Rozliczeniowa (KIR) / Ministerstwo Cyfryzacji',
      rows: [
        ['Tytuł zobowiązania', title],
        ['Kwota transakcji', `${amount.toFixed(2)} zł`],
        ['Metoda płatności', 'BLIK (rozliczenie KIR Elixir)'],
        ['Identyfikator KIR', `KIR-2026-${Math.floor(10000000 + Math.random() * 90000000)}`],
        ['Status', 'Rozliczone natychmiastowo'],
        ['Data i czas', new Date().toLocaleString('pl-PL')]
      ]
    });
  }

  if (box) {
    box.innerHTML = `
      <div class="blik-success-wrap">
        <div class="bsw-icon">✓</div>
        <b class="bsw-title">Płatność zrealizowana pomyślnie!</b>
        <p class="bsw-sub">Kwota <b>${amount.toFixed(2)} zł</b> została przekazana na rachunek urzędu. Wygenerowano oficjalne Urzędowe Poświadczenie Odbioru (UPO).</p>
        
        <div class="bsw-details">
          <div><span>Status KIR:</span><b style="color:#059669">Zaakceptowana (Rozliczona)</b></div>
          <div><span>Prowizja mObywatel:</span><b>0,00 zł (bez prowizji)</b></div>
        </div>

        <div class="bsw-actions">
          <button type="button" class="btn secondary" onclick="closeBlikModal();openPaymentReceipt('${payId}')">Pobierz UPO (PDF)</button>
          <button type="button" class="btn primary" onclick="closeBlikModal();openEPlatnosciModal()">Wróć do ePłatności</button>
        </div>
      </div>
    `;
  }

  if (typeof updateDashboard === 'function') updateDashboard();
};

function startBlikFallback(payId, amount, title) {
  if (typeof MobStore !== 'undefined') {
    MobStore.setTaxPaid(true);
    MobStore.addUPO({
      title: `ePłatności: ${title}`,
      source: 'KIR / ePłatności',
      rows: [['Tytuł', title], ['Kwota', `${amount.toFixed(2)} zł`], ['Metoda', 'BLIK']]
    });
  }
  if (typeof showToast === 'function') showToast(`Płatność ${amount.toFixed(2)} zł zrealizowana! UPO wygenerowane.`);
  openEPlatnosciModal();
  if (typeof updateDashboard === 'function') updateDashboard();
}

function openPaymentReceipt(payId) {
  if (typeof openOfficialCertificate === 'function') {
    openOfficialCertificate('podatek');
  } else if (typeof showToast === 'function') {
    showToast('Wygenerowano Urzędowe Poświadczenie Odbioru (UPO)');
  }
}

// ----------------- MODAL: CENTRALNY REJESTR WYBORCÓW (CRW) -----------------
function openWyboryModal() {
  const m = document.getElementById('wyboryModal');
  if (!m) return;
  const personaId = (typeof OS !== 'undefined' && OS.id) ? OS.id : 'jan';
  const customPrecinct = (typeof MobStore !== 'undefined') ? MobStore.get('crw_custom_precinct', null) : null;
  const base = USLUGI.crw[personaId] || USLUGI.crw.jan;
  const w = customPrecinct || base;

  const box = m.querySelector('#crwBody');
  if (box) {
    box.innerHTML = `
      <div class="crw-hero-card">
        <div class="ch-badge">🏛️ Oficjalny Rejestr Państwowej Komisji Wyborczej (PKW)</div>
        <b class="ch-title">${w.obwod}</b>
        <div class="ch-okreg">${w.okreg}</div>
      </div>

      <div class="crw-station-box">
        <div class="csb-head">
          <span class="csb-ic">📍</span>
          <div>
            <b>Adres Twojego Lokalu Wyborczego:</b>
            <p class="csb-school">${w.komisja}</p>
            <p class="csb-addr">${w.adres}</p>
          </div>
        </div>

        <div class="csb-features">
          <b>Udogodnienia dla wyborców:</b>
          <ul>
            ${w.cechy.map(c => `<li>✓ ${c}</li>`).join('')}
          </ul>
        </div>
      </div>

      ${customPrecinct ? `
        <div class="crw-alert-custom">
          <span>ℹ️</span>
          <div>
            <b>Złożono wniosek o zmianę miejsca głosowania!</b>
            <small>Zostałeś jednorazowo dopisany do wybranego obwodu na podstawie art. 28 Kodeksu wyborczego.</small>
          </div>
          <button type="button" class="btn-xs ghost" onclick="USLUGI.resetVotingStation()">Przywróć domyślny</button>
        </div>
      ` : ''}

      <div class="crw-actions-grid">
        <button type="button" class="btn secondary" onclick="USLUGI.downloadVotingCert()">
          📜 Pobierz zaświadczenie o prawie do głosowania (PDF)
        </button>
        <button type="button" class="btn primary" onclick="USLUGI.openChangePrecinctForm()">
          ✏️ Zmień miejsce głosowania (złóż wniosek)
        </button>
      </div>

      <div class="crw-data-verify">
        <b>Twoje dane w Centralnym Rejestrze Wyborców:</b>
        <div class="cdv-row"><span>Wyborca:</span><b>${typeof OS !== 'undefined' ? OS.nazwisko : w.persona}</b></div>
        <div class="cdv-row"><span>Prawo wybierania:</span><b style="color:#059669">Czynne prawo wyborcze (potwierdzone)</b></div>
        <div class="cdv-row"><span>Status spisu:</span><b>${w.spis}</b></div>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('wyboryModal', m);
}

function closeWyboryModal() {
  const m = document.getElementById('wyboryModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('wyboryModal');
  }
}

USLUGI.downloadVotingCert = function() {
  if (typeof showToast === 'function') {
    showToast('Pobrano urzędowe zaświadczenie o prawie do głosowania (PDF z kodem QR PKW)');
  }
};

USLUGI.openChangePrecinctForm = function() {
  const box = document.getElementById('crwBody');
  if (!box) return;

  box.innerHTML = `
    <div class="crw-form-box">
      <b class="cf-title">Wniosek o zmianę miejsca głosowania</b>
      <p class="cf-desc">Wybierz miejscowość lub obwód, w którym będziesz przebywać w dniu wyborów. Zmiana zostanie odnotowana natychmiastowo w CRW.</p>

      <div class="cf-group">
        <label for="crwCitySelect">Miejscowość pobytu w dniu wyborów:</label>
        <select id="crwCitySelect" class="cf-select">
          <option value="warszawa">Warszawa (Śródmieście, Obwód nr 14)</option>
          <option value="krakow">Kraków (Stare Miasto, Obwód nr 5)</option>
          <option value="gdansk">Gdańsk (Główne Miasto, Obwód nr 2)</option>
          <option value="zakopane">Zakopane (Krupówki, Obwód nr 3)</option>
          <option value="wroclaw">Wrocław (Rynek, Obwód nr 8)</option>
        </select>
      </div>

      <div class="cf-group">
        <label for="crwReason">Powód zmiany (opcjonalnie):</label>
        <input type="text" id="crwReason" class="cf-input" placeholder="np. Wyjazd służbowy / Urlop">
      </div>

      <div class="cf-actions">
        <button type="button" class="btn ghost" onclick="openWyboryModal()">Anuluj</button>
        <button type="button" class="btn primary" onclick="USLUGI.submitChangePrecinct()">Złóż wniosek i zaktualizuj CRW</button>
      </div>
    </div>
  `;
};

USLUGI.submitChangePrecinct = function() {
  const sel = document.getElementById('crwCitySelect');
  const city = sel ? sel.value : 'zakopane';

  const newPrecincts = {
    warszawa: {
      obwod: 'Obwód głosowania nr 14',
      okreg: 'Okręg nr 19 (Warszawa Śródmieście)',
      komisja: 'Liceum Ogólnokształcące nr IX im. K. Hoffmanowej',
      adres: 'ul. Emilii Plater 29, 00-688 Warszawa',
      dostepna: true,
      cechy: ['Lokal parterowy, podjazd', 'Karty w alfabecie Braille’a'],
      spis: 'Dopisany na jednorazowy wniosek wyborcy'
    },
    krakow: {
      obwod: 'Obwód głosowania nr 5',
      okreg: 'Okręg nr 13 (Kraków Stare Miasto)',
      komisja: 'I Liceum Ogólnokształcące im. B. Nowodworskiego',
      adres: 'pl. Na Groblach 9, 31-101 Kraków',
      dostepna: true,
      cechy: ['Winda, tłumacz PJM', 'Nakładki Braille’a'],
      spis: 'Dopisany na jednorazowy wniosek wyborcy'
    },
    zakopane: {
      obwod: 'Obwód głosowania nr 3',
      okreg: 'Okręg nr 14 (Nowy Sącz / Podhale)',
      komisja: 'Szkoła Podstawowa nr 1 im. Heleny Marusarzówny',
      adres: 'ul. Orkana 6, 34-500 Zakopane',
      dostepna: true,
      cechy: ['Podjazd dla wózków inwalidzkich', 'Stanowisko z pętlą indukcyjną'],
      spis: 'Dopisany na jednorazowy wniosek wyborcy'
    },
    gdansk: {
      obwod: 'Obwód głosowania nr 2',
      okreg: 'Okręg nr 25 (Gdańsk)',
      komisja: 'Szkoła Podstawowa nr 50',
      adres: 'ul. Grobla IV 8, 80-834 Gdańsk',
      dostepna: true,
      cechy: ['Lokal dostępny z poziomu ulicy'],
      spis: 'Dopisany na jednorazowy wniosek wyborcy'
    },
    wroclaw: {
      obwod: 'Obwód głosowania nr 8',
      okreg: 'Okręg nr 3 (Wrocław)',
      komisja: 'Szkoła Podstawowa nr 29',
      adres: 'ul. Kraińskiego 1, 50-153 Wrocław',
      dostepna: true,
      cechy: ['Lokal w pełni dostosowany dla osób z niepełnosprawnościami'],
      spis: 'Dopisany na jednorazowy wniosek wyborcy'
    }
  };

  const choice = newPrecincts[city] || newPrecincts.zakopane;
  if (typeof MobStore !== 'undefined') {
    MobStore.set('crw_custom_precinct', choice);
  }
  if (typeof showToast === 'function') {
    showToast('✓ Wniosek zaakceptowany! Zaktualizowano obwód w CRW.');
  }
  openWyboryModal();
};

USLUGI.resetVotingStation = function() {
  if (typeof MobStore !== 'undefined') {
    MobStore.set('crw_custom_precinct', null);
  }
  if (typeof showToast === 'function') showToast('Przywrócono domyślny obwód głosowania według zameldowania.');
  openWyboryModal();
};

// ----------------- MODAL: JAKOŚĆ POWIETRZA (GIOŚ) -----------------
function openJakoscPowietrzaModal(cityKey) {
  const m = document.getElementById('airModal');
  if (!m) return;
  const a = getAirForPersona(cityKey);
  const isSmogAlertOn = (typeof MobStore !== 'undefined') ? MobStore.get('gio_smog_alert', true) : true;

  const box = m.querySelector('.air-hero-box');
  if (box) {
    box.innerHTML = `
      <div class="air-cities-tabs">
        <button type="button" class="act-btn ${a.city === 'Kraków' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('krakow')">Kraków</button>
        <button type="button" class="act-btn ${a.city === 'Warszawa' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('warszawa')">Warszawa</button>
        <button type="button" class="act-btn ${a.city === 'Gdańsk' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('gdansk')">Gdańsk</button>
        <button type="button" class="act-btn ${a.city === 'Lublin' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('lublin')">Lublin</button>
        <button type="button" class="act-btn ${a.city === 'Katowice' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('katowice')">Katowice</button>
        <button type="button" class="act-btn ${a.city === 'Zakopane' ? 'active' : ''}" onclick="openJakoscPowietrzaModal('zakopane')">Zakopane</button>
      </div>

      <div class="air-circle-wrap" style="background:${a.bg};border-color:${a.color}">
        <span class="air-num" style="color:${a.color}">${a.pm25}</span>
        <small class="air-unit">µg/m³ PM2.5</small>
        <b class="air-idx" style="color:${a.color}">${a.index}</b>
      </div>

      <div class="air-meta-box">
        <div class="amb-station">📍 Stacja pomiarowa: <b>${a.station}</b></div>
        <p class="amb-advice">💡 ${a.advice}</p>

        <div class="amb-grid">
          <div class="amb-item">
            <span>Pył zawieszony PM2.5:</span>
            <b>${a.pm25} µg/m³ <small>(${a.pm25Norm}% normy)</small></b>
          </div>
          <div class="amb-item">
            <span>Pył zawieszony PM10:</span>
            <b>${a.pm10} µg/m³ <small>(${a.pm10Norm}% normy)</small></b>
          </div>
          <div class="amb-item">
            <span>Dwutlenek azotu (NO₂):</span>
            <b>${a.no2} µg/m³</b>
          </div>
          <div class="amb-item">
            <span>Ozon troposferyczny (O₃):</span>
            <b>${a.o3} µg/m³</b>
          </div>
          <div class="amb-item">
            <span>Dwutlenek siarki (SO₂):</span>
            <b>${a.so2} µg/m³</b>
          </div>
          <div class="amb-item">
            <span>Tlenek węgla (CO):</span>
            <b>${a.co} mg/m³</b>
          </div>
        </div>

        <div class="air-advisory-groups">
          <b>Zalecenia dla grup wrażliwych:</b>
          <div class="aag-row">
            <span>👶 Dzieci i kobiety w ciąży:</span>
            <b>${a.pm25 > 25 ? 'Zalecane ograniczenie dłuższego pobytu na zewnątrz' : 'Brak przeciwwskazań do spacerów'}</b>
          </div>
          <div class="aag-row">
            <span>🫁 Osoby z astmą i alergią:</span>
            <b>${a.pm25 > 25 ? 'Miej przy sobie leki wziewne, unikaj wietrzenia' : 'Warunki w pełni bezpieczne'}</b>
          </div>
          <div class="aag-row">
            <span>🏃 Aktywność sportowa:</span>
            <b>${a.pm10 > 50 ? 'Przenieś trening do pomieszczenia' : 'Świetne warunki do biegania'}</b>
          </div>
        </div>

        <div class="air-alert-toggle-box">
          <div>
            <b>Alerty smogowe i powiadomienia RCB</b>
            <small>Otrzymuj push przy przekroczeniu poziomu informowania PM10 (100 µg/m³)</small>
          </div>
          <button type="button" class="btn-xs ${isSmogAlertOn ? 'primary' : 'ghost'}" onclick="USLUGI.toggleSmogAlert()">
            ${isSmogAlertOn ? '✓ Włączone' : 'Wyłączone'}
          </button>
        </div>
      </div>
    `;
  }
  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('airModal', m);
}

function closeJakoscPowietrzaModal() {
  const m = document.getElementById('airModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('airModal');
  }
}

USLUGI.toggleSmogAlert = function() {
  if (typeof MobStore === 'undefined') return;
  const cur = MobStore.get('gio_smog_alert', true);
  MobStore.set('gio_smog_alert', !cur);
  if (typeof showToast === 'function') {
    showToast(!cur ? '🚨 Powiadomienia smogowe zostały aktywowane!' : 'Powiadomienia smogowe wyłączone.');
  }
  openJakoscPowietrzaModal();
};

// ----------------- WIDOK KATALOGU USŁUG (#viewServices) -----------------
function renderUslugiTab() {
  const root = document.getElementById('viewServices');
  if (!root) return;
  const isPeselBlocked = (typeof MobStore !== 'undefined') ? MobStore.isPeselBlocked() : false;
  const air = getAirForPersona();

  root.innerHTML = `
    <div class="services-header">
      <h2 class="services-title">Usługi publiczne</h2>
      <p class="services-sub">Oficjalne e-usługi administracji rządowej i samorządowej</p>
    </div>

    <div class="services-grid">
      <button type="button" class="service-card highlight" onclick="openIkpModal('recepty')">
        <div class="sc-icon" style="background:rgba(16,185,129,.12);color:#059669">🏥</div>
        <div class="sc-content">
          <b>Zdrowie i e-Recepty (IKP)</b>
          <small>Recepty z kodem kreskowym, skierowania, eWUŚ, EKUZ i leki stałe</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card highlight" onclick="openZastrzezPeselModal()">
        <div class="sc-icon" style="background:rgba(220,20,60,.1);color:var(--red)">🔒</div>
        <div class="sc-content">
          <b>Zastrzeż PESEL</b>
          <small>Status: <span style="color:${isPeselBlocked ? '#10b981' : '#dc143c'};font-weight:700">${isPeselBlocked ? 'Zastrzeżony (Bezpieczny)' : 'Niezastrzeżony'}</span></small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openEPlatnosciModal()">
        <div class="sc-icon" style="background:rgba(16,185,129,.1);color:#10b981">💳</div>
        <div class="sc-content">
          <b>ePłatności (BLIK)</b>
          <small>Podatki od nieruchomości i opłaty lokalne z kodem BLIK</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openBezpiecznyAutobusModal('KR 12345')">
        <div class="sc-icon" style="background:rgba(245,158,11,.1);color:#f59e0b">🚌</div>
        <div class="sc-content">
          <b>Bezpieczny autobus & CEPiK</b>
          <small>Badania techniczne, licznik, baza kradzieżowa Policji</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openJakoscPowietrzaModal()">
        <div class="sc-icon" style="background:rgba(59,130,246,.1);color:#3b82f6">🌿</div>
        <div class="sc-content">
          <b>Jakość powietrza (GIOŚ)</b>
          <small>${air.city}: <b style="color:${air.color}">${air.index}</b> (${air.pm25} µg/m³)</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openPointsDetail()">
        <div class="sc-icon" style="background:rgba(139,92,246,.1);color:#8b5cf6">🚗</div>
        <div class="sc-content">
          <b>Punkty karne CEPiK</b>
          <small>Licznik punktów, mandaty i zaświadczenie PDF</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openWyboryModal()">
        <div class="sc-icon" style="background:rgba(236,72,153,.1);color:#ec4899">🗳️</div>
        <div class="sc-content">
          <b>Wybory i Rejestr Wyborców (CRW)</b>
          <small>Sprawdź obwód, zmień miejsce głosowania, zaświadczenie</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>
    </div>
  `;
}
