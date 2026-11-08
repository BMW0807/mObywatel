/* ==========================================================================
   mObywatel 2.0 - Moduł Historii Punktów Karnych i Mandatów CEPiK 2.0
   Plik: mockup/mandaty.js
   Zgodność: Centralna Ewidencja Pojazdów i Kierowców (CEPiK 2.0)
   ========================================================================== */

(function () {
  'use strict';

  // --- Baza Danych Naruszeń i Punktów CEPiK 2.0 ---
  const CEPIK_DEFAULT_DATA = {
    marta: {
      driverName: 'Marta Kowalska',
      pesel: '91071427765',
      licenseNumber: '01234/20/1465',
      licenseIssueDate: '30.06.2020',
      categories: 'B',
      isYoungDriver: false,
      maxPoints: 24,
      violations: [
        {
          id: 'nar_marta_1',
          title: 'Przekroczenie prędkości o 21–25 km/h',
          code: 'C04',
          legalBasis: 'art. 92a § 2 Kodeksu wykroczeń',
          date: '12.05.2026, 08:42',
          rawDate: '2026-05-12',
          location: 'Warszawa, ul. Puławska / al. Niepodległości',
          authority: 'Wydział Ruchu Drogowego KSP Warszawa',
          vehicle: 'Toyota Corolla (WX 4521K)',
          points: 5,
          fineAmount: 300,
          paid: true,
          paymentDate: '14.05.2026',
          paymentMethod: 'ePłatności mObywatel (BLIK)',
          // Przedawnienie: 12 miesięcy od dnia uiszczenia grzywny (art. 98 ust. 4)
          expirationDate: '14.05.2027',
          noticeNumber: 'MZ-WA-88124/26',
          reducedByWord: false
        }
      ]
    },
    kacper: {
      driverName: 'Kacper Zieliński',
      pesel: '06232141719',
      licenseNumber: '00512/26/2861',
      licenseIssueDate: '14.01.2026',
      categories: 'B',
      isYoungDriver: true, // 1. rok posiadania prawa jazdy
      probationUntil: '14.01.2028',
      maxPoints: 20, // 20 pkt dla młodego kierowcy w pierwszym roku!
      violations: [
        {
          id: 'nar_kacper_1',
          title: 'Przekroczenie prędkości o 16–20 km/h',
          code: 'C03',
          legalBasis: 'art. 92a § 1 Kodeksu wykroczeń',
          date: '08.10.2026, 17:15',
          rawDate: '2026-10-08',
          location: 'Gdańsk, al. Grunwaldzka (rejon skrzyżowania z ul. Kościuszki)',
          authority: 'Wydział Ruchu Drogowego KMP Gdańsk',
          vehicle: 'Volkswagen Golf IV (GD 8K113)',
          points: 3,
          fineAmount: 200,
          paid: false,
          paymentDeadline: '22.10.2026',
          paymentDate: null,
          paymentMethod: null,
          // Bieg 12 miesięcy nie ruszy do momentu uiszczenia grzywny!
          expirationDate: null,
          noticeNumber: 'PM-GD-41092/26',
          reducedByWord: false
        }
      ]
    },
    jan: {
      driverName: 'Jan Wiśniewski',
      pesel: '83051203455',
      licenseNumber: '00871/12/1261',
      licenseIssueDate: '12.05.2012',
      categories: 'B, C',
      isYoungDriver: false,
      maxPoints: 24,
      violations: [] // Wzorowy kierowca - 0 punktów
    },
    ewa: {
      driverName: 'Ewa Nowak',
      pesel: '69020312845',
      licenseNumber: '03311/98/0663',
      licenseIssueDate: '18.06.1998',
      categories: 'B',
      isYoungDriver: false,
      maxPoints: 24,
      violations: [] // Czyste konto
    }
  };

  // Pamięć stanu modułu w bieżącej sesji
  let cepikState = null;

  function loadCepikState() {
    if (cepikState) return cepikState;
    try {
      const stored = localStorage.getItem('mob_cepik_state_v2');
      if (stored) {
        cepikState = JSON.parse(stored);
        return cepikState;
      }
    } catch (e) {}
    cepikState = JSON.parse(JSON.stringify(CEPIK_DEFAULT_DATA));
    return cepikState;
  }

  function saveCepikState() {
    try {
      if (cepikState) {
        localStorage.setItem('mob_cepik_state_v2', JSON.stringify(cepikState));
      }
    } catch (e) {}
  }

  function getDriverData(id) {
    const st = loadCepikState();
    const key = id || (window.OS && window.OS.id) || 'marta';
    if (!st[key]) {
      // Domyślny profil w razie nieznanej osoby
      st[key] = {
        driverName: (window.OS && window.OS.imie && window.OS.nazwisko) ? `${window.OS.imie} ${window.OS.nazwisko}` : 'Kierowca',
        pesel: (window.OS && window.OS.moje && window.OS.moje.pesel) || '91071427765',
        licenseNumber: '01234/20/1465',
        licenseIssueDate: '01.06.2020',
        categories: 'B',
        isYoungDriver: false,
        maxPoints: 24,
        violations: []
      };
    }
    return st[key];
  }

  // Obliczenie sumy aktywnych punktów
  function calculateTotalPoints(driver) {
    if (!driver || !driver.violations) return 0;
    return driver.violations
      .filter(v => !v.reducedByWord)
      .reduce((sum, v) => sum + (v.points || 0), 0);
  }

  // Synchronizacja z kartą w portfelu i szczegółami mPrawa jazdy w runtime
  function syncPjPointsWithOS(driverId, newPkt) {
    try {
      if (window.OS && window.OS.docs) {
        const pjDoc = window.OS.docs.find(d => d.id === 'pj');
        if (pjDoc) {
          const fPkt = pjDoc.f && pjDoc.f.find(x => x[0].includes('Punkt'));
          if (fPkt) fPkt[1] = String(newPkt);
          const rPkt = pjDoc.rows && pjDoc.rows.find(x => x[0].includes('Punkt'));
          if (rPkt) rPkt[1] = String(newPkt);
          pjDoc.sub = newPkt === 0 ? 'Kat. B, bez punktów karnych' : `Kat. B, ${newPkt} pkt karnych`;
        }
      }

      // Aktualizacja napisów na kafelkach
      const ptBadge = document.querySelector('#quickGrid .q-tile[data-key="pkt"] .q-val, .pts-num');
      if (ptBadge) ptBadge.textContent = String(newPkt);

      // Aktualizacja napisów w DOM kart, jeśli widoczne
      document.querySelectorAll('.card, .bigcard').forEach(c => {
        if (c.innerHTML.includes('Prawo jazdy') || c.getAttribute('aria-label')?.includes('Prawo jazdy')) {
          const bTags = c.querySelectorAll('b');
          bTags.forEach(b => {
            const small = b.previousElementSibling;
            if (small && small.textContent.includes('Punkt')) {
              b.textContent = String(newPkt);
            }
          });
        }
      });
    } catch (e) {}
  }

  // --- Style CSS dla Modułu CEPiK 2.0 ---
  function injectMandatyStyles() {
    if (document.getElementById('mandaty-styles')) return;
    const style = document.createElement('style');
    style.id = 'mandaty-styles';
    style.textContent = `
      /* CEPiK 2.0 Modal Styles */
      .mandaty-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--hair);
      }
      .mandaty-title-wrap h2 {
        margin: 0;
        font-size: 19px;
        font-weight: 700;
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mandaty-title-wrap small {
        display: block;
        font-size: 11px;
        color: var(--ink2);
        margin-top: 2px;
      }
      .mandaty-badge-gov {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(220,20,60,.08);
        color: var(--red);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .4px;
      }

      /* Karta statusu kierowcy */
      .driver-card-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--bg);
        border: 1px solid var(--hair);
        border-radius: 14px;
        padding: 10px 14px;
        margin-bottom: 14px;
      }
      .driver-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .driver-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--ink);
      }
      .driver-sub {
        font-size: 11.5px;
        color: var(--ink2);
      }
      .driver-status-tag {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 8px;
        white-space: nowrap;
      }
      .driver-status-tag.ok {
        background: var(--ok-wash);
        color: var(--ok);
        border: 1px solid rgba(46,125,50,.2);
      }
      .driver-status-tag.warn {
        background: var(--warn-wash);
        color: var(--warn);
        border: 1px solid rgba(154,90,0,.2);
      }
      .driver-status-tag.alert {
        background: var(--red-wash);
        color: var(--red);
        border: 1px solid rgba(220,20,60,.2);
      }

      /* Główny wskaźnik graficzny / Gauge */
      .mandaty-hero {
        background: var(--surface);
        border: 1.5px solid var(--hair);
        border-radius: 18px;
        padding: 16px 14px;
        margin-bottom: 16px;
        box-shadow: var(--elev-1);
        text-align: center;
      }
      .gauge-container {
        position: relative;
        width: 130px;
        height: 130px;
        margin: 0 auto 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gauge-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .gauge-bg {
        fill: none;
        stroke: var(--hair);
        stroke-width: 9;
      }
      .gauge-fill {
        fill: none;
        stroke-width: 9;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.8s cubic-bezier(.22,.9,.24,1), stroke .3s;
      }
      .gauge-inner-text {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .gauge-pts-val {
        font-size: 38px;
        font-weight: 800;
        line-height: 38px;
        letter-spacing: -1px;
        color: var(--ink);
      }
      .gauge-pts-max {
        font-size: 11px;
        font-weight: 600;
        color: var(--ink2);
        margin-top: 3px;
      }
      .gauge-desc {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--ink);
        margin: 0 0 4px;
      }
      .gauge-subdesc {
        font-size: 12px;
        color: var(--ink2);
        margin: 0 0 12px;
        line-height: 16px;
      }

      /* Pasek postępu limitu */
      .limit-bar-wrap {
        margin-top: 10px;
        padding: 0 8px;
      }
      .limit-bar-track {
        height: 8px;
        background: var(--bg);
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid var(--hair);
        display: flex;
      }
      .limit-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s var(--ease);
      }
      .limit-scale-ticks {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 10px;
        font-weight: 600;
        color: var(--ink3);
      }

      /* Lista naruszeń */
      .naruszenia-sec-h {
        font-size: 13px;
        font-weight: 700;
        color: var(--ink2);
        text-transform: uppercase;
        letter-spacing: .5px;
        margin: 16px 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .naruszenie-card {
        background: var(--surface);
        border: 1.5px solid var(--hair);
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,.03);
        transition: border-color .2s;
      }
      .naruszenie-card.reduced {
        opacity: 0.7;
        background: rgba(0,0,0,.02);
        border-style: dashed;
      }
      .nar-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      .nar-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--ink);
        line-height: 18px;
      }
      .nar-basis {
        display: block;
        font-size: 11px;
        color: var(--ink2);
        margin-top: 2px;
      }
      .nar-pts-badge {
        flex: none;
        padding: 4px 9px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 800;
        color: #fff;
        background: var(--red);
        display: inline-flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 2px 6px rgba(220,20,60,.25);
      }
      .nar-pts-badge.reduced-badge {
        background: var(--ink3);
        text-decoration: line-through;
        box-shadow: none;
      }

      .nar-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: var(--bg);
        border-radius: 10px;
        padding: 10px;
        font-size: 11.5px;
        margin-bottom: 10px;
      }
      .nar-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .nar-cell.full {
        grid-column: 1 / -1;
      }
      .nar-cell span {
        color: var(--ink2);
        font-size: 10.5px;
      }
      .nar-cell b {
        color: var(--ink);
        font-weight: 600;
      }

      /* Kalkulator Przedawnienia */
      .exp-calc-box {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-left: 4px solid #0284c7;
        border-radius: 10px;
        padding: 10px 12px;
        margin-top: 10px;
      }
      .phone.dark-mode .exp-calc-box {
        background: #0f172a;
        border-color: #334155;
        border-left-color: #38bdf8;
      }
      .exp-calc-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11.5px;
        font-weight: 700;
        color: #0369a1;
        margin-bottom: 4px;
      }
      .phone.dark-mode .exp-calc-head {
        color: #38bdf8;
      }
      .exp-date-highlight {
        font-size: 13px;
        font-weight: 800;
        color: var(--ink);
        margin: 2px 0 3px;
      }
      .exp-legal-rule {
        font-size: 11px;
        color: var(--ink2);
        line-height: 15px;
        margin: 0;
      }
      .exp-calc-box.unpaid {
        border-left-color: #f59e0b;
        background: #fffbeb;
      }
      .phone.dark-mode .exp-calc-box.unpaid {
        background: #291e05;
        border-left-color: #fbbf24;
      }
      .exp-calc-box.unpaid .exp-calc-head {
        color: #b45309;
      }
      .phone.dark-mode .exp-calc-box.unpaid .exp-calc-head {
        color: #fbbf24;
      }

      /* Sekcja Szkolenia WORD */
      .word-sec-box {
        background: linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(243,232,255,0.7) 100%);
        border: 1.5px solid #c7d2fe;
        border-radius: 16px;
        padding: 14px;
        margin-top: 16px;
        box-shadow: 0 4px 14px rgba(99,102,241,.08);
      }
      .phone.dark-mode .word-sec-box {
        background: linear-gradient(135deg, rgba(30,41,59,.9) 0%, rgba(49,46,129,.3) 100%);
        border-color: #4338ca;
      }
      .word-h {
        font-size: 13.5px;
        font-weight: 700;
        color: #3730a3;
        margin: 0 0 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .phone.dark-mode .word-h {
        color: #a5b4fc;
      }
      .word-rules-list {
        font-size: 11.5px;
        color: var(--ink2);
        line-height: 17px;
        margin: 0 0 12px;
        padding-left: 16px;
      }
      .word-rules-list li {
        margin-bottom: 3px;
      }
      .word-rules-list b {
        color: var(--ink);
      }
      .word-btn-wrap {
        display: flex;
        gap: 8px;
      }

      /* Pusty stan - 0 punktów */
      .clean-record-box {
        text-align: center;
        padding: 24px 16px;
        background: var(--surface);
        border: 1.5px solid var(--hair);
        border-radius: 16px;
        margin: 10px 0;
      }
      .clean-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--ok-wash);
        color: var(--ok);
        display: grid;
        place-items: center;
        font-size: 26px;
        margin: 0 auto 12px;
        border: 2px solid rgba(46,125,50,.25);
      }
      .clean-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--ink);
        margin: 0 0 6px;
      }
      .clean-desc {
        font-size: 12.5px;
        color: var(--ink2);
        line-height: 18px;
        max-width: 280px;
        margin: 0 auto;
      }

      /* Płynny styl dla interaktywnego wiersza punktów w mPrawie Jazdy */
      .row.clickable-pj-pts {
        cursor: pointer;
        transition: background .15s;
        border-radius: 8px;
        padding: 4px 6px;
        margin: -4px -6px;
      }
      .row.clickable-pj-pts:hover {
        background: var(--red-wash);
      }
      .pj-pts-badge-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--red);
        font-weight: 700;
      }
      .pj-pts-badge-link::after {
        content: '›';
        font-size: 16px;
        line-height: 1;
        opacity: .8;
      }
    `;
    document.head.appendChild(style);
  }

  // --- Główny Render Modalu CEPiK 2.0 ---
  function renderMandatyModalContent() {
    const driver = getDriverData();
    const totalPts = calculateTotalPoints(driver);
    const maxPts = driver.maxPoints || (driver.isYoungDriver ? 20 : 24);
    const pct = Math.min(100, Math.round((totalPts / maxPts) * 100));

    // Kolory dynamiczne wskaźnika
    let gaugeColor = '#10b981'; // Zielony (0 pkt)
    let statusLabel = 'Czyste konto';
    let statusClass = 'ok';

    if (totalPts > 0 && totalPts <= 6) {
      gaugeColor = '#0284c7'; // Niebieski (niski stan)
      statusLabel = `${totalPts} / ${maxPts} pkt • Bezpieczny stan`;
      statusClass = 'ok';
    } else if (totalPts > 6 && totalPts <= 15) {
      gaugeColor = '#f59e0b'; // Bursztynowy
      statusLabel = `Uwaga: ${totalPts} z ${maxPts} pkt`;
      statusClass = 'warn';
    } else if (totalPts > 15) {
      gaugeColor = '#dc143c'; // Czerwony (blisko limitu)
      statusLabel = `Krytyczny: ${totalPts} z ${maxPts} pkt!`;
      statusClass = 'alert';
    }

    if (driver.isYoungDriver) {
      statusLabel += ' (1. rok - limit 20 pkt)';
    }

    // Obliczenia obwodu okręgu dla SVG (r=52 => Obwód ~ 326.7)
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (pct / 100) * circumference;

    // Generowanie listy naruszeń
    let violationsHtml = '';
    const activeViolations = driver.violations || [];

    if (activeViolations.length === 0) {
      violationsHtml = `
        <div class="clean-record-box">
          <div class="clean-icon">🛡️</div>
          <h3 class="clean-title">Brak punktów karnych</h3>
          <p class="clean-desc">
            W Centralnej Ewidencji Pojazdów i Kierowców (CEPiK 2.0) nie ma żadnych aktywnych naruszeń drogowych ani zaległych mandatów.
          </p>
          <div style="margin-top:14px;font-size:11px;color:var(--ink3)">
            Ostatnia weryfikacja w rejestrze CEPiK: dzisiaj, godz. ${typeof now === 'function' ? now() : '12:00'}
          </div>
        </div>
      `;
    } else {
      violationsHtml = activeViolations.map((v, idx) => {
        const isReduced = v.reducedByWord;
        return `
          <div class="naruszenie-card ${isReduced ? 'reduced' : ''}" id="narCard_${v.id}">
            <div class="nar-head">
              <div>
                <div class="nar-title">${v.title}</div>
                <small class="nar-basis">${v.legalBasis} • Kod czynu: <b>${v.code || 'Wykroczenie'}</b></small>
              </div>
              <div class="nar-pts-badge ${isReduced ? 'reduced-badge' : ''}" title="${isReduced ? 'Skasowano kursem w WORD' : 'Aktywne punkty'}">
                ${isReduced ? '0 pkt' : `+${v.points} pkt`}
              </div>
            </div>

            <div class="nar-grid">
              <div class="nar-cell">
                <span>Data i godzina:</span>
                <b>📅 ${v.date}</b>
              </div>
              <div class="nar-cell">
                <span>Pojazd:</span>
                <b>🚗 ${v.vehicle}</b>
              </div>
              <div class="nar-cell full">
                <span>Miejsce wykroczenia:</span>
                <b>📍 ${v.location}</b>
              </div>
              <div class="nar-cell">
                <span>Organ nakładający:</span>
                <b>👮 ${v.authority}</b>
              </div>
              <div class="nar-cell">
                <span>Kwota grzywny:</span>
                <b>💰 ${v.fineAmount} zł</b>
              </div>
              <div class="nar-cell full" style="border-top:1px dashed var(--hair);padding-top:6px;margin-top:4px">
                <span>Status opłacenia mandatu:</span>
                ${v.paid
                  ? `<b style="color:var(--ok)">✓ Opłacony (${v.paymentDate}) – ${v.paymentMethod || 'Płatność bezgotówkowa'}</b>`
                  : `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px">
                       <b style="color:var(--red)">⏳ Oczekuje na wpłatę (termin: ${v.paymentDeadline || '7 dni'})</b>
                       <button type="button" class="btn primary btn-xs" onclick="MANDATY.payFine('${v.id}')">Opłać BLIK-iem (${v.fineAmount} zł)</button>
                     </div>`
                }
              </div>
            </div>

            <!-- Kalkulator przedawnienia punktów -->
            <div class="exp-calc-box ${v.paid ? 'paid' : 'unpaid'}">
              <div class="exp-calc-head">
                <span>⏱️</span>
                <b>KALKULATOR PRZEDAWNIENIA CEPiK 2.0</b>
              </div>
              ${v.paid ? `
                <div class="exp-date-highlight">
                  Wykasowanie z ewidencji: <span style="color:#0284c7">${v.expirationDate}</span>
                </div>
                <p class="exp-legal-rule">
                  Zasada prawna: punkty kasują się automatycznie po <b>12 miesiącach od dnia uiszczenia grzywny</b> (art. 98 ust. 4 ustawy o kierujących pojazdami).
                </p>
              ` : `
                <div class="exp-date-highlight" style="color:#b45309">
                  Bieg przedawnienia: WSTRZYMANY do momentu zapłaty!
                </div>
                <p class="exp-legal-rule">
                  ⚠️ <b>Ważne:</b> Okres 12 miesięcy liczony jest <b>wyłącznie od daty opłacenia mandatu</b>. Do chwili uiszczenia kwoty ${v.fineAmount} zł punkty pozostaną w ewidencji bezterminowo!
                </p>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <div class="mandaty-header">
        <div class="mandaty-title-wrap">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--red)"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24"/></svg>
            Ewidencja Punktów Karnych
          </h2>
          <small>Centralna Ewidencja Pojazdów i Kierowców (CEPiK 2.0) • MSWiA / MC</small>
        </div>
        <button class="tx-close" onclick="closeMandatyModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>

      <!-- Karta kierowcy -->
      <div class="driver-card-strip">
        <div class="driver-meta">
          <span class="driver-name">${driver.driverName}</span>
          <span class="driver-sub">Prawo jazdy kat. <b>${driver.categories}</b> • Blankiet: <b>${driver.licenseNumber}</b></span>
        </div>
        <span class="driver-status-tag ${statusClass}">${statusLabel}</span>
      </div>

      <!-- Główny wskaźnik / Gauge limitu punktów -->
      <div class="mandaty-hero">
        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 120 120">
            <circle class="gauge-bg" cx="60" cy="60" r="${radius}"></circle>
            <circle class="gauge-fill" cx="60" cy="60" r="${radius}"
              stroke="${gaugeColor}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${strokeOffset}">
            </circle>
          </svg>
          <div class="gauge-inner-text">
            <span class="gauge-pts-val" style="color:${totalPts === 0 ? '#10b981' : gaugeColor}">${totalPts}</span>
            <small class="gauge-pts-max">/ ${maxPts} pkt</small>
          </div>
        </div>

        <p class="gauge-desc">
          ${totalPts === 0 
            ? 'Gratulacje! Brak aktywnych punktów karnych na Twoim koncie.'
            : `Aktywne punkty karne: <b>${totalPts}</b> z dopuszczalnego limitu <b>${maxPts}</b>.`}
        </p>
        <p class="gauge-subdesc">
          ${driver.isYoungDriver 
            ? 'Kierowca w pierwszym roku od wydania uprawnień (limit 20 pkt). Po przekroczeniu następuje cofnięcie prawa jazdy decyzją starosty.'
            : totalPts === 0
              ? 'Wzorowa jazda zgodnie z przepisami ruchu drogowego.'
              : `Pozostało <b>${Math.max(0, maxPts - totalPts)} pkt</b> bezpiecznego zapasu do przekroczenia limitu.`}
        </p>

        <!-- Liniowy pasek postępu limitu -->
        <div class="limit-bar-wrap">
          <div class="limit-bar-track">
            <div class="limit-bar-fill" style="width:${pct}%;background:${gaugeColor}"></div>
          </div>
          <div class="limit-scale-ticks">
            <span>0 pkt</span>
            <span>10 pkt</span>
            <span>${driver.isYoungDriver ? '20 pkt (Limit)' : '24 pkt (Limit)'}</span>
          </div>
        </div>
      </div>

      <!-- Lista zarejestrowanych naruszeń drogowych -->
      <div class="naruszenia-sec-h">
        <span>Zarejestrowane naruszenia drogowe (${activeViolations.length})</span>
        <span style="font-size:11px;font-weight:600;color:var(--ink3)">CEPiK 2.0</span>
      </div>

      <div class="mandaty-list-box">
        ${violationsHtml}
      </div>

      <!-- Sekcja szkolenia redukującego punkty (WORD) -->
      <div class="word-sec-box">
        <h3 class="word-h">
          <span>🎓</span>
          Szkolenie redukujące punkty w WORD
        </h3>
        <ul class="word-rules-list">
          <li><b>Częstotliwość:</b> Możliwe nie częściej niż <b>raz na 6 miesięcy</b>.</li>
          <li><b>Skutek:</b> Zmniejsza stan o <b>6 najstarszych punktów karnych</b> z ewidencji.</li>
          <li><b>Koszt:</b> ok. <b>900–1 100 zł</b> (płatne w kasie wybranego ośrodka WORD).</li>
          <li><b>Czas trwania:</b> 8 godzin wykładów + próba awaryjnego hamowania na płycie poślizgowej.</li>
          <li><b>Ograniczenia prawne:</b> Szkolenie <u>nie przysługuje</u> kierowcom w 1. roku od wydania prawa jazdy (okres próbny) oraz osobom, które przekroczyły limit 24 pkt.</li>
        </ul>

        <div class="word-btn-wrap">
          <button type="button" class="btn secondary" style="flex:1" id="wordSimulateBtn" onclick="MANDATY.simulateWordCourse()">
            🎓 Zarejestruj ukończenie kursu w WORD (-6 pkt)
          </button>
        </div>
      </div>

      <!-- Przyciski dolne -->
      <div style="display:flex;gap:8px;margin-top:16px">
        <button type="button" class="btn secondary" style="flex:1" onclick="closeMandatyModal();if(typeof openOfficialCertificate==='function')openOfficialCertificate('punkty');">
          📜 Zaświadczenie PDF
        </button>
        <button type="button" class="btn primary" style="flex:1.3" onclick="closeMandatyModal();if(typeof startTopic==='function')startTopic('Ile mam punktów karnych i kiedy wygasną?');">
          Zapytaj asystenta AI
        </button>
      </div>

      <!-- Przełącznik profilu do celów demonstracyjnych mObywatela -->
      <div style="margin-top:16px;padding-top:10px;border-top:1px dashed var(--hair);text-align:center">
        <span style="font-size:11px;color:var(--ink3)">Podgląd demonstracyjny kierowców:</span>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:6px">
          <button type="button" class="chip-sm ${driver.driverName.includes('Marta') ? 'active' : ''}" onclick="MANDATY.switchDriverDemo('marta')">Marta (5 pkt)</button>
          <button type="button" class="chip-sm ${driver.driverName.includes('Kacper') ? 'active' : ''}" onclick="MANDATY.switchDriverDemo('kacper')">Kacper (3 pkt - Młody)</button>
          <button type="button" class="chip-sm ${driver.driverName.includes('Jan') ? 'active' : ''}" onclick="MANDATY.switchDriverDemo('jan')">Jan (0 pkt)</button>
        </div>
      </div>
    `;
  }

  // --- Główny Obiekt MANDATY ---
  const MANDATY = {
    // 1. Otwieranie Modalu
    open: function () {
      injectMandatyStyles();
      let modal = document.getElementById('mandatyModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mandatyModal';
        modal.className = 'sheet-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'mandatyTitle');
        modal.innerHTML = `
          <div class="scrim" onclick="closeMandatyModal()"></div>
          <div class="modal-box"></div>
        `;
        const app = document.getElementById('app') || document.body;
        app.appendChild(modal);
      }

      const box = modal.querySelector('.modal-box');
      if (box) {
        box.innerHTML = renderMandatyModalContent();
      }

      modal.classList.add('open');
      if (typeof openDialogFocus === 'function') {
        openDialogFocus('mandatyModal', box, '.tx-close');
      }

      const driver = getDriverData();
      const pts = calculateTotalPoints(driver);
      if (typeof announceSR === 'function') {
        announceSR(`Punkty karne CEPiK 2.0: ${pts} z ${driver.maxPoints} punktów dla ${driver.driverName}`);
      }
      if (typeof haptic === 'function') haptic('card');
    },

    // 2. Zamykanie Modalu
    close: function () {
      const modal = document.getElementById('mandatyModal');
      if (modal && modal.classList.contains('open')) {
        modal.classList.remove('open');
        if (typeof restoreDialogFocus === 'function') {
          restoreDialogFocus('mandatyModal');
        }
      }
      // Zamknięcie również ewentualnego starego modalu
      const oldModal = document.getElementById('pointsModal');
      if (oldModal && oldModal.classList.contains('open')) {
        oldModal.classList.remove('open');
      }
    },

    // 3. Symulacja ukończenia kursu redukującego w WORD (-6 pkt)
    simulateWordCourse: function () {
      const driver = getDriverData();
      const totalPts = calculateTotalPoints(driver);

      // Sprawdzenie ograniczenia prawnego dla młodego kierowcy w 1. roku
      if (driver.isYoungDriver) {
        const proceed = confirm(
          'UWAGA PRAWNA (art. 98 ust. 5 ustawy o kierujących pojazdami):\n\n' +
          'Kierowcy w okresie 1 roku od dnia wydania po raz pierwszy prawa jazdy (okres próbny, limit 20 pkt) ' +
          'NIE MOGĄ uczestniczyć w szkoleniu redukującym punkty w WORD.\n\n' +
          'Czy chcesz zasymulować wykonanie kursu w celach testowych?'
        );
        if (!proceed) return;
      }

      if (totalPts === 0) {
        if (typeof showToast === 'function') {
          showToast('Konto kierowcy jest czyste (0 pkt). Brak punktów do redukcji.');
        } else {
          alert('Posiadasz 0 punktów karnych – brak punktów do redukcji.');
        }
        return;
      }

      // Odejmujemy do 6 najstarszych punktów
      let pointsToReduce = 6;
      let actuallyReduced = 0;

      driver.violations.forEach(v => {
        if (!v.reducedByWord && pointsToReduce > 0) {
          v.reducedByWord = true;
          pointsToReduce -= v.points;
          actuallyReduced += v.points;
        }
      });

      saveCepikState();
      const newTotal = calculateTotalPoints(driver);

      // Rejestracja w UPO (Urzędowe Poświadczenie Odbioru)
      if (typeof MobStore !== 'undefined' && MobStore.addUPO) {
        MobStore.addUPO({
          title: 'Zaświadczenie WORD – redukcja punktów karnych',
          source: 'Wojewódzki Ośrodek Ruchu Drogowego / CEPiK 2.0',
          rows: [
            ['Kierowca', driver.driverName],
            ['Nr zaświadczenia', `WORD/KR/${Math.floor(10000 + Math.random() * 90000)}/2026`],
            ['Zredukowano punktów', `-${actuallyReduced} pkt`],
            ['Nowy stan punktów', `${newTotal} z ${driver.maxPoints} pkt`],
            ['Podstawa prawna', 'art. 98 ust. 5 ustawy o kierujących pojazdami']
          ]
        });
      }

      // Synchronizacja z kartą prawa jazdy w portfelu
      syncPjPointsWithOS(window.OS && window.OS.id, newTotal);

      // Powiadomienie użytkownika
      const msg = `🎓 Zarejestrowano zaświadczenie z WORD! Odliczono ${actuallyReduced} pkt. Aktualny stan: ${newTotal} pkt.`;
      if (typeof showToast === 'function') {
        showToast(msg);
      } else {
        alert(msg);
      }
      if (typeof announceSR === 'function') announceSR(msg);
      if (typeof haptic === 'function') haptic('success');

      // Odświeżenie widoku
      const modal = document.getElementById('mandatyModal');
      if (modal && modal.querySelector('.modal-box')) {
        modal.querySelector('.modal-box').innerHTML = renderMandatyModalContent();
      }
    },

    // 4. Symulacja opłacenia mandatu (BLIK)
    payFine: function (violationId) {
      const driver = getDriverData();
      const v = driver.violations.find(x => x.id === violationId);
      if (!v) return;

      const confirmPay = confirm(`Potwierdź płatność mandatu: ${v.title}\nKwota: ${v.fineAmount} zł\nMetoda: ePłatności mObywatel (BLIK)`);
      if (!confirmPay) return;

      v.paid = true;
      v.paymentDate = 'Dzisiaj, ' + (typeof now === 'function' ? now() : '12:00');
      v.paymentMethod = 'ePłatności mObywatel (BLIK)';
      
      // Zgodnie z art. 98 ust. 4: 12 miesięcy od dnia uiszczenia grzywny
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const day = String(nextYear.getDate()).padStart(2, '0');
      const month = String(nextYear.getMonth() + 1).padStart(2, '0');
      v.expirationDate = `${day}.${month}.${nextYear.getFullYear()}`;

      saveCepikState();

      if (typeof MobStore !== 'undefined' && MobStore.addUPO) {
        MobStore.addUPO({
          title: `Opłacenie mandatu: ${v.title}`,
          source: 'System ePłatności mObywatel / CEPiK 2.0',
          rows: [
            ['Kwota grzywny', `${v.fineAmount},00 zł`],
            ['Nr mandatu', v.noticeNumber],
            ['Data wpłaty', v.paymentDate],
            ['Uruchomiono przedawnienie', `Wygasną dnia: ${v.expirationDate}`]
          ]
        });
      }

      const msg = `✓ Opłacono mandat ${v.fineAmount} zł BLIK-iem! Uruchomiono 12-miesięczny bieg przedawnienia punktów (do ${v.expirationDate}).`;
      if (typeof showToast === 'function') showToast(msg);
      if (typeof haptic === 'function') haptic('success');

      // Odświeżenie modalu
      const modal = document.getElementById('mandatyModal');
      if (modal && modal.querySelector('.modal-box')) {
        modal.querySelector('.modal-box').innerHTML = renderMandatyModalContent();
      }
    },

    // 5. Przełączanie osób demonstracyjnych w modalu
    switchDriverDemo: function (id) {
      if (typeof zmienOsobe === 'function') {
        zmienOsobe(id);
      } else {
        const modal = document.getElementById('mandatyModal');
        if (modal && modal.querySelector('.modal-box')) {
          modal.querySelector('.modal-box').innerHTML = renderMandatyModalContent();
        }
      }
    }
  };

  // --- Globalne Funkcje API ---
  window.openMandatyModal = MANDATY.open;
  window.closeMandatyModal = MANDATY.close;
  window.MANDATY = MANDATY;

  // Przekierowanie istniejącego openPointsDetail do nowego modułu CEPiK 2.0
  window.openPointsDetail = MANDATY.open;
  window.closePointsDetail = MANDATY.close;

  // --- Podpięcie pod Kartę i Szczegóły mPrawa Jazdy ---
  function setupDrivingLicenseInteractions() {
    injectMandatyStyles();

    // 1. Delegacja kliknięć na wiersze z punktami w całym dokumencie
    document.addEventListener('click', function (e) {
      // Kliknięcie w dowolny wiersz zawierający "Punkt" w szczegółach dokumentu
      const row = e.target.closest('.row');
      if (row && /punkt/i.test(row.textContent)) {
        // Sprawdź czy to widok mPrawa jazdy lub kafelków
        const detailNav = document.querySelector('#detail .nav b');
        if (detailNav && /prawo jazdy/i.test(detailNav.textContent)) {
          e.stopPropagation();
          e.preventDefault();
          openMandatyModal();
          return;
        }
      }

      // Kliknięcie w komórkę z punktami bezpośrednio na karcie mPrawa jazdy
      const spanCell = e.target.closest('.dl span, .col span, span');
      if (spanCell && /punkt/i.test(spanCell.textContent)) {
        const card = e.target.closest('.card, .bigcard');
        if (card && (card.innerHTML.includes('prawo-jazdy') || card.getAttribute('aria-label')?.includes('Prawo jazdy') || card.querySelector('.ttl')?.textContent?.includes('Prawo jazdy'))) {
          e.stopPropagation();
          e.preventDefault();
          openMandatyModal();
          return;
        }
      }
    }, true);

    // 2. Nadanie kursora i wizualnego wskaźnika klikalności wierszom punktów w #detail
    const observer = new MutationObserver(function () {
      const detail = document.getElementById('detail');
      if (detail && detail.classList.contains('on')) {
        const nav = detail.querySelector('.nav b');
        if (nav && /prawo jazdy/i.test(nav.textContent)) {
          const rows = detail.querySelectorAll('.rows .row');
          rows.forEach(r => {
            if (/punkt/i.test(r.textContent) && !r.classList.contains('clickable-pj-pts')) {
              r.classList.add('clickable-pj-pts');
              r.setAttribute('title', 'Kliknij, aby otworzyć pełną historię punktów karnych i mandatów CEPiK 2.0');
              const b = r.querySelector('b');
              if (b && !b.classList.contains('pj-pts-badge-link')) {
                b.classList.add('pj-pts-badge-link');
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // Automatyczna inicjalizacja po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDrivingLicenseInteractions);
  } else {
    setupDrivingLicenseInteractions();
  }
})();
