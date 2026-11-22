/* ==========================================================================
   mObywatel 2.0 - Moduły Zdrowie & ZUS (moduly-zdrowie.js)
   Obsługa:
   1. ZUS i Zwolnienia Lekarskie (e-ZLA / L4, zasiłki chorobowe, e-Wizyty, PUE ZUS)
   2. Elektroniczna Karta Szczepień (IKP, szczepienia obowiązkowe i zalecane, dawki przypominające)
   3. Unijny Certyfikat Szczepienia (Kod QR UCC / IKP, eksport PDF)
   ========================================================================== */

(function () {
  'use strict';

  // --- Baza Danych Medycznych i ZUS dla 4 Person ---
  const ZDROWIE_DB = {
    jan: {
      id: 'jan',
      imieNazwisko: 'Jan Wiśniewski',
      pesel: '83051203455',
      urodzenie: '12.05.1983',
      ubezpieczenieZus: {
        tytul: 'Działalność gospodarcza (Wiśniewski Instalacje)',
        nip: '6792345679',
        oddzial: 'ZUS I Oddział w Krakowie, ul. Pędzichów 27',
        statusSkladkowy: 'Składki opłacane terminowo (konto czyste)',
        chorobowe: 'Dobrowolne ubezpieczenie chorobowe aktywne',
        podstawaWymiaru: 5348.00 // podstawa miesięczna w zł
      },
      activeZla: {
        id: 'zla_2026_jan_01',
        seriaNr: 'e-ZLA/2026/PL-883190',
        dataWystawienia: '18.11.2026',
        okresOd: '18.11.2026',
        okresDo: '24.11.2026',
        dni: 7,
        kodChoroby: 'J20.9',
        opisChoroby: 'Ostre zapalenie oskrzeli, nieokreślone',
        zaleceniaKod: '1',
        zaleceniaOpis: 'Chory powinien leżeć',
        lekarz: 'lek. med. Tomasz Lis',
        lekarzSpec: 'specjalista chorób wewnętrznych (PWZ 5821904)',
        placowka: 'NZOZ Przychodnia Rejonowa Kraków-Śródmieście, ul. Dietla 42',
        statusPrzekazania: 'Przekazano automatycznie do ZUS i profilu PUE płatnika',
        dataDoreczenia: '18.11.2026, godz. 11:42',
        stawkaProcent: 80,
        podstawaDzienna: 142.61,
        kwotaLaczna: 998.27,
        organWyplacajacy: 'ZUS I Oddział w Krakowie (wypłata bezpośrednia na konto)',
        statusZasilku: 'Wniosek Z-3b przekazany do ZUS • Zasiłek zatwierdzony do wypłaty',
        dniPozostalo: 2
      },
      historiaZla: [
        {
          id: 'zla_h_jan_1',
          seriaNr: 'e-ZLA/2026/PL-412890',
          okresOd: '12.01.2026',
          okresDo: '19.01.2026',
          dni: 8,
          kodChoroby: 'S60.0',
          opisChoroby: 'Uraz stłuczeniowy palca ręki prawej',
          zaleceniaOpis: 'Chory może chodzić',
          lekarz: 'dr n. med. Janusz Kruk',
          placowka: 'Szpital Specjalistyczny im. J. Dietla w Krakowie',
          stawkaProcent: 80,
          kwotaLaczna: 1140.88,
          status: 'Wypłacono i rozliczono przez ZUS'
        },
        {
          id: 'zla_h_jan_2',
          seriaNr: 'e-ZLA/2025/PL-992144',
          okresOd: '03.11.2025',
          okresDo: '09.11.2025',
          dni: 7,
          kodChoroby: 'J02.9',
          opisChoroby: 'Ostre zapalenie gardła',
          zaleceniaOpis: 'Chory powinien leżeć',
          lekarz: 'lek. med. Tomasz Lis',
          placowka: 'NZOZ Przychodnia Rejonowa Kraków-Śródmieście',
          stawkaProcent: 80,
          kwotaLaczna: 945.84,
          status: 'Wypłacono i rozliczono przez ZUS'
        },
        {
          id: 'zla_h_jan_3',
          seriaNr: 'e-ZLA/2025/PL-302195',
          okresOd: '14.04.2025',
          okresDo: '20.04.2025',
          dni: 7,
          kodChoroby: 'M54.5',
          opisChoroby: 'Ból okolicy lędźwiowo-krzyżowej',
          zaleceniaOpis: 'Chory może chodzić',
          lekarz: 'lek. med. Tomasz Zieliński',
          placowka: 'Przychodnia Podgórze',
          stawkaProcent: 80,
          kwotaLaczna: 945.84,
          status: 'Wypłacono i rozliczono przez ZUS'
        }
      ],
      szczepienia: {
        reminder: {
          tekst: 'Kolejna dawka przypominająca: Tężec / Błonica za 14 miesięcy (styczeń 2028 r.)',
          choroba: 'Tężec i Błonica (dTpa)',
          miesiecy: 14,
          termin: '01.2028'
        },
        obowiazkowe: [
          {
            id: 'szcz_jan_wzwb',
            choroba: 'Wirusowe Zapalenie Wątroby typu B (WZW B)',
            preparat: 'Engerix B (20 µg / 1 ml)',
            seria: 'ENG-2024-88A',
            data: '14.05.2024',
            dawka: 'Cykl podstawowy ukończony (3/3)',
            punkt: 'NZOZ Przychodnia Rejonowa Kraków-Śródmieście',
            lekarz: 'lek. med. Tomasz Lis',
            podal: 'piel. Danuta Wójcik',
            certId: 'UCC/PL/2024/091244-WZW',
            waznosc: 'Odporność wieloletnia'
          },
          {
            id: 'szcz_jan_tezec',
            choroba: 'Błonica, Tężec, Krztusiec (dTpa)',
            preparat: 'Boostrix (zawiesina we wstrzykiwaczu)',
            seria: 'BST-2018-91K',
            data: '18.01.2018',
            dawka: 'Dawka przypominająca (ważność 10 lat)',
            punkt: 'Wojskowa Specjalistyczna Przychodnia Lekarska',
            lekarz: 'lek. med. Andrzej Duda',
            podal: 'st. piel. Ewa Baran',
            certId: 'UCC/PL/2018/118274-TET',
            waznosc: 'Ważne do 01.2028'
          },
          {
            id: 'szcz_jan_polio',
            choroba: 'Poliomyelitis (Choroba Heinego-Medina)',
            preparat: 'Imovax Polio',
            seria: 'POL-1998-04B',
            data: '12.06.1998',
            dawka: 'Cykl wieku dziecięcego (4/4)',
            punkt: 'Przychodnia Rejonowa nr 3 w Krakowie',
            lekarz: 'dr Wanda Kaczmarek',
            podal: 'piel. K. Zając',
            certId: 'UCC/PL/1998/001928-POL',
            waznosc: 'Odporność trwała'
          }
        ],
        zalecane: [
          {
            id: 'szcz_jan_covid26',
            choroba: 'COVID-19 (Szczepienie adaptowane)',
            preparat: 'Comirnaty Omicron JN.1 (30 µg)',
            seria: 'FP-2026-9932',
            data: '15.10.2026',
            dawka: 'Dawka przypominająca (sezon 2026/2027)',
            punkt: 'Punkt Szczepień Szpital Dietla w Krakowie',
            lekarz: 'dr n. med. Janusz Kruk',
            podal: 'mgr piel. Anna Bąk',
            certId: 'UCC/PL/2026/COVID-883190',
            hasUcc: true,
            waznosc: 'Ważny w całej Unii Europejskiej'
          },
          {
            id: 'szcz_jan_grypa26',
            choroba: 'Grypa sezonowa',
            preparat: 'Vaxigrip Tetra 2026/2027 (zawiesina)',
            seria: 'VAX-2026-4410',
            data: '02.10.2026',
            dawka: '1 dawka (ochrona sezon 2026/2027)',
            punkt: 'Apteka Słoneczna Kraków, ul. Dietla 12',
            lekarz: 'mgr farm. Piotr Majewski',
            podal: 'mgr farm. Piotr Majewski',
            certId: 'UCC/PL/2026/FLU-331902',
            hasUcc: true,
            waznosc: 'Sezon epidemiologiczny 2026/2027'
          },
          {
            id: 'szcz_jan_kzm',
            choroba: 'Kleszczowe Zapalenie Mózgu (KZM)',
            preparat: 'FSME-Immun 0.5 ml',
            seria: 'FSM-2025-1082',
            data: '10.04.2025',
            dawka: 'Dawka przypominająca 1 (ochrona 3-letnia)',
            punkt: 'NZOZ Przychodnia Rejonowa Kraków-Śródmieście',
            lekarz: 'lek. med. Tomasz Lis',
            podal: 'piel. Danuta Wójcik',
            certId: 'UCC/PL/2025/KZM-901824',
            hasUcc: true,
            waznosc: 'Ważne do 04.2028'
          }
        ]
      }
    },

    marta: {
      id: 'marta',
      imieNazwisko: 'Marta Kowalska',
      pesel: '91071427765',
      urodzenie: '14.07.1991',
      ubezpieczenieZus: {
        tytul: 'Umowa o pracę (Urząd m.st. Warszawy)',
        nip: '5252248481',
        oddzial: 'ZUS I Oddział w Warszawie, ul. Senatorska 6/8',
        statusSkladkowy: 'Składki opłacane w terminie przez pracodawcę',
        chorobowe: 'Obowiązkowe ubezpieczenie chorobowe aktywne',
        podstawaWymiaru: 6850.00
      },
      activeZla: {
        id: 'zla_2026_marta_01',
        seriaNr: 'e-ZLA/2026/PL-551920',
        dataWystawienia: '19.11.2026',
        okresOd: '19.11.2026',
        okresDo: '23.11.2026',
        dni: 5,
        kodChoroby: 'H66.0',
        opisChoroby: 'Ostre ropne zapalenie ucha środkowego (Opieka nad dzieckiem: Jan Kowalski, 3 lata)',
        zaleceniaKod: '2',
        zaleceniaOpis: 'Chory może chodzić (opieka domowa)',
        lekarz: 'lek. med. Anna Jabłońska',
        lekarzSpec: 'pediatra i lekarz rodzinny (PWZ 4412093)',
        placowka: 'NZOZ Przychodnia Rodzinna Mokotów, ul. Puławska 112, Warszawa',
        statusPrzekazania: 'Przekazano automatycznie do Urzędu m.st. Warszawy oraz ZUS',
        dataDoreczenia: '19.11.2026, godz. 09:15',
        stawkaProcent: 80,
        podstawaDzienna: 182.67,
        kwotaLaczna: 913.35,
        organWyplacajacy: 'Zasiłek opiekuńczy ZUS wypłacany z listą płac Urzędu m.st. Warszawy',
        statusZasilku: 'Wniosek Z-15A złożony elektronicznie • Świadczenie naliczone',
        dniPozostalo: 1
      },
      historiaZla: [
        {
          id: 'zla_h_marta_1',
          seriaNr: 'e-ZLA/2026/PL-119283',
          okresOd: '12.03.2026',
          okresDo: '16.03.2026',
          dni: 5,
          kodChoroby: 'J00',
          opisChoroby: 'Ostry nieżyt nosa i gardła',
          zaleceniaOpis: 'Chory powinien leżeć',
          lekarz: 'lek. med. Anna Jabłońska',
          placowka: 'NZOZ Mokotów',
          stawkaProcent: 80,
          kwotaLaczna: 913.35,
          status: 'Wynagrodzenie chorobowe wypłacone przez pracodawcę'
        },
        {
          id: 'zla_h_marta_2',
          seriaNr: 'e-ZLA/2025/PL-772189',
          okresOd: '10.10.2025',
          okresDo: '17.10.2025',
          dni: 8,
          kodChoroby: 'Z76.2',
          opisChoroby: 'Opieka nad chorym dzieckiem (Zofia Kowalska)',
          zaleceniaOpis: 'Chory może chodzić',
          lekarz: 'lek. med. Anna Jabłońska',
          placowka: 'NZOZ Mokotów',
          stawkaProcent: 80,
          kwotaLaczna: 1392.80,
          status: 'Zasiłek opiekuńczy rozliczony i wypłacony'
        }
      ],
      szczepienia: {
        reminder: {
          tekst: 'Kolejna dawka przypominająca: Krztusiec / Tężec za 22 miesiące (wrzesień 2028 r.)',
          choroba: 'Krztusiec / Tężec (dTap)',
          miesiecy: 22,
          termin: '09.2028'
        },
        obowiazkowe: [
          {
            id: 'szcz_m_wzwb',
            choroba: 'WZW typu B',
            preparat: 'Engerix B',
            seria: 'ENG-2015-12K',
            data: '10.02.2015',
            dawka: 'Cykl podstawowy (3/3 dawki)',
            punkt: 'Przychodnia Rejonowa Mokotów',
            lekarz: 'lek. med. Piotr Adamski',
            podal: 'piel. Danuta Wieczorek',
            certId: 'UCC/PL/2015/881290-WZW',
            waznosc: 'Odporność stała'
          },
          {
            id: 'szcz_m_mmr',
            choroba: 'Odra, Świnka, Różyczka (MMR)',
            preparat: 'Priorix',
            seria: 'MMR-2001-44B',
            data: '14.09.2001',
            dawka: 'Szczepienie wieku młodzieńczego',
            punkt: 'Przychodnia Dziecięca Warszawa',
            lekarz: 'dr Maria Wójcik',
            podal: 'piel. A. Lis',
            certId: 'UCC/PL/2001/339102-MMR',
            waznosc: 'Odporność trwała'
          }
        ],
        zalecane: [
          {
            id: 'szcz_m_covid',
            choroba: 'COVID-19 (JN.1)',
            preparat: 'Comirnaty Omicron JN.1',
            seria: 'FP-2026-7712',
            data: '22.09.2026',
            dawka: 'Dawka przypominająca sezon 2026/2027',
            punkt: 'Punkt Szczepień Szpital Bielański',
            lekarz: 'lek. med. Anna Jabłońska',
            podal: 'piel. Danuta Wieczorek',
            certId: 'UCC/PL/2026/COVID-551920',
            hasUcc: true,
            waznosc: 'Ważny w całej Unii Europejskiej'
          },
          {
            id: 'szcz_m_flu',
            choroba: 'Grypa sezonowa',
            preparat: 'Influvac Tetra 2026/2027',
            seria: 'INF-2026-8812',
            data: '05.10.2026',
            dawka: '1 dawka sezonowa',
            punkt: 'NZOZ Mokotów',
            lekarz: 'lek. med. Anna Jabłońska',
            podal: 'piel. Danuta Wieczorek',
            certId: 'UCC/PL/2026/FLU-992144',
            hasUcc: true,
            waznosc: 'Sezon 2026/2027'
          },
          {
            id: 'szcz_m_hpv',
            choroba: 'Wirus brodawczaka ludzkiego (HPV)',
            preparat: 'Gardasil 9',
            seria: 'GAR-2023-119',
            data: '18.11.2023',
            dawka: 'Pełny cykl 3 dawek ukończony',
            punkt: 'Centrum Medyczne Żelazna',
            lekarz: 'dr n. med. Marek Szymański',
            podal: 'położna Ewa Maj',
            certId: 'UCC/PL/2023/HPV-441208',
            hasUcc: true,
            waznosc: 'Ochrona wieloletnia'
          }
        ]
      }
    },

    ewa: {
      id: 'ewa',
      imieNazwisko: 'Ewa Nowak',
      pesel: '69020312845',
      urodzenie: '03.02.1969',
      ubezpieczenieZus: {
        tytul: 'Umowa o pracę (Szkoła Podstawowa nr 24 w Lublinie)',
        nip: '7122849102',
        oddzial: 'ZUS Oddział w Lublinie, ul. Tomasz Zana 36/38',
        statusSkladkowy: 'Składki opłacane terminowo',
        chorobowe: 'Obowiązkowe ubezpieczenie chorobowe aktywne',
        podstawaWymiaru: 4550.00
      },
      activeZla: null, // brak aktywnego L4 w tym momencie
      historiaZla: [
        {
          id: 'zla_h_ewa_1',
          seriaNr: 'e-ZLA/2026/PL-339182',
          okresOd: '14.07.2026',
          okresDo: '28.07.2026',
          dni: 15,
          kodChoroby: 'M54.4',
          opisChoroby: 'Rwa kulszowa z lumbalgią',
          zaleceniaOpis: 'Chory powinien leżeć',
          lekarz: 'lek. med. Janusz Kruk',
          placowka: 'Przychodnia Rodzinna Śródmieście w Lublinie',
          stawkaProcent: 80,
          kwotaLaczna: 1819.95,
          status: 'Wypłacone przez pracodawcę (wynagrodzenie chorobowe)'
        },
        {
          id: 'zla_h_ewa_2',
          seriaNr: 'e-ZLA/2025/PL-881290',
          okresOd: '15.02.2025',
          okresDo: '22.02.2025',
          dni: 8,
          kodChoroby: 'J04.0',
          opisChoroby: 'Ostre zapalenie krtani (schorzenie narządu głosu)',
          zaleceniaOpis: 'Chory powinien leżeć (oszczędzanie głosu)',
          lekarz: 'lek. med. Janusz Kowalczyk',
          placowka: 'Przychodnia Rodzinna Śródmieście',
          stawkaProcent: 80,
          kwotaLaczna: 921.60,
          status: 'Rozliczone i wypłacone w terminie'
        }
      ],
      szczepienia: {
        reminder: {
          tekst: 'Kolejna dawka przypominająca: Grypa sezonowa na jesień 2027 r. (za 10 miesięcy)',
          choroba: 'Grypa sezonowa',
          miesiecy: 10,
          termin: '09.2027'
        },
        obowiazkowe: [
          {
            id: 'szcz_e_tezec',
            choroba: 'Błonica i Tężec (Td)',
            preparat: 'Tetana (adsorbowana)',
            seria: 'TET-2022-44A',
            data: '12.05.2022',
            dawka: 'Dawka przypominająca (ważność 10 lat)',
            punkt: 'Przychodnia Rodzinna Śródmieście, Lublin',
            lekarz: 'lek. med. Janusz Kruk',
            podal: 'piel. Bożena Mazur',
            certId: 'UCC/PL/2022/991204-TET',
            waznosc: 'Ważne do 05.2032'
          }
        ],
        zalecane: [
          {
            id: 'szcz_e_pneumo',
            choroba: 'Pneumokoki (Profilaktyka 50+)',
            preparat: 'Prevenar 20 (skoniugowana 20-walentna)',
            seria: 'PRE-2026-901',
            data: '14.09.2026',
            dawka: '1 dawka – pełna ochrona trwała',
            punkt: 'Przychodnia Rodzinna Śródmieście w Lublinie',
            lekarz: 'lek. med. Janusz Kruk',
            podal: 'piel. Bożena Mazur',
            certId: 'UCC/PL/2026/PNE-690203',
            hasUcc: true,
            waznosc: 'Ochrona wieloletnia'
          },
          {
            id: 'szcz_e_covid',
            choroba: 'COVID-19 (JN.1)',
            preparat: 'Comirnaty Omicron JN.1',
            seria: 'FP-2026-3391',
            data: '28.09.2026',
            dawka: 'Dawka przypominająca sezon 2026/2027',
            punkt: 'SPSK nr 1 w Lublinie',
            lekarz: 'lek. med. Janusz Kruk',
            podal: 'piel. Bożena Mazur',
            certId: 'UCC/PL/2026/COVID-339182',
            hasUcc: true,
            waznosc: 'Ważny w całej Unii Europejskiej'
          },
          {
            id: 'szcz_e_grypa',
            choroba: 'Grypa sezonowa',
            preparat: 'Vaxigrip Tetra',
            seria: 'VAX-2026-118',
            data: '08.10.2026',
            dawka: '1 dawka bezpłatna (program dla nauczycieli)',
            punkt: 'Apteka Lubelska',
            lekarz: 'mgr farm. Anna Kot',
            podal: 'mgr farm. Anna Kot',
            certId: 'UCC/PL/2026/FLU-881290',
            hasUcc: true,
            waznosc: 'Sezon 2026/2027'
          }
        ]
      }
    },

    kacper: {
      id: 'kacper',
      imieNazwisko: 'Kacper Zieliński',
      pesel: '06232141719',
      urodzenie: '21.03.2006',
      ubezpieczenieZus: {
        tytul: 'Ubezpieczenie studenckie (Politechnika Gdańska)',
        nip: '5840203593',
        oddzial: 'ZUS Oddział w Gdańsku, ul. Chmielna 27/33',
        statusSkladkowy: 'Zgłoszony do ubezpieczenia zdrowotnego przez uczelnię',
        chorobowe: 'Brak ubezpieczenia chorobowego (student < 26 lat)',
        podstawaWymiaru: 0.00
      },
      activeZla: null,
      historiaZla: [
        {
          id: 'zla_h_kacper_1',
          seriaNr: 'e-ZLA/2026/PL-994102',
          okresOd: '10.02.2026',
          okresDo: '14.02.2026',
          dni: 5,
          kodChoroby: 'J03.0',
          opisChoroby: 'Ostre paciorkowcowe zapalenie migdałków podniebiennych (Angina)',
          zaleceniaOpis: 'Chory powinien leżeć',
          lekarz: 'lek. med. Piotr Czarnecki',
          placowka: 'Akademicka Przychodnia Studencka, Gdańsk',
          stawkaProcent: 0,
          kwotaLaczna: 0.00,
          status: 'Przekazano elektronicznie do Dziekanatu WETI Politechniki Gdańskiej'
        }
      ],
      szczepienia: {
        reminder: {
          tekst: 'Kolejna dawka przypominająca: Tężec / Błonica za 5 lat (rok 2031)',
          choroba: 'Tężec / Błonica (dT)',
          miesiecy: 60,
          termin: '03.2031'
        },
        obowiazkowe: [
          {
            id: 'szcz_k_wzwb',
            choroba: 'Wirusowe Zapalenie Wątroby typu B',
            preparat: 'Engerix B',
            seria: 'ENG-2021-33X',
            data: '14.09.2021',
            dawka: 'Cykl 3 dawek ukończony',
            punkt: 'Akademicka Przychodnia Studencka, Gdańsk',
            lekarz: 'lek. med. Piotr Czarnecki',
            podal: 'piel. Krystyna Nowak',
            certId: 'UCC/PL/2021/449102-WZW',
            waznosc: 'Odporność stała'
          },
          {
            id: 'szcz_k_tezec',
            choroba: 'Błonica, Tężec, Krztusiec (dTpa)',
            preparat: 'Boostrix',
            seria: 'BST-2021-99T',
            data: '18.10.2021',
            dawka: 'Dawka przypominająca w 19. roku życia',
            punkt: 'Przychodnia Szkolna Gdańsk',
            lekarz: 'lek. med. Piotr Czarnecki',
            podal: 'piel. Krystyna Nowak',
            certId: 'UCC/PL/2021/773190-TET',
            waznosc: 'Ważne do 10.2031'
          },
          {
            id: 'szcz_k_mmr',
            choroba: 'Odra, Świnka, Różyczka',
            preparat: 'MMR VaxPro',
            seria: 'MMR-2016-09P',
            data: '15.03.2016',
            dawka: 'Dawka uzupełniająca w 10. roku życia',
            punkt: 'Przychodnia nr 1 w Gdańsku',
            lekarz: 'dr Ewa Nowicka',
            podal: 'piel. M. Adamska',
            certId: 'UCC/PL/2016/110293-MMR',
            waznosc: 'Odporność trwała'
          }
        ],
        zalecane: [
          {
            id: 'szcz_k_covid',
            choroba: 'COVID-19 (JN.1)',
            preparat: 'Comirnaty Omicron JN.1',
            seria: 'FP-2026-5510',
            data: '05.10.2026',
            dawka: 'Dawka przypominająca sezon 2026/2027',
            punkt: 'Akademicka Przychodnia Studencka',
            lekarz: 'lek. med. Piotr Czarnecki',
            podal: 'piel. Krystyna Nowak',
            certId: 'UCC/PL/2026/COVID-062321',
            hasUcc: true,
            waznosc: 'Ważny w całej Unii Europejskiej'
          },
          {
            id: 'szcz_k_kzm',
            choroba: 'Kleszczowe Zapalenie Mózgu (KZM)',
            preparat: 'FSME-Immun 0.5 ml',
            seria: 'FSM-2025-441',
            data: '20.05.2025',
            dawka: 'Dawka 2/3 (przed obozem żeglarskim)',
            punkt: 'NZOZ Gdańsk-Wrzeszcz',
            lekarz: 'lek. med. Piotr Czarnecki',
            podal: 'piel. Krystyna Nowak',
            certId: 'UCC/PL/2025/KZM-330192',
            hasUcc: true,
            waznosc: 'Wymagana dawka 3 w 2026 r.'
          }
        ]
      }
    }
  };

  // --- Pomocnik pobierania danych aktywnej persony ---
  function getActivePersonData() {
    const pId = (typeof OS !== 'undefined' && OS.id) ? OS.id : 'jan';
    return ZDROWIE_DB[pId] || ZDROWIE_DB.jan;
  }

  // --- Bezpieczny dostęp do MobStore ---
  const _store = {
    get: function (k, def) {
      if (typeof MobStore !== 'undefined' && typeof MobStore.get === 'function') {
        return MobStore.get(k, def);
      }
      try {
        const v = localStorage.getItem('mob_zdrowie_' + k);
        return v !== null ? JSON.parse(v) : def;
      } catch (e) {
        return def;
      }
    },
    set: function (k, val) {
      if (typeof MobStore !== 'undefined' && typeof MobStore.set === 'function') {
        MobStore.set(k, val);
        return;
      }
      try {
        localStorage.setItem('mob_zdrowie_' + k, JSON.stringify(val));
      } catch (e) {}
    }
  };

  // Stan lokalny modułu
  let _szczepActiveTab = 'zalecane';
  let _currentRateJan = 80; // 80% lub 100%

  // ==========================================================================
  // INIEKCJA STYLÓW DLA MODUŁÓW ZDROWIA I ZUS
  // ==========================================================================
  function injectStyles() {
    if (document.getElementById('moduly-zdrowie-styles')) return;
    const style = document.createElement('style');
    style.id = 'moduly-zdrowie-styles';
    style.textContent = `
      /* --- Ogólne style kontenerów zdrowia i ZUS --- */
      .zus-zla-content, .szczep-content, .ucc-content {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-top: 4px;
        font-family: inherit;
        color: var(--ink, #1e293b);
      }

      /* Hero ZUS e-ZLA */
      .zus-status-card {
        background: linear-gradient(135deg, #007834, #005a26);
        color: #ffffff;
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow: 0 4px 14px rgba(0, 120, 52, 0.25);
      }
      .zus-status-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .zus-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.22);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        letter-spacing: .3px;
      }
      .zus-badge .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 8px #4ade80;
        animation: pulseZus 1.8s infinite;
      }
      @keyframes pulseZus {
        0% { transform: scale(0.95); opacity: 0.85; }
        50% { transform: scale(1.25); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.85; }
      }
      .zus-hero-title {
        font-size: 17px;
        font-weight: 800;
        margin: 0 0 4px 0;
        line-height: 1.25;
      }
      .zus-hero-sub {
        font-size: 12px;
        color: rgba(255,255,255,0.9);
        margin: 0;
        line-height: 1.4;
      }

      /* Karta Aktywnego L4 */
      .zla-active-card {
        background: #ffffff;
        border: 1.5px solid #007834;
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .zac-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--hair, #e2e8f0);
        padding-bottom: 10px;
      }
      .zac-num {
        font-size: 13px;
        font-weight: 800;
        color: #007834;
        display: block;
      }
      .zac-period {
        font-size: 16px;
        font-weight: 800;
        color: var(--ink, #0f172a);
        margin-top: 2px;
        display: block;
      }
      .zac-pill {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 8px;
        white-space: nowrap;
      }
      .zac-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        font-size: 12px;
      }
      .zac-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .zac-item small {
        font-size: 10.5px;
        color: var(--ink2, #64748b);
        font-weight: 600;
      }
      .zac-item b {
        font-size: 12.5px;
        color: var(--ink, #0f172a);
      }
      .zac-item.full {
        grid-column: span 2;
      }
      .zla-sec-alert {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 11px;
        color: #1e40af;
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }

      /* Kalkulator i podsumowanie zasiłku */
      .zla-calc-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .zcc-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .zcc-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--ink, #1e293b);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .rate-toggle-btns {
        display: flex;
        gap: 4px;
        background: #e2e8f0;
        padding: 2px;
        border-radius: 8px;
      }
      .rt-btn {
        border: none;
        background: transparent;
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        cursor: pointer;
        color: #475569;
        transition: all 0.2s;
      }
      .rt-btn.active {
        background: #ffffff;
        color: #007834;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .zcc-nums {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .zcc-main-sum {
        font-size: 22px;
        font-weight: 900;
        color: #007834;
      }
      .zcc-main-sum small {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      .zcc-daily {
        font-size: 12px;
        color: #475569;
        text-align: right;
      }

      /* Historia e-ZLA */
      .zla-hist-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
      }
      .zla-hist-head b {
        font-size: 13px;
        font-weight: 700;
      }
      .zla-hist-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .zla-hist-item {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
      }
      .zhi-left b {
        color: var(--ink, #0f172a);
        font-size: 12.5px;
        display: block;
      }
      .zhi-left small {
        color: var(--ink2, #64748b);
        display: block;
        margin-top: 2px;
      }
      .zhi-right {
        text-align: right;
      }
      .zhi-right b {
        color: #007834;
        font-size: 13px;
        display: block;
      }
      .zhi-badge {
        font-size: 10px;
        color: #059669;
        background: #ecfdf5;
        padding: 2px 6px;
        border-radius: 6px;
        display: inline-block;
        margin-top: 2px;
      }

      /* Karta e-Wizyty i PUE */
      .zus-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 4px;
      }
      .zus-act-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        text-align: left;
        cursor: pointer;
        transition: all .2s;
        gap: 4px;
      }
      .zus-act-btn:hover, .zus-act-btn:active {
        background: #f1f5f9;
        border-color: #007834;
      }
      .zus-act-btn.primary {
        background: #f0fdf4;
        border-color: #86efac;
      }
      .zus-act-btn b {
        font-size: 12.5px;
        color: var(--ink, #0f172a);
      }
      .zus-act-btn small {
        font-size: 10.5px;
        color: var(--ink2, #64748b);
      }
      .zus-act-btn i {
        font-size: 18px;
        margin-bottom: 2px;
      }

      /* Baner umówionej e-Wizyty */
      .zus-ewizyta-banner {
        background: #ecfdf5;
        border: 1.5px solid #6ee7b7;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .zeb-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .zeb-title {
        font-size: 12.5px;
        font-weight: 800;
        color: #065f46;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* --- Style Karty Szczepień (IKP) --- */
      .szczep-reminder-banner {
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        border: 1px solid #bfdbfe;
        border-radius: 14px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .srb-icon {
        font-size: 26px;
        flex-shrink: 0;
      }
      .srb-text b {
        font-size: 12.5px;
        color: #1e3a8a;
        display: block;
      }
      .srb-text small {
        font-size: 11px;
        color: #1d4ed8;
        display: block;
        margin-top: 2px;
      }

      .szczep-tabs-bar {
        display: flex;
        gap: 6px;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 12px;
      }
      .szczep-tab-btn {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 12px;
        font-weight: 700;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .szczep-tab-btn.active {
        background: #ffffff;
        color: #0284c7;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }

      .szczep-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .szczep-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      }
      .sc-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .sc-title {
        font-size: 13.5px;
        font-weight: 800;
        color: var(--ink, #0f172a);
        margin: 0;
      }
      .sc-drug {
        font-size: 12px;
        font-weight: 700;
        color: #0284c7;
        margin-top: 2px;
        display: block;
      }
      .sc-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
        background: #f1f5f9;
        color: #475569;
      }
      .sc-badge.ucc {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }
      .sc-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        font-size: 11px;
        background: #f8fafc;
        border-radius: 8px;
        padding: 8px 10px;
      }
      .sc-details div {
        display: flex;
        flex-direction: column;
      }
      .sc-details small {
        color: #64748b;
        font-size: 10px;
      }
      .sc-details b {
        color: #1e293b;
        font-size: 11.5px;
      }
      .sc-details .full {
        grid-column: span 2;
      }
      .sc-actions {
        display: flex;
        gap: 8px;
        margin-top: 2px;
      }

      /* --- Style Modalu UCC QR --- */
      .ucc-card-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        padding: 8px 0;
      }
      .ucc-cert-hero {
        width: 100%;
        background: linear-gradient(135deg, #003399, #002266);
        color: #ffffff;
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 4px 12px rgba(0, 51, 153, 0.25);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .uch-flag {
        font-size: 28px;
      }
      .uch-titles b {
        font-size: 14px;
        display: block;
      }
      .uch-titles small {
        font-size: 11px;
        color: rgba(255,255,255,0.85);
      }
      .ucc-qr-box {
        background: #ffffff;
        padding: 16px;
        border-radius: 18px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        border: 2px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .ucc-qr-svg {
        width: 200px;
        height: 200px;
      }
      .ucc-badge-valid {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
        font-size: 12px;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 20px;
      }
      .ucc-meta-table {
        width: 100%;
        font-size: 11.5px;
        background: #f8fafc;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .um-row {
        display: flex;
        justify-content: space-between;
      }
      .um-row span {
        color: #64748b;
      }
      .um-row b {
        color: #0f172a;
      }
      .ucc-actions {
        width: 100%;
        display: flex;
        gap: 8px;
      }
      .ucc-actions .btn {
        flex: 1;
      }

      /* --- TRYB CIEMNY (.phone.dark-mode) --- */
      .phone.dark-mode .zla-active-card,
      .phone.dark-mode .zla-calc-card,
      .phone.dark-mode .zla-hist-item,
      .phone.dark-mode .zus-act-btn,
      .phone.dark-mode .szczep-card,
      .phone.dark-mode .sc-details,
      .phone.dark-mode .ucc-qr-box,
      .phone.dark-mode .ucc-meta-table {
        background: #1e2430 !important;
        border-color: rgba(255,255,255,0.12) !important;
        color: #f1f5f9 !important;
      }
      .phone.dark-mode .zac-period,
      .phone.dark-mode .sc-title,
      .phone.dark-mode .um-row b,
      .phone.dark-mode .zla-hist-item .zhi-left b,
      .phone.dark-mode .zac-item b {
        color: #ffffff !important;
      }
      .phone.dark-mode .szczep-tabs-bar,
      .phone.dark-mode .rate-toggle-btns {
        background: #141824 !important;
      }
      .phone.dark-mode .szczep-tab-btn.active,
      .phone.dark-mode .rt-btn.active {
        background: #2a3447 !important;
        color: #38bdf8 !important;
      }
      .phone.dark-mode .zcc-nums {
        background: #141824 !important;
        border-color: rgba(255,255,255,0.1) !important;
      }
      .phone.dark-mode .szczep-reminder-banner {
        background: rgba(30, 58, 138, 0.3) !important;
        border-color: rgba(96, 165, 250, 0.4) !important;
      }
      .phone.dark-mode .srb-text b { color: #93c5fd !important; }
      .phone.dark-mode .srb-text small { color: #bfdbfe !important; }

      /* --- WYSOKI KONTRAST (.high-contrast) --- */
      .high-contrast .zus-status-card,
      .high-contrast .zla-active-card,
      .high-contrast .zla-calc-card,
      .high-contrast .zla-hist-item,
      .high-contrast .zus-act-btn,
      .high-contrast .szczep-reminder-banner,
      .high-contrast .szczep-card,
      .high-contrast .sc-details,
      .high-contrast .ucc-cert-hero,
      .high-contrast .ucc-qr-box,
      .high-contrast .ucc-meta-table {
        background: #000000 !important;
        border: 2px solid #ffd700 !important;
        color: #ffffff !important;
      }
      .high-contrast .zac-num,
      .high-contrast .zac-period,
      .high-contrast .zcc-main-sum,
      .high-contrast .zhi-right b,
      .high-contrast .sc-drug,
      .high-contrast .srb-text b,
      .high-contrast .srb-text small,
      .high-contrast .um-row b {
        color: #ffd700 !important;
      }
      .high-contrast .zac-pill,
      .high-contrast .zhi-badge,
      .high-contrast .sc-badge.ucc,
      .high-contrast .ucc-badge-valid {
        background: #ffd700 !important;
        color: #000000 !important;
        border-color: #ffd700 !important;
        font-weight: 900 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // GENERATOR KODU QR SVG (DLA UCC / CERTYFIKATÓW SZCZEPIENIA)
  // ==========================================================================
  function generateQrSvg(seedStr, size = 200) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const pseudoRandom = (n) => {
      const v = Math.sin(hash + n * 997) * 10000;
      return v - Math.floor(v);
    };

    const n = 29; // wymiar siatki 29x29 (wersja UCC QR)
    let rects = '';

    // Wzorce pozycyjne (Finder patterns 7x7) w 3 rogach
    const drawFinder = (x0, y0) => {
      let f = `<rect x="${x0}" y="${y0}" width="7" height="7" fill="black"/>`;
      f += `<rect x="${x0 + 1}" y="${y0 + 1}" width="5" height="5" fill="white"/>`;
      f += `<rect x="${x0 + 2}" y="${y0 + 2}" width="3" height="3" fill="black"/>`;
      return f;
    };

    // Generowanie modułów danych
    let step = 0;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        // Pomijamy narożniki wzorców wyszukiwania
        if ((x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)) {
          continue;
        }
        // Linie synchronizacji (Timing patterns)
        if (x === 6 || y === 6) {
          if ((x + y) % 2 === 0) {
            rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;
          }
          continue;
        }
        // Mały wzorzec wyrównania (Alignment pattern 5x5 w prawym dolnym rogu)
        if (x >= 20 && x <= 24 && y >= 20 && y <= 24) {
          if (x === 20 || x === 24 || y === 20 || y === 24 || (x === 22 && y === 22)) {
            rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;
          }
          continue;
        }
        // Losowe moduły danych na podstawie hasha certyfikatu
        step++;
        if (pseudoRandom(step) > 0.48) {
          rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;
        }
      }
    }

    const finders = drawFinder(0, 0) + drawFinder(n - 7, 0) + drawFinder(0, n - 7);

    return `
      <svg viewBox="-2 -2 ${n + 4} ${n + 4}" width="${size}" height="${size}" class="ucc-qr-svg" shape-rendering="crispEdges" aria-label="Kod QR Certyfikatu UCC">
        <rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#ffffff"/>
        ${rects}
        ${finders}
      </svg>
    `;
  }

  // ==========================================================================
  // MODUŁ 1: ZUS I ZWOLNIENIA LEKARSKIE (e-ZLA / L4)
  // ==========================================================================

  function renderZusZlaModal() {
    injectStyles();
    const data = getActivePersonData();
    const container = document.getElementById('zusZlaContent');
    if (!container) return;

    const ubezp = data.ubezpieczenieZus;
    const active = data.activeZla;
    const hist = data.historiaZla || [];
    const ewizyta = _store.get('zus_ewizyta_' + data.id, null);

    // Przeliczenie kwoty dla Jana przy zmianie stawki 80% / 100%
    let displayRate = active ? active.stawkaProcent : 80;
    let displayDaily = active ? active.podstawaDzienna : 0;
    let displayTotal = active ? active.kwotaLaczna : 0;

    if (active && data.id === 'jan') {
      displayRate = _currentRateJan;
      if (_currentRateJan === 100) {
        displayDaily = +(active.podstawaDzienna * 1.25).toFixed(2);
        displayTotal = +(displayDaily * active.dni).toFixed(2);
      }
    }

    let activeHtml = '';
    if (active) {
      activeHtml = `
        <div class="zla-active-card">
          <div class="zac-head">
            <div>
              <span class="zac-num">${active.seriaNr}</span>
              <span class="zac-period">${active.okresOd} – ${active.okresDo} (${active.dni} dni)</span>
            </div>
            <span class="zac-pill">Pozostało: ${active.dniPozostalo} dni</span>
          </div>

          <div class="zac-grid">
            <div class="zac-item full">
              <small>Rozpoznanie lekarskie (ICD-10)</small>
              <b>${active.kodChoroby} • ${active.opisChoroby}</b>
            </div>
            <div class="zac-item">
              <small>Zalecenia medyczne</small>
              <b>Kod ${active.zaleceniaKod}: ${active.zaleceniaOpis}</b>
            </div>
            <div class="zac-item">
              <small>Status doręczenia</small>
              <b style="color:#007834">✅ Dostarczono do ZUS i pracodawcy</b>
            </div>
            <div class="zac-item full">
              <small>Lekarz wystawiający i placówka</small>
              <b>${active.lekarz} (${active.lekarzSpec})</b>
              <span style="font-size:11px;color:var(--ink2)">${active.placowka}</span>
            </div>
          </div>

          <div class="zla-sec-alert">
            <span style="font-size:16px">🔒</span>
            <div>
              <b>Ochrona danych medycznych:</b> Kod choroby i opis diagnozy są widoczne tylko dla Ciebie i orzeczników ZUS. Pracodawca otrzymuje e-ZLA bez informacji o schorzeniu.
            </div>
          </div>

          <!-- Kalkulator świadczenia chorobowego -->
          <div class="zla-calc-card">
            <div class="zcc-head">
              <div class="zcc-title">
                <span>💰</span>
                <span>Świadczenie chorobowe</span>
              </div>
              ${data.id === 'jan' ? `
                <div class="rate-toggle-btns" role="group" aria-label="Wybór stawki procentowej">
                  <button type="button" class="rt-btn ${_currentRateJan === 80 ? 'active' : ''}" onclick="toggleZlaRate(80)">80% podstawy</button>
                  <button type="button" class="rt-btn ${_currentRateJan === 100 ? 'active' : ''}" onclick="toggleZlaRate(100)">100% (szpital/wypadek)</button>
                </div>
              ` : `
                <span style="font-size:11px;font-weight:700;color:#007834;background:#ecfdf5;padding:2px 8px;border-radius:6px">Stawka ${displayRate}%</span>
              `}
            </div>

            <div class="zcc-nums">
              <div>
                <small style="font-size:11px;color:var(--ink2);display:block">Przewidywana kwota świadczenia:</small>
                <div class="zcc-main-sum">${displayTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <small>zł brutto</small></div>
              </div>
              <div class="zcc-daily">
                <b>${displayDaily.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</b> / dzień<br>
                <small style="color:var(--ink2)">za ${active.dni} dni zwolnienia</small>
              </div>
            </div>

            <div style="font-size:11px;color:var(--ink2);line-height:1.4">
              <b>Organ wypłacający:</b> ${active.organWyplacajacy}.<br>
              <b>Status wniosku:</b> ${active.statusZasilku}.
            </div>
          </div>
        </div>
      `;
    } else {
      activeHtml = `
        <div class="zla-active-card" style="text-align:center;padding:20px 14px">
          <div style="font-size:32px;margin-bottom:6px">🩺</div>
          <b style="font-size:15px;color:var(--ink)">Brak aktywnego zwolnienia lekarskiego</b>
          <p style="font-size:12px;color:var(--ink2);margin:4px 0 0 0">
            Obecnie nie posiadasz wystawionego elektronicznego zwolnienia lekarskiego (e-ZLA). Jeśli lekarz wystawi zwolnienie, pojawi się ono tutaj natychmiast.
          </p>
        </div>
      `;
    }

    // Baner e-Wizyty jeśli została umówiona
    let ewizytaBanner = '';
    if (ewizyta) {
      ewizytaBanner = `
        <div class="zus-ewizyta-banner">
          <div class="zeb-top">
            <span class="zeb-title">🎥 Umówiona e-Wizyta w ZUS</span>
            <button type="button" class="btn-xs ghost" onclick="cancelZusEwizyta()" style="color:#b91c1c">Odwołaj</button>
          </div>
          <div style="font-size:12px;color:#064e3b">
            <b>Termin:</b> ${ewizyta.termin} • <b>Temat:</b> ${ewizyta.temat}<br>
            <b>Ekspert:</b> ${ewizyta.oddzial}<br>
            <small style="color:#047857">Link do połączenia wideo przesłano na powiązany adres e-mail oraz powiadomienie push.</small>
          </div>
        </div>
      `;
    }

    // Historia zwolnień lekarskich
    let histHtml = '';
    if (hist.length > 0) {
      histHtml = `
        <div class="zla-hist-head">
          <b>Historia e-ZLA (lata 2025–2026)</b>
          <small style="color:var(--ink2)">Wszystkich wpisów: ${hist.length}</small>
        </div>
        <div class="zla-hist-list">
          ${hist.map(item => `
            <div class="zla-hist-item">
              <div class="zhi-left">
                <b>${item.okresOd} – ${item.okresDo} (${item.dni} dni)</b>
                <small>${item.kodChoroby}: ${item.opisChoroby}</small>
                <small style="color:var(--ink2)">${item.lekarz} • ${item.placowka}</small>
              </div>
              <div class="zhi-right">
                <b>${item.kwotaLaczna > 0 ? item.kwotaLaczna.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' zł' : 'Rozliczone'}</b>
                <span class="zhi-badge">${item.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Nagłówek ZUS -->
      <div class="zus-status-card">
        <div class="zus-status-top">
          <span class="zus-badge">
            <span class="pulse-dot"></span>
            Rejestr ZUS & e-ZLA
          </span>
          <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9)">PESEL: ${data.pesel}</span>
        </div>
        <h3 class="zus-hero-title">${data.imieNazwisko}</h3>
        <p class="zus-hero-sub">${ubezp.tytul} • ${ubezp.statusSkladkowy}</p>
      </div>

      ${ewizytaBanner}

      <!-- Sekcja Aktywnego Zwolnienia -->
      ${activeHtml}

      <!-- Przyciski akcji ZUS: PUE oraz e-Wizyta -->
      <div class="zus-actions-grid">
        <button type="button" class="zus-act-btn primary" onclick="scheduleZusEwizyta()">
          <i>🎥</i>
          <b>Umów e-Wizytę w ZUS</b>
          <small>Wideorozmowa z ekspertem ZUS bez wychodzenia z domu</small>
        </button>

        <button type="button" class="zus-act-btn" onclick="window.location.href='ZUS.html'">
          <i>🏛️</i>
          <b>Panel PUE / eZUS</b>
          <small>Przejdź do pełnego portalu i wniosków elektronicznych</small>
        </button>
      </div>

      <!-- Historia zwolnień -->
      ${histHtml}

      <!-- Pobierz oficjalne zestawienie -->
      <div style="display:flex;gap:8px;margin-top:6px">
        <button type="button" class="btn ghost wide" onclick="downloadZlaPdf('${active ? active.id : 'historia'}')">
          📄 Pobierz historię zwolnień (PDF)
        </button>
      </div>
    `;
  }

  function openZusZlaModal() {
    if (typeof haptic === 'function') haptic('card');
    let modal = document.getElementById('zusZlaModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'zusZlaModal';
      modal.className = 'sheet-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'zusZlaTitle');
      modal.innerHTML = `
        <div class="scrim" onclick="closeZusZlaModal()"></div>
        <div class="modal-box zus-box">
          <div class="modal-head">
            <h2 id="zusZlaTitle">ZUS i Zwolnienia Lekarskie (e-ZLA)</h2>
            <button class="tx-close" onclick="closeZusZlaModal()" aria-label="Zamknij">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
            </button>
          </div>
          <p class="modal-sub">Elektroniczne zwolnienia lekarskie (L4) i zasiłki chorobowe ZUS</p>
          <div class="zus-zla-content" id="zusZlaContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(modal);
    }

    renderZusZlaModal();
    modal.classList.add('open');

    if (typeof openDialogFocus === 'function') {
      openDialogFocus('zusZlaModal', modal.querySelector('.modal-box') || modal, '.tx-close');
    }
    if (typeof announceSR === 'function') {
      announceSR('Otwarto zwolnienia lekarskie e-ZLA i ZUS');
    }
  }

  function closeZusZlaModal() {
    const modal = document.getElementById('zusZlaModal');
    if (modal) {
      modal.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') {
        restoreDialogFocus('zusZlaModal');
      }
    }
  }

  function toggleZlaRate(rate) {
    _currentRateJan = rate;
    renderZusZlaModal();
    if (typeof showToast === 'function') {
      showToast(`Przełączono kalkulację na ${rate}% podstawy wymiaru`);
    }
  }

  function scheduleZusEwizyta() {
    const data = getActivePersonData();
    const existing = _store.get('zus_ewizyta_' + data.id, null);
    if (existing) {
      if (typeof showToast === 'function') {
        showToast('Posiadasz już zaplanowaną e-Wizytę w ZUS: ' + existing.termin);
      }
      return;
    }

    const termin = 'Jutro, 23.11.2026 godz. 10:30';
    const wizytaObj = {
      id: 'ewiz_' + Date.now(),
      termin: termin,
      temat: 'Zasiłki chorobowe i weryfikacja e-ZLA',
      oddzial: data.ubezpieczenieZus.oddzial,
      utworzono: new Date().toISOString()
    };

    _store.set('zus_ewizyta_' + data.id, wizytaObj);
    renderZusZlaModal();

    if (typeof showToast === 'function') {
      showToast('Zarezerwowano e-Wizytę w ZUS: ' + termin);
    }
    if (typeof announceSR === 'function') {
      announceSR('Pomyślnie zarezerwowano e-Wizytę w ZUS');
    }
  }

  function cancelZusEwizyta() {
    const data = getActivePersonData();
    _store.set('zus_ewizyta_' + data.id, null);
    renderZusZlaModal();
    if (typeof showToast === 'function') {
      showToast('Odwołano zaplanowaną e-Wizytę w ZUS');
    }
  }

  function downloadZlaPdf(id) {
    if (typeof showToast === 'function') {
      showToast('Pobrano urzędowe zaświadczenie o zwolnieniu lekarskim e-ZLA (PDF)');
    }
  }

  // ==========================================================================
  // MODUŁ 2: ELEKTRONICZNA KARTA SZCZEPIEŃ (IKP)
  // ==========================================================================

  function renderKartaSzczepienModal() {
    injectStyles();
    const data = getActivePersonData();
    const container = document.getElementById('szczepContent');
    if (!container) return;

    const szczep = data.szczepienia;
    const obowiazkowe = szczep.obowiazkowe || [];
    const zalecane = szczep.zalecane || [];
    const currentList = _szczepActiveTab === 'obowiazkowe' ? obowiazkowe : zalecane;

    container.innerHTML = `
      <!-- Baner / Licznik Przypomnienia -->
      <div class="szczep-reminder-banner">
        <div class="srb-icon">🔔</div>
        <div class="srb-text">
          <b>${szczep.reminder.tekst}</b>
          <small>Szczepienie przypominające przeciw tężcowi i błonicy zaleca się co 10 lat.</small>
        </div>
        <button type="button" class="btn-xs primary" onclick="exportSzczepCalendar('${szczep.reminder.choroba}')" style="margin-left:auto;white-space:nowrap">
          + Kalendarz
        </button>
      </div>

      <!-- Przełącznik Zakładek -->
      <div class="szczep-tabs-bar" role="tablist">
        <button type="button" class="szczep-tab-btn ${_szczepActiveTab === 'zalecane' ? 'active' : ''}" onclick="switchSzczepTab('zalecane')" role="tab" aria-selected="${_szczepActiveTab === 'zalecane'}">
          ⭐ Szczepienia zalecane (${zalecane.length})
        </button>
        <button type="button" class="szczep-tab-btn ${_szczepActiveTab === 'obowiazkowe' ? 'active' : ''}" onclick="switchSzczepTab('obowiazkowe')" role="tab" aria-selected="${_szczepActiveTab === 'obowiazkowe'}">
          🛡️ Obowiązkowe (${obowiazkowe.length})
        </button>
      </div>

      <!-- Lista Szczepień -->
      <div class="szczep-list">
        ${currentList.map(item => `
          <div class="szczep-card">
            <div class="sc-head">
              <div>
                <h4 class="sc-title">${item.choroba}</h4>
                <span class="sc-drug">${item.preparat}</span>
              </div>
              <span class="sc-badge ${item.hasUcc ? 'ucc' : ''}">
                ${item.hasUcc ? '🇪🇺 Certyfikat UCC' : 'Wpis w IKP'}
              </span>
            </div>

            <div class="sc-details">
              <div>
                <small>Data podania</small>
                <b>${item.data}</b>
              </div>
              <div>
                <small>Numer serii</small>
                <b>${item.seria}</b>
              </div>
              <div class="full">
                <small>Cykl / Dawka</small>
                <b>${item.dawka}</b>
              </div>
              <div class="full">
                <small>Punkt szczepień i lekarz</small>
                <b>${item.punkt}</b>
                <span style="font-size:10.5px;color:var(--ink2)">Kwalifikacja: ${item.lekarz} • Podał: ${item.podal}</span>
              </div>
            </div>

            <div class="sc-actions">
              <button type="button" class="btn ghost wide" onclick="openUccQrModal('${item.id}')">
                📲 Wyświetl Unijny Certyfikat (Kod QR UCC / IKP)
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Dodatkowe akcje IKP -->
      <div style="display:flex;gap:8px;margin-top:4px">
        <button type="button" class="btn ghost wide" onclick="downloadFullSzczepCardPdf()">
          📑 Pobierz pełną Kartę Szczepień (PDF z IKP)
        </button>
      </div>
    `;
  }

  function openKartaSzczepienModal(tab = 'zalecane') {
    if (typeof haptic === 'function') haptic('card');
    _szczepActiveTab = tab;

    let modal = document.getElementById('kartaSzczepienModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kartaSzczepienModal';
      modal.className = 'sheet-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'szczepTitle');
      modal.innerHTML = `
        <div class="scrim" onclick="closeKartaSzczepienModal()"></div>
        <div class="modal-box szczep-box">
          <div class="modal-head">
            <h2 id="szczepTitle">Elektroniczna Karta Szczepień</h2>
            <button class="tx-close" onclick="closeKartaSzczepienModal()" aria-label="Zamknij">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
            </button>
          </div>
          <p class="modal-sub">Internetowe Konto Pacjenta • Rejestr Szczepień Ochronnych</p>
          <div class="szczep-content" id="szczepContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(modal);
    }

    renderKartaSzczepienModal();
    modal.classList.add('open');

    if (typeof openDialogFocus === 'function') {
      openDialogFocus('kartaSzczepienModal', modal.querySelector('.modal-box') || modal, '.tx-close');
    }
    if (typeof announceSR === 'function') {
      announceSR('Otwarto Elektroniczną Kartę Szczepień IKP');
    }
  }

  function closeKartaSzczepienModal() {
    const modal = document.getElementById('kartaSzczepienModal');
    if (modal) {
      modal.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') {
        restoreDialogFocus('kartaSzczepienModal');
      }
    }
  }

  function switchSzczepTab(tab) {
    _szczepActiveTab = tab;
    renderKartaSzczepienModal();
    if (typeof haptic === 'function') haptic('tap');
  }

  function exportSzczepCalendar(choroba) {
    if (typeof showToast === 'function') {
      showToast(`Dodano przypomnienie do kalendarza (.ics): Dawka przypominająca ${choroba}`);
    }
  }

  function downloadFullSzczepCardPdf() {
    if (typeof showToast === 'function') {
      showToast('Wygenerowano i pobrano oficjalny odpis Karty Szczepień IKP (PDF)');
    }
  }

  // ==========================================================================
  // MODUŁ 3: UNIJNY CERTYFIKAT SZCZEPIENIA (KOD QR UCC / IKP)
  // ==========================================================================

  function renderUccQrModal(szczepId) {
    injectStyles();
    const data = getActivePersonData();
    const container = document.getElementById('uccContent');
    if (!container) return;

    // Odnalezienie szczepienia w zalecanych lub obowiązkowych
    let item = null;
    const all = [...(data.szczepienia.zalecane || []), ...(data.szczepienia.obowiazkowe || [])];
    if (szczepId) {
      item = all.find(s => s.id === szczepId);
    }
    if (!item) {
      item = all[0];
    }

    const qrSeed = (item.certId || 'UCC-PL-DEFAULT') + '-' + data.pesel;
    const qrSvg = generateQrSvg(qrSeed, 210);

    container.innerHTML = `
      <div class="ucc-card-wrap">
        <div class="ucc-cert-hero">
          <div class="uch-titles">
            <b>Unijny Certyfikat Szczepienia</b>
            <small>EU Digital COVID / Vaccine Certificate • IKP</small>
          </div>
          <div class="uch-flag">🇪🇺 🇵🇱</div>
        </div>

        <div class="ucc-qr-box">
          <div class="ucc-badge-valid">
            <span>✅</span>
            <span>Certyfikat ważny</span>
          </div>

          ${qrSvg}

          <div style="text-align:center">
            <b style="font-size:14px;color:var(--ink)">${data.imieNazwisko}</b>
            <div style="font-size:11px;color:var(--ink2);margin-top:2px">PESEL: ${data.pesel} • Data ur.: ${data.urodzenie}</div>
          </div>
        </div>

        <div class="ucc-meta-table">
          <div class="um-row">
            <span>Preparat szczepionki:</span>
            <b>${item.preparat}</b>
          </div>
          <div class="um-row">
            <span>Choroba docelowa:</span>
            <b>${item.choroba}</b>
          </div>
          <div class="um-row">
            <span>Data podania:</span>
            <b>${item.data}</b>
          </div>
          <div class="um-row">
            <span>Numer serii:</span>
            <b>${item.seria}</b>
          </div>
          <div class="um-row">
            <span>Dawka w cyklu:</span>
            <b>${item.dawka}</b>
          </div>
          <div class="um-row">
            <span>Identyfikator (UVCI):</span>
            <b style="font-family:monospace;font-size:10px">${item.certId}</b>
          </div>
          <div class="um-row">
            <span>Państwo wydania:</span>
            <b>Rzeczpospolita Polska (Centrum e-Zdrowia)</b>
          </div>
        </div>

        <div class="ucc-actions">
          <button type="button" class="btn primary" onclick="downloadUccPdf('${item.certId}')">
            📄 Pobierz PDF
          </button>
          <button type="button" class="btn ghost" onclick="saveToWallet('${item.certId}')">
            📲 Dodaj do Portfela
          </button>
        </div>
      </div>
    `;
  }

  function openUccQrModal(szczepId) {
    if (typeof haptic === 'function') haptic('card');
    let modal = document.getElementById('uccQrModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'uccQrModal';
      modal.className = 'sheet-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'uccTitle');
      modal.innerHTML = `
        <div class="scrim" onclick="closeUccQrModal()"></div>
        <div class="modal-box ucc-box">
          <div class="modal-head">
            <h2 id="uccTitle">Certyfikat Szczepienia (UCC)</h2>
            <button class="tx-close" onclick="closeUccQrModal()" aria-label="Zamknij">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
            </button>
          </div>
          <p class="modal-sub">Oficjalny Unijny Certyfikat z podpisem kryptograficznym</p>
          <div class="ucc-content" id="uccContent"></div>
        </div>
      `;
      (document.getElementById('app') || document.body).appendChild(modal);
    }

    renderUccQrModal(szczepId);
    modal.classList.add('open');

    if (typeof openDialogFocus === 'function') {
      openDialogFocus('uccQrModal', modal.querySelector('.modal-box') || modal, '.tx-close');
    }
    if (typeof announceSR === 'function') {
      announceSR('Wyświetlono kod QR Unijnego Certyfikatu Szczepienia');
    }
  }

  function closeUccQrModal() {
    const modal = document.getElementById('uccQrModal');
    if (modal) {
      modal.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') {
        restoreDialogFocus('uccQrModal');
      }
    }
  }

  function downloadUccPdf(certId) {
    if (typeof showToast === 'function') {
      showToast('Pobrano oficjalny certyfikat szczepienia UCC w formacie PDF');
    }
  }

  function saveToWallet(certId) {
    if (typeof showToast === 'function') {
      showToast('Dodano certyfikat szczepienia do cyfrowego Portfela (Apple / Google Wallet)');
    }
  }

  // ==========================================================================
  // EKSPORT GLOBALNY FUNKCJI DO WINDOW
  // ==========================================================================
  window.ZDROWIE_DB = ZDROWIE_DB;

  // Moduł 1: ZUS i e-ZLA
  window.openZusZlaModal = openZusZlaModal;
  window.closeZusZlaModal = closeZusZlaModal;
  window.renderZusZlaModal = renderZusZlaModal;
  window.toggleZlaRate = toggleZlaRate;
  window.scheduleZusEwizyta = scheduleZusEwizyta;
  window.cancelZusEwizyta = cancelZusEwizyta;
  window.downloadZlaPdf = downloadZlaPdf;

  // Moduł 2: Karta Szczepień
  window.openKartaSzczepienModal = openKartaSzczepienModal;
  window.closeKartaSzczepienModal = closeKartaSzczepienModal;
  window.renderKartaSzczepienModal = renderKartaSzczepienModal;
  window.switchSzczepTab = switchSzczepTab;
  window.exportSzczepCalendar = exportSzczepCalendar;
  window.downloadFullSzczepCardPdf = downloadFullSzczepCardPdf;

  // Moduł 3: Certyfikaty UCC
  window.openUccQrModal = openUccQrModal;
  window.closeUccQrModal = closeUccQrModal;
  window.renderUccQrModal = renderUccQrModal;
  window.downloadUccPdf = downloadUccPdf;
  window.saveToWallet = saveToWallet;

})();
