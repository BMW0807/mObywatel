/* ---------- mObywatel 2.0 - Moduł e-Usług Publicznych (uslugi.js) ---------- */

const USLUGI = {
  // 1. Zastrzeż PESEL & Czasowe odbezpieczenie
  peselData: {
    tempUnlockTimer: null,
    history: [
      { who: 'PKO Bank Polski S.A.', reason: 'Wniosek o kredyt hipoteczny', date: '08.11.2026, 14:10', status: 'blocked', note: 'Zastrzeżenie aktywne – wniosek wstrzymany (art. 105a Prawa Bankowego)', icon: '<i class="ik ik-institution" aria-hidden="true"></i>' },
      { who: 'mBank S.A.', reason: 'Wniosek o kartę kredytową', date: '04.11.2026, 11:24', status: 'blocked', note: 'Zastrzeżenie aktywne – odrzucono zapytanie BIK', icon: '<i class="ik ik-bank" aria-hidden="true"></i>' },
      { who: 'Kancelaria Notarialna, Kraków', reason: 'Akt notarialny – sprzedaż lokalu mieszkalnego', date: '18.10.2026, 09:15', status: 'ok', note: 'Weryfikacja tożsamości udana (czasowe odbezpieczenie)', icon: '<i class="ik ik-cert" aria-hidden="true"></i>' },
      { who: 'P4 Sp. z o.o. (Play)', reason: 'Zawarcie nowej umowy abonamentowej (eSIM)', date: '02.09.2026, 16:40', status: 'ok', note: 'Zezwolono na weryfikację tożsamości klienta', icon: '<i class="ik ik-mobile" aria-hidden="true"></i>' },
      { who: 'Alior Bank S.A.', reason: 'Weryfikacja tożsamości przy otwarciu konta', date: '21.08.2026, 12:05', status: 'blocked', note: 'Zapytanie zablokowane z mocy ustawy', icon: '<i class="ik ik-bank" aria-hidden="true"></i>' },
      { who: 'ING Bank Śląski', reason: 'Cykliczny audyt antywyłudzeniowy klientów', date: '15.08.2026, 03:00', status: 'ok', note: 'Weryfikacja rutynowa zakończona pomyślnie', icon: '<i class="ik ik-shield" aria-hidden="true"></i>' }
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
    krakow: { city: 'Kraków', station: 'Kraków, al. Krasińskiego', index: 'Umiarkowana', color: 'var(--warn-ink)', bg: 'var(--warn-wash)', pm25: 38, pm25Norm: 152, pm10: 52, pm10Norm: 104, no2: 24, o3: 32, so2: 8, co: 0.6, advice: 'Osoby wrażliwe, starsze i dzieci powinny ograniczyć intensywny wysiłek na zewnątrz.' },
    warszawa: { city: 'Warszawa', station: 'Warszawa, ul. Marszałkowska', index: 'Dobra', color: 'var(--ok-ink)', bg: 'var(--ok-wash)', pm25: 18, pm25Norm: 72, pm10: 28, pm10Norm: 56, no2: 19, o3: 40, so2: 5, co: 0.4, advice: 'Jakość powietrza jest dobra. Możesz bez przeszkód spędzać czas na świeżym powietrzu.' },
    lublin: { city: 'Lublin', station: 'Lublin, ul. Obywatelska', index: 'Dobra', color: 'var(--ok-ink)', bg: 'var(--ok-wash)', pm25: 21, pm25Norm: 84, pm10: 31, pm10Norm: 62, no2: 16, o3: 36, so2: 6, co: 0.4, advice: 'Powietrze nie stanowi zagrożenia dla zdrowia.' },
    gdansk: { city: 'Gdańsk', station: 'Gdańsk, ul. Wyzwolenia', index: 'Bardzo dobra', color: 'var(--ok-ink)', bg: 'var(--ok-wash)', pm25: 9, pm25Norm: 36, pm10: 14, pm10Norm: 28, no2: 11, o3: 48, so2: 3, co: 0.3, advice: 'Świetna jakość powietrza. Idealne warunki do aktywności i spacerów nad morzem.' },
    katowice: { city: 'Katowice', station: 'Katowice, ul. Plebiscytowa', index: 'Dostateczna', color: 'var(--red-ink)', bg: 'var(--red-wash)', pm25: 46, pm25Norm: 184, pm10: 68, pm10Norm: 136, no2: 38, o3: 25, so2: 14, co: 0.9, advice: 'Zaleca się unikanie wietrzenia mieszkań oraz ograniczenie wysiłku fizycznego na powietrzu.' },
    wroclaw: { city: 'Wrocław', station: 'Wrocław, ul. Wiśniowa', index: 'Dobra', color: 'var(--ok-ink)', bg: 'var(--ok-wash)', pm25: 22, pm25Norm: 88, pm10: 34, pm10Norm: 68, no2: 21, o3: 38, so2: 7, co: 0.5, advice: 'Jakość powietrza jest zadowalająca, zanieczyszczenia nie stwarzają zagrożenia.' },
    zakopane: { city: 'Zakopane', station: 'Zakopane, ul. Sienkiewicza', index: 'Bardzo dobra', color: 'var(--ok-ink)', bg: 'var(--ok-wash)', pm25: 8, pm25Norm: 32, pm10: 12, pm10Norm: 24, no2: 7, o3: 54, so2: 2, co: 0.2, advice: 'Czyste górskie powietrze, sprzyjające rekreacji i wędrówkom.' }
  },

  // 5. Centralny Rejestr Wyborców (CRW)
  crw: {
    jan: {
      persona: 'Jan Wiśniewski',
      okreg: 'Okręg wyborczy nr 13 (Kraków)',
      obwod: 'Obwód głosowania nr 312',
      komisja: 'Szkoła Podstawowa nr 34',
      adres: 'ul. Wielicka 40, Kraków (Dzielnica XIII Podgórze)',
      dostepna: true,
      cechy: ['Lokal przystosowany dla osób z niepełnosprawnościami', 'Podjazd i winda na parter', 'Karty do głosowania z nakładką w alfabecie Braille’a', 'Pętla indukcyjna dla osób słabosłyszących'],
      spis: 'Ujęty z urzędu w stałym obwodzie głosowania'
    },
    marta: {
      persona: 'Marta Kowalska',
      okreg: 'Okręg wyborczy nr 19 (Warszawa)',
      obwod: 'Obwód głosowania nr 145',
      komisja: 'Szkoła Podstawowa nr 98',
      adres: 'ul. Kwiatowa 30, Warszawa (Mokotów)',
      dostepna: true,
      cechy: ['Lokal parterowy, brak barier architektonicznych', 'Wydzielone stanowisko z dobrym oświetleniem', 'Dostępny tłumacz PJM (Polski Język Migowy)'],
      spis: 'Ujęta z urzędu w stałym obwodzie głosowania'
    },
    ewa: {
      persona: 'Ewa Nowak',
      okreg: 'Okręg wyborczy nr 6 (Lublin)',
      obwod: 'Obwód głosowania nr 41',
      komisja: 'Szkoła Podstawowa nr 24',
      adres: 'ul. Lipowa 10, Lublin (Śródmieście)',
      dostepna: true,
      cechy: ['Podjazd dla wózków inwalidzkich', 'Nakładki Braille’a na karty'],
      spis: 'Ujęta z urzędu w stałym obwodzie głosowania'
    },
    kacper: {
      persona: 'Kacper Zieliński',
      okreg: 'Okręg wyborczy nr 35 (Olsztyn)',
      obwod: 'Obwód głosowania nr 7 w Elblągu',
      komisja: 'Szkoła Podstawowa nr 11',
      adres: 'ul. Ogólna 20, Elbląg',
      dostepna: true,
      cechy: ['Lokal dostępny z poziomu chodnika', 'Miejsca parkingowe dla osób uprawnionych'],
      spis: 'Ujęty z urzędu w stałym obwodzie głosowania (zameldowanie na pobyt stały w Elblągu)'
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
    let icon = isBlocked ? '<i class="ik ik-lock" aria-hidden="true"></i>' : '<i class="ik ik-unlock" aria-hidden="true"></i>';

    if (isTempUnlocked) {
      const remSec = Math.max(0, Math.floor((unlockUntil - Date.now()) / 1000));
      const mStr = String(Math.floor(remSec / 60)).padStart(2, '0');
      const sStr = String(remSec % 60).padStart(2, '0');
      stateTitle = `CZASOWO ODBEZPIECZONY (${mStr}:${sStr})`;
      stateDesc = `Ochrona zostanie automatycznie wznowiona po upływie czasu.`;
      badgeClass = 'warn';
      icon = '<i class="ik ik-hourglass" aria-hidden="true"></i>';
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
          ${isBlocked ? '<i class="ik ik-unlock" aria-hidden="true"></i> Cofnij zastrzeżenie PESEL' : '<i class="ik ik-lock" aria-hidden="true"></i> Zastrzeż numer PESEL'}
        </button>
      </div>

      ${isBlocked ? `
        <div class="pesel-temp-box">
          <div class="ptb-head">
            <b><i class="ik ik-timer" aria-hidden="true"></i> Czasowe odbezpieczenie PESEL</b>
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
            <b style="color:var(--warn-ink)"><i class="ik ik-hourglass" aria-hidden="true"></i> Aktywne czasowe odbezpieczenie</b>
            <small>PESEL pozostanie odbezpieczony jeszcze przez chwilę. Możesz zakończyć wizytę i zablokować go od razu:</small>
          </div>
          <div class="ptb-actions">
            <button type="button" class="btn-xs primary" onclick="USLUGI.togglePeselState()">Zablokuj teraz natychmiast</button>
          </div>
        </div>
      ` : '')}

      <div class="pesel-info-grid">
        <div class="p-item"><span>Twój numer PESEL:</span><b>${peselMasked}</b></div>
        <div class="p-item"><span>Status w Rejestrze:</span><b style="color:${isBlocked ? 'var(--ok-ink)' : (isTempUnlocked ? 'var(--warn-ink)' : 'var(--red-ink)')}">${isBlocked ? 'Chroniony (aktywny)' : (isTempUnlocked ? 'Odbezpieczony (czasowo)' : 'Niezabezpieczony')}</b></div>
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
              <b>${h.icon || '<i class="ik ik-institution" aria-hidden="true"></i>'} ${h.who}</b>
              <span class="phi-badge ${h.status}">${h.status === 'blocked' ? '<i class="ik ik-ban" aria-hidden="true"></i> Zablokowano' : '<i class="ik ik-check" aria-hidden="true"></i> Zezwolono'}</span>
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
        if (typeof showToast === 'function') showToast('Czas minął – Twój PESEL został automatycznie ponownie zastrzeżony!');
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
    showToast(next ? 'Numer PESEL został pomyślnie zastrzeżony!' : 'Zastrzeżenie numeru PESEL zostało cofnięte.');
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
    showToast(`PESEL odbezpieczony na ${minutes} min. Ochrona włączy się automatycznie.`);
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
          <span class="bh-badge ${data.inspectionValid ? 'ok' : 'err'}">${data.inspectionValid ? '<i class="ik ik-check" aria-hidden="true"></i> SPRAWNY' : '<i class="ik ik-warning" aria-hidden="true"></i> ZAGROŻENIE'}</span>
        </div>

        ${data.alert ? `<div class="bh-alert"><i class="ik ik-warning" aria-hidden="true"></i> ${data.alert}</div>` : ''}

        <div class="bh-police-status">
          <span class="bps-ic"><i class="ik ik-shield" aria-hidden="true"></i></span>
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
          <div class="bh-row"><span>Uprawnienia GITD:</span><b style="color:var(--ok-ink)">${data.license}</b></div>
        </div>

        ${data.timeline && data.timeline.length ? `
          <div class="bus-timeline-box">
            <b class="bt-title"><i class="ik ik-trend" aria-hidden="true"></i> Historia odczytów licznika i badań (CEPiK)</b>
            <div class="bt-list">
              ${data.timeline.map(t => `
                <div class="bt-item">
                  <div class="bt-dot"></div>
                  <div class="bt-row">
                    <span class="bt-date">${t.date}</span>
                    <b class="bt-odo">${t.odo}</b>
                  </div>
                  <small class="bt-skp">${t.skp} — wynik: <span style="color:var(--ok-ink)">${t.result}</span></small>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="bus-actions-row">
        <button type="button" class="btn secondary" onclick="downloadBusCert('${data.plate}')"><i class="ik ik-cert" aria-hidden="true"></i> Pobierz raport CEPiK (PDF)</button>
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
            <span class="ep-status ${actuallyPaid ? 'ok' : 'wait'}">${actuallyPaid ? '<i class="ik ik-check" aria-hidden="true"></i> Opłacono przez mObywatel' : `Termin: ${p.due}`}</span>
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
        <button type="button" class="bk-key action" onclick="USLUGI.backspaceBlik()"><i class="ik ik-backspace" aria-hidden="true"></i></button>
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
      if (typeof showToast === 'function') showToast('Kod BLIK wygasł. Wygeneruj nowy kod w banku.');
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
          <span><i class="ik ik-institution" aria-hidden="true"></i> PKO Bank Polski • IKO</span>
          <small>teraz</small>
        </div>
        <b>Prośba o płatność BLIK: ${amount.toFixed(2)} zł</b>
        <p>Odbiorca: ePłatności gov.pl (${title})</p>
      </div>

      <button type="button" class="btn primary" onclick="USLUGI.finishBlikSuccess('${payId}', ${amount}, '${title}')">
        <i class="ik ik-check" aria-hidden="true"></i> Symuluj potwierdzenie w banku
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
        <div class="bsw-icon"><i class="ik ik-check" aria-hidden="true"></i></div>
        <b class="bsw-title">Płatność zrealizowana pomyślnie!</b>
        <p class="bsw-sub">Kwota <b>${amount.toFixed(2)} zł</b> została przekazana na rachunek urzędu. Wygenerowano oficjalne Urzędowe Poświadczenie Odbioru (UPO).</p>
        
        <div class="bsw-details">
          <div><span>Status KIR:</span><b style="color:var(--ok-ink)">Zaakceptowana (Rozliczona)</b></div>
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
        <div class="ch-badge"><i class="ik ik-institution" aria-hidden="true"></i> Oficjalny Rejestr Państwowej Komisji Wyborczej (PKW)</div>
        <b class="ch-title">${w.obwod}</b>
        <div class="ch-okreg">${w.okreg}</div>
      </div>

      <div class="crw-station-box">
        <div class="csb-head">
          <span class="csb-ic"><i class="ik ik-pin" aria-hidden="true"></i></span>
          <div>
            <b>Adres Twojego Lokalu Wyborczego:</b>
            <p class="csb-school">${w.komisja}</p>
            <p class="csb-addr">${w.adres}</p>
          </div>
        </div>

        <div class="csb-features">
          <b>Udogodnienia dla wyborców:</b>
          <ul>
            ${w.cechy.map(c => `<li><i class="ik ik-check" aria-hidden="true"></i> ${c}</li>`).join('')}
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
          <i class="ik ik-cert" aria-hidden="true"></i> Pobierz zaświadczenie o prawie do głosowania (PDF)
        </button>
        <button type="button" class="btn primary" onclick="USLUGI.openChangePrecinctForm()">
          <i class="ik ik-edit" aria-hidden="true"></i> Zmień miejsce głosowania (złóż wniosek)
        </button>
      </div>

      <div class="crw-data-verify">
        <b>Twoje dane w Centralnym Rejestrze Wyborców:</b>
        <div class="cdv-row"><span>Wyborca:</span><b>${typeof OS !== 'undefined' ? OS.nazwisko : w.persona}</b></div>
        <div class="cdv-row"><span>Prawo wybierania:</span><b style="color:var(--ok-ink)">Czynne prawo wyborcze (potwierdzone)</b></div>
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
    showToast('Wniosek zaakceptowany! Zaktualizowano obwód w CRW.');
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
        <div class="amb-station"><i class="ik ik-pin" aria-hidden="true"></i> Stacja pomiarowa: <b>${a.station}</b></div>
        <p class="amb-advice"><i class="ik ik-bulb" aria-hidden="true"></i> ${a.advice}</p>

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
            <span><i class="ik ik-baby" aria-hidden="true"></i> Dzieci i kobiety w ciąży:</span>
            <b>${a.pm25 > 25 ? 'Zalecane ograniczenie dłuższego pobytu na zewnątrz' : 'Brak przeciwwskazań do spacerów'}</b>
          </div>
          <div class="aag-row">
            <span><i class="ik ik-lungs" aria-hidden="true"></i> Osoby z astmą i alergią:</span>
            <b>${a.pm25 > 25 ? 'Miej przy sobie leki wziewne, unikaj wietrzenia' : 'Warunki w pełni bezpieczne'}</b>
          </div>
          <div class="aag-row">
            <span><i class="ik ik-run" aria-hidden="true"></i> Aktywność sportowa:</span>
            <b>${a.pm10 > 50 ? 'Przenieś trening do pomieszczenia' : 'Świetne warunki do biegania'}</b>
          </div>
        </div>

        <div class="air-alert-toggle-box">
          <div>
            <b>Alerty smogowe i powiadomienia RCB</b>
            <small>Otrzymuj push przy przekroczeniu poziomu informowania PM10 (100 µg/m³)</small>
          </div>
          <button type="button" class="btn-xs ${isSmogAlertOn ? 'primary' : 'ghost'}" onclick="USLUGI.toggleSmogAlert()">
            ${isSmogAlertOn ? '<i class="ik ik-check" aria-hidden="true"></i> Włączone' : 'Wyłączone'}
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
    showToast(!cur ? 'Powiadomienia smogowe zostały aktywowane!' : 'Powiadomienia smogowe wyłączone.');
  }
  openJakoscPowietrzaModal();
};

// ----------------- WIDOK KATALOGU USŁUG (#viewServices) -----------------

// ==========================================================================
// 7 NOWYCH MODUŁÓW E-USŁUG mObywatel 2.0
// ==========================================================================

// ----------------- 1. ZGŁOŚ NARUSZENIE ŚRODOWISKOWE (GIOŚ) -----------------
let giosSelectedCategory = 'dzikie_wysypisko';

function openGiosModal() {
  const m = document.getElementById('giosZgloszenieModal');
  if (!m) return;
  giosSelectedCategory = 'dzikie_wysypisko';
  renderGiosForm();
  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('giosZgloszenieModal', m);
}

function closeGiosModal() {
  const m = document.getElementById('giosZgloszenieModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('giosZgloszenieModal');
  }
}

function renderGiosForm() {
  const box = document.getElementById('giosContent');
  if (!box) return;

  const cats = [
    { id: 'dzikie_wysypisko', icon: '🗑️', name: 'Dzikie wysypisko', desc: 'Nielegalne składowanie odpadów, opon, gruzu' },
    { id: 'scieki_woda', icon: '🚯', name: 'Zanieczyszczenie wód', desc: 'Wylewanie ścieków do rzeki, rowu, jeziora' },
    { id: 'dym_ogien', icon: '💨', name: 'Spalanie odpadów', desc: 'Dymiący komin, palenie plastików, lakierów' },
    { id: 'odpady_niebezpieczne', icon: '☣️', name: 'Odpady niebezpieczne', desc: 'Beczki z chemikaliami, azbest, odpady medyczne' }
  ];

  box.innerHTML = `
    <div class="gios-form-wrap">
      <div class="gfw-desc">
        Główny Inspektorat Ochrony Środowiska przyjmuje zgłoszenia o zdarzeniach mogących niekorzystnie wpływać na środowisko.
      </div>

      <b class="gfw-label">Wybierz kategorię naruszenia:</b>
      <div class="gios-cat-grid">
        ${cats.map(c => `
          <button type="button" class="gios-cat-btn ${giosSelectedCategory === c.id ? 'active' : ''}" onclick="selectGiosCategory('${c.id}')">
            <span class="gcb-icon">${c.icon}</span>
            <span class="gcb-name">${c.name}</span>
            <small class="gcb-desc">${c.desc}</small>
          </button>
        `).join('')}
      </div>

      <div class="gfw-field">
        <label for="giosLocInput">Lokalizacja zdarzenia (geotagowanie GPS):</label>
        <div class="gios-loc-box">
          <input type="text" id="giosLocInput" class="gios-input" value="Kraków, rejon ul. Lipskiej (GPS: 50.0482°N, 19.9821°E)" readonly>
          <span class="gios-gps-badge">📍 GPS precyzyjny (±4m)</span>
        </div>
      </div>

      <div class="gfw-field">
        <label for="giosDescInput">Opis sytuacji / uwagi dla inspektorów:</label>
        <textarea id="giosDescInput" class="gios-textarea" rows="3" placeholder="Opisz co zauważyłeś, np. porzucone opony i odpady budowlane na skraju lasu...">Porzucone odpady budowlane i kilkanaście zużytych opon ciężarowych na skraju nieużytków.</textarea>
      </div>

      <div class="gfw-field">
        <span class="gfw-sublabel">Dokumentacja fotograficzna (aparat):</span>
        <div class="gios-photo-strip">
          <div class="gps-photo-item">
            <span class="gpi-tag">📷 Foto 1</span>
            <small>ZDJECIE_20261110_1028.JPG (2.4 MB)</small>
            <span class="gpi-ok">✓ Załączono</span>
          </div>
          <button type="button" class="btn-xs ghost" onclick="if(typeof showToast==='function')showToast('Symulacja: zrobiono dodatkowe zdjęcie terenu')">+ Zrób kolejne zdjęcie</button>
        </div>
      </div>

      <div class="gios-anon-toggle">
        <input type="checkbox" id="giosAnonCheck" class="gios-check">
        <label for="giosAnonCheck">Zgłoszenie anonimowe (dane zgłaszającego nie zostaną przekazane)</label>
      </div>

      <div class="gios-actions">
        <button type="button" class="btn ghost" onclick="closeGiosModal()">Anuluj</button>
        <button type="button" class="btn primary" onclick="submitGiosReport()">🚨 Wyślij zgłoszenie do GIOŚ</button>
      </div>
    </div>
  `;
}

function selectGiosCategory(catId) {
  giosSelectedCategory = catId;
  renderGiosForm();
}

function submitGiosReport() {
  const box = document.getElementById('giosContent');
  if (!box) return;

  const ticketId = `GIOS/2026/WM/${Math.floor(10000 + Math.random() * 90000)}`;

  box.innerHTML = `
    <div class="gios-success-card">
      <div class="gsc-icon">✓</div>
      <b class="gsc-title">Zgłoszenie zostało zarejestrowane!</b>
      <p class="gsc-sub">Informacja trafiła do Wojewódzkiego Inspektoratu Ochrony Środowiska (WIOŚ).</p>
      
      <div class="gsc-ticket-box">
        <div class="gtb-row"><span>Numer sprawy:</span><b class="vin-mono">${ticketId}</b></div>
        <div class="gtb-row"><span>Data i godzina:</span><b>${new Date().toLocaleString('pl-PL')}</b></div>
        <div class="gtb-row"><span>Status:</span><b style="color:#059669">Przekazano inspektorom dyżurnym</b></div>
        <div class="gtb-row"><span>Weryfikacja w terenie:</span><b>W trakcie planowania</b></div>
      </div>

      <p class="gsc-note">Dziękujemy za obywatelską postawę i dbałość o czyste środowisko naturalne.</p>

      <div class="gsc-actions">
        <button type="button" class="btn primary" onclick="closeGiosModal()">Wróć do usług</button>
      </div>
    </div>
  `;

  if (typeof showToast === 'function') {
    showToast(`✓ Zgłoszenie przyjęte przez GIOŚ (${ticketId})`);
  }
}

// ----------------- 2. MOJA RODZINA I DZIECI -----------------
function openRodzinaModal() {
  const m = document.getElementById('rodzinaDzieciModal');
  if (!m) return;

  const box = document.getElementById('rodzinaContent');
  if (box) {
    box.innerHTML = `
      <div class="rodzina-hero-banner">
        <div class="rhb-icon">👨‍👩‍👧‍👦</div>
        <div>
          <b>Centrum Rodziny i Dokumenty Dzieci</b>
          <small>Cyfrowe legitymacje szkolne, recepty i świadczenia ZUS dla Twoich dzieci</small>
        </div>
      </div>

      <div class="rodzina-kids-list">
        <!-- Dziecko 1 -->
        <div class="kid-card">
          <div class="kc-head">
            <div class="kc-avatar">👧</div>
            <div>
              <b class="kc-name">Zofia Wiśniewska</b>
              <small class="kc-sub">12 lat • PESEL: 14281504928</small>
            </div>
            <span class="kc-badge ok">Szkoła Podstawowa</span>
          </div>

          <div class="kc-docs-grid">
            <div class="kc-doc-item" onclick="openChildSchoolCard('Zofia Wiśniewska')">
              <span class="kcd-ic">🪪</span>
              <div>
                <b>mLegitymacja Szkolna</b>
                <small>SP nr 26 w Krakowie • Ważna do 30.09.2027</small>
              </div>
              <span class="kcd-arr">→</span>
            </div>

            <div class="kc-doc-item" onclick="openChildPrescriptions('Zofia')">
              <span class="kcd-ic">💊</span>
              <div>
                <b>e-Recepty i Zdrowie (IKP)</b>
                <small>1 aktywna e-Recepta (Amoksiklav) • Bilans 10-latka</small>
              </div>
              <span class="kcd-arr">→</span>
            </div>
          </div>

          <div class="kc-benefits-box">
            <div class="kcb-row">
              <span>Program Rodzina 800+:</span>
              <b style="color:#059669">✓ Przyznane (800 zł / m-c)</b>
            </div>
            <div class="kcb-row">
              <span>Program Dobry Start 300+:</span>
              <b>✓ Wypłacono na rok 2026/2027</b>
            </div>
          </div>
        </div>

        <!-- Dziecko 2 -->
        <div class="kid-card">
          <div class="kc-head">
            <div class="kc-avatar">👦</div>
            <div>
              <b class="kc-name">Piotr Wiśniewski</b>
              <small class="kc-sub">8 lat • PESEL: 18231201941</small>
            </div>
            <span class="kc-badge ok">Szkoła Podstawowa</span>
          </div>

          <div class="kc-docs-grid">
            <div class="kc-doc-item" onclick="openChildSchoolCard('Piotr Wiśniewski')">
              <span class="kcd-ic">🪪</span>
              <div>
                <b>mLegitymacja Szkolna</b>
                <small>SP nr 26 w Krakowie • Ważna do 30.09.2027</small>
              </div>
              <span class="kcd-arr">→</span>
            </div>
          </div>

          <div class="kc-benefits-box">
            <div class="kcb-row">
              <span>Program Rodzina 800+:</span>
              <b style="color:#059669">✓ Przyznane (800 zł / m-c)</b>
            </div>
          </div>
        </div>
      </div>

      <div class="rodzina-actions">
        <button type="button" class="btn secondary" onclick="closeRodzinaModal();if(typeof openDoc==='function')openDoc('kdr')">
          💳 Karta Dużej Rodziny (KDR)
        </button>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('rodzinaDzieciModal', m);
}

function closeRodzinaModal() {
  const m = document.getElementById('rodzinaDzieciModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('rodzinaDzieciModal');
  }
}

function openChildSchoolCard(childName) {
  if (typeof showToast === 'function') {
    showToast(`Otwarto oficjalną mLegitymację szkolną dla: ${childName}`);
  }
  closeRodzinaModal();
  if (typeof openDoc === 'function') openDoc('legitymacja-szkolna');
}

function openChildPrescriptions(childName) {
  closeRodzinaModal();
  if (typeof openIkpModal === 'function') openIkpModal('recepty');
}

// ----------------- 3. ZGŁOSZENIE ZBYCIA POJAZDU (CEPiK) -----------------
function openZbycieModal(presetPlate) {
  const m = document.getElementById('zbyciePojazduModal');
  if (!m) return;

  const box = document.getElementById('zbycieContent');
  if (box) {
    box.innerHTML = `
      <div class="zbycie-form-wrap">
        <div class="zfw-alert">
          <b>⚠️ Obowiązek ustawowy:</b>
          <p>Zgłoś sprzedaż pojazdu w ciągu 30 dni od podpisania umowy, aby uniknąć kary finansowej (art. 78 ustawy Prawo o ruchu drogowym) i zabezpieczyć się przed mandatami nowego właściciela.</p>
        </div>

        <div class="gfw-field">
          <label for="zbycieVehSelect">Wybierz sprzedany pojazd:</label>
          <select id="zbycieVehSelect" class="gios-select">
            <option value="SKODA">Skoda Octavia (KR 7821P) • VIN: TMBJJ7NE1KZ129482</option>
            <option value="FIAT">Fiat Panda (LU 5521P) • VIN: ZFA31200005192841</option>
          </select>
        </div>

        <div class="gfw-field">
          <label for="zbycieBuyerType">Kto kupił pojazd?</label>
          <select id="zbycieBuyerType" class="gios-select">
            <option value="osoba">Osoba fizyczna (PESEL)</option>
            <option value="firma">Firma / Przedsiębiorca (NIP)</option>
          </select>
        </div>

        <div class="gfw-field">
          <label for="zbycieBuyerName">Imię i nazwisko / Nazwa nabywcy:</label>
          <input type="text" id="zbycieBuyerName" class="gios-input" value="Marek Zieliński" placeholder="np. Jan Kowalski">
        </div>

        <div class="gfw-field">
          <label for="zbycieBuyerId">Numer PESEL / NIP nabywcy:</label>
          <input type="text" id="zbycieBuyerId" class="gios-input" value="84092109412" placeholder="11 cyfr PESEL">
        </div>

        <div class="gfw-field">
          <label for="zbycieDate">Data zawarcia umowy sprzedaży:</label>
          <input type="date" id="zbycieDate" class="gios-input" value="2026-11-08">
        </div>

        <div class="gfw-field">
          <label for="zbyciePrice">Kwota transakcji z umowy (zł):</label>
          <input type="number" id="zbyciePrice" class="gios-input" value="38500" placeholder="np. 38500">
        </div>

        <div class="gfw-field">
          <span class="gfw-sublabel">Skan / zdjęcie umowy kupna-sprzedaży:</span>
          <div class="pab-chip">
            <span>📄 Umowa_sprzedazy_Skoda_Octavia_podpisana.pdf (420 KB)</span>
            <span style="color:#059669;font-weight:700">✓ Gotowy do wysyłki</span>
          </div>
        </div>

        <div class="pf-signature-banner">
          <span class="psb-ic">✍️</span>
          <div>
            <b>Podpis mDowodem</b>
            <p>Zgłoszenie zbycia zostanie natychmiast przekazane do Wydziału Komunikacji w Krakowie i Ubezpieczeniowego Funduszu Gwarancyjnego (UFG).</p>
          </div>
        </div>

        <div class="zbycie-actions">
          <button type="button" class="btn ghost" onclick="closeZbycieModal()">Anuluj</button>
          <button type="button" class="btn primary" onclick="submitZbyciePojazdu()">🔐 Podpisz i zgłoś zbycie</button>
        </div>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('zbyciePojazduModal', m);
}

function closeZbycieModal() {
  const m = document.getElementById('zbyciePojazduModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('zbyciePojazduModal');
  }
}

function submitZbyciePojazdu() {
  // Animacja biometrii Face ID
  const faceEl = document.getElementById('faceid');
  if (faceEl) {
    faceEl.classList.add('active');
    setTimeout(() => faceEl.classList.add('ok'), 600);
    setTimeout(() => {
      faceEl.classList.remove('active', 'ok');
      finalizeZbycie();
    }, 1200);
  } else {
    finalizeZbycie();
  }
}

function finalizeZbycie() {
  const box = document.getElementById('zbycieContent');
  if (!box) return;

  const upoNum = `UPO/CEPIK/2026/11/${Math.floor(100000 + Math.random() * 900000)}`;

  box.innerHTML = `
    <div class="zbycie-success-card">
      <div class="zsc-icon">✓</div>
      <b class="zsc-title">Zgłoszenie zbycia przyjęte!</b>
      <p class="zsc-sub">Pojazd został odnotowany jako zbyty w Centralnej Ewidencji Pojazdów (CEPiK) oraz Starostwie.</p>

      <div class="zsc-info-box">
        <div class="zib-row"><span>Pojazd:</span><b>Skoda Octavia (KR 7821P)</b></div>
        <div class="zib-row"><span>Nabywca:</span><b>Marek Zieliński (PESEL: 8409•••412)</b></div>
        <div class="zib-row"><span>Urzędowe UPO:</span><b class="vin-mono">${upoNum}</b></div>
        <div class="zib-row"><span>Powiadomienie UFG:</span><b style="color:#059669">Wysłane pomyślnie</b></div>
      </div>

      <div class="zsc-actions">
        <button type="button" class="btn primary" onclick="closeZbycieModal()">Zamknij</button>
      </div>
    </div>
  `;

  if (typeof showToast === 'function') {
    showToast(`✓ Zgłoszono zbycie pojazdu! Wygenerowano ${upoNum}`);
  }
}

// ----------------- 4. KRAJOWY REJESTR KARNY (KRK) -----------------
function openKrkModal() {
  const m = document.getElementById('krkModal');
  if (!m) return;

  const box = document.getElementById('krkContent');
  const o = (typeof OS !== 'undefined' && OS.nazwisko) ? OS.nazwisko : 'Jan Wiśniewski';
  const pesel = (typeof OS !== 'undefined' && OS.moje && OS.moje.pesel) ? OS.moje.pesel : '91071427765';
  const certId = `KRK/E-ZASW/2026/11/${Math.floor(100000 + Math.random() * 900000)}`;

  if (box) {
    box.innerHTML = `
      <div class="krk-doc-sheet">
        <div class="kds-head">
          <div class="kds-emblem">🦅</div>
          <div class="kds-titles">
            <span>RZECZPOSPOLITA POLSKA</span>
            <b>MINISTERSTWO SPRAWIEDLIWOŚCI</b>
            <small>KRAJOWY REJESTR KARNY</small>
          </div>
        </div>

        <div class="kds-banner">
          <b>ZAŚWIADCZENIE O NIEKARALNOŚCI</b>
          <small>Wydane w trybie art. 19 ust. 1 ustawy z dnia 24 maja 2000 r. o Krajowym Rejestrze Karnym</small>
        </div>

        <div class="kds-verdict-box">
          <div class="kvb-stamp">✓ POTWIERDZONA TOŻSAMOŚĆ</div>
          <div class="kvb-big-status">NIE FIGURUJE</div>
          <p class="kvb-text">w Kartotece Karnej Krajowego Rejestru Karnego oraz Rejestrze Sprawców Przestępstw na Tle Seksualnym.</p>
        </div>

        <div class="kds-data-grid">
          <div class="kdg-row"><span>Imię i nazwisko:</span><b>${o}</b></div>
          <div class="kdg-row"><span>Numer PESEL:</span><b class="vin-mono">${pesel}</b></div>
          <div class="kdg-row"><span>Numer zaświadczenia:</span><b class="vin-mono">${certId}</b></div>
          <div class="kdg-row"><span>Data wystawienia:</span><b>${new Date().toLocaleDateString('pl-PL')}</b></div>
          <div class="kdg-row"><span>Pieczęć elektroniczna:</span><b>Kwalifikowana Pieczęć Elektroniczna MS</b></div>
        </div>

        <div class="kds-legal-note">
          Niniejsze zaświadczenie stanowi dokument urzędowy opatrzony kwalifikowaną pieczęcią elektroniczną Ministra Sprawiedliwości. Spełnia wymogi tzw. Ustawy Kamilka (praca z dziećmi), wymogi przetargowe oraz procedury rekrutacyjne.
        </div>
      </div>

      <div class="krk-actions-bar">
        <button type="button" class="btn secondary" onclick="downloadKrkPdf('${certId}')">📜 Pobierz oficjalny PDF</button>
        <button type="button" class="btn primary" onclick="closeKrkModal()">Wróć</button>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('krkModal', m);
}

function closeKrkModal() {
  const m = document.getElementById('krkModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('krkModal');
  }
}

function downloadKrkPdf(certId) {
  if (typeof showToast === 'function') {
    showToast(`Pobrano oficjalne e-Zaświadczenie KRK (${certId}.pdf) z pieczęcią Ministerstwa Sprawiedliwości`);
  }
}

// ----------------- 5. KALKULATOR EMERYTURY ZUS -----------------
let emerytSelectedAge = 65;

function openEmeryturaModal() {
  const m = document.getElementById('emeryturaModal');
  if (!m) return;
  emerytSelectedAge = 65;
  renderEmeryturaView();
  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('emeryturaModal', m);
}

function closeEmeryturaModal() {
  const m = document.getElementById('emeryturaModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('emeryturaModal');
  }
}

function renderEmeryturaView() {
  const box = document.getElementById('emerytContent');
  if (!box) return;

  // Obliczenia prognozy emerytalnej wg wieku
  const baseP = 4820; // kwota dla wieku 65 lat
  const diff = emerytSelectedAge - 65;
  const payout = Math.round(baseP * Math.pow(1.092, diff));
  const diffPct = Math.round(((payout - baseP) / baseP) * 100);

  box.innerHTML = `
    <div class="emeryt-wrap">
      <div class="ew-hero">
        <span class="ew-sub">Prognozowana emerytura brutto przy przejściu w wieku:</span>
        <div class="ew-age-badge">${emerytSelectedAge} lat</div>
        <b class="ew-amount">${payout.toLocaleString('pl-PL')} zł <small>/ miesiąc</small></b>
        ${diff !== 0 ? `
          <div class="ew-diff ${diff > 0 ? 'plus' : 'minus'}">
            ${diff > 0 ? `+${diffPct}% więcej dzięki pracy dłużej o ${diff} ${diff === 1 ? 'rok' : 'lata'}` : `${diffPct}% mniej niż przy wieku ustawowym`}
          </div>
        ` : '<div class="ew-diff std">Wiek powszechny (ustawowy)</div>'}
      </div>

      <div class="ew-slider-box">
        <div class="esb-head">
          <span>Wiek zakończenia aktywności zawodowej:</span>
          <b>${emerytSelectedAge} lat</b>
        </div>
        <input type="range" min="60" max="72" value="${emerytSelectedAge}" class="ew-slider" id="emerytAgeRange" oninput="changeEmerytAge(this.value)">
        <div class="esb-scale">
          <span>60 lat</span>
          <span>65 lat (ustawowy)</span>
          <span>72 lata</span>
        </div>
      </div>

      <div class="ew-stats-grid">
        <div class="esg-card">
          <span class="esg-lbl">Zwaloryzowane składki ZUS:</span>
          <b class="esg-val">542 810 zł</b>
        </div>
        <div class="esg-card">
          <span class="esg-lbl">Subkonto w ZUS:</span>
          <b class="esg-val">168 450 zł</b>
        </div>
        <div class="esg-card">
          <span class="esg-lbl">Kapitał początkowy:</span>
          <b class="esg-val">84 200 zł</b>
        </div>
        <div class="esg-card">
          <span class="esg-lbl">Dalsze trwanie życia (GUS):</span>
          <b class="esg-val">${Math.max(120, 218 - (emerytSelectedAge - 60) * 12)} m-cy</b>
        </div>
      </div>

      <div class="ew-tip-box">
        💡 <b>Zasada waloryzacji ZUS:</b> Każdy dodatkowy rok pracy po osiągnięciu wieku emerytalnego zwiększa Twoje przyszłe świadczenie średnio o <b>8–12%</b> dzięki powiększeniu puli składek i statystycznemu skróceniu okresu pobierania.
      </div>

      <div class="ew-actions">
        <button type="button" class="btn secondary" onclick="closeEmeryturaModal();if(typeof askAssistantWithPrompt==='function')askAssistantWithPrompt('Jak mogę zwiększyć swoją przyszłą emeryturę w ZUS?')">Zapytaj Asystenta AI</button>
        <button type="button" class="btn primary" onclick="bookZusAppointment()">📅 Umów e-Wizytę w ZUS</button>
      </div>
    </div>
  `;
}

function changeEmerytAge(val) {
  emerytSelectedAge = parseInt(val, 10);
  renderEmeryturaView();
}

function bookZusAppointment() {
  if (typeof showToast === 'function') {
    showToast('Przekierowano do rezerwacji e-Wizyty w ZUS (terminy dostępne od jutra)');
  }
}

// ----------------- 6. POLAK ZA GRANICĄ • ODYSEUSZ (MSZ) -----------------
let odyseuszSelectedCountry = 'Włochy';

function openOdyseuszModal() {
  const m = document.getElementById('odyseuszModal');
  if (!m) return;
  renderOdyseuszView();
  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('odyseuszModal', m);
}

function closeOdyseuszModal() {
  const m = document.getElementById('odyseuszModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('odyseuszModal');
  }
}

function renderOdyseuszView() {
  const box = document.getElementById('odyseuszContent');
  if (!box) return;

  const embassies = {
    'Włochy': { city: 'Rzym', addr: 'Via Rubens 20, 00197 Roma', phone: '+39 335 599 5212', level: '1 – Zwykła ostrożność', color: '#10b981' },
    'Hiszpania': { city: 'Madryt', addr: 'Calle Guisando 23 bis, 28035 Madrid', phone: '+34 913 736 605', level: '1 – Zwykła ostrożność', color: '#10b981' },
    'Grecja': { city: 'Ateny', addr: 'Chryssanthemon 22, 154 52 Paleo Psychico', phone: '+30 693 655 4629', level: '1 – Zwykła ostrożność', color: '#10b981' },
    'Chorwacja': { city: 'Zagrzeb', addr: 'Krležin gvozd 3, 10000 Zagreb', phone: '+385 1 4899 414', level: '1 – Zwykła ostrożność', color: '#10b981' },
    'Turcja': { city: 'Ankara', addr: 'Atatürk Bulvarı 241, Kavaklıdere', phone: '+90 530 469 1881', level: '2 – Zachowaj szczególną ostrożność', color: '#f59e0b' },
    'Egipt': { city: 'Kair', addr: '5 El Anab Street, Dokki, Giza', phone: '+20 106 182 8585', level: '2 – Ostrzeżenie dla podróżnych', color: '#f59e0b' }
  };

  const current = embassies[odyseuszSelectedCountry] || embassies['Włochy'];

  box.innerHTML = `
    <div class="ody-wrap">
      <div class="ody-hero">
        <span class="ody-tag">✈️ SERWIS MINISTERSTWA SPRAW ZAGRANICZNYCH</span>
        <b>System Rejestracji Podróży Odyseusz</b>
        <p>Zgłoś swój wyjazd, aby w razie kryzysu, trzęsienia ziemi lub zamieszek konsul mógł się z Tobą natychmiast skontaktować.</p>
      </div>

      <div class="gfw-field">
        <label for="odyCountrySelect">Wybierz kraj docelowy:</label>
        <select id="odyCountrySelect" class="gios-select" onchange="selectOdyCountry(this.value)">
          ${Object.keys(embassies).map(k => `<option value="${k}" ${k === odyseuszSelectedCountry ? 'selected' : ''}>${k}</option>`).join('')}
        </select>
      </div>

      <div class="ody-consul-card">
        <div class="occ-head">
          <span class="occ-flag">🏛️</span>
          <div>
            <b>Ambasada i Konsulat RP w: ${current.city}</b>
            <small>${current.addr}</small>
          </div>
        </div>
        <div class="occ-phone-row">
          <span>🚨 Całodobowy telefon alarmowy:</span>
          <b class="vin-mono">${current.phone}</b>
        </div>
        <div class="occ-level-row">
          <span>Poziom ostrzeżenia MSZ:</span>
          <b style="color:${current.color}">${current.level}</b>
        </div>
      </div>

      <div class="gfw-field">
        <label for="odyDates">Termin pobytu:</label>
        <input type="text" id="odyDates" class="gios-input" value="15.11.2026 – 22.11.2026 (7 dni)">
      </div>

      <div class="gfw-field">
        <label for="odyContact">Numer telefonu w podróży:</label>
        <input type="tel" id="odyContact" class="gios-input" value="+48 601 234 567">
      </div>

      <div class="ody-actions">
        <button type="button" class="btn ghost" onclick="closeOdyseuszModal()">Zamknij</button>
        <button type="button" class="btn primary" onclick="submitOdyRegistration()">🌍 Zarejestruj podróż w Odyseuszu</button>
      </div>
    </div>
  `;
}

function selectOdyCountry(c) {
  odyseuszSelectedCountry = c;
  renderOdyseuszView();
}

function submitOdyRegistration() {
  if (typeof showToast === 'function') {
    showToast(`✓ Podróż do: ${odyseuszSelectedCountry} zarejestrowana w MSZ Odyseusz!`);
  }
  closeOdyseuszModal();
}

// ----------------- 7. AWARYJNE ZASTRZEŻENIE KART PŁATNICZYCH (ZBP) -----------------
function openZastrzezKartyModal() {
  const m = document.getElementById('zastrzezKartyModal');
  if (!m) return;

  const box = document.getElementById('kartyContent');
  if (box) {
    box.innerHTML = `
      <div class="karty-wrap">
        <div class="karty-alert-hero">
          <span class="kah-ic">🚨</span>
          <div>
            <b>Zgubiłeś portfel lub skradziono Ci karty?</b>
            <p>Jeden system blokuje karty debetowe i kredytowe we wszystkich bankach w Polsce jednocześnie.</p>
          </div>
        </div>

        <div class="karty-hotline-box">
          <span class="khb-lbl">Oficjalna infolinia Związku Banków Polskich (24/7):</span>
          <b class="khb-phone">(+48) 828 828 828</b>
          <small>Automatyczny system rozpoznawania banku po nazwie głosowej</small>
        </div>

        <b class="karty-sec-h">Twoje powiązane banki i karty:</b>
        <div class="karty-bank-list" id="kartyBankList">
          <div class="kbl-item">
            <div class="kbli-info">
              <b>🏛️ PKO Bank Polski</b>
              <small>Karta debetowa PKO Visa •••• 4912, Kredytowa Mastercard •••• 8102</small>
            </div>
            <span class="kbli-status" id="st_pko">Aktywna</span>
          </div>

          <div class="kbl-item">
            <div class="kbli-info">
              <b>🏦 mBank S.A.</b>
              <small>Karta debetowa Visa zbliżeniowa •••• 3319</small>
            </div>
            <span class="kbli-status" id="st_mbank">Aktywna</span>
          </div>

          <div class="kbl-item">
            <div class="kbli-info">
              <b>🛡️ ING Bank Śląski</b>
              <small>Karta walutowa EUR Mastercard •••• 9012</small>
            </div>
            <span class="kbli-status" id="st_ing">Aktywna</span>
          </div>
        </div>

        <div class="karty-actions">
          <button type="button" class="btn secondary" onclick="closeZastrzezKartyModal();if(typeof openZastrzezPeselModal==='function')openZastrzezPeselModal()">
            🔒 Zastrzeż także PESEL
          </button>
          <button type="button" class="btn primary danger-btn" onclick="executeCardBlock()">
            🛑 ZABLOKUJ WSZYSTKIE KARTY TERAZ
          </button>
        </div>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('zastrzezKartyModal', m);
}

function closeZastrzezKartyModal() {
  const m = document.getElementById('zastrzezKartyModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('zastrzezKartyModal');
  }
}

function executeCardBlock() {
  const st1 = document.getElementById('st_pko');
  const st2 = document.getElementById('st_mbank');
  const st3 = document.getElementById('st_ing');

  if (st1) { st1.textContent = '🚫 ZABLOKOWANA'; st1.className = 'kbli-status blocked'; }
  if (st2) { st2.textContent = '🚫 ZABLOKOWANA'; st2.className = 'kbli-status blocked'; }
  if (st3) { st3.textContent = '🚫 ZABLOKOWANA'; st3.className = 'kbli-status blocked'; }

  if (typeof showToast === 'function') {
    showToast('🛑 Wszystkie karty płatnicze zostały natychmiast zablokowane w systemie ZBP!');
  }
}

// ----------------- WIDOK KATALOGU USŁUG (#viewServices) -----------------
function renderUslugiTab() {
  const root = document.getElementById('viewServices');
  if (!root) return;
  const isPeselBlocked = (typeof MobStore !== 'undefined') ? MobStore.isPeselBlocked() : false;
  const air = getAirForPersona();

  root.innerHTML = `
    <div class="services-header">
      <h2 class="services-title">Katalog e-Usług</h2>
      <p class="services-sub">Oficjalne usługi administracji rządowej, samorządowej i sądownictwa</p>
    </div>

    <!-- 1. KATEGORIA: BEZPIECZEŃSTWO I ZDROWIE -->
    <div class="services-cat-block">
      <h3 class="services-cat-title">🛡️ Bezpieczeństwo i Tożsamość</h3>
      <div class="services-grid">
        <button type="button" class="service-card highlight" onclick="openZastrzezPeselModal()">
          <div class="sc-icon" style="background:rgba(220,20,60,.1);color:var(--red)">🔒</div>
          <div class="sc-content">
            <b>Zastrzeż PESEL</b>
            <small>Status: <span style="color:${isPeselBlocked ? '#10b981' : '#dc143c'};font-weight:700">${isPeselBlocked ? 'Zastrzeżony (Bezpieczny)' : 'Niezastrzeżony'}</span></small>
          </div>
          <span class="sc-arrow">→</span>
        </button>

        <button type="button" class="service-card" onclick="openZastrzezKartyModal()">
          <div class="sc-icon" style="background:rgba(239,68,68,.1);color:#ef4444">🛑</div>
          <div class="sc-content">
            <b>Zastrzeż karty (ZBP)</b>
            <small>Awaryjna blokada kart płatniczych wszystkich banków</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>

        <button type="button" class="service-card" onclick="openKrkModal()">
          <div class="sc-icon" style="background:rgba(79,70,229,.1);color:#4f46e5">📜</div>
          <div class="sc-content">
            <b>Zaświadczenie o niekaralności (KRK)</b>
            <small>Krajowy Rejestr Karny • Certyfikat z pieczęcią MS</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>

        <button type="button" class="service-card" onclick="openOdyseuszModal()">
          <div class="sc-icon" style="background:rgba(14,165,233,.1);color:#0ea5e9">✈️</div>
          <div class="sc-content">
            <b>Polak za granicą (Odyseusz)</b>
            <small>Rejestracja podróży MSZ i telefony alarmowe konsulatów</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- 2. KATEGORIA: ZDROWIE I ŚRODOWISKO -->
    <div class="services-cat-block">
      <h3 class="services-cat-title">🌿 Zdrowie i Środowisko</h3>
      <div class="services-grid">
        <button type="button" class="service-card highlight" onclick="openIkpModal('recepty')">
          <div class="sc-icon" style="background:rgba(16,185,129,.12);color:#059669">🏥</div>
          <div class="sc-content">
            <b>Zdrowie i e-Recepty (IKP)</b>
            <small>Recepty z kodem kreskowym, skierowania, eWUŚ i leki</small>
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

        <button type="button" class="service-card" onclick="openGiosModal()">
          <div class="sc-icon" style="background:rgba(234,88,12,.1);color:#ea580c">🚨</div>
          <div class="sc-content">
            <b>Zgłoś naruszenie środowiskowe</b>
            <small>Dzikie wysypiska, ścieki i spalanie śmieci do GIOŚ</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- 3. KATEGORIA: RODZINA I EMERYTURA -->
    <div class="services-cat-block">
      <h3 class="services-cat-title">👨‍👩‍👧‍👦 Rodzina i Świadczenia ZUS</h3>
      <div class="services-grid">
        <button type="button" class="service-card highlight" onclick="openRodzinaModal()">
          <div class="sc-icon" style="background:rgba(236,72,153,.1);color:#ec4899">👶</div>
          <div class="sc-content">
            <b>Moja Rodzina i Dzieci</b>
            <small>mLegitymacje dzieci, e-Recepty, 800+ i Dobry Start</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>

        <button type="button" class="service-card" onclick="openEmeryturaModal()">
          <div class="sc-icon" style="background:rgba(139,92,246,.1);color:#8b5cf6">📊</div>
          <div class="sc-content">
            <b>Kalkulator Emerytury ZUS</b>
            <small>Symulator wieku emerytalnego i waloryzacja kapitału</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>

        <button type="button" class="service-card" onclick="openEPlatnosciModal()">
          <div class="sc-icon" style="background:rgba(16,185,129,.1);color:#10b981">💳</div>
          <div class="sc-content">
            <b>ePłatności (BLIK)</b>
            <small>Podatki lokalne i opłaty samorządowe z kodem BLIK</small>
          </div>
          <span class="sc-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- 4. KATEGORIA: KIEROWCA I POJAZDY -->
    <div class="services-cat-block">
      <h3 class="services-cat-title">🚗 Kierowca i Pojazdy</h3>
      <div class="services-grid">
        <button type="button" class="service-card" onclick="openBezpiecznyAutobusModal('KR 12345')">
          <div class="sc-icon" style="background:rgba(245,158,11,.1);color:#f59e0b">🚌</div>
          <div class="sc-content">
            <b>Bezpieczny autobus & CEPiK</b>
            <small>Badania techniczne, licznik, baza kradzieżowa Policji</small>
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

        <button type="button" class="service-card" onclick="openZbycieModal('SKODA')">
          <div class="sc-icon" style="background:rgba(37,99,235,.1);color:#2563eb">📝</div>
          <div class="sc-content">
            <b>Zgłoszenie zbycia pojazdu</b>
            <small>Zgłoś sprzedaż auta w 30 dni do Starostwa i UFG</small>
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
    </div>
  `;
}
