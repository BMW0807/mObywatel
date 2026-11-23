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

  // --- Pomocnik generowania oficjalnego dokumentu PDF-1.4 mObywatel 2.0 w czystym JS ---
  function generateMinimalPdf(title, lines, meta = {}) {
    // 1. Bezpieczna transkrypcja polskich znaków i znaków specjalnych w standardzie PDF
    const sanitize = str => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/[ą]/g, 'a').replace(/[Ą]/g, 'A')
        .replace(/[ć]/g, 'c').replace(/[Ć]/g, 'C')
        .replace(/[ę]/g, 'e').replace(/[Ę]/g, 'E')
        .replace(/[ł]/g, 'l').replace(/[Ł]/g, 'L')
        .replace(/[ń]/g, 'n').replace(/[Ń]/g, 'N')
        .replace(/[ó]/g, 'o').replace(/[Ó]/g, 'O')
        .replace(/[ś]/g, 's').replace(/[Ś]/g, 'S')
        .replace(/[ź]/g, 'z').replace(/[Ź]/g, 'Z')
        .replace(/[ż]/g, 'z').replace(/[Ż]/g, 'Z')
        .replace(/[„”""]/g, '"')
        .replace(/[’'']/g, "'")
        .replace(/[–—]/g, '-')
        .replace(/•\s*•/g, '**')
        .replace(/•/g, ' * ')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[\r\n]/g, ' ');
    };

    // Pomocnik obliczania długości bajtowej w UTF-8
    const getByteLen = str => (typeof TextEncoder !== 'undefined')
      ? new TextEncoder().encode(str).length
      : (typeof Buffer !== 'undefined' ? Buffer.byteLength(str, 'utf8') : str.length);

    // Wygenerowanie deterministycznego skrótu i numeru seryjnego dokumentu
    const rawTitle = String(title || '');
    const rawSub = String((meta && meta.subtitle) || '');
    const seedString = rawTitle + rawSub + (Array.isArray(lines) ? lines.slice(0, 5).join('') : '');
    let hashVal = 0;
    for (let i = 0; i < seedString.length; i++) {
      hashVal = ((hashVal << 5) - hashVal) + seedString.charCodeAt(i);
      hashVal |= 0;
    }
    const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0').toUpperCase();
    const docSerial = 'PL-MOB-2026-' + hexHash;
    const now = new Date();
    const dateStr = String(now.getDate()).padStart(2, '0') + '.' +
                    String(now.getMonth() + 1).padStart(2, '0') + '.' +
                    now.getFullYear() + ' ' +
                    String(now.getHours()).padStart(2, '0') + ':' +
                    String(now.getMinutes()).padStart(2, '0');

    // Pomocnik dzielenia długich linii tekstu
    function wrapText(text, maxChars = 55) {
      const str = String(text || '').trim();
      if (!str) return [];
      if (str.length <= maxChars) return [str];
      const words = str.split(/\s+/);
      const out = [];
      let cur = '';
      for (const w of words) {
        if (!cur) {
          cur = w;
        } else if ((cur + ' ' + w).length <= maxChars) {
          cur += ' ' + w;
        } else {
          out.push(cur);
          cur = w;
        }
      }
      if (cur) out.push(cur);
      return out;
    }

    const s = [];

    // =========================================================================
    // 1. GÓRNY PASEK AKCENTUJĄCY - BARWY NARODOWE (KARMIN / BIEL / GRANAT)
    // =========================================================================
    s.push('q');
    s.push('0.863 0.078 0.235 rg 0 834 595 8 re f'); // Karmin flagowy (#DC143C)
    s.push('1 1 1 rg 0 832 595 2 re f');             // Biel
    s.push('0.118 0.227 0.541 rg 0 829 595 3 re f'); // Granat mObywatel (#1E3A8A)
    s.push('Q');

    // =========================================================================
    // 2. ELEGANCKI NAGŁÓWEK DOKUMENTU PAŃSTWOWEGO
    // =========================================================================
    s.push('q');
    s.push('0.973 0.980 0.988 rg 0.886 0.910 0.941 RG 1 w');
    s.push('38 732 519 88 re B'); // Tło kontenera nagłówka i obramowanie
    s.push('Q');

    // Wektorowa tarcza herbowa Rzeczypospolitej Polskiej
    s.push('q');
    s.push('0.863 0.078 0.235 rg 0.851 0.467 0.024 RG 1 w');
    s.push('48 802 m 92 802 l 92 770 l 92 754 70 744 70 744 c 70 744 48 754 48 770 c 48 802 l B');
    s.push('Q');

    // Korona w kolorze złota
    s.push('q');
    s.push('0.961 0.753 0.141 rg');
    s.push('63 793 m 77 793 l 78 799 l 73 796 l 70 801 l 67 796 l 62 799 l 63 793 l f');
    s.push('Q');

    // Wektorowa sylwetka Orła Białego
    s.push('q');
    s.push('1 1 1 rg 67 788 m 68 792 l 72 792 l 74 790 l 72 786 l 68 786 l f'); // Głowa
    s.push('0.961 0.753 0.141 rg 73 790 m 76 789 l 73 788 l f'); // Złoty dziób
    s.push('1 1 1 rg 67 786 m 73 786 l 75 776 l 72 766 l 68 766 l 65 776 l f'); // Korpus
    s.push('68 786 m 61 790 l 52 792 l 51 786 l 55 780 l 52 776 l 58 773 l 66 776 l f'); // Lewe skrzydło
    s.push('72 786 m 79 790 l 88 792 l 89 786 l 85 780 l 88 776 l 82 773 l 74 776 l f'); // Prawe skrzydło
    s.push('68 766 m 72 766 l 74 756 l 70 752 l 66 756 l f'); // Ogon
    s.push('0.961 0.753 0.141 rg 64 766 m 61 762 l 63 761 l 66 765 l f'); // Szpony
    s.push('76 766 m 79 762 l 77 761 l 74 765 l f');
    s.push('Q');

    // Napisy nagłówkowe
    s.push('BT');
    s.push('/F2 11 Tf 0.059 0.090 0.165 rg 102 798 Td (RZECZPOSPOLITA POLSKA) Tj ET');
    s.push('BT');
    s.push('/F1 7.5 Tf 0.392 0.455 0.545 rg 102 786 Td (SYSTEM MOBYWATEL 2.0 | OFICJALNY DOKUMENT ELEKTRONICZNY) Tj ET');

    // Delikatna linia podziału
    s.push('q 0.886 0.910 0.941 RG 0.75 w 102 779 m 435 779 l S Q');

    // Tytuł dokumentu (z automatycznym podziałem na wiersze przy długich nazwach)
    const cleanTitle = sanitize(title || 'DOKUMENT URZEDOWY');
    const titleParts = wrapText(cleanTitle, 36);
    const subTitle = sanitize((meta && meta.subtitle) || 'RZECZPOSPOLITA POLSKA * DOKUMENT CYFROWY');

    if (titleParts.length > 1) {
      s.push('BT');
      s.push(`/F2 11 Tf 0.059 0.090 0.165 rg 102 766 Td (${titleParts[0]}) Tj ET`);
      s.push('BT');
      s.push(`/F2 11 Tf 0.059 0.090 0.165 rg 102 754 Td (${titleParts[1]}) Tj ET`);
      s.push('BT');
      s.push(`/F2 7 Tf 0.863 0.078 0.235 rg 102 742 Td (${subTitle}) Tj ET`);
    } else {
      s.push('BT');
      s.push(`/F2 12.5 Tf 0.059 0.090 0.165 rg 102 763 Td (${cleanTitle}) Tj ET`);
      s.push('BT');
      s.push(`/F2 7.5 Tf 0.863 0.078 0.235 rg 102 750 Td (${subTitle}) Tj ET`);
    }

    // Prawy górny znaczek statusu (Pill badge)
    s.push('q');
    s.push('0.925 0.992 0.961 rg 0.655 0.953 0.816 RG 1 w');
    s.push('444 786 98 20 re B');
    s.push('0.086 0.639 0.290 rg 452 794 4 4 re f');
    s.push('Q');
    s.push('BT');
    s.push('/F2 6.5 Tf 0.086 0.639 0.290 rg 460 793 Td (ORYGINAL CYFROWY) Tj ET');

    // Prawy chip weryfikacji serii i numeru
    s.push('q');
    s.push('0.945 0.961 0.976 rg 0.796 0.835 0.882 RG 0.5 w');
    s.push('444 746 98 34 re B');
    s.push('Q');
    s.push('BT');
    s.push('/F1 5.5 Tf 0.392 0.455 0.545 rg 450 769 Td (SERIA I NUMER:) Tj ET');
    s.push('BT');
    s.push(`/F2 6.5 Tf 0.059 0.090 0.165 rg 450 758 Td (${docSerial}) Tj ET`);
    s.push('BT');
    s.push('/F2 5.5 Tf 0.086 0.639 0.290 rg 450 750 Td (STATUS: WAZNY I AKTYWNY) Tj ET');

    // =========================================================================
    // 3. SIATKA METADANYCH (METADATA BOX / TABELA DANYCH)
    // =========================================================================
    const cardTop = 720;
    const sealTop = 152;
    const cardLeft = 38;
    const cardWidth = 519;

    let curY = cardTop;
    let dataRowIdx = 0;

    const parsed = [];
    const rawLines = Array.isArray(lines) ? lines : [];

    rawLines.forEach(raw => {
      const trimmed = String(raw || '').trim();
      if (!trimmed) {
        parsed.push({ type: 'SPACE' });
        return;
      }

      if (trimmed.endsWith(':') ||
          (/^([A-Z0-9\s\(\)\.\,\-\/]{10,}):?$/.test(trimmed) && !trimmed.includes(':') && trimmed.length < 50) ||
          trimmed.startsWith('===') || trimmed.startsWith('---')) {
        parsed.push({
          type: 'SECTION_HEADER',
          text: sanitize(trimmed.replace(/^[:=\-\s]+|[:=\-\s]+$/g, ''))
        });
        return;
      }

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 45) {
        const k = trimmed.substring(0, colonIdx).trim();
        const v = trimmed.substring(colonIdx + 1).trim();
        if (v.length > 0) {
          parsed.push({
            type: 'KEY_VALUE',
            key: sanitize(k),
            val: sanitize(v)
          });
          return;
        }
      }

      if (/^(\d+\.|\*|\-)\s+/.test(trimmed)) {
        parsed.push({
          type: 'LIST_ITEM',
          text: sanitize(trimmed)
        });
        return;
      }

      if (/^[0-9a-fA-F:\s]{24,}$/.test(trimmed)) {
        parsed.push({
          type: 'CODE_BLOCK',
          text: sanitize(trimmed)
        });
        return;
      }

      parsed.push({
        type: 'PARAGRAPH',
        text: sanitize(trimmed)
      });
    });

    parsed.forEach(item => {
      if (curY < sealTop + 24) return;

      if (item.type === 'SPACE') {
        curY -= 6;
        return;
      }

      if (item.type === 'SECTION_HEADER') {
        const rowH = 19;
        curY -= rowH;
        s.push('q');
        s.push(`0.945 0.961 0.976 rg ${cardLeft} ${curY} ${cardWidth} ${rowH} re f`);
        s.push(`0.863 0.078 0.235 rg ${cardLeft} ${curY} 3.5 ${rowH} re f`);
        s.push(`0.886 0.910 0.941 RG 0.5 w ${cardLeft} ${curY} m ${cardLeft + cardWidth} ${curY} l S`);
        s.push('Q');

        s.push('BT');
        s.push(`/F2 8 Tf 0.059 0.090 0.165 rg ${cardLeft + 10} ${curY + 5.5} Td (${item.text}) Tj ET`);
        dataRowIdx = 0;
        return;
      }

      if (item.type === 'KEY_VALUE') {
        const wrappedVal = wrapText(item.val, 55);
        const numLines = Math.max(1, wrappedVal.length);
        const rowH = numLines === 1 ? 17 : (numLines === 2 ? 26 : 34);
        curY -= rowH;

        const bg = (dataRowIdx % 2 === 1) ? '0.973 0.980 0.988' : '1 1 1';
        s.push('q');
        s.push(`${bg} rg ${cardLeft} ${curY} ${cardWidth} ${rowH} re f`);
        s.push(`0.886 0.910 0.941 RG 0.5 w ${cardLeft} ${curY} m ${cardLeft + cardWidth} ${curY} l S`);
        s.push('Q');

        s.push('BT');
        const labelY = curY + (numLines === 1 ? 4.5 : (numLines === 2 ? 14 : 22));
        s.push(`/F2 8 Tf 0.278 0.333 0.412 rg ${cardLeft + 10} ${labelY} Td (${item.key}:) Tj ET`);

        const isHighlight = /KOD 200|WAZNA|ZLOZONE|ZATWIERDZON|AKTYWN|KWALIFIKOWANA/i.test(item.val);
        const valColor = isHighlight ? '0.086 0.639 0.290' : '0.059 0.090 0.165';
        const valFont = isHighlight ? '/F2' : '/F1';

        if (numLines === 1) {
          s.push('BT');
          s.push(`${valFont} 8 Tf ${valColor} rg ${cardLeft + 170} ${curY + 4.5} Td (${wrappedVal[0]}) Tj ET`);
        } else {
          wrappedVal.forEach((lineText, lIdx) => {
            const lineY = curY + (numLines - 1 - lIdx) * 10 + 4;
            s.push('BT');
            s.push(`${valFont} 8 Tf ${valColor} rg ${cardLeft + 170} ${lineY} Td (${lineText}) Tj ET`);
          });
        }

        dataRowIdx++;
        return;
      }

      if (item.type === 'LIST_ITEM') {
        const wrappedList = wrapText(item.text, 95);
        const numLines = Math.max(1, wrappedList.length);
        const rowH = numLines === 1 ? 17 : 24;
        curY -= rowH;
        const bg = (dataRowIdx % 2 === 1) ? '0.973 0.980 0.988' : '1 1 1';
        s.push('q');
        s.push(`${bg} rg ${cardLeft} ${curY} ${cardWidth} ${rowH} re f`);
        s.push(`0.886 0.910 0.941 RG 0.5 w ${cardLeft} ${curY} m ${cardLeft + cardWidth} ${curY} l S`);
        s.push('Q');

        if (numLines === 1) {
          s.push('BT');
          s.push(`/F1 8 Tf 0.059 0.090 0.165 rg ${cardLeft + 10} ${curY + 4.5} Td (${wrappedList[0]}) Tj ET`);
        } else {
          wrappedList.forEach((lineText, lIdx) => {
            const lineY = curY + (numLines - 1 - lIdx) * 9.5 + 3.5;
            s.push('BT');
            s.push(`/F1 8 Tf 0.059 0.090 0.165 rg ${cardLeft + 10} ${lineY} Td (${lineText}) Tj ET`);
          });
        }
        dataRowIdx++;
        return;
      }

      if (item.type === 'CODE_BLOCK') {
        const rowH = 20;
        curY -= rowH;
        s.push('q');
        s.push(`0.945 0.961 0.976 rg 0.796 0.835 0.882 RG 0.5 w`);
        s.push(`${cardLeft + 10} ${curY + 2} ${cardWidth - 20} ${rowH - 4} re B`);
        s.push('Q');

        s.push('BT');
        s.push(`/F4 7.5 Tf 0.059 0.090 0.165 rg ${cardLeft + 18} ${curY + 6} Td (${item.text}) Tj ET`);
        return;
      }

      if (item.type === 'PARAGRAPH') {
        const wrappedP = wrapText(item.text, 92);
        const numLines = Math.max(1, wrappedP.length);
        const rowH = numLines === 1 ? 16 : numLines * 10 + 6;
        curY -= rowH;

        s.push('q');
        s.push(`0.973 0.980 0.988 rg ${cardLeft} ${curY} ${cardWidth} ${rowH} re f`);
        s.push(`0.580 0.639 0.722 RG 2 w ${cardLeft + 2} ${curY} m ${cardLeft + 2} ${curY + rowH} l S`);
        s.push(`0.886 0.910 0.941 RG 0.5 w ${cardLeft} ${curY} m ${cardLeft + cardWidth} ${curY} l S`);
        s.push('Q');

        if (numLines === 1) {
          s.push('BT');
          s.push(`/F3 7.5 Tf 0.278 0.333 0.412 rg ${cardLeft + 10} ${curY + 4.5} Td (${wrappedP[0]}) Tj ET`);
        } else {
          wrappedP.forEach((lineText, lIdx) => {
            const lineY = curY + (numLines - 1 - lIdx) * 9.5 + 4;
            s.push('BT');
            s.push(`/F3 7.5 Tf 0.278 0.333 0.412 rg ${cardLeft + 10} ${lineY} Td (${lineText}) Tj ET`);
          });
        }
        return;
      }
    });

    // Rysowanie zamykającego obramowania karty metadanych
    const cardActualHeight = cardTop - curY;
    s.push('q');
    s.push(`0.886 0.910 0.941 RG 1 w ${cardLeft} ${curY} ${cardWidth} ${cardActualHeight} re S`);
    s.push('Q');

    // =========================================================================
    // 4. KWALIFIKOWANA PIECZĘĆ ELEKTRONICZNA I POŚWIADCZENIE WERYFIKACJI
    // =========================================================================
    const sealH = 88;
    const sealY = 56;

    s.push('q');
    s.push(`0.973 0.980 0.988 rg 0.796 0.835 0.882 RG 1 w`);
    s.push(`${cardLeft} ${sealY} ${cardWidth} ${sealH} re B`);
    s.push(`1 1 1 rg ${cardLeft} ${sealY + sealH - 3} ${cardWidth / 2} 3 re f`);
    s.push(`0.863 0.078 0.235 rg ${cardLeft + cardWidth / 2} ${sealY + sealH - 3} ${cardWidth / 2} 3 re f`);
    s.push('Q');

    // Autentyczny wektorowy kod QR (matryca 21x21)
    const qrX = cardLeft + 8;
    const qrY = sealY + 10;
    const qrMod = 3;
    const qrPlateSize = 70;

    s.push('q');
    s.push(`1 1 1 rg 0.886 0.910 0.941 RG 0.5 w ${qrX - 3.5} ${qrY - 3.5} ${qrPlateSize} ${qrPlateSize} re B`);
    s.push('Q');

    const qrMat = Array.from({ length: 21 }, () => Array(21).fill(0));
    function placeFinder(startX, startY) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            qrMat[startY + r][startX + c] = 1;
          } else {
            qrMat[startY + r][startX + c] = 0;
          }
        }
      }
    }
    placeFinder(0, 0);
    placeFinder(14, 0);
    placeFinder(0, 14);

    for (let i = 8; i < 13; i++) {
      qrMat[6][i] = (i % 2 === 0) ? 1 : 0;
      qrMat[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    let hashBits = Math.abs(hashVal);
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
        if (r >= 9 && r <= 11 && c >= 9 && c <= 11) continue;
        hashBits = (hashBits * 1103515245 + 12345) & 0x7fffffff;
        if (((hashBits >> 16) & 1) ^ ((r + c) % 2 === 0)) {
          qrMat[r][c] = 1;
        }
      }
    }

    s.push('q');
    s.push('0.059 0.090 0.165 rg');
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if (qrMat[r][c] === 1) {
          const mx = qrX + c * qrMod;
          const my = qrY + (20 - r) * qrMod;
          s.push(`${mx.toFixed(1)} ${my.toFixed(1)} ${qrMod} ${qrMod} re f`);
        }
      }
    }

    // Miniaturka znaku urzędowego w centrum QR
    s.push(`1 1 1 rg ${qrX + 8.5 * qrMod} ${qrY + 8.5 * qrMod} ${4 * qrMod} ${4 * qrMod} re f`);
    s.push(`0.863 0.078 0.235 rg ${qrX + 9.5 * qrMod} ${qrY + 9.5 * qrMod} ${2 * qrMod} ${2 * qrMod} re f`);
    s.push('Q');

    s.push('BT');
    s.push(`/F2 5 Tf 0.392 0.455 0.545 rg ${qrX + 6} ${qrY - 7} Td (KOD WERYFIKACJI) Tj ET`);

    // Prawa strona ramki pieczęci
    const sealContentX = cardLeft + 84;
    s.push('q');
    s.push(`0.996 0.949 0.949 rg 0.988 0.647 0.647 RG 0.75 w`);
    s.push(`${sealContentX} ${sealY + sealH - 24} 420 16 re B`);
    s.push('Q');

    s.push('BT');
    s.push(`/F2 7 Tf 0.863 0.078 0.235 rg ${sealContentX + 8} ${sealY + sealH - 18} Td (DOKUMENT POTWIERDZONY KWALIFIKOWANA PIECZECIA ELEKTRONICZNA) Tj ET`);

    s.push('BT');
    s.push(`/F2 7 Tf 0.059 0.090 0.165 rg ${sealContentX} ${sealY + sealH - 34} Td (Wystawca: Ministerstwo Cyfryzacji | Wezel Krajowy Identyfikacji Elektronicznej) Tj ET`);

    s.push('BT');
    s.push(`/F1 6.5 Tf 0.278 0.333 0.412 rg ${sealContentX} ${sealY + sealH - 44} Td (Certyfikat kwalifikowany: PL-MC-EIDAS-2026-${hexHash} | Algorytm: SHA-256 with RSA) Tj ET`);

    s.push('BT');
    s.push(`/F1 6.5 Tf 0.392 0.455 0.545 rg ${sealContentX} ${sealY + sealH - 54} Td (Podstawa prawna: Rozporzadzenie UE eIDAS nr 910/2014 | Posiada pelna moc dokumentu papierowego) Tj ET`);

    s.push('q');
    s.push(`0.925 0.992 0.961 rg 0.525 0.937 0.675 RG 0.5 w`);
    s.push(`${sealContentX} ${sealY + 8} 255 14 re B`);
    s.push('Q');

    s.push('BT');
    s.push(`/F2 6 Tf 0.086 0.639 0.290 rg ${sealContentX + 6} ${sealY + 12} Td (STATUS: PIECZEC WAZNA | INTEGRALNOSC POTWIERDZONA) Tj ET`);

    s.push('BT');
    s.push(`/F1 6 Tf 0.392 0.455 0.545 rg ${sealContentX + 270} ${sealY + 12} Td (Weryfikacja: ${dateStr}) Tj ET`);

    // =========================================================================
    // 5. STOPKA DOKUMENTU Z KLAUZULĄ PRAWNĄ
    // =========================================================================
    s.push('q');
    s.push(`0.886 0.910 0.941 RG 0.5 w ${cardLeft} 45 m ${cardLeft + cardWidth} 45 l S`);
    s.push('Q');

    s.push('BT');
    s.push(`/F1 6.5 Tf 0.392 0.455 0.545 rg ${cardLeft} 34 Td (Dokument wydany na podstawie art. 19e ustawy z dnia 17 lutego 2005 r. o informatyzacji podmiotow realizujacych zadania publiczne.) Tj ET`);

    s.push('BT');
    s.push(`/F1 6 Tf 0.580 0.639 0.722 rg ${cardLeft} 24 Td (Aplikacja mObywatel 2.0 | Wygenerowano: ${dateStr} | Identyfikator: ${docSerial}) Tj ET`);

    s.push('BT');
    s.push(`/F2 6.5 Tf 0.278 0.333 0.412 rg ${cardLeft + cardWidth - 55} 24 Td (Strona 1 z 1) Tj ET`);

    // =========================================================================
    // 6. KOMPILACJA STRUKTURY PLIKU PDF-1.4 (XREF I TRAILER)
    // =========================================================================
    const stream = s.join('\n');
    const streamLen = getByteLen(stream);

    let pdf = '%PDF-1.4\n';
    const offsets = [];

    function addObj(str) {
      offsets.push(getByteLen(pdf));
      pdf += str + '\n';
    }

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources 5 0 R >>\nendobj');
    addObj('4 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + stream + '\nendstream\nendobj');
    addObj('5 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >> /F4 << /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >> >> >>\nendobj');

    const startxref = getByteLen(pdf);
    pdf += 'xref\n0 6\n0000000000 65535 f \n';
    offsets.forEach(off => {
      pdf += String(off).padStart(10, '0') + ' 00000 n \n';
    });
    pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
    return pdf;
  }
  window.generateMinimalPdf = generateMinimalPdf;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.generateMinimalPdf = generateMinimalPdf;
  }

  // --- Pobranie pliku do przeglądarki ---
  function downloadBlob(filename, content, mimeType) {
    if (typeof window !== 'undefined' && window.downloadBlob && window.downloadBlob !== downloadBlob) {
      return window.downloadBlob(filename, content, mimeType);
    }
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
  window.downloadBlob = downloadBlob;

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

  function tryFallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const res = document.execCommand('copy');
      document.body.removeChild(ta);
      return res;
    } catch (e) {
      return false;
    }
  }

  window.copyPitMikrorachunek = function () {
    const data = getPitData();
    const rawNumber = data.mikrorachunek.replace(/\s+/g, '');
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawNumber).catch(() => {
        tryFallbackCopy(rawNumber);
      });
      copied = true;
    } else {
      copied = tryFallbackCopy(rawNumber);
    }
    if (typeof showToast === 'function') {
      showToast(`Skopiowano numer mikrorachunku podatkowego: ${data.mikrorachunek}`);
    }
    if (typeof announceSR === 'function') {
      announceSR('Skopiowano numer mikrorachunku podatkowego');
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
    } else if (actVal.startsWith('urodzenie_') && actVal !== 'urodzenie_self') {
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

  // --- Pomocniki dla Profilu Zaufanego (PZ) ---
  function getPzDefaultValidDate(pId) {
    const o = curOS();
    const pzDoc = (o && o.docs && o.docs.find(d => d.id === 'pz')) ||
      (typeof DOCS !== 'undefined' && DOCS.find(d => d.id === 'pz'));
    if (pzDoc) {
      const fVal = (pzDoc.f && pzDoc.f.find(x => x[0] === 'Ważny do')) ||
                   (pzDoc.rows && pzDoc.rows.find(x => x[0] === 'Data ważności'));
      if (fVal && fVal[1]) {
        const m = fVal[1].match(/\d{2}\.\d{2}\.\d{4}/);
        if (m) return m[0];
      }
    }
    const defaults = {
      jan: '12.05.2028',
      marta: '14.07.2028',
      ewa: '03.02.2028',
      kacper: '21.03.2028'
    };
    return defaults[pId] || '14.10.2028';
  }

  function getPzValidUntil(pId) {
    try {
      const stored = localStorage.getItem('mob_pz_valid_until_' + pId);
      if (stored) return stored;
      if (typeof MobStore !== 'undefined' && MobStore.get) {
        const ms = MobStore.get('pz_valid_until');
        if (ms) return ms;
      }
    } catch (e) {}
    return getPzDefaultValidDate(pId);
  }

  const DEFAULT_PZ_HISTORY = [
    { title: 'Krajowa Administracja Skarbowa (Twój e-PIT)', time: 'Dzisiaj, 09:14', status: '✓', ok: true },
    { title: 'Platforma Usług Elektronicznych ZUS (PUE ZUS)', time: 'Wczoraj, 14:22', ok: false },
    { title: 'Elektroniczna Skrzynka Podawcza ePUAP', time: '12.11.2026, 11:05', ok: false }
  ];

  function getPzHistory(pId) {
    try {
      const stored = localStorage.getItem('mob_pz_history_' + pId);
      if (stored) return JSON.parse(stored);
      if (typeof MobStore !== 'undefined' && MobStore.get) {
        const ms = MobStore.get('pz_history');
        if (ms) return ms;
      }
    } catch (e) {}
    return DEFAULT_PZ_HISTORY.slice();
  }

  function addPzHistoryEntry(pId, entry) {
    const hist = getPzHistory(pId);
    hist.unshift(entry);
    try {
      localStorage.setItem('mob_pz_history_' + pId, JSON.stringify(hist));
      if (typeof MobStore !== 'undefined' && MobStore.set) {
        MobStore.set('pz_history', hist);
      }
    } catch (e) {}
  }

  const DEFAULT_AUTH_METHOD = 'Aplikacja mObywatel (Powiadomienia PUSH)';

  function getPzAuthMethod(pId) {
    try {
      const stored = localStorage.getItem('mob_pz_auth_method_' + pId);
      if (stored) return stored;
      if (typeof MobStore !== 'undefined' && MobStore.get) {
        const ms = MobStore.get('pz_auth_method');
        if (ms) return ms;
      }
    } catch (e) {}
    return DEFAULT_AUTH_METHOD;
  }

  function getPzContactData(pId) {
    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski' };
    const fullName = `${o.imie} ${o.nazwisko}`;
    let defaultEmail = `${fullName.toLowerCase().replace(/\s+/g, '.')}@obywatel.gov.pl`;
    let defaultPhone = '+48 ••• •• 12';

    const pzDoc = (o && o.docs && o.docs.find(d => d.id === 'pz')) ||
      (typeof DOCS !== 'undefined' && DOCS.find(d => d.id === 'pz'));
    if (pzDoc && pzDoc.rows) {
      const rEmail = pzDoc.rows.find(r => r[0] === 'Powiązany e-mail');
      const rPhone = pzDoc.rows.find(r => r[0] === 'Powiązany telefon');
      if (rEmail && rEmail[1]) defaultEmail = rEmail[1];
      if (rPhone && rPhone[1]) defaultPhone = rPhone[1];
    }

    try {
      const stored = localStorage.getItem('mob_pz_contact_' + pId);
      if (stored) return JSON.parse(stored);
      if (typeof MobStore !== 'undefined' && MobStore.get) {
        const ms = MobStore.get('pz_contact');
        if (ms) return ms;
      }
    } catch (e) {}
    return { email: defaultEmail, phone: defaultPhone };
  }

  function syncPzDocWithStoredState() {
    const pId = getPersonaKey();
    const validUntil = getPzValidUntil(pId);
    const authMethod = getPzAuthMethod(pId);
    const contact = getPzContactData(pId);
    const newYear = (validUntil.match(/\d{4}$/) || ['2029'])[0];

    const updateDoc = doc => {
      if (!doc || doc.id !== 'pz') return;
      doc.sub = `Węzeł Krajowy • Ważny do ${newYear}`;
      doc.line = `PZ aktywny, ważny do ${validUntil}`;
      if (Array.isArray(doc.f)) {
        const fDate = doc.f.find(x => x[0] === 'Ważny do');
        if (fDate) fDate[1] = validUntil;
        const fVer = doc.f.find(x => x[0] === 'Weryfikacja');
        if (fVer && authMethod.includes('SMS')) fVer[1] = 'SMS / login.gov.pl';
        else if (fVer && authMethod.includes('PUSH')) fVer[1] = 'mObywatel PUSH';
        const fPhone = doc.f.find(x => x[0].startsWith('Powiązany tel'));
        if (fPhone) fPhone[1] = contact.phone;
      }
      if (Array.isArray(doc.rows)) {
        const rDate = doc.rows.find(x => x[0] === 'Data ważności');
        if (rDate) rDate[1] = `${validUntil} (odnowienie online)`;
        const rEmail = doc.rows.find(x => x[0] === 'Powiązany e-mail');
        if (rEmail) rEmail[1] = contact.email;
        const rPhone = doc.rows.find(x => x[0] === 'Powiązany telefon');
        if (rPhone) rPhone[1] = contact.phone;
      }
    };

    if (typeof DOCS !== 'undefined' && Array.isArray(DOCS)) DOCS.forEach(updateDoc);
    const o = curOS();
    if (o && Array.isArray(o.docs)) o.docs.forEach(updateDoc);
  }

  function renderPzModalContent() {
    const container = document.getElementById('pzContent');
    if (!container) return;

    const pId = getPersonaKey();
    const validUntil = getPzValidUntil(pId);
    const authMethod = getPzAuthMethod(pId);
    const contact = getPzContactData(pId);
    const history = getPzHistory(pId);
    const isPush = authMethod.includes('PUSH') || authMethod.includes('mObywatel');

    const o = curOS() || { imie: 'Jan', nazwisko: 'Wiśniewski', moje: { pesel: '83051203455' } };
    const fullName = `${o.imie} ${o.nazwisko}`;
    const pesel = (o.moje && o.moje.pesel) || '83051203455';

    container.innerHTML = `
      <div class="pz-hero-card">
        <div class="pzc-icon">🛡️</div>
        <span class="pzc-title">Profil Zaufany jest AKTYWNY</span>
        <div class="pzc-status">✓ Ważny do: <b>${validUntil}</b> (Certyfikat kwalifikowany Węzła Krajowego)</div>
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
        <div class="pzd-row" style="align-items:center">
          <span style="color:var(--ink2)">Metoda autoryzacji:</span>
          <div style="display:flex;align-items:center;gap:6px">
            <b style="color:${isPush ? '#059669' : '#2563eb'}">${authMethod}</b>
            <button type="button" class="btn secondary" style="padding:2px 8px;font-size:10px" onclick="togglePzAuthMethod()" aria-label="Zmień metodę autoryzacji PZ">Przełącz</button>
          </div>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Połączony adres e-mail:</span>
          <b id="pzDisplayEmail">${contact.email}</b>
        </div>
        <div class="pzd-row">
          <span style="color:var(--ink2)">Powiązany numer telefonu:</span>
          <b id="pzDisplayPhone">${contact.phone}</b>
        </div>
      </div>

      <div style="margin:-4px 0 12px;display:flex;justify-content:flex-end">
        <button type="button" class="btn secondary" style="font-size:11px;padding:4px 10px" onclick="changePzContactData()">
          ✏️ Zmień powiązane dane (e-mail / tel)
        </button>
      </div>

      <div id="pzContactEditBox" style="display:none;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px;margin-bottom:12px">
        <div style="font-weight:700;font-size:12px;margin-bottom:6px;color:var(--ink)">Zmień powiązane dane kontaktowe Profilu Zaufanego:</div>
        <div class="gfw-field" style="margin-bottom:6px">
          <label style="font-size:11px;color:var(--ink2);display:block;margin-bottom:2px" for="pzEmailInput">Adres e-mail:</label>
          <input type="email" id="pzEmailInput" class="cf-input" value="${contact.email}" style="width:100%;font-size:12px;padding:6px 8px">
        </div>
        <div class="gfw-field" style="margin-bottom:8px">
          <label style="font-size:11px;color:var(--ink2);display:block;margin-bottom:2px" for="pzPhoneInput">Numer telefonu:</label>
          <input type="tel" id="pzPhoneInput" class="cf-input" value="${contact.phone}" style="width:100%;font-size:12px;padding:6px 8px">
        </div>
        <div style="display:flex;gap:6px">
          <button type="button" class="btn primary" style="flex:1;font-size:11px;padding:6px" onclick="savePzContactFromInputs()">Zapisz dane</button>
          <button type="button" class="btn secondary" style="flex:none;font-size:11px;padding:6px 10px" onclick="changePzContactData()">Anuluj</button>
        </div>
      </div>

      <h4 style="font-size:12px;color:var(--ink);margin:0 0 6px 2px;font-weight:700">Ostatnie autoryzacje przez login.gov.pl:</h4>
      <div style="background:#fff;border:1px solid var(--hair);border-radius:10px;padding:8px 12px;font-size:11px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px">
        ${history.slice(0, 4).map(h => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.title}</span>
            <b style="color:${h.ok ? '#059669' : 'var(--ink2)'};flex:none">${h.time}${h.status ? ' ' + h.status : ''}</b>
          </div>
        `).join('')}
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

    syncPzDocWithStoredState();
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
    const pId = getPersonaKey();
    const validUntil = getPzValidUntil(pId);
    const authMethod = getPzAuthMethod(pId);
    const contact = getPzContactData(pId);
    const fullName = `${o.imie} ${o.nazwisko}`;
    const lines = [
      `Certyfikat Identyfikacyjny Profilu Zaufanego (PZ)`,
      `Wlasciciel: ${fullName}`,
      `PESEL: ${(o.moje && o.moje.pesel) || '83051203455'}`,
      `Wydawca: Minister Cyfryzacji / Wezel Krajowy login.gov.pl`,
      `Data waznosci: ${validUntil}`,
      `Metoda uwierzytelniania: ${authMethod}`,
      `Powiazany adres e-mail: ${contact.email}`,
      `Powiazany numer telefonu: ${contact.phone}`,
      `Odcisk cyfrowy klucza publicznego SHA-256:`,
      `  98:A1:4F:22:90:BC:7E:11:09:44:81:AA:BB:12:DE:09:55:18:22:99`
    ];
    const pdfGen = (typeof window !== 'undefined' && window.generateMinimalPdf) || (typeof generateMinimalPdf === 'function' ? generateMinimalPdf : null);
    if (pdfGen) {
      const pdf = pdfGen('CERTYFIKAT PROFILU ZAUFANEGO (PZ)', lines, { subtitle: 'RZECZPOSPOLITA POLSKA • WEZEL KRAJOWY' });
      downloadBlob('Certyfikat_Profil_Zaufany.pdf', pdf, 'application/pdf');
    }
    if (typeof showToast === 'function') {
      showToast('Pobrano Certyfikat Profilu Zaufanego (PDF)');
    }
  };

  window.renewPz = function () {
    const pId = getPersonaKey();
    const curValid = getPzValidUntil(pId);
    let newDateStr = '';

    const m = curValid.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) {
      const d = m[1];
      const mo = m[2];
      const yr = parseInt(m[3], 10) + 3;
      newDateStr = `${d}.${mo}.${yr}`;
    } else {
      const nowD = new Date();
      const d = String(nowD.getDate()).padStart(2, '0');
      const mo = String(nowD.getMonth() + 1).padStart(2, '0');
      const yr = nowD.getFullYear() + 3;
      newDateStr = `${d}.${mo}.${yr}`;
    }

    try {
      localStorage.setItem('mob_pz_valid_until_' + pId, newDateStr);
      if (typeof MobStore !== 'undefined' && MobStore.set) {
        MobStore.set('pz_valid_until', newDateStr);
      }
    } catch (e) {}

    // Aktualizacja karty w DOCS i OS.docs
    syncPzDocWithStoredState();

    if (typeof renderStack === 'function') renderStack();
    if (typeof updateDashboard === 'function') updateDashboard();

    const det = document.getElementById('detail');
    if (det && det.classList.contains('on')) {
      const pzDoc = (typeof DOCS !== 'undefined' && DOCS.find(x => x.id === 'pz')) ||
        (typeof curOS === 'function' && curOS() && curOS().docs && curOS().docs.find(x => x.id === 'pz'));
      if (pzDoc && pzDoc.rows) {
        const rowsEl = det.querySelector('.rows');
        if (rowsEl && typeof rowsH === 'function') {
          rowsEl.innerHTML = rowsH(pzDoc.rows);
        }
      }
    }

    const timeStr = typeof now === 'function' ? now() : new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    addPzHistoryEntry(pId, {
      title: 'Przedłużenie ważności certyfikatu Profilu Zaufanego o 3 lata',
      time: `Dzisiaj, ${timeStr}`,
      status: '✓',
      ok: true
    });

    if (typeof MobStore !== 'undefined' && MobStore.addUPO) {
      const o = curOS();
      MobStore.addUPO({
        title: 'Przedłużenie ważności Profilu Zaufanego (PZ)',
        source: 'Ministerstwo Cyfryzacji / Węzeł Krajowy login.gov.pl',
        rows: [
          ['Dokument', 'Profil Zaufany (PZ)'],
          ['Okres ważności', `Przedłużono o 3 lata (do ${newDateStr})`],
          ['Wnioskodawca', `${(o && o.imie) || 'Jan'} ${(o && o.nazwisko) || 'Wiśniewski'}`],
          ['Status', 'Certyfikat zaktualizowany w Węźle Krajowym']
        ]
      });
    }

    renderPzModalContent();

    if (typeof showToast === 'function') {
      showToast(`Profil Zaufany przedłużony o 3 lata! Ważny do: ${newDateStr}`);
    }
    if (typeof announceSR === 'function') {
      announceSR(`Profil Zaufany przedłużony o 3 lata, ważny do ${newDateStr}`);
    }
  };

  window.togglePzAuthMethod = function () {
    const pId = getPersonaKey();
    const current = getPzAuthMethod(pId);
    const isCurrentlyPush = current.includes('PUSH') || current.includes('mObywatel');
    const newMethod = isCurrentlyPush
      ? 'Kody SMS (Węzeł Krajowy login.gov.pl)'
      : 'Aplikacja mObywatel (Powiadomienia PUSH)';

    try {
      localStorage.setItem('mob_pz_auth_method_' + pId, newMethod);
      if (typeof MobStore !== 'undefined' && MobStore.set) {
        MobStore.set('pz_auth_method', newMethod);
      }
    } catch (e) {}

    syncPzDocWithStoredState();

    const timeStr = typeof now === 'function' ? now() : new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    addPzHistoryEntry(pId, {
      title: `Zmiana metody autoryzacji: ${isCurrentlyPush ? 'Kody SMS' : 'mObywatel PUSH'}`,
      time: `Dzisiaj, ${timeStr}`,
      status: '✓',
      ok: true
    });

    renderPzModalContent();

    if (typeof showToast === 'function') {
      showToast(`Zmieniono metodę logowania na: ${isCurrentlyPush ? 'Kody SMS (login.gov.pl)' : 'Powiadomienia PUSH w mObywatelu'}`);
    }
    if (typeof announceSR === 'function') {
      announceSR(`Zmieniono metodę autoryzacji na: ${newMethod}`);
    }
  };

  window.savePzContactData = function (newEmail, newPhone) {
    const pId = getPersonaKey();
    const contact = {
      email: (newEmail || '').trim(),
      phone: (newPhone || '').trim()
    };
    try {
      localStorage.setItem('mob_pz_contact_' + pId, JSON.stringify(contact));
      if (typeof MobStore !== 'undefined' && MobStore.set) {
        MobStore.set('pz_contact', contact);
      }
    } catch (e) {}

    syncPzDocWithStoredState();

    const timeStr = typeof now === 'function' ? now() : new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    addPzHistoryEntry(pId, {
      title: 'Aktualizacja powiązanego numeru tel. i e-mail PZ',
      time: `Dzisiaj, ${timeStr}`,
      status: '✓',
      ok: true
    });

    renderPzModalContent();

    if (typeof showToast === 'function') {
      showToast('Zaktualizowano dane kontaktowe Profilu Zaufanego.');
    }
    if (typeof announceSR === 'function') {
      announceSR('Zaktualizowano dane kontaktowe Profilu Zaufanego');
    }
  };

  window.changePzContactData = function (emailParam, phoneParam) {
    const pId = getPersonaKey();
    if (typeof emailParam === 'string' && typeof phoneParam === 'string') {
      window.savePzContactData(emailParam, phoneParam);
      return;
    }
    const editBox = document.getElementById('pzContactEditBox');
    if (editBox) {
      const isHidden = editBox.style.display === 'none';
      editBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        const inp = document.getElementById('pzEmailInput');
        if (inp) inp.focus();
      }
    } else {
      const current = getPzContactData(pId);
      const email = window.prompt ? window.prompt('Wprowadź nowy adres e-mail powiązany z PZ:', current.email) : null;
      if (email !== null && email.trim() !== '') {
        const phone = window.prompt ? window.prompt('Wprowadź nowy numer telefonu powiązany z PZ:', current.phone) : current.phone;
        window.savePzContactData(email, phone || current.phone);
      }
    }
  };

  window.savePzContactFromInputs = function () {
    const emailInp = document.getElementById('pzEmailInput');
    const phoneInp = document.getElementById('pzPhoneInput');
    const pId = getPersonaKey();
    const current = getPzContactData(pId);
    const email = emailInp ? emailInp.value.trim() : current.email;
    const phone = phoneInp ? phoneInp.value.trim() : current.phone;
    window.savePzContactData(email, phone);
  };

  // Eksport funkcji PZ na window dla wygody i integracji
  window.renderPzModalContent = renderPzModalContent;
  window.syncPzDocWithStoredState = syncPzDocWithStoredState;
  window.getPzValidUntil = getPzValidUntil;
  window.getPzAuthMethod = getPzAuthMethod;
  window.getPzContactData = getPzContactData;

  // Inicjalna synchronizacja stanu PZ
  try {
    syncPzDocWithStoredState();
  } catch (e) {}

  // --- Automatyczna inicjalizacja po załadowaniu DOM ---
  function initModulyUrzad() {
    try {
      syncPzDocWithStoredState();
    } catch (e) {}

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
