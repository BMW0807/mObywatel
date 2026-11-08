/* ==========================================================================
   mObywatel 2.0 - Moduł Globalnej Wyszukiwarki Spraw i Spotlight (spotlight.js)
   Wyszukiwarka spraw publicznych, autocomplete, dopasowanie fuzzy oraz integracja z AI
   ========================================================================== */

(function (root) {
  'use strict';

  // 1. Pełna baza 28 spraw publicznych w 6 kategoriach
  const CASES_DATABASE = [
    // --- Kategoria 1: Zdrowie ---
    {
      id: 'zdrowie-recepty',
      title: 'e-Recepty',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Aktywne e-recepty w IKP, kod kreskowy w aptece i 4-cyfrowy PIN',
      icon: '💊',
      badge: 'IKP / Apteka',
      keywords: ['recepta', 'recepty', 'leki', 'antybiotyk', 'apteka', 'pin', 'farmaceuta', 'dawkowanie', 'ikp', 'kod kreskowy'],
      query: 'Moje aktywne e-recepty w IKP i dawkowanie leków',
      viewAction: function () {
        if (typeof openIkpModal === 'function') {
          openIkpModal('recepty');
        } else if (typeof openDoc === 'function') {
          openDoc('ikp');
        }
      }
    },
    {
      id: 'zdrowie-skierowania',
      title: 'e-Skierowania',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Skierowania na badania diagnostyczne, rezonans, USG i do poradni NFZ',
      icon: '📋',
      badge: 'NFZ Badania',
      keywords: ['skierowanie', 'skierowania', 'badania', 'usg', 'rezonans', 'poradnia', 'specjalista', 'tomografia', 'krew'],
      query: 'Jakie mam ważne e-skierowania i gdzie mogę umówić wizytę?',
      viewAction: function () {
        if (typeof openIkpModal === 'function') {
          openIkpModal('skierowania');
        } else if (typeof openERejestracjaModal === 'function') {
          openERejestracjaModal();
        }
      }
    },
    {
      id: 'zdrowie-lekarz-poz',
      title: 'Lekarz POZ',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Twój lekarz rodzinny, dane przychodni rejonowej i rejestracja na wizytę',
      icon: '🏥',
      badge: 'Podstawowa Opieka',
      keywords: ['lekarz poz', 'lekarz', 'poz', 'przychodnia', 'rodzinny', 'internista', 'kontakt', 'wizyta', 'pielegniarka'],
      query: 'Kto jest moim lekarzem rodzinnym POZ i jaki jest numer przychodni?',
      viewAction: function () {
        if (typeof openIkpModal === 'function') {
          openIkpModal('poz');
        } else if (typeof openERejestracjaModal === 'function') {
          openERejestracjaModal();
        }
      }
    },
    {
      id: 'zdrowie-ekuz',
      title: 'Karta EKUZ',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Europejska Karta Ubezpieczenia Zdrowotnego – leczenie w UE/EFTA',
      icon: '🇪🇺',
      badge: 'Unia Europejska',
      keywords: ['ekuz', 'karta ekuz', 'europa', 'ue', 'wyjazd', 'ubezpieczenie za granica', 'leczenie w ue', 'podroz'],
      query: 'Jak wyrobić lub okazać Kartę EKUZ na wyjazd do Unii Europejskiej?',
      viewAction: function () {
        if (typeof openEkuzModal === 'function') {
          openEkuzModal();
        } else if (typeof openIkpModal === 'function') {
          openIkpModal('ewus');
        }
      }
    },
    {
      id: 'zdrowie-ewus',
      title: 'eWUŚ',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Elektroniczna weryfikacja prawa do bezpłatnych świadczeń NFZ (zielony status)',
      icon: '🛡️',
      badge: 'Status NFZ',
      keywords: ['ewus', 'nfz', 'ubezpieczenie zdrowotne', 'status ubezpieczenia', 'skladka zdrowotna', 'zielony ewus', 'uprawnienia'],
      query: 'Czy mam aktywny zielony status ubezpieczenia zdrowotnego eWUŚ w NFZ?',
      viewAction: function () {
        if (typeof openIkpModal === 'function') {
          openIkpModal('ewus');
        }
      }
    },
    {
      id: 'zdrowie-dilo',
      title: 'DiLO',
      category: 'Zdrowie',
      catKey: 'zdrowie',
      desc: 'Karta Szybkiej Terapii Onkologicznej i koordynator leczenia NFZ',
      icon: '🎗️',
      badge: 'Szybka Terapia',
      keywords: ['dilo', 'karta dilo', 'onkologia', 'rak', 'nowotwor', 'terapia onkologiczna', 'koordynator nfz', 'zielona karta'],
      query: 'Jak działa Karta Szybkiej Terapii Onkologicznej DiLO?',
      viewAction: function () {
        if (typeof openDiloModal === 'function') {
          openDiloModal();
        } else if (typeof openIkpModal === 'function') {
          openIkpModal('ewus');
        }
      }
    },

    // --- Kategoria 2: Dokumenty ---
    {
      id: 'dok-mdowod',
      title: 'mDowód',
      category: 'Dokumenty',
      catKey: 'dokumenty',
      desc: 'Cyfrowy dowód tożsamości – seria, numer, PESEL i termin ważności',
      icon: '🪪',
      badge: 'Tożsamość',
      keywords: ['mdowod', 'dowod', 'dowod osobisty', 'tozsamosc', 'seria dowodu', 'dane osobowe', 'pesel'],
      query: 'Pokaż mój dowód osobisty mDowód i termin ważności dokumentu',
      viewAction: function () {
        if (typeof openDoc === 'function') {
          openDoc('dowod');
        }
      }
    },
    {
      id: 'dok-pesel',
      title: 'Zastrzeż PESEL',
      category: 'Dokumenty',
      catKey: 'dokumenty',
      desc: 'Blokada wyłudzeń kredytów i rejestr instytucji sprawdzających PESEL',
      icon: '🔒',
      badge: 'Bezpieczeństwo',
      keywords: ['zastrzez pesel', 'pesel', 'bezpieczenstwo', 'blokada pesel', 'kredyt', 'wyludzenie', 'zlodziej', 'rejestr zastrzezen'],
      query: 'Zastrzeż mój numer PESEL w urzędowym rejestrze i sprawdź historię',
      viewAction: function () {
        if (typeof openZastrzezPeselModal === 'function') {
          openZastrzezPeselModal();
        }
      }
    },
    {
      id: 'dok-paszport',
      title: 'Paszport',
      category: 'Dokumenty',
      catKey: 'dokumenty',
      desc: 'Wniosek o paszport biometryczny, termin ważności i status gotowości',
      icon: '📘',
      badge: 'Dokument RP',
      keywords: ['paszport', 'wniosek paszport', 'paszport dla dziecka', 'waznosc paszportu', 'wyjazd poza ue', 'granica'],
      query: 'Jak złożyć wniosek o paszport lub sprawdzić czy jest gotowy do odbioru?',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Wniosek o paszport', null, true);
        } else if (typeof send === 'function') {
          send('Jak złożyć wniosek o paszport i sprawdzić termin odbioru?');
        }
      }
    },
    {
      id: 'dok-kdr',
      title: 'Karta Dużej Rodziny',
      category: 'Dokumenty',
      catKey: 'dokumenty',
      desc: 'Zniżki kolejowe, handlowe i komunalne dla rodzin z trójką lub więcej dzieci',
      icon: '👨‍👩‍👧‍👦',
      badge: 'Dla Rodzin',
      keywords: ['karta duzej rodziny', 'kdr', 'rodzina', 'ulgi', 'znizki', 'pkp', 'znizka na paliwo', 'troje dzieci'],
      query: 'Jakie zniżki daje Karta Dużej Rodziny i jak z niej korzystać?',
      viewAction: function () {
        if (typeof DOCS !== 'undefined' && DOCS.some(x => x.id === 'kdr') && typeof openDoc === 'function') {
          openDoc('kdr');
        } else if (typeof startTopic === 'function') {
          startTopic('Karta Dużej Rodziny', null, true);
        } else if (typeof send === 'function') {
          send('Moja Karta Dużej Rodziny i przysługujące ulgi');
        }
      }
    },
    {
      id: 'dok-legitymacja',
      title: 'mLegitymacja',
      category: 'Dokumenty',
      catKey: 'dokumenty',
      desc: 'Legitymacja szkolna lub studencka – ulga 51% na przejazdy PKP i MPK',
      icon: '🎓',
      badge: 'Student / Uczeń',
      keywords: ['mlegitymacja', 'legitymacja', 'student', 'szkola', 'uczen', 'znizka pkp', 'politechnika', 'studia', 'nr albumu'],
      query: 'Pokaż moją mLegitymację i przysługujące zniżki studenckie/szkolne',
      viewAction: function () {
        if (typeof DOCS !== 'undefined' && DOCS.some(x => x.id === 'leg') && typeof openDoc === 'function') {
          openDoc('leg');
        } else if (typeof startTopic === 'function') {
          startTopic('mLegitymacja szkolna i studencka', null, true);
        } else if (typeof send === 'function') {
          send('Jak dodać lub okazać mLegitymację studencką/szkolną?');
        }
      }
    },

    // --- Kategoria 3: Kierowca i pojazdy ---
    {
      id: 'kier-mprawo-jazdy',
      title: 'mPrawo jazdy',
      category: 'Kierowca i pojazdy',
      catKey: 'kierowca',
      desc: 'Cyfrowe prawo jazdy, kategorie uprawnień (np. Kat. B) i data ważności',
      icon: '🪪',
      badge: 'Uprawnienia',
      keywords: ['mprawo jazdy', 'prawo jazdy', 'kierowca', 'kategoria b', 'uprawnienia', 'blankiet', 'kierowanie'],
      query: 'Pokaż moje mPrawo jazdy i termin ważności uprawnień',
      viewAction: function () {
        if (typeof openDoc === 'function') {
          openDoc('pj');
        }
      }
    },
    {
      id: 'kier-punkty-karne',
      title: 'Punkty karne',
      category: 'Kierowca i pojazdy',
      catKey: 'kierowca',
      desc: 'Aktualny stan punktów karnych z CEPiK, limit 24/20 pkt i historia naruszeń',
      icon: '⚠️',
      badge: 'CEPiK',
      keywords: ['punkty karne', 'punkty', 'mandat', 'cepik', 'policja', 'limit punktow', 'ile mam punktow', 'drogowe'],
      query: 'Ile mam aktualnie punktów karnych na koncie kierowcy w CEPiK?',
      viewAction: function () {
        if (typeof openPointsDetail === 'function') {
          openPointsDetail();
        }
      }
    },
    {
      id: 'kier-mandaty',
      title: 'Mandaty CEPiK',
      category: 'Kierowca i pojazdy',
      catKey: 'kierowca',
      desc: 'Wykaz mandatów karnych, historia wpłat i przedawnienie punktów (1 rok)',
      icon: '📑',
      badge: 'Policja / CANARD',
      keywords: ['mandaty cepik', 'mandaty', 'mandat', 'zaplac mandat', 'kara', 'fotoradar', 'grzywna', 'oplata mandatu'],
      query: 'Sprawdź moje mandaty karne w CEPiK i status płatności',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Mandaty karne i historia punktów', null, true);
        } else if (typeof send === 'function') {
          send('Sprawdź historię moich mandatów karnych w CEPiK');
        }
      }
    },
    {
      id: 'kier-bezpieczny-autobus',
      title: 'Bezpieczny autobus',
      category: 'Kierowca i pojazdy',
      catKey: 'kierowca',
      desc: 'Weryfikacja badań technicznych, polisy OC i stanu autokaru w CEPiK',
      icon: '🚌',
      badge: 'Bezpieczeństwo',
      keywords: ['bezpieczny autobus', 'autobus', 'autokar', 'wycieczka szkolna', 'rej autobus', 'kontrola skp', 'pojazd'],
      query: 'Sprawdź stan techniczny i polisę autobusu wycieczkowego w bazie CEPiK',
      viewAction: function () {
        if (typeof openBezpiecznyAutobusModal === 'function') {
          openBezpiecznyAutobusModal('KR 12345');
        }
      }
    },
    {
      id: 'kier-oc-badanie',
      title: 'OC i badanie',
      category: 'Kierowca i pojazdy',
      catKey: 'kierowca',
      desc: 'Termin ubezpieczenia OC pojazdu i data badania technicznego w stacji SKP',
      icon: '🚗',
      badge: 'Pojazd',
      keywords: ['oc i badanie', 'oc', 'badanie techniczne', 'przeglad', 'auto', 'pojazd', 'dowod rejestracyjny', 'warta', 'pzu'],
      query: 'Kiedy kończy się polisa OC i badanie techniczne mojego auta?',
      viewAction: function () {
        if (typeof openDoc === 'function') {
          openDoc('auto');
        }
      }
    },

    // --- Kategoria 4: Finanse i podatki ---
    {
      id: 'fin-eplatnosci',
      title: 'ePłatności',
      category: 'Finanse i podatki',
      catKey: 'finanse',
      desc: 'Opłacanie podatków lokalnych, opłat za odpady i należności urzędowych',
      icon: '💳',
      badge: 'Samorząd',
      keywords: ['eplatnosci', 'platnosci', 'podatki', 'urzad skarbowy', 'oplata za smieci', 'gmina', 'podatek'],
      query: 'Jakie mam oczekujące ePłatności urzędowe i podatki lokalne?',
      viewAction: function () {
        if (typeof openEPlatnosciModal === 'function') {
          openEPlatnosciModal();
        }
      }
    },
    {
      id: 'fin-podatek-nieruchomosci',
      title: 'Podatek od nieruchomości',
      category: 'Finanse i podatki',
      catKey: 'finanse',
      desc: 'Raty podatku lokalnego za mieszkanie, dom lub grunt z płatnością BLIK',
      icon: '🏠',
      badge: 'Podatek Gminny',
      keywords: ['podatek od nieruchomosci', 'nieruchomosc', 'mieszkanie', 'grunt', 'oplata lokalna', 'rata podatku', 'dom'],
      query: 'Kiedy mija termin płatności podatku od nieruchomości i jak zapłacić BLIK?',
      viewAction: function () {
        if (typeof openEPlatnosciModal === 'function') {
          openEPlatnosciModal();
        }
      }
    },
    {
      id: 'fin-epit',
      title: 'ePIT',
      category: 'Finanse i podatki',
      catKey: 'finanse',
      desc: 'Rozliczenie zeznania rocznego PIT w usłudze Twój e-PIT Ministerstwa Finansów',
      icon: '📊',
      badge: 'Twój e-PIT',
      keywords: ['epit', 'pit', 'twoj epit', 'zeznanie podatkowe', 'zwrot podatku', 'ulga prorodzinna', 'urzad skarbowy', 'rozliczenie roczne'],
      query: 'Kiedy otrzymam zwrot podatku z Twój e-PIT i jak zaakceptować zeznanie?',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Rozliczenie Twój e-PIT', null, true);
        } else if (typeof send === 'function') {
          send('Jak rozliczyć Twój e-PIT i sprawdzić zwrot podatku?');
        }
      }
    },
    {
      id: 'fin-blik',
      title: 'BLIK',
      category: 'Finanse i podatki',
      catKey: 'finanse',
      desc: 'Szybkie i bezpieczne płatności urzędowe kodem BLIK z banku bez prowizji',
      icon: '⚡',
      badge: '0 zł prowizji',
      keywords: ['blik', 'platnosc blik', 'kod blik', 'oplata bez prowizji', 'przelew blik', 'platnosc w urzedzie'],
      query: 'Jak zapłacić kodem BLIK za sprawę urzędową w mObywatelu?',
      viewAction: function () {
        if (typeof openEPlatnosciModal === 'function') {
          openEPlatnosciModal();
        }
      }
    },

    // --- Kategoria 5: Firma i CEIDG ---
    {
      id: 'firma-poswiadcz',
      title: 'Poświadcz za firmę',
      category: 'Firma i CEIDG',
      catKey: 'firma',
      desc: 'Certyfikat reprezentacji przedsiębiorcy i spółki w CEIDG z kodem QR',
      icon: '🏢',
      badge: 'CEIDG / KRS',
      keywords: ['poswiadcz za firme', 'firma', 'ceidg', 'nip', 'reprezentacja', 'regon', 'wlasna dzialalnosc', 'przedsiebiorca'],
      query: 'Jak poświadczyć tożsamość przedsiębiorcy i uprawnienia do reprezentacji firmy?',
      viewAction: function () {
        if (typeof openFirmaPoswiadczModal === 'function') {
          openFirmaPoswiadczModal();
        } else if (typeof openDoc === 'function') {
          openDoc('firma');
        }
      }
    },
    {
      id: 'firma-biala-lista',
      title: 'Biała lista VAT',
      category: 'Firma i CEIDG',
      catKey: 'firma',
      desc: 'Wykaz zarejestrowanych podatników VAT Ministerstwa Finansów i rachunków firmowych',
      icon: '📑',
      badge: 'Ministerstwo Finansów',
      keywords: ['biala lista vat', 'vat', 'biala lista', 'rachunek bankowy firmy', 'kontrahent', 'mf', 'czynny podatnik vat'],
      query: 'Jak sprawdzić numer konta kontrahenta na Białej Liście Podatników VAT?',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Biała lista podatników VAT', null, true);
        } else if (typeof send === 'function') {
          send('Sprawdź kontrahenta na Białej Liście Podatników VAT');
        }
      }
    },
    {
      id: 'firma-zaswiadczenie-ceidg',
      title: 'Zaświadczenie CEIDG',
      category: 'Firma i CEIDG',
      catKey: 'firma',
      desc: 'Urzędowy wypis z rejestru przedsiębiorców CEIDG w PDF z cyfrową pieczęcią RP',
      icon: '📜',
      badge: 'Odpis PDF',
      keywords: ['zaswiadczenie ceidg', 'ceidg pdf', 'wypis ceidg', 'odpis firmy', 'rejestr przedsiebiorcow', 'dokument urzedowy'],
      query: 'Pobierz urzędowe zaświadczenie o wpisie do rejestru CEIDG (PDF)',
      viewAction: function () {
        if (typeof openOfficialCertificate === 'function') {
          openOfficialCertificate('ceidg');
        } else if (typeof openDoc === 'function') {
          openDoc('firma');
        }
      }
    },
    {
      id: 'firma-podpis-edowod',
      title: 'Podpis e-dowodem',
      category: 'Firma i CEIDG',
      catKey: 'firma',
      desc: 'Złożenie kwalifikowanego podpisu elektronicznego certyfikatem e-dowodu',
      icon: '✍️',
      badge: 'Podpis Cyfrowy',
      keywords: ['podpis e-dowodem', 'podpis elektroniczny', 'podpisz', 'e-dowod', 'certyfikat podpisu', 'face id', 'podpisanie umowy'],
      query: 'Jak podpisać dokument cyfrowy e-dowodem z certyfikatem tożsamości?',
      viewAction: function () {
        if (typeof openFirmaPodpisModal === 'function') {
          openFirmaPodpisModal();
        }
      }
    },

    // --- Kategoria 6: Sytuacje życiowe ---
    {
      id: 'zycie-zgubiony-portfel',
      title: 'Zgubiony portfel',
      category: 'Sytuacje życiowe',
      catKey: 'sytuacje',
      desc: 'Natychmiastowe zastrzeżenie dowodu osobistego, PESEL-u i kart płatniczych',
      icon: '👛',
      badge: 'Procedura SOS',
      keywords: ['zgubiony portfel', 'zgubilam portfel', 'zgubilem portfel', 'kradziez', 'utrata dokumentow', 'uniewaznij dowod', 'kradziez tozsamosci'],
      query: 'Zgubiłem portfel i dowód osobisty – instrukcja co zrobić natychmiast',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Zgubiłam portfel i dokumenty', null, true);
        } else if (typeof send === 'function') {
          send('Zgubiłem portfel – instrukcja krok po kroku jak zastrzec dokumenty');
        }
      }
    },
    {
      id: 'zycie-stluczka',
      title: 'Stłuczka drogowa',
      category: 'Sytuacje życiowe',
      catKey: 'sytuacje',
      desc: 'Wspólne oświadczenie o zdarzeniu drogowym, wymiana danych i polisa sprawcy',
      icon: '💥',
      badge: 'Kolizja',
      keywords: ['stluczka drogowa', 'stluczka', 'kolizja', 'wypadek', 'oswiadczenie sprawcy', 'spisanie oswiadczenia', 'szkoda komunikacyjna'],
      query: 'Miałem stłuczkę drogową – jak bezpiecznie spisać oświadczenie kolizyjne?',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Miałam stłuczkę samochodową', null, true);
        } else if (typeof send === 'function') {
          send('Miałem stłuczkę drogową – jak sporządzić oświadczenie sprawcy?');
        }
      }
    },
    {
      id: 'zycie-noworodek',
      title: 'Noworodek w rodzinie',
      category: 'Sytuacje życiowe',
      catKey: 'sytuacje',
      desc: 'Zgłoszenie narodzin dziecka w USC, nadanie PESEL oraz wniosek o 800+ i becikowe',
      icon: '👶',
      badge: 'Narodziny',
      keywords: ['noworodek w rodzinie', 'noworodek', 'dziecko', 'narodziny', 'urodzenie', 'usc', '800+', 'becikowe', 'zus swiadczenie'],
      query: 'Urodziło się nam dziecko – jakie formalności załatwić w urzędzie i ZUS?',
      viewAction: function () {
        if (typeof startTopic === 'function') {
          startTopic('Urodziło nam się dziecko', null, true);
        } else if (typeof send === 'function') {
          send('Urodziło nam się dziecko – jak zgłosić narodziny i złożyć wniosek o 800+?');
        }
      }
    },
    {
      id: 'zycie-wyjazd-zagranica',
      title: 'Wyjazd za granicę',
      category: 'Sytuacje życiowe',
      catKey: 'sytuacje',
      desc: 'Karta EKUZ, paszport, ubezpieczenie turystyczne i zasady bezpiecznej podróży',
      icon: '✈️',
      badge: 'Podróż',
      keywords: ['wyjazd za granice', 'wyjazd', 'wakacje', 'podroz', 'ekuz za granica', 'roaming', 'paszport podroz', 'odprawa'],
      query: 'Wyjeżdżam za granicę – jak przygotować dokumenty i ubezpieczenie EKUZ?',
      viewAction: function () {
        if (typeof openEkuzModal === 'function') {
          openEkuzModal();
        } else if (typeof startTopic === 'function') {
          startTopic('Wyjazd za granicę – poradnik', null, true);
        }
      }
    }
  ];

  const CATEGORIES = [
    { key: 'all', label: 'Wszystkie', icon: '✨' },
    { key: 'zdrowie', label: 'Zdrowie', icon: '💊' },
    { key: 'dokumenty', label: 'Dokumenty', icon: '🪪' },
    { key: 'kierowca', label: 'Kierowca i pojazdy', icon: '🚗' },
    { key: 'finanse', label: 'Finanse i podatki', icon: '💳' },
    { key: 'firma', label: 'Firma i CEIDG', icon: '🏢' },
    { key: 'sytuacje', label: 'Sytuacje życiowe', icon: '🧭' }
  ];

  // 2. Normalizacja tekstu i inteligentny algorytm fuzzy match
  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[łŁ]/g, 'l')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function computeFuzzyScore(item, rawQuery) {
    const qNorm = normalizeText(rawQuery);
    if (!qNorm || qNorm.length < 2) return 0;

    const tNorm = normalizeText(item.title);
    const dNorm = normalizeText(item.desc);
    const cNorm = normalizeText(item.category);
    const kwNorm = item.keywords.map(normalizeText);

    let score = 0;

    // Dokładne dopasowanie tytułu
    if (tNorm === qNorm) return 200;

    // Słowo w tytule
    const titleWords = tNorm.split(' ');
    if (titleWords.includes(qNorm)) score += 130;

    // Początek tytułu
    if (tNorm.startsWith(qNorm)) score += 120;
    else if (tNorm.includes(qNorm)) score += 80;

    // Słowa kluczowe
    for (const kw of kwNorm) {
      if (kw === qNorm) {
        score = Math.max(score, 110);
      } else if (kw.startsWith(qNorm)) {
        score = Math.max(score, 75);
      } else if (kw.includes(qNorm)) {
        score = Math.max(score, 50);
      }
    }

    // Opis i kategoria
    if (dNorm.includes(qNorm)) score += 35;
    if (cNorm.includes(qNorm)) score += 30;

    // Dopasowanie sekwencji znaków (subsequence fuzzy match dla literówek)
    if (score === 0 && qNorm.length >= 3) {
      let tIdx = 0;
      let matchedCount = 0;
      for (let i = 0; i < qNorm.length; i++) {
        const char = qNorm[i];
        const nextIdx = tNorm.indexOf(char, tIdx);
        if (nextIdx !== -1) {
          matchedCount++;
          tIdx = nextIdx + 1;
        }
      }
      if (matchedCount === qNorm.length) {
        score = 25;
      }
    }

    return score;
  }

  function searchCases(query, activeCategory = 'all') {
    const raw = (query || '').trim();
    let pool = CASES_DATABASE;
    if (activeCategory && activeCategory !== 'all') {
      pool = pool.filter(it => it.catKey === activeCategory);
    }

    if (!raw || raw.length < 2) {
      // Gdy brak zapytania, zwróć całą kategorię
      return pool.map(item => ({ item, score: 1 }));
    }

    const scored = [];
    for (const item of pool) {
      const score = computeFuzzyScore(item, raw);
      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightMatches(text, rawQuery) {
    if (!rawQuery || rawQuery.trim().length < 2) return escapeHtml(text);
    const qNorm = normalizeText(rawQuery);
    if (!qNorm) return escapeHtml(text);

    // Proste podświetlenie pierwszego wystąpienia
    const tNorm = normalizeText(text);
    const idx = tNorm.indexOf(qNorm);
    if (idx !== -1) {
      const before = escapeHtml(text.slice(0, idx));
      const match = escapeHtml(text.slice(idx, idx + qNorm.length));
      const after = escapeHtml(text.slice(idx + qNorm.length));
      return `${before}<mark class="sp-match">${match}</mark>${after}`;
    }
    return escapeHtml(text);
  }

  // 3. Wstrzyknięcie dedykowanych stylów Spotlight i Autocomplete
  function injectSpotlightStyles() {
    if (document.getElementById('spotlight-styles')) return;
    const style = document.createElement('style');
    style.id = 'spotlight-styles';
    style.textContent = `
      /* --- Modal Spotlight --- */
      #spotlightModal {
        position: absolute;
        inset: 0;
        z-index: 100;
        pointer-events: none;
        opacity: 0;
        transition: opacity .22s cubic-bezier(.16,1,.3,1);
      }
      #spotlightModal.open {
        pointer-events: auto;
        opacity: 1;
      }
      #spotlightModal .scrim {
        position: absolute;
        inset: 0;
        background: rgba(12, 16, 26, .58);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }
      #spotlightModal {
        position: absolute;
        inset: 0;
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }
      .spotlight-box {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        max-height: 88%;
        height: 88%;
        background: var(--surface, #ffffff);
        border-radius: 26px 26px 0 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(100%);
        transition: transform .28s cubic-bezier(.16,1,.3,1);
        box-shadow: 0 -14px 44px rgba(12, 18, 38, .32);
        border-top: 1px solid rgba(255,255,255,.2);
      }
      #spotlightModal.open .spotlight-box {
        transform: translateY(0);
      }
      .sp-grabber {
        width: 38px;
        height: 4px;
        border-radius: 99px;
        background: var(--ink3, #c5cad6);
        margin: 10px auto 4px;
        flex: none;
        opacity: .7;
      }
      .sp-header {
        padding: 8px 18px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex: none;
      }
      .sp-head-titles h2 {
        margin: 0;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: -.02em;
        color: var(--ink, #11141a);
      }
      .sp-head-titles small {
        display: block;
        font-size: 12px;
        color: var(--ink2, #5a6475);
        margin-top: 2px;
      }
      .sp-close-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 0;
        background: var(--bg, #f2f3f7);
        color: var(--ink, #11141a);
        display: grid;
        place-items: center;
        cursor: pointer;
        flex: none;
        transition: background .15s;
      }
      .sp-close-btn:hover {
        background: #e4e7ed;
      }
      .sp-close-btn svg {
        width: 18px;
        height: 18px;
      }

      /* Wyszukiwarka wewnątrz Spotlight */
      .sp-search-bar {
        padding: 0 16px 10px;
        flex: none;
      }
      .sp-input-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--bg, #f2f3f7);
        border: 1.5px solid var(--hair, #e1e4ec);
        border-radius: 16px;
        padding: 10px 14px;
        transition: border-color .15s, box-shadow .15s;
      }
      .sp-input-wrap:focus-within {
        border-color: var(--red, #dc143c);
        box-shadow: 0 0 0 3px var(--red-wash, rgba(220,20,60,.1));
        background: var(--surface, #ffffff);
      }
      .sp-input-wrap svg.sp-input-ic {
        width: 20px;
        height: 20px;
        color: var(--ink2, #5a6475);
        flex: none;
      }
      .sp-input-field {
        border: 0;
        background: none;
        flex: 1;
        font-size: 15px;
        font-weight: 500;
        color: var(--ink, #11141a);
        outline: none;
        min-width: 0;
      }
      .sp-input-field::placeholder {
        color: var(--ink3, #8a94a6);
      }
      .sp-clear-btn {
        border: 0;
        background: var(--ink3, #c5cad6);
        color: #fff;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
      }

      /* Kafelki / Zakładki kategorii */
      .sp-categories {
        display: flex;
        gap: 6px;
        padding: 0 16px 10px;
        overflow-x: auto;
        flex: none;
        scrollbar-width: none;
      }
      .sp-categories::-webkit-scrollbar {
        display: none;
      }
      .sp-cat-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        border-radius: 99px;
        border: 1px solid var(--hair, #e1e4ec);
        background: var(--bg, #f2f3f7);
        color: var(--ink, #11141a);
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: all .15s;
      }
      .sp-cat-chip:hover {
        background: #e7eaef;
      }
      .sp-cat-chip.active {
        background: var(--red, #dc143c);
        color: #ffffff;
        border-color: var(--red, #dc143c);
        box-shadow: 0 2px 8px rgba(220,20,60,.28);
      }

      /* Lista wyników */
      .sp-results-wrap {
        flex: 1;
        overflow-y: auto;
        padding: 4px 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        -webkit-overflow-scrolling: touch;
      }
      .sp-section-title {
        font-size: 11.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--ink2, #5a6475);
        margin: 6px 0 2px 4px;
      }

      /* Karta pojedynczej sprawy */
      .sp-item-card {
        background: var(--bg, #f8f9fc);
        border: 1px solid var(--hair, #e2e5ec);
        border-radius: 16px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color .15s, background .15s, transform .1s;
        outline: none;
      }
      .sp-item-card:hover,
      .sp-item-card.active {
        background: var(--surface, #ffffff);
        border-color: var(--red, #dc143c);
        box-shadow: 0 4px 14px rgba(15,25,60,.08);
      }
      .sp-card-main {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
      }
      .sp-card-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--red-wash, rgba(220,20,60,.09));
        display: grid;
        place-items: center;
        font-size: 20px;
        flex: none;
      }
      .sp-card-body {
        flex: 1;
        min-width: 0;
      }
      .sp-card-headline {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .sp-card-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--ink, #11141a);
      }
      .sp-badge {
        font-size: 10.5px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(17,20,26,.06);
        color: var(--ink2, #5a6475);
      }
      .sp-badge-cat {
        font-size: 10.5px;
        font-weight: 600;
        color: var(--red, #dc143c);
        background: var(--red-wash, rgba(220,20,60,.08));
      }
      .sp-card-desc {
        font-size: 12.5px;
        line-height: 16px;
        color: var(--ink2, #5a6475);
        margin-top: 3px;
      }
      .sp-match {
        background: rgba(220,20,60,.18);
        color: var(--red, #dc143c);
        padding: 0 2px;
        border-radius: 3px;
        font-weight: 700;
      }

      /* Przyciski akcji na kafelku sprawy */
      .sp-card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 4px;
        border-top: 1px dashed var(--hair, #e6e9f0);
      }
      .sp-act-btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        border: 0;
        transition: transform .1s, background .15s;
      }
      .sp-act-btn:active {
        transform: scale(.97);
      }
      .sp-act-view {
        background: var(--red, #dc143c);
        color: #ffffff;
      }
      .sp-act-view:hover {
        background: #ba1033;
      }
      .sp-act-ai {
        background: var(--surface, #ffffff);
        color: var(--ink, #11141a);
        border: 1px solid var(--hair, #dce0e9);
      }
      .sp-act-ai:hover {
        background: #eef1f6;
      }

      /* Brak wyników / Zapytaj AI */
      .sp-empty-box {
        text-align: center;
        padding: 30px 16px;
        background: var(--bg, #f8f9fc);
        border-radius: 18px;
        border: 1px dashed var(--hair, #dce0e9);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .sp-empty-icon {
        font-size: 36px;
      }
      .sp-empty-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--ink, #11141a);
      }
      .sp-empty-sub {
        font-size: 13px;
        color: var(--ink2, #5a6475);
        max-width: 280px;
        margin: 0;
      }
      .sp-ask-ai-direct {
        margin-top: 8px;
        background: var(--red, #dc143c);
        color: #fff;
        border: 0;
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(220,20,60,.25);
      }

      /* --- Nowe style dla podpowiedzi w czacie (#searchSuggest) --- */
      #searchSuggest .ss-item-rich {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        background: none;
        border: 1px solid transparent;
        width: 100%;
        text-align: left;
        transition: background .15s, border-color .15s;
        cursor: pointer;
      }
      #searchSuggest .ss-item-rich:hover,
      #searchSuggest .ss-item-rich.active {
        background: var(--bg, #f2f3f7);
        border-color: var(--hair, #e0e4eb);
      }
      #searchSuggest .ss-row-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      #searchSuggest .ss-rich-ic {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--red-wash, rgba(220,20,60,.08));
        display: grid;
        place-items: center;
        font-size: 15px;
        flex: none;
      }
      #searchSuggest .ss-rich-text {
        flex: 1;
        min-width: 0;
      }
      #searchSuggest .ss-rich-text b {
        display: block;
        font-size: 13.5px;
        color: var(--ink, #11141a);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #searchSuggest .ss-rich-text small {
        display: block;
        font-size: 11px;
        color: var(--ink2, #5a6475);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #searchSuggest .ss-btn-group {
        display: flex;
        gap: 6px;
        margin-left: 38px;
      }
      #searchSuggest .ss-pill-btn {
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        border: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      #searchSuggest .ss-pill-view {
        background: var(--red, #dc143c);
        color: #fff;
      }
      #searchSuggest .ss-pill-ai {
        background: var(--surface, #ffffff);
        color: var(--ink, #11141a);
        border: 1px solid var(--hair, #dce0e9);
      }

      /* --- Tryb ciemny --- */
      .phone.dark-mode .spotlight-box {
        background: #181d28;
        color: #f0f3fa;
        border-top-color: rgba(255,255,255,0.1);
      }
      .phone.dark-mode .sp-head-titles h2 { color: #f0f3fa; }
      .phone.dark-mode .sp-head-titles small { color: #9aa5b8; }
      .phone.dark-mode .sp-close-btn { background: #232a39; color: #f0f3fa; }
      .phone.dark-mode .sp-input-wrap { background: #232a39; border-color: #333d52; }
      .phone.dark-mode .sp-input-field { color: #ffffff; }
      .phone.dark-mode .sp-cat-chip { background: #232a39; border-color: #333d52; color: #d0d7e5; }
      .phone.dark-mode .sp-item-card { background: #1e2433; border-color: #2b3447; }
      .phone.dark-mode .sp-item-card:hover,
      .phone.dark-mode .sp-item-card.active { background: #242c3d; border-color: var(--red, #dc143c); }
      .phone.dark-mode .sp-card-title { color: #f0f3fa; }
      .phone.dark-mode .sp-badge { background: rgba(255,255,255,.08); color: #c0cadb; }
      .phone.dark-mode .sp-act-ai { background: #262f42; color: #f0f3fa; border-color: #38455e; }
      .phone.dark-mode .sp-empty-box { background: #1e2433; border-color: #333d52; }
      .phone.dark-mode .sp-empty-title { color: #f0f3fa; }
      .phone.dark-mode #searchSuggest .ss-item-rich:hover,
      .phone.dark-mode #searchSuggest .ss-item-rich.active { background: #232a39; border-color: #38455e; }
      .phone.dark-mode #searchSuggest .ss-rich-text b { color: #ffffff; }
      .phone.dark-mode #searchSuggest .ss-pill-ai { background: #283244; color: #fff; border-color: #3d4a63; }

      /* --- Wysoki kontrast --- */
      .high-contrast .spotlight-box {
        background: #000 !important;
        border: 2px solid #fff !important;
      }
      .high-contrast .sp-input-wrap {
        background: #000 !important;
        border: 2px solid #fff !important;
      }
      .high-contrast .sp-item-card {
        background: #111 !important;
        border: 2px solid #fff !important;
      }
      .high-contrast .sp-card-title { color: #fff !important; }
      .high-contrast .sp-card-desc { color: #ffd700 !important; }
      .high-contrast .sp-cat-chip.active {
        background: #ffd700 !important;
        color: #000 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 4. Budowa drzewa DOM modułu Spotlight
  let activeCategory = 'all';
  let currentSearchResults = [];
  let selectedSpotlightIdx = -1;
  let previousFocusedElement = null;

  function ensureSpotlightDOM() {
    if (document.getElementById('spotlightModal')) return;

    const app = document.getElementById('app') || document.body;
    if (!app) return;
    const modal = document.createElement('div');
    modal.className = 'sheet-modal';
    modal.id = 'spotlightModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'spotlightTitle');

    modal.innerHTML = `
      <div class="scrim" id="spotlightScrim"></div>
      <div class="spotlight-box" role="document">
        <div class="sp-grabber" aria-hidden="true"></div>
        <div class="sp-header">
          <div class="sp-head-titles">
            <h2 id="spotlightTitle">Wyszukiwarka spraw</h2>
            <small>Katalog 28 spraw mObywatela i asystent AI</small>
          </div>
          <button type="button" class="sp-close-btn" id="spotlightCloseBtn" aria-label="Zamknij wyszukiwarkę">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="sp-search-bar">
          <div class="sp-input-wrap">
            <svg class="sp-input-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input type="text" id="spotlightSearchInput" class="sp-input-field" placeholder="Szukaj: np. recepty, punkty, pesel, stłuczka..." autocomplete="off" enterkeyhint="search" aria-label="Wyszukaj sprawę publiczną" role="combobox" aria-autocomplete="list" aria-controls="spotlightResultsList" aria-expanded="true">
            <button type="button" class="sp-clear-btn" id="spotlightClearBtn" aria-label="Wyczyść zapytanie" hidden>×</button>
          </div>
        </div>

        <div class="sp-categories" role="tablist" aria-label="Kategorie spraw">
          ${CATEGORIES.map(c => `
            <button type="button" class="sp-cat-chip ${c.key === 'all' ? 'active' : ''}" data-cat="${c.key}" role="tab" aria-selected="${c.key === 'all'}">
              <span>${c.icon}</span> ${c.label}
            </button>
          `).join('')}
        </div>

        <div class="sp-results-wrap" id="spotlightResultsList" role="listbox" aria-label="Wyniki wyszukiwania"></div>
      </div>
    `;

    app.appendChild(modal);

    // Event listenery dla modalu
    const scrim = document.getElementById('spotlightScrim');
    if (scrim) scrim.onclick = closeSpotlight;

    const closeBtn = document.getElementById('spotlightCloseBtn');
    if (closeBtn) closeBtn.onclick = closeSpotlight;

    const searchInput = document.getElementById('spotlightSearchInput');
    const clearBtn = document.getElementById('spotlightClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const val = this.value;
        if (clearBtn) clearBtn.hidden = !val.length;
        renderSpotlightList(val, activeCategory);
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.onclick = function () {
        searchInput.value = '';
        clearBtn.hidden = true;
        searchInput.focus();
        renderSpotlightList('', activeCategory);
      };
    }

    // Obsługa zakładek kategorii
    const catChips = modal.querySelectorAll('.sp-cat-chip');
    catChips.forEach(chip => {
      chip.onclick = function () {
        if (typeof haptic === 'function') haptic('tap');
        catChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        activeCategory = this.dataset.cat;
        renderSpotlightList(searchInput.value, activeCategory);
      };
    });

    // Obsługa klawiatury w Spotlight (strzałki góra/dół, Enter, Escape)
    if (modal.addEventListener) modal.addEventListener('keydown', handleSpotlightKeydown);
  }

  // 5. Renderowanie listy wyników w oknie Spotlight
  function renderSpotlightList(query, cat) {
    const listEl = document.getElementById('spotlightResultsList');
    if (!listEl) return;

    selectedSpotlightIdx = -1;
    const matches = searchCases(query, cat);
    currentSearchResults = matches.map(m => m.item);

    if (!matches.length) {
      const qEsc = escapeHtml(query);
      listEl.innerHTML = `
        <div class="sp-empty-box">
          <span class="sp-empty-icon">🔍</span>
          <div class="sp-empty-title">Nie znaleziono bezpośredniej sprawy</div>
          <p class="sp-empty-sub">Brak dopasowania w katalogu. Możesz zapytać o to asystenta AI.</p>
          <button type="button" class="sp-ask-ai-direct" id="spDirectAskBtn">
            <span>💬</span> Zapytaj asystenta: „${qEsc}”
          </button>
        </div>
      `;
      const askBtn = document.getElementById('spDirectAskBtn');
      if (askBtn) {
        askBtn.onclick = function () {
          closeSpotlight();
          if (typeof send === 'function') send(query);
        };
      }
      return;
    }

    const isFiltered = query.trim().length >= 2;
    let html = '';
    if (!isFiltered) {
      const activeCatObj = CATEGORIES.find(c => c.key === cat);
      html += `<div class="sp-section-title">${activeCatObj ? activeCatObj.label : 'Wszystkie sprawy'} (${matches.length})</div>`;
    } else {
      html += `<div class="sp-section-title">Znalezione sprawy (${matches.length})</div>`;
    }

    html += matches.map((m, idx) => {
      const item = m.item;
      const titleHl = highlightMatches(item.title, query);
      const descHl = highlightMatches(item.desc, query);

      return `
        <div class="sp-item-card" data-idx="${idx}" role="option" tabindex="0" id="sp-item-${idx}">
          <div class="sp-card-main" onclick="SPOTLIGHT.triggerAction('${item.id}', 'primary')">
            <div class="sp-card-icon">${item.icon}</div>
            <div class="sp-card-body">
              <div class="sp-card-headline">
                <span class="sp-card-title">${titleHl}</span>
                <span class="sp-badge sp-badge-cat">${item.category}</span>
                ${item.badge ? `<span class="sp-badge">${item.badge}</span>` : ''}
              </div>
              <div class="sp-card-desc">${descHl}</div>
            </div>
          </div>
          <div class="sp-card-actions">
            <button type="button" class="sp-act-btn sp-act-view" onclick="event.stopPropagation(); SPOTLIGHT.triggerAction('${item.id}', 'view')" aria-label="Otwórz widok: ${item.title}">
              <span>🚀</span> Przejdź do widoku
            </button>
            <button type="button" class="sp-act-btn sp-act-ai" onclick="event.stopPropagation(); SPOTLIGHT.triggerAction('${item.id}', 'ai')" aria-label="Zapytaj asystenta AI o: ${item.title}">
              <span>💬</span> Zapytaj AI
            </button>
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;
  }

  // 6. Obsługa klawiatury w modalu Spotlight
  function handleSpotlightKeydown(e) {
    const modal = document.getElementById('spotlightModal');
    if (!modal || !modal.classList.contains('open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSpotlight();
      return;
    }

    const items = modal.querySelectorAll('.sp-item-card');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSpotlightIdx = (selectedSpotlightIdx + 1) % items.length;
      updateSpotlightItemSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSpotlightIdx = (selectedSpotlightIdx - 1 + items.length) % items.length;
      updateSpotlightItemSelection(items);
    } else if (e.key === 'Enter') {
      if (selectedSpotlightIdx >= 0 && selectedSpotlightIdx < currentSearchResults.length) {
        e.preventDefault();
        const activeItem = currentSearchResults[selectedSpotlightIdx];
        triggerAction(activeItem.id, 'primary');
      }
    }
  }

  function updateSpotlightItemSelection(items) {
    items.forEach((it, i) => {
      const isSel = i === selectedSpotlightIdx;
      it.classList.toggle('active', isSel);
      it.setAttribute('aria-selected', isSel ? 'true' : 'false');
      if (isSel) {
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        const input = document.getElementById('spotlightSearchInput');
        if (input) input.setAttribute('aria-activedescendant', it.id);
      }
    });
  }

  // 7. Otwieranie / zamykanie Spotlight
  function openSpotlight(initialQuery = '') {
    ensureSpotlightDOM();
    injectSpotlightStyles();

    const modal = document.getElementById('spotlightModal');
    if (!modal) return;

    previousFocusedElement = document.activeElement;
    if (typeof haptic === 'function') haptic('card');

    modal.classList.add('open');
    if (typeof announceSR === 'function') {
      announceSR('Otwarto globalną wyszukiwarkę spraw mObywatela');
    }

    const searchInput = document.getElementById('spotlightSearchInput');
    const clearBtn = document.getElementById('spotlightClearBtn');
    if (searchInput) {
      searchInput.value = initialQuery;
      clearBtn.hidden = !initialQuery.length;
      renderSpotlightList(initialQuery, activeCategory);
      setTimeout(() => searchInput.focus(), 80);
    }
  }

  function closeSpotlight() {
    const modal = document.getElementById('spotlightModal');
    if (!modal || !modal.classList.contains('open')) return;

    if (typeof haptic === 'function') haptic('tap');
    modal.classList.remove('open');

    if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
      previousFocusedElement.focus();
    }
  }

  function toggleSpotlight() {
    const modal = document.getElementById('spotlightModal');
    if (modal && modal.classList.contains('open')) {
      closeSpotlight();
    } else {
      openSpotlight();
    }
  }

  // 8. Wykonywanie akcji wybranej sprawy
  function triggerAction(caseId, type = 'primary') {
    const found = CASES_DATABASE.find(c => c.id === caseId);
    if (!found) return;

    if (typeof haptic === 'function') haptic('success');
    closeSpotlight();

    if (type === 'ai') {
      // Wyślij zapytanie do asystenta AI
      if (typeof send === 'function') {
        send(found.query || found.title);
      }
    } else if (type === 'view') {
      // Otwórz bezpośredni widok / modal
      if (typeof found.viewAction === 'function') {
        found.viewAction();
      } else if (typeof send === 'function') {
        send(found.query || found.title);
      }
    } else {
      // Primary click: preferuj widok, a jeśli brak, AI
      if (typeof found.viewAction === 'function') {
        found.viewAction();
      } else if (typeof send === 'function') {
        send(found.query || found.title);
      }
    }
  }

  // 9. Autocomplete nad kompozytorem czatu (#searchSuggest i #prompt)
  let promptSuggestMatches = [];
  let promptSuggestSelectedIdx = -1;

  function initPromptAutocomplete() {
    const promptInput = document.getElementById('prompt');
    const suggest = document.getElementById('searchSuggest');
    if (!promptInput || !suggest) return;

    function hideSuggest() {
      suggest.hidden = true;
      suggest.innerHTML = '';
      promptSuggestSelectedIdx = -1;
      promptSuggestMatches = [];
    }

    function renderSuggest(matches, query) {
      if (!matches.length) {
        hideSuggest();
        return;
      }
      promptSuggestMatches = matches.slice(0, 4);
      promptSuggestSelectedIdx = -1;

      suggest.innerHTML = promptSuggestMatches.map((item, idx) => {
        const titleHl = highlightMatches(item.title, query);
        return `
          <div class="ss-item-rich" data-idx="${idx}" data-id="${item.id}" role="option" id="ss-rich-${idx}">
            <div class="ss-row-head" onclick="SPOTLIGHT.triggerPromptSuggest(${idx}, 'primary')">
              <span class="ss-rich-ic">${item.icon}</span>
              <span class="ss-rich-text">
                <b>${titleHl}</b>
                <small>${item.desc}</small>
              </span>
              <span class="ss-badge">${item.category}</span>
            </div>
            <div class="ss-btn-group">
              <button type="button" class="ss-pill-btn ss-pill-view" onclick="event.stopPropagation(); SPOTLIGHT.triggerPromptSuggest(${idx}, 'view')">
                🚀 Przejdź do widoku
              </button>
              <button type="button" class="ss-pill-btn ss-pill-ai" onclick="event.stopPropagation(); SPOTLIGHT.triggerPromptSuggest(${idx}, 'ai')">
                💬 Zapytaj AI
              </button>
            </div>
          </div>
        `;
      }).join('');

      suggest.hidden = false;
    }

    // Przechwytujemy zdarzenie input w fazie capture, aby nadpisać stary handler z accessibility.js
    promptInput.addEventListener('input', function (e) {
      e.stopImmediatePropagation();
      const val = promptInput.value.trim();
      if (val.length < 2) {
        hideSuggest();
        return;
      }
      const matches = searchCases(val, 'all').map(m => m.item);
      renderSuggest(matches, val);
    }, true);

    // Klawiatura nad polem #prompt (strzałki, Enter, Escape)
    promptInput.addEventListener('keydown', function (e) {
      if (suggest.hidden) return;
      const items = suggest.querySelectorAll('.ss-item-rich');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopImmediatePropagation();
        promptSuggestSelectedIdx = (promptSuggestSelectedIdx + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('active', i === promptSuggestSelectedIdx));
        if (items[promptSuggestSelectedIdx]) {
          items[promptSuggestSelectedIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopImmediatePropagation();
        promptSuggestSelectedIdx = (promptSuggestSelectedIdx - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('active', i === promptSuggestSelectedIdx));
        if (items[promptSuggestSelectedIdx]) {
          items[promptSuggestSelectedIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter' && promptSuggestSelectedIdx >= 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        triggerPromptSuggest(promptSuggestSelectedIdx, 'primary');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        hideSuggest();
      }
    }, true);

    // Zamknięcie po kliknięciu poza podpowiedzi
    document.addEventListener('click', function (e) {
      if (!suggest.contains(e.target) && e.target !== promptInput) {
        hideSuggest();
      }
    });
  }

  function triggerPromptSuggest(idx, type = 'primary') {
    if (idx < 0 || idx >= promptSuggestMatches.length) return;
    const item = promptSuggestMatches[idx];
    const suggest = document.getElementById('searchSuggest');
    const promptInput = document.getElementById('prompt');

    if (suggest) {
      suggest.hidden = true;
      suggest.innerHTML = '';
    }
    if (promptInput) {
      promptInput.value = '';
    }

    triggerAction(item.id, type);
  }

  // 10. Podpięcie pod #searchPill
  function initSearchPill() {
    const pill = document.getElementById('searchPill');
    if (!pill) return;

    // Przechwytujemy kliknięcie w pill (faza capture) aby otworzyć interfejs Spotlight
    pill.addEventListener('click', function (e) {
      // Jeśli kliknięto w przycisk mikrofonu w pillu, nie otwieraj spotlight (pozwól zadziałać mikrofonowi)
      if (e.target.closest('.sp-mic-btn')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openSpotlight();
    }, true);

    pill.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSpotlight();
      }
    });
  }

  // 11. Skrót klawiszowy Ctrl+K / Cmd+K
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleSpotlight();
      }
    });
  }

  // Publiczne API
  const SPOTLIGHT = {
    cases: CASES_DATABASE,
    categories: CATEGORIES,
    search: searchCases,
    open: openSpotlight,
    close: closeSpotlight,
    toggle: toggleSpotlight,
    triggerAction: triggerAction,
    triggerPromptSuggest: triggerPromptSuggest,
    init: function () {
      injectSpotlightStyles();
      ensureSpotlightDOM();
      initSearchPill();
      initPromptAutocomplete();
      initKeyboardShortcuts();
    }
  };

  root.SPOTLIGHT = SPOTLIGHT;

  // Inicjalizacja po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SPOTLIGHT.init());
  } else {
    SPOTLIGHT.init();
  }

})(typeof window !== 'undefined' ? window : this);
