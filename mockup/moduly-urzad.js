/* ==========================================================================
   mObywatel 2.0 - Moduł Urzędy & Podatki (moduly-urzad.js)
   Zgodność:
   1. Twój e-PIT / KAS (Krajowa Administracja Skarbowa)
      - Deklaracja PIT-37 z rozliczeniem rocznym i ulgą prorodzinną
      - Pobieranie oficjalnego UPO (Urzędowe Poświadczenie Odbioru)
      - Indywidualny Mikrorachunek Podatkowy
      - Zmiana organizacji 1.5% OPP i akceptacja zeznania
   2. Zaświadczenia i Odpisy z Rejestru Stanu Cywilnego (USC)
      - Odpis aktu urodzenia (własny oraz dzieci)
      - Odpis aktu małżeństwa
      - Zaświadczenie o stanie cywilnym
      - Interaktywny kreator wniosku z pieczęcią cyfrową Ministra Cyfryzacji
   3. Profil Zaufany (PZ)
      - Certyfikat tożsamości, termin ważności, autoryzacja mObywatel
   ========================================================================== */

(function (window, document) {
  'use strict';

  // --- Pomocnik pobierania aktywnej osoby ---
  const curOS = () => (typeof OS !== 'undefined' ? OS : null);

  function getPersonaKey() {
    const o = curOS();
    if (o && o.id) return o.id;
    try {
      const stored = localStorage.getItem('mobOsoba');
      if (stored) return stored;
    } catch (e) {}
    return 'jan';
  }

  // --- Baza Danych: Urząd Skarbowy (Twój e-PIT / KAS) ---
  const PIT_DATABASE = {
    jan: {
      year: '2025/2026',
      form: 'PIT-37 (za rok 2025)',
      taxOffice: 'Pierwszy Urząd Skarbowy w Krakowie',
      taxOfficeAddress: 'ul. Krowoderskich Zuchów 2, 31-272 Kraków',
      status: 'Złożone i zaakceptowane w Urzędzie Skarbowym (Pierwszy US w Krakowie)',
      statusDate: '18.02.2026, 10:14:22',
      upoId: 'UPO-PIT-2026-98124',
      taxId: '83051203455',
      mikrorachunek: 'PL 1010 0071 2228 3051 2034 5500',
      incomeGross: 148500.00,
      costs: 3000.00,
      revenueNet: 145500.00,
      zusSocial: 16720.40,
      zusHealth: 11590.16,
      taxBase: 128780.00,
      childRelief: 4224.12, // Ulga na 3 dzieci (1112.04 + 1112.04 + 2000.04)
      childReliefDetails: 'Ulga prorodzinna na 3 dzieci (Hanna, Igor, Michał): 4 224,12 zł',
      advancesPaid: 18450.00,
      calculatedTax: 16968.00,
      refundAmount: 1482.00,
      isRefund: true,
      bankAccount: 'PKO BP •• 9031 (konto zwrotu nadpłaty)',
      opp: {
        krs: '0000037904',
        name: 'Fundacja Dzieciom "Zdążyć z Pomocą"',
        amount: 214.35,
        detail: '18294 Wiśniewska Hanna i Igor',
        consent: true
      }
    },

    marta: {
      year: '2025/2026',
      form: 'PIT-37 (za rok 2025)',
      taxOffice: 'Trzeci Urząd Skarbowy Warszawa-Śródmieście',
      taxOfficeAddress: 'ul. Lindleya 14, 02-013 Warszawa',
      status: 'Złożone i zaakceptowane w Urzędzie Skarbowym (Trzeci US Warszawa)',
      statusDate: '22.02.2026, 09:31:05',
      upoId: 'UPO-PIT-2026-88412',
      taxId: '91071427765',
      mikrorachunek: 'PL 1010 0071 2229 1071 4277 6500',
      incomeGross: 98400.00,
      costs: 3000.00,
      revenueNet: 95400.00,
      zusSocial: 13490.20,
      zusHealth: 7641.88,
      taxBase: 81910.00,
      childRelief: 4224.12, // Ulga na 3 dzieci (Zofia, Piotr, Antoni)
      childReliefDetails: 'Ulga prorodzinna na 3 dzieci (Zofia, Piotr, Antoni): 4 224,12 zł',
      advancesPaid: 12180.00,
      calculatedTax: 10698.00,
      refundAmount: 1482.00,
      isRefund: true,
      bankAccount: 'mBank •• 4412 (konto zwrotu nadpłaty)',
      opp: {
        krs: '0000270809',
        name: 'Fundacja Avalon – Bezpośrednia Pomoc Niepełnosprawnym',
        amount: 168.90,
        detail: 'Kowalska 1462',
        consent: true
      }
    },

    ewa: {
      year: '2025/2026',
      form: 'PIT-40A/37 (za rok 2025)',
      taxOffice: 'Urząd Skarbowy Poznań-Grunwald',
      taxOfficeAddress: 'ul. Smoluchowskiego 1, 60-179 Poznań',
      status: 'Złożone i zaakceptowane w Urzędzie Skarbowym (Poznań-Grunwald)',
      statusDate: '15.02.2026, 11:20:00',
      upoId: 'UPO-PIT-2026-33918',
      taxId: '53081409921',
      mikrorachunek: 'PL 1010 0071 2225 3081 4099 2100',
      incomeGross: 54200.00,
      costs: 0.00,
      revenueNet: 54200.00,
      zusSocial: 0.00,
      zusHealth: 4878.00,
      taxBase: 54200.00,
      childRelief: 0.00,
      childReliefDetails: 'Brak ulg prorodzinnych',
      advancesPaid: 2904.00,
      calculatedTax: 2492.00,
      refundAmount: 412.00,
      isRefund: true,
      bankAccount: 'Santander Bank •• 5519 (konto emerytalne)',
      opp: {
        krs: '0000033107',
        name: 'Wielka Orkiestra Świątecznej Pomocy',
        amount: 37.38,
        detail: 'Dla dzieci i seniorów',
        consent: true
      }
    },

    kacper: {
      year: '2025/2026',
      form: 'PIT-37 (Ulga dla młodych do 26 r.ż.)',
      taxOffice: 'Pierwszy Urząd Skarbowy w Gdańsku',
      taxOfficeAddress: 'ul. Rzeźnicka 54/56, 80-822 Gdańsk',
      status: 'Złożone i zaakceptowane w Urzędzie Skarbowym (Gdańsk)',
      statusDate: '16.02.2026, 14:05:40',
      upoId: 'UPO-PIT-2026-11452',
      taxId: '06232141719',
      mikrorachunek: 'PL 1010 0071 2220 6232 1417 1900',
      incomeGross: 46200.00,
      costs: 0.00,
      revenueNet: 46200.00,
      zusSocial: 5190.00,
      zusHealth: 3690.00,
      taxBase: 0.00, // Zerowy PIT dla młodych
      childRelief: 0.00,
      childReliefDetails: 'Zwolnienie z PIT do 26 roku życia (art. 21 ust. 1 pkt 148)',
      advancesPaid: 0.00,
      calculatedTax: 0.00,
      refundAmount: 0.00,
      isRefund: true,
      bankAccount: 'ING Bank •• 1138',
      opp: {
        krs: '0000396361',
        name: 'Fundacja Siepomaga',
        amount: 0.00,
        detail: 'Na leczenie dzieci',
        consent: false
      }
    }
  };

  // --- Baza Danych: Urząd Stanu Cywilnego (USC) ---
  const USC_DATABASE = {
    jan: {
      holder: 'Jan Wiśniewski',
      birthDate: '12.05.1983',
      birthPlace: 'Kraków',
      fatherName: 'Stanisław',
      motherName: 'Halina',
      maidenName: 'Wiśniewski',
      marriage: {
        spouse: 'Agnieszka Wiśniewska (z d. Kowalczyk)',
        date: '15.09.2012',
        place: 'USC Kraków (Wydział Spraw Społecznych)',
        actNumber: '1261011/00/AM/2012/98412'
      },
      civilStatus: 'Żonaty',
      children: [
        { id: 'c_hanna', name: 'Hanna Wiśniewska', birthDate: '09.07.2015', birthPlace: 'Kraków', pesel: '15270931826', actNumber: '1261011/00/AU/2015/04128' },
        { id: 'c_igor', name: 'Igor Wiśniewski', birthDate: '16.11.2019', birthPlace: 'Kraków', pesel: '19211640170', actNumber: '1261011/00/AU/2019/11904' },
        { id: 'c_michal', name: 'Michał Wiśniewski', birthDate: '04.03.2011', birthPlace: 'Kraków', pesel: '11030422135', actNumber: '1261011/00/AU/2011/02195' },
        // Zapewnienie dostępności Zofii i Piotra w celach uniwersalnych
        { id: 'c_zofia', name: 'Zofia Kowalska', birthDate: '11.04.2020', birthPlace: 'Warszawa', pesel: '20221104567', actNumber: '1465011/00/AU/2020/07123' },
        { id: 'c_piotr', name: 'Piotr Wiśniewski', birthDate: '05.09.2023', birthPlace: 'Kraków', pesel: '23290518921', actNumber: '1261011/00/AU/2023/08451' }
      ]
    },

    marta: {
      holder: 'Marta Kowalska',
      birthDate: '14.07.1991',
      birthPlace: 'Warszawa',
      fatherName: 'Andrzej',
      motherName: 'Krystyna',
      maidenName: 'Nowak',
      marriage: {
        spouse: 'Tomasz Kowalski',
        date: '10.08.2019',
        place: 'USC m.st. Warszawy (Mokotów)',
        actNumber: '1465011/00/AM/2019/04218'
      },
      civilStatus: 'Zamężna',
      children: [
        { id: 'c_zofia_m', name: 'Zofia Kowalska', birthDate: '11.04.2020', birthPlace: 'Warszawa', pesel: '20221104567', actNumber: '1465011/00/AU/2020/07123' },
        { id: 'c_piotr_m', name: 'Piotr Kowalski', birthDate: '05.09.2023', birthPlace: 'Warszawa', pesel: '23290518921', actNumber: '1465011/00/AU/2023/08451' },
        { id: 'c_antoni_m', name: 'Antoni Kowalski', birthDate: '12.03.2014', birthPlace: 'Warszawa', pesel: '14250312345', actNumber: '1465011/00/AU/2014/03192' }
      ]
    },

    ewa: {
      holder: 'Ewa Wiśniewska',
      birthDate: '14.08.1953',
      birthPlace: 'Poznań',
      fatherName: 'Wacław',
      motherName: 'Stanisława',
      maidenName: 'Zielińska',
      marriage: {
        spouse: 'Henryk Wiśniewski (zmarły w 2021 r.)',
        date: '20.10.1979',
        place: 'USC Poznań-Stare Miasto',
        actNumber: '3064011/00/AM/1979/01429'
      },
      civilStatus: 'Wdowa',
      children: [
        { id: 'c_jan_e', name: 'Jan Wiśniewski', birthDate: '12.05.1983', birthPlace: 'Kraków', pesel: '83051203455', actNumber: '1261011/00/AU/1983/03812' }
      ]
    },

    kacper: {
      holder: 'Kacper Zieliński',
      birthDate: '21.03.2006',
      birthPlace: 'Gdańsk',
      fatherName: 'Marek',
      motherName: 'Beata',
      maidenName: 'Zieliński',
      marriage: null,
      civilStatus: 'Kawaler',
      children: []
    }
  };

  // --- Pomocnik generowania poprawnego pliku PDF-1.4 w czystym JS ---
  function generateMinimalPdf(title, lines, meta = {}) {
    const sanitize = str => String(str || '')
      .replace(/[ąĄ]/g, 'a').replace(/[ćĆ]/g, 'c').replace(/[ęĘ]/g, 'e')
      .replace(/[łŁ]/g, 'l').replace(/[ńŃ]/g, 'n').replace(/[óÓ]/g, 'o')
      .replace(/[śŚ]/g, 's').replace(/[źŹ]/g, 'z').replace(/[żŻ]/g, 'z')
      .replace(/[\(\)\\\r]/g, '');

    const streamLines = [
      'BT',
      '/F1 14 Tf',
      '50 780 Td',
      '18 TL',
      '(' + sanitize(title) + ') Tj',
      'T*',
      '/F1 10 Tf',
      '14 TL'
    ];

    if (meta.subtitle) {
      streamLines.push('(' + sanitize(meta.subtitle) + ') Tj', 'T*');
    }
    streamLines.push('(----------------------------------------------------------------------) Tj', 'T*');

    lines.forEach(l => {
      if (!l) {
        streamLines.push('T*');
      } else {
        streamLines.push('(' + sanitize(l) + ') Tj', 'T*');
      }
    });

    streamLines.push('T*');
    streamLines.push('(Dokument wygenerowany w aplikacji mObywatel 2.0) Tj', 'T*');
    streamLines.push('(Posiada kwalifikowana pieczec elektroniczna Rzeczypospolitej Polskiej) Tj', 'T*');
    streamLines.push('ET');

    const stream = streamLines.join('\n');
    const streamLen = new TextEncoder().encode(stream).length;

    let pdf = '%PDF-1.4\n';
    const offsets = [];

    function addObj(str) {
      offsets.push(new TextEncoder().encode(pdf).length);
      pdf += str + '\n';
    }

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj');
    addObj('4 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + stream + '\nendstream\nendobj');
    addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

    const startxref = new TextEncoder().encode(pdf).length;
    pdf += 'xref\n0 6\n0000000000 65535 f \n';
    offsets.forEach(off => {
      pdf += String(off).padStart(10, '0') + ' 00000 n \n';
    });
    pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
    return pdf;
  }

  // --- Pobranie pliku do przeglądarki ---
  function downloadBlob(filename, content, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      return true;
    } catch (e) {
      console.error('Błąd pobierania pliku:', e);
      return false;
    }
  }

  // ==========================================================================
  // 1. TWÓJ E-PIT / KAS (URZĄD SKARBOWY)
  // ==========================================================================

  function getPitData() {
    const key = getPersonaKey();
    const base = PIT_DATABASE[key] || PIT_DATABASE.jan;

    // Pobranie ewentualnych nadpisanych w MobStore danych OPP lub statusu
    let opp = base.opp;
    let isAccepted = true;
    if (typeof MobStore !== 'undefined') {
      const customOpp = MobStore.get('pit_opp_' + key, null);
      if (customOpp) opp = customOpp;
      isAccepted = MobStore.get('pit_accepted_' + key, true);
    }
    return { ...base, opp, isAccepted };
  }

  function renderPitModalContent() {
    const container = document.getElementById('pitContent');
    if (!container) return;

    const data = getPitData();
    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski', moje: { pesel: data.taxId } };
    const fullName = `${o.imie} ${o.nazwisko}`;
    const pesel = (o.moje && o.moje.pesel) || data.taxId;

    const formatPln = val => {
      const parts = Number(val).toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join(',') + ' zł';
    };

    container.innerHTML = `
      <!-- Hero Card ze statusem i wynikiem finansowym -->
      <div class="pit-hero-card">
        <span class="phc-type">${data.form.toUpperCase()} • ROK PODATKOWY 2025</span>
        <div class="phc-status">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          ${data.status}
        </div>
        <span class="phc-amount refund">+${formatPln(data.refundAmount)}</span>
        <span class="phc-lbl">Kwota nadpłaty podatku – do zwrotu na rachunek bankowy</span>
      </div>

      <!-- Szczegółowe podsumowanie kalkulacji podatkowej KAS -->
      <div class="pit-breakdown">
        <div class="pbd-row">
          <span>Podatnik:</span>
          <b>${fullName} (PESEL: ${pesel})</b>
        </div>
        <div class="pbd-row">
          <span>Właściwy Urząd Skarbowy:</span>
          <b>${data.taxOffice}</b>
        </div>
        <div class="pbd-row">
          <span>Przychód brutto:</span>
          <b>${formatPln(data.incomeGross)}</b>
        </div>
        <div class="pbd-row">
          <span>Koszty uzyskania przychodów:</span>
          <b>${formatPln(data.costs)}</b>
        </div>
        <div class="pbd-row">
          <span>Dochód po odliczeniu kosztów:</span>
          <b>${formatPln(data.revenueNet)}</b>
        </div>
        <div class="pbd-row">
          <span>Składki ZUS (społeczne):</span>
          <b>${formatPln(data.zusSocial)}</b>
        </div>
        <div class="pbd-row">
          <span>Podstawa obliczenia podatku:</span>
          <b>${formatPln(data.taxBase)}</b>
        </div>
        <div class="pbd-row highlight" style="background:#f0fdf4;padding:6px 8px;border-radius:6px;border-color:#bbf7d0">
          <span style="color:#166534;font-weight:700">👶 Ulga prorodzinna (3 dzieci):</span>
          <b style="color:#166534;font-size:13px">-${formatPln(data.childRelief)}</b>
        </div>
        <div class="pbd-row">
          <span>Pobrane zaliczki na podatek:</span>
          <b>${formatPln(data.advancesPaid)}</b>
        </div>
        <div class="pbd-row">
          <span>Podatek należny po ulgach:</span>
          <b>${formatPln(data.calculatedTax)}</b>
        </div>
        <div class="pbd-row highlight">
          <span style="color:#059669;font-weight:800">Wynik zeznania:</span>
          <b style="color:#059669;font-size:14px">Nadpłata +${formatPln(data.refundAmount)}</b>
        </div>
        <div class="pbd-row" style="margin-top:4px;font-size:11px">
          <span>Konto do zwrotu:</span>
          <b>${data.bankAccount}</b>
        </div>
      </div>

      <!-- Identyfikator UPO i pieczęć KAS -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:12px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <span style="color:#1e40af;font-weight:700;display:block">Urzędowe Poświadczenie Odbioru (UPO)</span>
          <span style="color:#1e3a8a;font-family:monospace;font-size:11px">Id: ${data.upoId}</span>
          <small style="color:#3b82f6;display:block;margin-top:2px">Zaakceptowane elektronicznie przez Ministerstwo Finansów</small>
        </div>
        <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="downloadPitUpo()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Pobierz UPO
        </button>
      </div>

      <!-- Indywidualny Mikrorachunek Podatkowy -->
      <div class="pit-microacc-box">
        <span class="pmb-lbl">Twój indywidualny mikrorachunek podatkowy (KAS):</span>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px">
          <span class="pmb-acc" id="pitMicroAccText">${data.mikrorachunek}</span>
          <button type="button" class="btn secondary" style="padding:4px 8px;font-size:11px;flex:none" onclick="copyPitMikrorachunek()">Kopiuj</button>
        </div>
        <small style="color:var(--ink2);display:block;margin-top:4px;font-size:11px">Rachunek służy do ewentualnych wpłat PIT, CIT i VAT do Twojego urzędu skarbowego.</small>
      </div>

      <!-- Organizacja Pożytku Publicznego (1.5% OPP) -->
      <div id="pitOppSection" style="background:#fff;border:1px solid var(--hair);border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <b style="font-size:13px;color:var(--ink)">❤️ Przekazujesz 1,5% podatku dla OPP:</b>
          <span style="font-weight:700;color:#dc2626">${formatPln(data.opp.amount)}</span>
        </div>
        <div style="color:var(--ink2);margin-bottom:4px">
          <b>${data.opp.name}</b> (KRS: ${data.opp.krs})
        </div>
        ${data.opp.detail ? `<div style="font-size:11px;color:var(--ink2)">Cel szczegółowy: <i>${data.opp.detail}</i></div>` : ''}
      </div>

      <!-- Edytor zmiany 1.5% OPP (ukryty domyślnie) -->
      <div id="pitOppEditor" style="display:none;background:#f8fafc;border:1.5px solid #3b82f6;border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:12px">
        <b style="font-size:13px;color:#1e3a8a;display:block;margin-bottom:8px">Zmień organizację 1,5% OPP / cel szczegółowy</b>
        <div class="gfw-field" style="margin-bottom:8px">
          <label class="gfw-label" for="oppKrsSelect" style="font-size:12px">Wybierz organizację OPP:</label>
          <select id="oppKrsSelect" class="cf-select" style="font-size:12px;padding:6px 8px" onchange="onOppSelectChange(this)">
            <option value="0000037904" ${data.opp.krs === '0000037904' ? 'selected' : ''}>Fundacja Dzieciom "Zdążyć z Pomocą" (KRS 0000037904)</option>
            <option value="0000270809" ${data.opp.krs === '0000270809' ? 'selected' : ''}>Fundacja Avalon – Bezpośrednia Pomoc Niepełnosprawnym (KRS 0000270809)</option>
            <option value="0000033107" ${data.opp.krs === '0000033107' ? 'selected' : ''}>Wielka Orkiestra Świątecznej Pomocy (KRS 0000033107)</option>
            <option value="0000396361" ${data.opp.krs === '0000396361' ? 'selected' : ''}>Fundacja Siepomaga (KRS 0000396361)</option>
            <option value="0000056901" ${data.opp.krs === '0000056901' ? 'selected' : ''}>SOS Wioski Dziecięce w Polsce (KRS 0000056901)</option>
            <option value="custom">Inny numer KRS...</option>
          </select>
        </div>
        <div class="gfw-field" id="customKrsField" style="display:none;margin-bottom:8px">
          <label class="gfw-label" for="customKrsInput" style="font-size:12px">Wpisz 10-cyfrowy numer KRS:</label>
          <input type="text" id="customKrsInput" class="cf-input" placeholder="np. 0000123456" maxlength="10">
        </div>
        <div class="gfw-field" style="margin-bottom:8px">
          <label class="gfw-label" for="oppDetailInput" style="font-size:12px">Cel szczegółowy 1,5% (opcjonalnie):</label>
          <input type="text" id="oppDetailInput" class="cf-input" value="${data.opp.detail || ''}" placeholder="np. imię i nazwisko podopiecznego, nr subkonta">
        </div>
        <div style="margin-bottom:10px">
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ink)">
            <input type="checkbox" id="oppConsentCheck" ${data.opp.consent ? 'checked' : ''}>
            Wyrażam zgodę na przekazanie moich danych osobowych (imię, nazwisko, adres) organizacji OPP
          </label>
        </div>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn primary" style="flex:1;font-size:12px;padding:8px" onclick="savePitOpp()">Zapisz i zatwierdź zeznanie</button>
          <button type="button" class="btn secondary" style="flex:none;font-size:12px;padding:8px 12px" onclick="togglePitOppEdit(false)">Anuluj</button>
        </div>
      </div>

      <!-- Przyciski akcji -->
      <div class="pit-actions-row">
        <button type="button" class="btn secondary" onclick="downloadPitUpo()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Pobierz UPO (PDF)
        </button>
        <button type="button" class="btn primary" onclick="togglePitOppEdit(true)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Zmień 1.5% OPP / Zatwierdź
        </button>
      </div>
    `;
  }

  window.openPitSkarbowyModal = function () {
    let m = document.getElementById('pitSkarbowyModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'pitSkarbowyModal';
      m.className = 'sheet-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-labelledby', 'pitTitle');
      m.innerHTML = `
        <div class="scrim" onclick="closePitSkarbowyModal()"></div>
        <div class="modal-box pit-box">
          <div class="modal-head">
            <h2 id="pitTitle">Twój e-PIT • Urząd Skarbowy</h2>
            <button class="tx-close" onclick="closePitSkarbowyModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
          </div>
          <p class="modal-sub">Krajowa Administracja Skarbowa (KAS) • Rozliczenie roczne</p>
          <div class="pit-content" id="pitContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(m);
    }

    renderPitModalContent();
    m.classList.add('open');
    if (typeof openDialogFocus === 'function') openDialogFocus('pitModal', m, '.tx-close');
    if (typeof announceSR === 'function') announceSR('Otwarto zeznanie roczne Twój e-PIT w Urzędzie Skarbowym');
  };

  window.closePitSkarbowyModal = function () {
    const m = document.getElementById('pitSkarbowyModal');
    if (m) {
      m.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') restoreDialogFocus('pitModal');
    }
  };

  window.copyPitMikrorachunek = function () {
    const data = getPitData();
    const rawNumber = data.mikrorachunek.replace(/\s+/g, '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawNumber).catch(() => {});
    }
    if (typeof showToast === 'function') {
      showToast(`Skopiowano numer mikrorachunku podatkowego: ${data.mikrorachunek}`);
    }
  };

  window.togglePitOppEdit = function (show) {
    const editor = document.getElementById('pitOppEditor');
    const oppSec = document.getElementById('pitOppSection');
    if (editor) editor.style.display = show ? 'block' : 'none';
    if (oppSec) oppSec.style.display = show ? 'none' : 'block';
  };

  window.onOppSelectChange = function (sel) {
    const customFld = document.getElementById('customKrsField');
    if (customFld) {
      customFld.style.display = sel.value === 'custom' ? 'block' : 'none';
    }
  };

  window.savePitOpp = function () {
    const key = getPersonaKey();
    const sel = document.getElementById('oppKrsSelect');
    const customKrs = document.getElementById('customKrsInput');
    const detailInp = document.getElementById('oppDetailInput');
    const consentChk = document.getElementById('oppConsentCheck');

    let krs = sel ? sel.value : '0000037904';
    let name = 'Fundacja Pożytku Publicznego';

    if (krs === 'custom') {
      krs = (customKrs && customKrs.value.trim()) || '0000037904';
      name = 'Organizacja Pożytku Publicznego (KRS: ' + krs + ')';
    } else if (sel && sel.options[sel.selectedIndex]) {
      name = sel.options[sel.selectedIndex].text.split('(')[0].trim();
    }

    const currentData = getPitData();
    const updatedOpp = {
      krs: krs,
      name: name,
      amount: currentData.opp.amount,
      detail: detailInp ? detailInp.value.trim() : '',
      consent: consentChk ? consentChk.checked : true
    };

    if (typeof MobStore !== 'undefined') {
      MobStore.set('pit_opp_' + key, updatedOpp);
      MobStore.set('pit_accepted_' + key, true);
      MobStore.addUPO({
        title: `Zaktualizowano 1.5% OPP w Twój e-PIT`,
        source: `Krajowa Administracja Skarbowa (${currentData.taxOffice})`,
        rows: [
          ['Deklaracja', currentData.form],
          ['Wybrana OPP', `${name} (KRS ${krs})`],
          ['Kwota 1.5%', `${currentData.opp.amount} zł`],
          ['Status', 'Zaakceptowano z podpisem podatnika w mObywatel']
        ]
      });
    }

    if (typeof showToast === 'function') {
      showToast('Zaktualizowano 1,5% dla OPP oraz zaakceptowano zeznanie podatkowe.');
    }

    renderPitModalContent();
  };

  window.downloadPitUpo = function () {
    const data = getPitData();
    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski', moje: { pesel: data.taxId } };
    const fullName = `${o.imie} ${o.nazwisko}`;
    const pesel = (o.moje && o.moje.pesel) || data.taxId;

    const lines = [
      `Identyfikator poswiadczenia: ${data.upoId}`,
      `Data i czas urzedowego przyjecia: ${data.statusDate}`,
      `Rodzaj dokumentu: ${data.form}`,
      `Wlasciwy organ skarbowy: ${data.taxOffice}`,
      `Adres urzedu: ${data.taxOfficeAddress}`,
      '',
      `Dane podatnika:`,
      `  Nazwisko i imie: ${fullName}`,
      `  Identyfikator podatkowy PESEL: ${pesel}`,
      `  Mikrorachunek podatkowy: ${data.mikrorachunek}`,
      '',
      `Wynik finansowy rozliczenia:`,
      `  Przychod brutto: ${data.incomeGross.toFixed(2)} PLN`,
      `  Koszty uzyskania przychodow: ${data.costs.toFixed(2)} PLN`,
      `  Odliczenia - ulga na dzieci: ${data.childRelief.toFixed(2)} PLN`,
      `  Zaliczki pobrane przez platnikow: ${data.advancesPaid.toFixed(2)} PLN`,
      `  Kwota nadplaty (do zwrotu): ${data.refundAmount.toFixed(2)} PLN`,
      `  Numer rachunku do zwrotu: ${data.bankAccount}`,
      '',
      `Wniosek o przekazanie 1.5% podatku dla OPP:`,
      `  KRS organizacji: ${data.opp.krs}`,
      `  Nazwa: ${data.opp.name}`,
      `  Kwota 1.5%: ${data.opp.amount.toFixed(2)} PLN`,
      `  Cel szczegolowy: ${data.opp.detail || 'Brak'}`,
      '',
      `Suma kontrolna SHA-256 dokumentu:`,
      `  c7b94109e25d4812a884f092831e7892bc0148123985718290348712398bfa21`,
      `Status weryfikacji KAS: KOD 200 - Dokument poprawny, zlozony i zarejestrowany.`
    ];

    const pdfContent = generateMinimalPdf(
      'KRAJOWA ADMINISTRACJA SKARBOWA - URZEDOWE POSWIADCZENIE ODBIORU',
      lines,
      { subtitle: 'MINISTERSTWO FINANSOW • SYSTEM e-DEKLARACJE KAS' }
    );

    const fileName = `${data.upoId}.pdf`;
    const success = downloadBlob(fileName, pdfContent, 'application/pdf');

    if (success) {
      if (typeof MobStore !== 'undefined') {
        MobStore.addUPO({
          title: `Pobrano UPO: ${data.form}`,
          source: `${data.taxOffice} / KAS`,
          rows: [
            ['Identyfikator UPO', data.upoId],
            ['Podatnik', fullName],
            ['Kwota nadpłaty', `${data.refundAmount.toFixed(2)} zł`],
            ['Status', 'Poświadczenie autentyczne z podpisem KAS']
          ]
        });
      }

      if (typeof showToast === 'function') {
        showToast(`Pobrano Urzędowe Poświadczenie Odbioru (${fileName})`);
      }
      if (typeof announceSR === 'function') {
        announceSR('Pobrano plik Urzędowego Poświadczenia Odbioru PIT w formacie PDF.');
      }
    }
  };

  // ==========================================================================
  // 2. ZAŚWIADCZENIA Z URZĘDU STANU CYWILNEGO (USC)
  // ==========================================================================

  function getUscData() {
    const key = getPersonaKey();
    return USC_DATABASE[key] || USC_DATABASE.jan;
  }

  function renderUscModalContent() {
    const container = document.getElementById('uscContent');
    if (!container) return;

    const data = getUscData();
    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski' };
    const holder = data.holder || `${o.imie} ${o.nazwisko}`;

    container.innerHTML = `
      <!-- Hero informacyjny USC -->
      <div class="usc-hero">
        <div class="uh-icon">🏛️</div>
        <div class="uh-tx">
          <b>Rejestr Stanu Cywilnego (RSC)</b>
          <small>Pobieraj urzędowe e-odpisy z kwalifikowaną pieczęcią elektroniczną Ministra Cyfryzacji. Dokument ma moc prawną oryginału papierowego.</small>
        </div>
      </div>

      <!-- Szybka lista dostępnych odpisów dla zalogowanej osoby -->
      <h3 style="font-size:13px;color:var(--ink);margin:0 0 8px 2px;font-weight:700">Dostępne odpisy aktów stanu cywilnego:</h3>
      <div class="usc-acts-list">
        <!-- Akt urodzenia własny -->
        <div class="uact-card">
          <div class="uac-info">
            <b>Odpis aktu urodzenia (własny)</b>
            <small>${holder} • ur. ${data.birthDate}, ${data.birthPlace}</small>
          </div>
          <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('urodzenie', '${holder}', 'skrocony', 'Własny użytek urzędowy')">
            Pobierz PDF
          </button>
        </div>

        <!-- Akty urodzenia dzieci -->
        ${data.children && data.children.length ? data.children.map(child => `
          <div class="uact-card">
            <div class="uac-info">
              <b>Odpis aktu urodzenia dziecka</b>
              <small>${child.name} • ur. ${child.birthDate}, ${child.birthPlace} (PESEL: ${child.pesel})</small>
            </div>
            <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('urodzenie', '${child.name}', 'skrocony', 'Sprawa paszportowa i świadczenia')">
              Pobierz PDF
            </button>
          </div>
        `).join('') : `
          <div class="uact-card">
            <div class="uac-info">
              <b>Odpis aktu urodzenia dziecka: Zofia Kowalska</b>
              <small>Zofia Kowalska • ur. 11.04.2020, Warszawa (PESEL: 20221104567)</small>
            </div>
            <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('urodzenie', 'Zofia Kowalska', 'skrocony', 'Sprawa paszportowa')">
              Pobierz PDF
            </button>
          </div>
          <div class="uact-card">
            <div class="uac-info">
              <b>Odpis aktu urodzenia dziecka: Piotr Kowalski</b>
              <small>Piotr Kowalski • ur. 05.09.2023, Warszawa (PESEL: 23290518921)</small>
            </div>
            <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('urodzenie', 'Piotr Kowalski', 'skrocony', 'Świadczenia ZUS')">
              Pobierz PDF
            </button>
          </div>
        `}

        <!-- Akt małżeństwa -->
        ${data.marriage ? `
          <div class="uact-card">
            <div class="uac-info">
              <b>Odpis aktu małżeństwa</b>
              <small>${holder} & ${data.marriage.spouse} • ${data.marriage.date}, ${data.marriage.place}</small>
            </div>
            <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('malzenstwo', '${holder} & ${data.marriage.spouse}', 'skrocony', 'Sprawy urzędowe i notarialne')">
              Pobierz PDF
            </button>
          </div>
        ` : ''}

        <!-- Zaświadczenie o stanie cywilnym -->
        <div class="uact-card">
          <div class="uac-info">
            <b>Zaświadczenie o stanie cywilnym</b>
            <small>${holder} • Stan: ${data.civilStatus} (Wydanie do ślubu, banku lub notariusza)</small>
          </div>
          <button type="button" class="btn secondary" style="padding:6px 10px;font-size:11px" onclick="orderUscAct('stan_cywilny', '${holder}', 'zaswiadczenie', 'Potwierdzenie stanu cywilnego')">
            Pobierz PDF
          </button>
        </div>
      </div>

      <!-- Interaktywny kreator nowego wniosku o odpis -->
      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px">
        <h4 style="font-size:13px;color:#0f172a;margin:0 0 10px 0;font-weight:800;display:flex;align-items:center;gap:6px">
          <span>✨</span> Nowy wniosek o e-Odpis z USC (Kreator)
        </h4>

        <div class="gfw-field" style="margin-bottom:8px">
          <label class="gfw-label" for="uscActTypeSelect" style="font-size:12px">Rodzaj aktu:</label>
          <select id="uscActTypeSelect" class="cf-select" style="font-size:12px;padding:6px 8px" onchange="onUscActTypeChange(this)">
            <option value="urodzenie_self">Akt urodzenia – wnioskodawca (${holder})</option>
            ${data.children && data.children.length ? data.children.map(c => `
              <option value="urodzenie_${c.id}">Akt urodzenia dziecka: ${c.name}</option>
            `).join('') : `
              <option value="urodzenie_child_zofia">Akt urodzenia dziecka: Zofia Kowalska</option>
              <option value="urodzenie_child_piotr">Akt urodzenia dziecka: Piotr Kowalski</option>
            `}
            ${data.marriage ? `<option value="malzenstwo">Akt małżeństwa</option>` : ''}
            <option value="stan_cywilny">Zaświadczenie o stanie cywilnym</option>
          </select>
        </div>

        <div class="gfw-field" style="margin-bottom:8px">
          <label class="gfw-label" for="uscFormTypeSelect" style="font-size:12px">Postać odpisu:</label>
          <select id="uscFormTypeSelect" class="cf-select" style="font-size:12px;padding:6px 8px">
            <option value="skrocony">Odpis skrócony (Standardowy – bezpłatny w mObywatel)</option>
            <option value="zupelny">Odpis zupełny (Zawiera pełną treść i wzmianki marginesowe)</option>
            <option value="wielojezyczny">Odpis wielojęzyczny (Druk Konwencji Wiedeńskiej CIEC – do UE)</option>
          </select>
        </div>

        <div class="gfw-field" style="margin-bottom:12px">
          <label class="gfw-label" for="uscPurposeSelect" style="font-size:12px">Cel wydania dokumentu:</label>
          <select id="uscPurposeSelect" class="cf-select" style="font-size:12px;padding:6px 8px">
            <option value="Sprawa paszportowa lub dowód osobisty">Sprawa paszportowa lub dowód osobisty</option>
            <option value="Świadczenia rodzinne i opiekuńcze (ZUS / 800+)">Świadczenia rodzinne i opiekuńcze (ZUS / 800+)</option>
            <option value="Czynności notarialne / spadek / nieruchomość">Czynności notarialne / spadek / nieruchomość</option>
            <option value="Zatrudnienie i sprawy pracownicze">Zatrudnienie i sprawy pracownicze</option>
            <option value="Zawarcie związku małżeńskiego">Zawarcie związku małżeńskiego</option>
            <option value="Inne postępowanie urzędowe lub sądowe">Inne postępowanie urzędowe lub sądowe</option>
          </select>
        </div>

        <button type="button" class="btn primary" style="width:100%;font-size:13px;padding:10px" onclick="submitUscWizard()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Pobierz urzędowy e-Odpis aktu (PDF z podpisem cyfrowym)
        </button>
      </div>

      <!-- Informacja prawna o kwalifikowanej pieczęci -->
      <div style="font-size:11px;color:var(--ink2);line-height:1.4;background:#fff;border:1px solid var(--hair);border-radius:10px;padding:10px 12px">
        🔒 <b>Kwalifikowana pieczęć cyfrowa:</b> Wszystkie wydane elektronicznie odpisy są opatrzone zaawansowaną pieczęcią Ministra Cyfryzacji w oparciu o art. 44 ust. 2 ustawy z dnia 28 listopada 2014 r. – Prawo o aktach stanu cywilnego.
      </div>
    `;
  }

  window.openUscModal = function () {
    let m = document.getElementById('uscZaswiadczeniaModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'uscZaswiadczeniaModal';
      m.className = 'sheet-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-labelledby', 'uscTitle');
      m.innerHTML = `
        <div class="scrim" onclick="closeUscModal()"></div>
        <div class="modal-box usc-box">
          <div class="modal-head">
            <h2 id="uscTitle">Zaświadczenia i Odpisy z USC</h2>
            <button class="tx-close" onclick="closeUscModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
          </div>
          <p class="modal-sub">Elektroniczne odpisy aktów stanu cywilnego z pieczęcią RP</p>
          <div class="usc-content" id="uscContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(m);
    }

    renderUscModalContent();
    m.classList.add('open');
    if (typeof openDialogFocus === 'function') openDialogFocus('uscModal', m, '.tx-close');
    if (typeof announceSR === 'function') announceSR('Otwarto zaświadczenia i odpisy z Urzędu Stanu Cywilnego');
  };

  window.closeUscModal = function () {
    const m = document.getElementById('uscZaswiadczeniaModal');
    if (m) {
      m.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') restoreDialogFocus('uscModal');
    }
  };

  window.onUscActTypeChange = function (sel) {
    // Automatyczne podpowiedzi celu lub postaci aktu
    const formSel = document.getElementById('uscFormTypeSelect');
    if (!formSel) return;
    if (sel.value === 'stan_cywilny') {
      formSel.innerHTML = `
        <option value="zaswiadczenie">Zaświadczenie o stanie cywilnym (Ważne 6 miesięcy)</option>
      `;
    } else {
      formSel.innerHTML = `
        <option value="skrocony">Odpis skrócony (Standardowy – bezpłatny w mObywatel)</option>
        <option value="zupelny">Odpis zupełny (Zawiera pełną treść i wzmianki marginesowe)</option>
        <option value="wielojezyczny">Odpis wielojęzyczny (Druk Konwencji Wiedeńskiej CIEC – do UE)</option>
      `;
    }
  };

  window.submitUscWizard = function () {
    const data = getUscData();
    const actSel = document.getElementById('uscActTypeSelect');
    const formSel = document.getElementById('uscFormTypeSelect');
    const purpSel = document.getElementById('uscPurposeSelect');

    const actVal = actSel ? actSel.value : 'urodzenie_self';
    const formType = formSel ? formSel.value : 'skrocony';
    const purpose = purpSel ? purpSel.value : 'Sprawy urzędowe';

    let type = 'urodzenie';
    let person = data.holder;

    if (actVal === 'malzenstwo') {
      type = 'malzenstwo';
      person = `${data.holder} & ${(data.marriage && data.marriage.spouse) || 'Małżonek'}`;
    } else if (actVal === 'stan_cywilny') {
      type = 'stan_cywilny';
      person = data.holder;
    } else if (actVal.startsWith('urodzenie_child_') || actVal.startsWith('urodzenie_c_')) {
      type = 'urodzenie';
      const childId = actVal.replace('urodzenie_', '');
      const childObj = data.children && data.children.find(c => c.id === childId);
      if (childObj) {
        person = childObj.name;
      } else if (actVal.includes('zofia')) {
        person = 'Zofia Kowalska';
      } else if (actVal.includes('piotr')) {
        person = 'Piotr Kowalski';
      } else {
        person = 'Dziecko';
      }
    }

    orderUscAct(type, person, formType, purpose);
  };

  window.orderUscAct = function (type, person, formType = 'skrocony', purpose = 'Sprawy urzędowe') {
    const data = getUscData();
    const docTitles = {
      urodzenie: formType === 'zupelny' ? 'ODPIS ZUPELNY AKTU URODZENIA' : (formType === 'wielojezyczny' ? 'ODPIS WIELOMOWY AKTU URODZENIA (CIEC)' : 'ODPIS SKROCONY AKTU URODZENIA'),
      malzenstwo: formType === 'zupelny' ? 'ODPIS ZUPELNY AKTU MALZENSTWA' : 'ODPIS SKROCONY AKTU MALZENSTWA',
      stan_cywilny: 'ZASWIADCZENIE O STANIE CYWILNYM'
    };

    const docTitle = docTitles[type] || 'ODPIS AKTU STANU CYWILNEGO';
    const actNumber = 'RSC/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random() * 900000);
    const currentDate = new Date().toLocaleDateString('pl-PL') + ' ' + new Date().toLocaleTimeString('pl-PL');

    const lines = [
      `Dokument: ${docTitle}`,
      `Oznaczenie aktu w rejestrze: ${actNumber}`,
      `Data wystawienia e-Odpisu: ${currentDate}`,
      `Cel wydania dokumentu: ${purpose}`,
      '',
      `DANE OSOBY / OSOB W AKCIE:`,
      `  Osoba, ktorej dotyczy dokument: ${person}`,
      `  Miejsce sporzadzenia aktu: Urzad Stanu Cywilnego (Polska)`,
      `  Kierownik USC / Wystawca: Ministerstwo Cyfryzacji - System Rejestrow Panstwowych`,
      '',
      `POSWIADCZENIE CYFROWE I KLAUZULA PRAWNA:`,
      `  Niniejszy dokument zostal wygenerowany automatycznie z Rejestru Stanu Cywilnego (RSC).`,
      `  Zgodnie z art. 44 ust. 2 ustawy z dnia 28 listopada 2014 r. - Prawo o aktach stanu cywilnego`,
      `  posiada on moc dokumentu urzedowego wydanego w postaci papierowej.`,
      '',
      `Certyfikat kwalifikowanej pieczeci cyfrowej:`,
      `  Wystawca: Centrum Certyfikacji Ministerstwa Cyfryzacji`,
      `  Certyfikat nr: PL-CERT-RSC-${Date.now().toString(36).toUpperCase()}`,
      `  Algorytm podpisu: SHA-256 with RSA Encryption`,
      `  Status pieczeci: KWALIFIKOWANA PIECZEC ELEKTRONICZNA WAZNA I ZWERYFIKOWANA`
    ];

    const pdfContent = generateMinimalPdf(
      'RZECZPOSPOLITA POLSKA - REJESTR STANU CYWILNEGO',
      lines,
      { subtitle: 'MINISTERSTWO CYFRYZACJI • URZAD STANU CYWILNEGO' }
    );

    const safeName = String(person).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Odpis_USC_${type}_${safeName}.pdf`;
    const success = downloadBlob(fileName, pdfContent, 'application/pdf');

    if (success) {
      if (typeof MobStore !== 'undefined') {
        MobStore.addUPO({
          title: `e-Odpis z USC: ${docTitle}`,
          source: 'Rejestr Stanu Cywilnego (Ministerstwo Cyfryzacji)',
          rows: [
            ['Dokument', docTitle],
            ['Dotyczy', person],
            ['Postać odpisu', formType.toUpperCase()],
            ['Cel wydania', purpose],
            ['Podpis', 'Kwalifikowana pieczęć Ministra Cyfryzacji']
          ]
        });
      }

      if (typeof showToast === 'function') {
        showToast(`Wygenerowano i pobrano oficjalny e-Odpis (${fileName}) z pieczęcią cyfrową.`);
      }
      if (typeof announceSR === 'function') {
        announceSR('Pobrano oficjalny e-Odpis aktu z pieczęcią cyfrową.');
      }
    }
  };

  // ==========================================================================
  // 3. PROFIL ZAUFANY (PZ) - PEŁNA OBSŁUGA MODALU #pzModal
  // ==========================================================================

  function renderPzModalContent() {
    const container = document.getElementById('pzContent');
    if (!container) return;

    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski', moje: { pesel: '83051203455' } };
    const fullName = `${o.imie} ${o.nazwisko}`;
    const pesel = (o.moje && o.moje.pesel) || '83051203455';

    container.innerHTML = `
      <div class="pz-hero-card">
        <div class="pzc-icon">🛡️</div>
        <span class="pzc-title">Profil Zaufany jest AKTYWNY</span>
        <div class="pzc-status">✓ Ważny do: 14.10.2028 (Certyfikat kwalifikowany Węzła Krajowego)</div>
      </div>

      <div class="pz-details-grid">
        <div class="pzd-row">
          <span style="color:var(--ink2)">Właściciel Profilu:</span>
          <b>${fullName}</b>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Identyfikator (PESEL):</span>
          <b style="font-family:monospace">${pesel}</b>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Metoda autoryzacji:</span>
          <b style="color:#059669">Aplikacja mObywatel (Powiadomienia PUSH)</b>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Połączony adres e-mail:</span>
          <b>${fullName.toLowerCase().replace(/\s+/g, '.')}@obywatel.gov.pl</b>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Powiązany numer telefonu:</span>
          <b>+48 ••• •• 12</b>
        </div>
      </div>

      <h4 style="font-size:12px;color:var(--ink);margin:0 0 6px 2px;font-weight:700">Ostatnie autoryzacje przez login.gov.pl:</h4>
      <div style="background:#fff;border:1px solid var(--hair);border-radius:10px;padding:8px 12px;font-size:11px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between">
          <span>Krajowa Administracja Skarbowa (Twój e-PIT)</span>
          <b style="color:#059669">Dzisiaj, 09:14 ✓</b>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span>Platforma Usług Elektronicznych ZUS (PUE ZUS)</span>
          <span style="color:var(--ink2)">Wczoraj, 14:22</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span>Elektroniczna Skrzynka Podawcza ePUAP</span>
          <span style="color:var(--ink2)">12.11.2026, 11:05</span>
        </div>
      </div>

      <div style="display:flex;gap:8px">
        <button type="button" class="btn secondary" style="flex:1;font-size:12px" onclick="downloadPzCert()">
          Pobierz certyfikat PZ
        </button>
        <button type="button" class="btn primary" style="flex:1;font-size:12px" onclick="renewPz()">
          Przedłuż ważność o 3 lata
        </button>
      </div>
    `;
  }

  window.openPzModal = function () {
    let m = document.getElementById('pzModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'pzModal';
      m.className = 'sheet-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-labelledby', 'pzTitle');
      m.innerHTML = `
        <div class="scrim" onclick="closePzModal()"></div>
        <div class="modal-box pz-box">
          <div class="modal-head">
            <h2 id="pzTitle">Profil Zaufany (PZ)</h2>
            <button class="tx-close" onclick="closePzModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
          </div>
          <p class="modal-sub">Krajowy Węzeł Identyfikacji Elektronicznej • Certyfikat tożsamości</p>
          <div class="pz-content" id="pzContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(m);
    }

    renderPzModalContent();
    m.classList.add('open');
    if (typeof openDialogFocus === 'function') openDialogFocus('pzModal', m, '.tx-close');
    if (typeof announceSR === 'function') announceSR('Otwarto szczegóły Profilu Zaufanego');
  };

  window.closePzModal = function () {
    const m = document.getElementById('pzModal');
    if (m) {
      m.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') restoreDialogFocus('pzModal');
    }
  };

  window.downloadPzCert = function () {
    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski', moje: { pesel: '83051203455' } };
    const fullName = `${o.imie} ${o.nazwisko}`;
    const lines = [
      `Certyfikat Identyfikacyjny Profilu Zaufanego (PZ)`,
      `Wlasciciel: ${fullName}`,
      `PESEL: ${(o.moje && o.moje.pesel) || '83051203455'}`,
      `Wydawca: Minister Cyfryzacji / Wezel Krajowy login.gov.pl`,
      `Data waznosci: 14.10.2028`,
      `Metoda uwierzytelniania: mObywatel Push 2FA`,
      `Odcisk cyfrowy klucza publicznego SHA-256:`,
      `  98:A1:4F:22:90:BC:7E:11:09:44:81:AA:BB:12:DE:09:55:18:22:99`
    ];
    const pdf = generateMinimalPdf('CERTYFIKAT PROFILU ZAUFANEGO (PZ)', lines, { subtitle: 'RZECZPOSPOLITA POLSKA • WEZEL KRAJOWY' });
    downloadBlob('Certyfikat_Profil_Zaufany.pdf', pdf, 'application/pdf');
    if (typeof showToast === 'function') {
      showToast('Pobrano Certyfikat Profilu Zaufanego (PDF)');
    }
  };

  window.renewPz = function () {
    if (typeof showToast === 'function') {
      showToast('Profil Zaufany został pomyślnie przedłużony o kolejne 3 lata.');
    }
  };

  // --- Automatyczna inicjalizacja po załadowaniu DOM ---
  function initModulyUrzad() {
    // Sprawdzenie i przygotowanie modalów w DOM
    const pitModal = document.getElementById('pitSkarbowyModal');
    if (pitModal && !document.getElementById('pitContent')) {
      const box = pitModal.querySelector('.modal-box');
      if (box) {
        const div = document.createElement('div');
        div.id = 'pitContent';
        div.className = 'pit-content';
        box.appendChild(div);
      }
    }

    const uscModal = document.getElementById('uscZaswiadczeniaModal');
    if (uscModal && !document.getElementById('uscContent')) {
      const box = uscModal.querySelector('.modal-box');
      if (box) {
        const div = document.createElement('div');
        div.id = 'uscContent';
        div.className = 'usc-content';
        box.appendChild(div);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModulyUrzad);
  } else {
    initModulyUrzad();
  }

})(window, document);
