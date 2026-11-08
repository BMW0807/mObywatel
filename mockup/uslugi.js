/* ---------- mObywatel 2.0 - Moduł e-Usług Publicznych (uslugi.js) ---------- */

const USLUGI = {
  // 1. Zastrzeż PESEL
  peselData: {
    history: [
      { who: 'mBank S.A.', reason: 'Wniosek o kredyt gotówkowy', date: '04.11.2026, 11:24', status: 'blocked', note: 'Zastrzeżenie aktywne – wniosek odrzucony' },
      { who: 'Kancelaria Notarialna, Kraków', reason: 'Akt notarialny – sprzedaż lokalu', date: '18.10.2026, 09:15', status: 'ok', note: 'Weryfikacja tożsamości udana' },
      { who: 'P4 Sp. z o.o. (Play)', reason: 'Zawarcie nowej umowy abonamentowej', date: '02.09.2026, 16:40', status: 'ok', note: 'Zezwolono na weryfikację' },
      { who: 'ING Bank Śląski', reason: 'Cykliczna weryfikacja klientów', date: '15.08.2026, 03:00', status: 'ok', note: 'Brak nieautoryzowanych prób' }
    ]
  },

  // 2. Bezpieczny autobus (Baza CEPiK)
  buses: {
    'KR 12345': {
      plate: 'KR 12345',
      brand: 'Setra S 515 HD',
      year: 2020,
      vin: 'VNE4100000184291',
      seats: 53,
      inspectionValid: true,
      inspectionDate: '15.04.2027',
      ocValid: true,
      ocCompany: 'PZU S.A.',
      ocDate: '20.08.2027',
      mileage: '241 850 km',
      status: 'Zarejestrowany / Dopuszczony do ruchu',
      lastCheck: 'Stacja Kontroli Pojazdów Kraków-Nowa Huta (SKP/KR/042)'
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
      status: 'Zarejestrowany / Wymaga odnowienia badań',
      lastCheck: 'Okręgowa Stacja Kontroli Pojazdów Warszawa-Włochy'
    },
    'GD 4490': {
      plate: 'GD 4490',
      brand: 'Scania Touring HD',
      year: 2019,
      vin: 'YS4K4X20001923841',
      seats: 49,
      inspectionValid: true,
      inspectionDate: '22.09.2027',
      ocValid: true,
      ocCompany: 'Ergo Hestia S.A.',
      ocDate: '18.06.2027',
      mileage: '312 400 km',
      status: 'Zarejestrowany / Dopuszczony do ruchu',
      lastCheck: 'SKP Gdańsk-Osowa'
    },
    'LU 9012A': {
      plate: 'LU 9012A',
      brand: 'Solaris Urbino 12',
      year: 2021,
      vin: 'SUA123419082194',
      seats: 85,
      inspectionValid: true,
      inspectionDate: '01.07.2027',
      ocValid: true,
      ocCompany: 'TUW TUW',
      ocDate: '12.12.2026',
      mileage: '142 600 km',
      status: 'Zarejestrowany / Dopuszczony do ruchu',
      lastCheck: 'MPK Lublin Sp. z o.o.'
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
    krakow: { city: 'Kraków', station: 'Kraków, al. Krasińskiego', index: 'Umiarkowana', color: '#f59e0b', bg: '#fef3c7', pm25: 38, pm25Norm: 152, pm10: 52, pm10Norm: 104, no2: 24, advice: 'Osoby wrażliwe, starsze i dzieci powinny ograniczyć intensywny wysiłek na zewnątrz.' },
    warszawa: { city: 'Warszawa', station: 'Warszawa, ul. Marszałkowska', index: 'Dobra', color: '#10b981', bg: '#d1fae5', pm25: 18, pm25Norm: 72, pm10: 28, pm10Norm: 56, no2: 19, advice: 'Jakość powietrza jest dobra. Możesz bez przeszkód spędzać czas na świeżym powietrzu.' },
    lublin: { city: 'Lublin', station: 'Lublin, ul. Obywatelska', index: 'Dobra', color: '#10b981', bg: '#d1fae5', pm25: 21, pm25Norm: 84, pm10: 31, pm10Norm: 62, no2: 16, advice: 'Powietrze nie stanowi zagrożenia dla zdrowia.' },
    gdansk: { city: 'Gdańsk', station: 'Gdańsk, ul. Wyzwolenia', index: 'Bardzo dobra', color: '#059669', bg: '#a7f3d0', pm25: 9, pm25Norm: 36, pm10: 14, pm10Norm: 28, no2: 11, advice: 'Świetna jakość powietrza. Idealne warunki do aktywności i spacerów nad morzem.' }
  }
};

// Pobieranie stacji dla danej osoby
function getAirForPersona() {
  const city = (typeof OS !== 'undefined' && OS.opis) ? OS.opis.toLowerCase() : '';
  if (city.includes('warszaw')) return USLUGI.air.warszawa;
  if (city.includes('gdań') || city.includes('gdansk')) return USLUGI.air.gdansk;
  if (city.includes('lublin')) return USLUGI.air.lublin;
  return USLUGI.air.krakow;
}

// ----------------- MODAL: ZASTRZEŻ PESEL -----------------
function openZastrzezPeselModal() {
  const m = document.getElementById('peselModal');
  if (!m) return;
  const isBlocked = (typeof MobStore !== 'undefined') ? MobStore.isPeselBlocked() : false;
  const peselRaw = (typeof OS !== 'undefined' && OS.docs && OS.docs[0] && OS.docs[0].f) ? (OS.docs[0].f.find(x => x[0] === 'PESEL') || ['','91071427765'])[1] : '91071427765';
  const peselMasked = peselRaw.slice(0, 6) + '••••' + peselRaw.slice(-1);

  const hero = m.querySelector('.pesel-hero-box');
  if (hero) {
    hero.innerHTML = `
      <div class="pesel-badge-state ${isBlocked ? 'blocked' : 'active'}">
        <span class="pesel-state-ic">${isBlocked ? '🔒' : '🔓'}</span>
        <div>
          <b class="pesel-state-title">${isBlocked ? 'PESEL ZASTRZEŻONY' : 'PESEL NIEZASTRZEŻONY'}</b>
          <small class="pesel-state-desc">${isBlocked ? 'Ochrona przed wyłudzeniem kredytu jest aktywna' : 'Możesz paść ofiarą zaciągnięcia pożyczki na Twoje dane'}</small>
        </div>
      </div>
      <div class="pesel-action-toggle">
        <button type="button" class="btn ${isBlocked ? 'secondary' : 'primary'} pesel-btn-toggle" onclick="USLUGI.togglePeselState()">
          ${isBlocked ? 'Cofnij zastrzeżenie PESEL' : 'Zastrzeż numer PESEL'}
        </button>
      </div>
      <div class="pesel-info-grid">
        <div class="p-item"><span>Twój numer PESEL:</span><b>${peselMasked}</b></div>
        <div class="p-item"><span>Status w Rejestrze:</span><b style="color:${isBlocked ? '#10b981' : '#dc143c'}">${isBlocked ? 'Chroniony (aktywny)' : 'Niezabezpieczony'}</b></div>
        <div class="p-item"><span>Ważność ochrony:</span><b>Do odwołania</b></div>
      </div>
    `;
  }

  const histEl = m.querySelector('.pesel-hist-list');
  if (histEl) {
    histEl.innerHTML = USLUGI.peselData.history.map(h => `
      <div class="pesel-hist-item">
        <div class="phi-head">
          <b>${h.who}</b>
          <span class="phi-badge ${h.status}">${h.status === 'blocked' ? '🚫 Zablokowano' : '✓ Zezwolono'}</span>
        </div>
        <div class="phi-reason">${h.reason}</div>
        <div class="phi-foot">
          <small>${h.date}</small>
          <small class="phi-note">${h.note}</small>
        </div>
      </div>
    `).join('');
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('peselModal', m);
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
  const current = MobStore.isPeselBlocked();
  const next = !current;
  MobStore.setPeselBlocked(next);
  if (typeof showToast === 'function') {
    showToast(next ? '🔒 Numer PESEL został pomyślnie zastrzeżony!' : '🔓 Zastrzeżenie numeru PESEL zostało cofnięte.');
  }
  openZastrzezPeselModal();
  if (typeof updateDashboard === 'function') updateDashboard();
};

// ----------------- MODAL: BEZPIECZNY AUTOBUS -----------------
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
  const cleanPlate = plate.toUpperCase().trim();
  const data = USLUGI.buses[cleanPlate] || {
    plate: cleanPlate,
    brand: 'Autokar Turystyczny (baza CEPiK)',
    year: 2021,
    seats: 51,
    inspectionValid: true,
    inspectionDate: '18.08.2027',
    ocValid: true,
    ocCompany: 'PZU S.A.',
    ocDate: '12.09.2027',
    mileage: '198 400 km',
    status: 'Zarejestrowany / Dopuszczony do ruchu',
    lastCheck: 'Okręgowa Stacja Kontroli Pojazdów'
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
        <div class="bh-grid">
          <div class="bh-row"><span>Badanie techniczne:</span><b>Ważne do ${data.inspectionDate}</b></div>
          <div class="bh-row"><span>Polisa OC:</span><b>${data.ocCompany} (do ${data.ocDate})</b></div>
          <div class="bh-row"><span>Liczba miejsc:</span><b>${data.seats} miejsc siedzących</b></div>
          <div class="bh-row"><span>Rok produkcji:</span><b>${data.year}</b></div>
          <div class="bh-row"><span>Odczyt licznika:</span><b>${data.mileage}</b></div>
          <div class="bh-row"><span>Status CEPiK:</span><b style="color:#059669">${data.status}</b></div>
        </div>
      </div>
      <div class="bus-actions-row">
        <button type="button" class="btn secondary" onclick="downloadBusCert('${data.plate}')">📜 Pobierz raport PDF</button>
        <button type="button" class="btn primary" onclick="closeBezpiecznyAutobusModal();if(typeof askAssistantWithPrompt==='function')askAssistantWithPrompt('Czy autobus ${data.plate} ma ważne badania i polisę OC?')">Zapytaj asystenta AI</button>
      </div>
    `;
  }
}

function downloadBusCert(plate) {
  if (typeof showToast === 'function') showToast(`Pobrano oficjalny raport CEPiK dla ${plate} (PDF)`);
}

// ----------------- MODAL: ePŁATNOŚCI -----------------
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
              `<button type="button" class="btn-xs primary" onclick="startBlikPayment('${p.id}', ${p.amount}, '${p.title}')">Zapłać BLIK</button>`}
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

function startBlikPayment(payId, amount, title) {
  const code = prompt(`Podaj 6-cyfrowy kod BLIK z aplikacji banku, aby opłacić: ${title} (${amount.toFixed(2)} zł):`, '741 852');
  if (!code) return;
  if (typeof showToast === 'function') showToast('Trwa autoryzacja w aplikacji banku…');
  setTimeout(() => {
    if (typeof MobStore !== 'undefined') {
      MobStore.setTaxPaid(true);
      MobStore.addUPO({
        title: `ePłatności: ${title}`,
        source: 'Krajowa Administracja Skarbowa / System ePłatności',
        rows: [['Tytuł przelewu', title], ['Kwota', `${amount.toFixed(2)} zł`], ['Metoda', 'BLIK'], ['Status', 'Księgowanie natychmiastowe']]
      });
    }
    if (typeof showToast === 'function') showToast(`Płatność ${amount.toFixed(2)} zł zakończona sukcesem! UPO wygenerowane.`);
    openEPlatnosciModal();
  }, 1200);
}

function openPaymentReceipt(payId) {
  if (typeof openOfficialCertificate === 'function') {
    openOfficialCertificate('podatek');
  } else if (typeof showToast === 'function') {
    showToast('Wygenerowano Urzędowe Poświadczenie Odbioru (UPO)');
  }
}

// ----------------- MODAL: JAKOŚĆ POWIETRZA -----------------
function openJakoscPowietrzaModal() {
  const m = document.getElementById('airModal');
  if (!m) return;
  const a = getAirForPersona();
  const box = m.querySelector('.air-hero-box');
  if (box) {
    box.innerHTML = `
      <div class="air-circle-wrap" style="background:${a.bg};border-color:${a.color}">
        <span class="air-num" style="color:${a.color}">${a.pm25}</span>
        <small class="air-unit">µg/m³ PM2.5</small>
        <b class="air-idx" style="color:${a.color}">${a.index}</b>
      </div>
      <div class="air-meta-box">
        <div class="amb-station">📍 Stacja pomiarowa: <b>${a.station}</b></div>
        <p class="amb-advice">💡 ${a.advice}</p>
        <div class="amb-grid">
          <div class="amb-item"><span>Norma PM2.5:</span><b>${a.pm25Norm}%</b></div>
          <div class="amb-item"><span>Pył PM10:</span><b>${a.pm10} µg/m³ (${a.pm10Norm}%)</b></div>
          <div class="amb-item"><span>Dwutlenek azotu (NO₂):</span><b>${a.no2} µg/m³</b></div>
          <div class="amb-item"><span>Aktualizacja:</span><b>przed chwilą (GIOŚ)</b></div>
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
          <b>ePłatności</b>
          <small>Podatki od nieruchomości i opłaty lokalne przez BLIK</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openBezpiecznyAutobusModal('KR 12345')">
        <div class="sc-icon" style="background:rgba(245,158,11,.1);color:#f59e0b">🚌</div>
        <div class="sc-content">
          <b>Bezpieczny autobus</b>
          <small>Sprawdź stan techniczny i polisę OC autokaru</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>

      <button type="button" class="service-card" onclick="openJakoscPowietrzaModal()">
        <div class="sc-icon" style="background:rgba(59,130,246,.1);color:#3b82f6">🌿</div>
        <div class="sc-content">
          <b>Jakość powietrza</b>
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

      <button type="button" class="service-card" onclick="if(typeof openOfficialCertificate==='function')openOfficialCertificate('wybory')">
        <div class="sc-icon" style="background:rgba(236,72,153,.1);color:#ec4899">🗳️</div>
        <div class="sc-content">
          <b>Wybory i Rejestr Wyborców</b>
          <small>Sprawdź obwód głosowania i lokal wyborczy</small>
        </div>
        <span class="sc-arrow">→</span>
      </button>
    </div>
  `;
}
