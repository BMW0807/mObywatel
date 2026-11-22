/**
 * Katalog Dokumentów Państwowych (mObywatel 2.0)
 * Moduł "+ Dodaj dokument" umożliwiający dynamiczne pobieranie i dodawanie
 * oficjalnych dokumentów państwowych do portfela mObywatela.
 */

(function () {
  'use strict';

  // --- 1. Definicje tła kart SVG (jako bezpiecznie zakodowane data URI) ---
  function svgToUri(str) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim())
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27');
  }

  const SVG_BGS = {
    emeryt: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="50%" stop-color="#047857"/><stop offset="100%" stop-color="#065f46"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(52,211,153,0.35)"/><stop offset="100%" stop-color="rgba(6,78,59,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 110 Q300 150 600 100" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/><path d="M0 320 Q300 270 600 325" fill="none" stroke="rgba(52,211,153,0.18)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="62"/><path d="M-28 -14 L0 -42 L28 -14 L16 32 L-16 32 Z"/><circle cx="0" cy="-4" r="11"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">ZUS</text></svg>`),

    karta_polaka: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#881337"/><stop offset="50%" stop-color="#9f1239"/><stop offset="100%" stop-color="#4c0519"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(251,113,133,0.3)"/><stop offset="100%" stop-color="rgba(136,19,55,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 100 Q300 135 600 95" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><path d="M0 108 Q300 143 600 103" fill="none" stroke="rgba(225,29,72,0.4)" stroke-width="2"/><g transform="translate(440,225)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><path d="M0 -50 L12 -24 L38 -18 L16 2 L26 32 L0 16 L-26 32 L-16 2 L-38 -18 L-12 -24 Z"/><circle cx="0" cy="-6" r="12"/></g><rect x="510" y="34" width="54" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="537" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">RP</text></svg>`),

    nauczyciel: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="50%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#172554"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(96,165,250,0.35)"/><stop offset="100%" stop-color="rgba(30,58,138,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 115 Q300 150 600 110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><path d="M-40 20 Q-20 0 0 10 Q20 0 40 20 L40 -20 Q20 -40 0 -30 Q-20 -40 -40 -20 Z"/><line x1="0" y1="-30" x2="0" y2="10"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text></svg>`),

    pwz_lekarz: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f766e"/><stop offset="50%" stop-color="#0284c7"/><stop offset="100%" stop-color="#134e4a"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(56,189,248,0.35)"/><stop offset="100%" stop-color="rgba(15,118,110,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><line x1="0" y1="-55" x2="0" y2="55"/><path d="M-15 -35 C-5 -45 15 -30 0 -15 C-20 0 20 20 0 35"/></g><rect x="502" y="34" width="62" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="533" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">NIL</text></svg>`),

    pwz_pielegniarka: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4338ca"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#312e81"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(165,180,252,0.35)"/><stop offset="100%" stop-color="rgba(67,56,202,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 140 600 100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.09)" stroke-width="3" fill="none"><circle cx="0" cy="0" r="48"/><path d="M-18 0 H18 M0 -18 V18"/></g><rect x="490" y="34" width="74" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="527" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">NIPiP</text></svg>`),

    legitymacja_szkolna: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9a3412"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="rgba(253,186,116,0.35)"/><stop offset="100%" stop-color="rgba(154,52,18,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 110 Q300 145 600 105" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"><rect x="-35" y="-35" width="70" height="70" rx="14"/><path d="M-20 -5 L0 15 L20 -5"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MEN</text></svg>`),

    hdk: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4c0519"/><stop offset="45%" stop-color="#9f1239"/><stop offset="80%" stop-color="#be123c"/><stop offset="100%" stop-color="#881337"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="65%"><stop offset="0%" stop-color="rgba(244,63,94,0.4)"/><stop offset="60%" stop-color="rgba(190,18,60,0.1)"/><stop offset="100%" stop-color="rgba(76,5,25,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 110 Q300 150 600 100" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/><path d="M0 310 L180 310 L195 290 L210 330 L225 285 L240 325 L255 310 L600 310" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.8"/><path d="M0 320 Q300 280 600 330" fill="none" stroke="rgba(251,113,133,0.18)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.10)" stroke-width="3" fill="none"><path d="M0 -65 C0 -65 42 -12 42 22 C42 45 23 64 0 64 C-23 64 -42 45 -42 22 C-42 -12 0 -65 0 -65 Z"/><path d="M -9 18 H 9 M 0 9 V 27" stroke-width="3.5" stroke-linecap="round"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">HDK</text></svg>`),

    osp: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a1128"/><stop offset="35%" stop-color="#1c1917"/><stop offset="70%" stop-color="#451a03"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient><radialGradient id="gl" cx="82%" cy="22%" r="65%"><stop offset="0%" stop-color="rgba(245,158,11,0.35)"/><stop offset="50%" stop-color="rgba(234,88,12,0.15)"/><stop offset="100%" stop-color="rgba(10,17,40,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(251,191,36,0.22)" stroke-width="2"/><path d="M0 320 Q300 270 600 325" fill="none" stroke="rgba(245,158,11,0.2)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(251,191,36,0.14)" stroke-width="2.5" fill="none"><path d="M0 -62 C35 -62 55 -40 55 5 C55 42 22 62 0 72 C-22 62 -55 42 -55 5 C-55 -40 -35 -62 0 -62 Z"/><line x1="-36" y1="-36" x2="36" y2="36"/><line x1="36" y1="-36" x2="-36" y2="36"/><path d="M-22 8 C-22 -15 22 -15 22 8 C26 12 24 16 18 16 L-18 16 C-24 16 -26 12 -22 8 Z"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fef3c7" text-anchor="middle">OSP</text></svg>`),

    pz: svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#081b33"/><stop offset="40%" stop-color="#0c2d58"/><stop offset="75%" stop-color="#154a8a"/><stop offset="100%" stop-color="#0a2040"/></linearGradient><radialGradient id="gl" cx="80%" cy="20%" r="65%"><stop offset="0%" stop-color="rgba(56,189,248,0.35)"/><stop offset="60%" stop-color="rgba(14,116,144,0.12)"/><stop offset="100%" stop-color="rgba(8,27,51,0)"/></radialGradient></defs><rect width="600" height="400" rx="36" fill="url(#g)"/><rect width="600" height="400" rx="36" fill="url(#gl)"/><path d="M0 105 Q300 145 600 95" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><path d="M0 315 Q300 270 600 320" fill="none" stroke="rgba(56,189,248,0.18)" stroke-width="2"/><g transform="translate(440,220)" stroke="rgba(255,255,255,0.12)" stroke-width="2.5" fill="none"><path d="M0 -62 C32 -62 52 -44 52 2 C52 38 22 58 0 68 C-22 58 -52 38 -52 2 C-52 -44 -32 -62 0 -62 Z"/><path d="M-12 6 C-12 -2 -4 -8 0 -8 C4 -8 12 -2 12 6 L12 12 H-12 Z"/><rect x="-16" y="12" width="32" height="24" rx="4"/></g><rect x="496" y="34" width="68" height="26" rx="6" fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.4)" stroke-width="1.5"/><text x="530" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">PZ</text></svg>`)
  };

  // --- 2. Baza wzorcowa dokumentów do dodania (Katalog Państwowy) ---
  const KATALOG_DOKUMENTOW = [
    {
      id: 'emeryt',
      kategoria: 'emerytura',
      kategoriaLabel: 'Emerytury i ZUS',
      nazwa: 'mLegitymacja emeryta/rencisty',
      instytucja: 'ZUS • Zakład Ubezpieczeń Społecznych',
      badge: 'ZUS',
      ikona: 'id',
      opis: 'Elektroniczne potwierdzenie prawa do świadczeń emerytalno-rentowych ZUS, ulgowych przejazdów i bezpłatnych leków.',
      build: function (os) {
        const pesel = (os && os.moje && os.moje.pesel) || '91071427765';
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'emeryt',
          name: 'mLegitymacja emeryta-rencisty',
          img: 'assets/card-emeryt.svg',
          strip: 'assets/strip-emeryt.svg',
          sub: 'ZUS • Ważna bezterminowo',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'ZUS EL/140284/2026',
          f: [
            ['PESEL', pesel],
            ['Nr legitymacji', 'EL/140284/2026'],
            ['Świadczenie', 'Emerytura ZUS'],
            ['Ważna do', 'bezterminowo']
          ],
          rows: [
            ['Posiadacz', imieNazw],
            ['PESEL', pesel],
            ['Numer legitymacji', 'EL/140284/2026'],
            ['Rodzaj świadczenia', 'Emerytura powszechna'],
            ['Organ wydający', 'Zakład Ubezpieczeń Społecznych, I Oddział'],
            ['Ważność', 'Bezterminowo'],
            ['Uprawnienia', 'Zniżki PKP/Polregio, ulgi komunikacji miejskiej, program Leki 65+']
          ]
        };
      }
    },
    {
      id: 'karta_polaka',
      kategoria: 'tozsamosc',
      kategoriaLabel: 'Tożsamość i status',
      nazwa: 'Karta Polaka',
      instytucja: 'Rzeczpospolita Polska • MSZ',
      badge: 'RP / MSZ',
      ikona: 'shield',
      opis: 'Dokument potwierdzający przynależność do Narodu Polskiego, dający prawo do zwolnienia z wizy i 37% ulgi kolejowej.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'karta_polaka',
          name: 'Karta Polaka',
          img: 'assets/card-karta-polaka.svg',
          strip: 'assets/strip-karta-polaka.svg',
          sub: 'RP • Ważna do 18.06.2034',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'Karta Polaka KP/908234/24',
          f: [
            ['Nr Karty', 'KP/908234/24'],
            ['Ważna do', '18.06.2034'],
            ['Obywatelstwo', 'Polskie pochodzenie'],
            ['Wojewoda', 'Mazowiecki']
          ],
          rows: [
            ['Posiadacz', imieNazw],
            ['Obywatelstwo', 'Przynależność do Narodu Polskiego'],
            ['Numer Karty', 'KP/908234/24'],
            ['Data wydania', '18.06.2024'],
            ['Data ważności', '18.06.2034'],
            ['Organ wydający', 'Wojewoda Mazowiecki'],
            ['Uprawnienia', 'Zwolnienie z opłat wizowych, prawo do pracy w RP, 37% ulgi na przejazdy PKP, darmowy wstęp do muzeów państwowych']
          ]
        };
      }
    },
    {
      id: 'nauczyciel',
      kategoria: 'edukacja',
      kategoriaLabel: 'Edukacja i nauka',
      nazwa: 'Karta Nauczyciela (MEN)',
      instytucja: 'Ministerstwo Edukacji Narodowej',
      badge: 'MEN',
      ikona: 'doc',
      opis: 'Służbowa legitymacja nauczyciela potwierdzająca zatrudnienie w oświacie oraz uprawniająca do 33% ulgi PKP.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'nauczyciel',
          name: 'Karta Nauczyciela',
          img: 'assets/card-nauczyciel.svg',
          strip: 'assets/strip-nauczyciel.svg',
          sub: 'MEN • Ważna do 31.08.2027',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'MEN nr 33421/2025',
          f: [
            ['Nr legitymacji', 'MEN/33421/2025'],
            ['Ważna do', '31.08.2027'],
            ['Stopień', 'Nauczyciel mianowany'],
            ['Placówka', 'Liceum Ogólnokształcące']
          ],
          rows: [
            ['Posiadacz', imieNazw],
            ['Numer legitymacji', 'MEN/33421/2025'],
            ['Stanowisko', 'Nauczyciel mianowany'],
            ['Szkoła', 'XVII Liceum Ogólnokształcące z Oddziałami Dwujęzycznymi'],
            ['Organ prowadzący', 'Miasto Stołeczne Warszawa'],
            ['Ważność', 'Do 31.08.2027'],
            ['Uprawnienia', '33% ulgi na przejazdy koleją PKP, preferencyjny wstęp do muzeów i teatrów']
          ]
        };
      }
    },
    {
      id: 'pwz_lekarz',
      kategoria: 'zawodowe',
      kategoriaLabel: 'Uprawnienia zawodowe',
      nazwa: 'Prawo Wykonywania Zawodu Lekarza (NIL)',
      instytucja: 'Naczelna Izba Lekarska',
      badge: 'NIL',
      ikona: 'shield',
      opis: 'Dokument PWZ Lekarza wydany przez Okręgową Izbę Lekarską potwierdzający kwalifikacje i prawo ordynacji leków.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'pwz_lekarz',
          name: 'PWZ Lekarza (NIL)',
          img: 'assets/card-pwz-lekarz.svg',
          strip: 'assets/strip-pwz-lekarz.svg',
          sub: 'NIL • PWZ nr 5482103',
          photo: 1,
          holder: ('LEK. ' + imieNazw).toUpperCase(),
          line: 'PWZ Lekarza nr 5482103',
          f: [
            ['Nr PWZ', '5482103'],
            ['Izba', 'OIL Warszawa'],
            ['Specjalizacja', 'Choroby wewnętrzne'],
            ['Status', 'Aktywne prawo']
          ],
          rows: [
            ['Lekarz', 'lek. ' + imieNazw],
            ['Tytuł zawodowy', 'Lekarz medycyny'],
            ['Numer PWZ', '5482103'],
            ['Izba Lekarska', 'Okręgowa Izba Lekarska w Warszawie'],
            ['Data uchwały', '22.10.2018'],
            ['Status uprawnień', 'Prawo wykonywania zawodu bez ograniczeń'],
            ['Specjalizacja', 'Medycyna rodzinna / Interna (st. II)']
          ]
        };
      }
    },
    {
      id: 'pwz_pielegniarka',
      kategoria: 'zawodowe',
      kategoriaLabel: 'Uprawnienia zawodowe',
      nazwa: 'Prawo Wykonywania Zawodu Pielęgniarki (NIPiP)',
      instytucja: 'Naczelna Izba Pielęgniarek i Położnych',
      badge: 'NIPiP',
      ikona: 'shield',
      opis: 'Cyfrowe PWZ Pielęgniarki potwierdzające kwalifikacje zawodowe, specjalizację i przynależność do samorządu NIPiP.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'pwz_pielegniarka',
          name: 'PWZ Pielęgniarki (NIPiP)',
          img: 'assets/card-pwz-pielegniarka.svg',
          strip: 'assets/strip-pwz-pielegniarka.svg',
          sub: 'NIPiP • PWZ nr 8814201P',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'PWZ Pielęgniarki nr 8814201P',
          f: [
            ['Nr PWZ', '8814201P'],
            ['Izba', 'OIPiP Warszawa'],
            ['Specjalność', 'Pielęgniarstwo anestezjologiczne'],
            ['Status', 'Aktywne prawo']
          ],
          rows: [
            ['Pielęgniarka', imieNazw],
            ['Tytuł zawodowy', 'Pielęgniarka dyplomowana'],
            ['Numer PWZ', '8814201P'],
            ['Izba', 'Warszawska Okręgowa Izba Pielęgniarek i Położnych'],
            ['Status uprawnień', 'Prawo wykonywania zawodu bez ograniczeń'],
            ['Specjalizacja', 'Pielęgniarstwo anestezjologiczne i intensywnej opieki']
          ]
        };
      }
    },
    {
      id: 'kdr',
      kategoria: 'rodzina',
      kategoriaLabel: 'Rodzina i świadczenia',
      nazwa: 'Karta Dużej Rodziny',
      instytucja: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
      badge: 'MRPiPS',
      ikona: 'baby',
      opis: 'System zniżek i dodatkowych uprawnień dla rodzin wielodzietnych 3+ w całej Polsce (kolej, paliwa, zakupy).',
      build: function (os) {
        const pesel = (os && os.moje && os.moje.pesel) || '91071427765';
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'kdr',
          name: 'Karta Dużej Rodziny',
          img: 'assets/card-kdr-bez.webp',
          strip: 'assets/strip-kdr.webp',
          sub: 'Ważna bezterminowo',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'Nr KDR 2026/118 554',
          f: [
            ['Nr karty', '2026/118 554'],
            ['Ważna', 'bezterminowo'],
            ['PESEL', pesel]
          ],
          rows: [
            ['Posiadacz', imieNazw],
            ['PESEL', pesel],
            ['Numer karty', 'KDR 2026/118 554'],
            ['Ważna', 'bezterminowo (rodzic)'],
            ['Uprawnienia', 'Zniżki handlowe, 37% ulgi PKP, tańszy paszport, zniżki na paliwo Orlen/Lotos']
          ]
        };
      }
    },
    {
      id: 'leg',
      kategoria: 'edukacja',
      kategoriaLabel: 'Edukacja i nauka',
      nazwa: 'mLegitymacja studencka',
      instytucja: 'Ministerstwo Nauki i Szkolnictwa Wyższego',
      badge: 'MNiSW / Uczelnia',
      ikona: 'doc',
      opis: 'Elektroniczny odpowiednik ELS dla studentów uczelni wyższych potwierdzający status studenta i 51% ulgi PKP.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Kacper Zieliński';
        return {
          id: 'leg',
          name: 'mLegitymacja studencka',
          img: 'assets/card-legitymacja-bez.webp',
          strip: 'assets/strip-legitymacja.webp',
          sub: 'Ważna do 31.03.2027',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'Uniwersytet Warszawski, nr albumu 241908',
          f: [
            ['Nr albumu', '241908'],
            ['Ważna do', '31.03.2027'],
            ['Uczelnia', 'UW'],
            ['Ulga PKP', '51%']
          ],
          rows: [
            ['Student', imieNazw],
            ['Uczelnia', 'Uniwersytet Warszawski'],
            ['Wydział', 'Wydział Prawa i Administracji'],
            ['Numer albumu', '241908'],
            ['Ważna do', '31.03.2027'],
            ['Uprawnienia', '51% ulgi na bilety PKP/Polregio, 50% ulgi na komunikację miejską']
          ]
        };
      }
    },
    {
      id: 'legitymacja_szkolna',
      kategoria: 'edukacja',
      kategoriaLabel: 'Edukacja i nauka',
      nazwa: 'mLegitymacja szkolna',
      instytucja: 'Ministerstwo Edukacji Narodowej',
      badge: 'MEN / Szkoła',
      ikona: 'doc',
      opis: 'Elektroniczna legitymacja ucznia szkoły podstawowej lub ponadpodstawowej z ulgą 37% PKP i 50% MPK.',
      build: function (os) {
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Marta Kowalska';
        return {
          id: 'legitymacja_szkolna',
          name: 'mLegitymacja szkolna',
          img: 'assets/card-legitymacja-szkolna.svg',
          strip: 'assets/strip-legitymacja-szkolna.svg',
          sub: 'MEN • Ważna do 30.09.2027',
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: 'Szkoła nr LS/8812/2026',
          f: [
            ['Nr legitymacji', 'LS/8812/2026'],
            ['Ważna do', '30.09.2027'],
            ['Szkoła', 'XIV LO im. S. Staszica'],
            ['Ulga', '37% PKP / 50% MPK']
          ],
          rows: [
            ['Uczeń', imieNazw],
            ['Szkoła', 'XIV Liceum Ogólnokształcące im. Stanisława Staszica w Warszawie'],
            ['Numer legitymacji', 'LS/8812/2026'],
            ['Data ważności', '30.09.2027'],
            ['Uprawnienia', '37% ulgi na przejazdy kolejowe, 50% ulgi na komunikację miejską']
          ]
        };
      }
    },
    {
      id: 'hdk',
      kategoria: 'zdrowie',
      kategoriaLabel: 'Zdrowie i krwiodawstwo',
      nazwa: 'Książeczka krwiodawcy (HDK / ZHDK)',
      instytucja: 'Ministerstwo Zdrowia • RCKiK',
      badge: 'HDK / RCKiK',
      ikona: 'shield',
      opis: 'Cyfrowa legitymacja Honorowego Dawcy Krwi: grupa krwi, litry oddanej krwi, data donacji, termin kolejnego oddania i uprawnienia (2 dni wolnego, ulgi na leki).',
      build: function (os) {
        const pesel = (os && os.moje && os.moje.pesel) || '83051203455';
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Jan Wiśniewski';
        const isJan = os && os.id === 'jan';
        const isMarta = os && os.id === 'marta';
        const grupa = isJan ? '0 Rh+' : (isMarta ? 'A Rh+' : '0 Rh-');
        const litry = isJan ? '18,5 L' : (isMarta ? '4,5 L' : '2,25 L');
        const tytul = isJan ? 'Zasłużony Honorowy Dawca Krwi I stopnia' : (isMarta ? 'Honorowy Dawca Krwi' : 'Honorowy Dawca Krwi');
        const nrLeg = isJan ? 'ZHDK/KR/04192/2018' : (isMarta ? 'HDK/WA/11082/2021' : 'HDK/PL/08129/2023');
        const dataOst = isJan ? '14.10.2026' : (isMarta ? '15.09.2026' : '10.08.2026');
        const kolejna = isJan ? '09.12.2026' : (isMarta ? '15.12.2026' : '05.11.2026');
        const centrum = isJan ? 'RCKiK w Krakowie, ul. Rzeźnicza 11' : (isMarta ? 'RCKiK w Warszawie, ul. Saska 63/75' : 'Regionalne Centrum Krwiodawstwa i Krwiolecznictwa');
        const ulgi = isJan 
          ? '2 dni wolnego od pracy, bezpłatne leki z listy Zasłużonych (ZHDK), 100% ulgi na komunikację miejską w Krakowie (>18L), ulga podatkowa PIT'
          : '2 dni wolnego od pracy/szkoły za każdą donację, ulga podatkowa PIT (darowizna krwi), obsługa poza kolejnością w aptekach i przychodniach';

        return {
          id: 'hdk',
          name: 'Książeczka krwiodawcy',
          img: 'assets/card-hdk.svg',
          strip: 'assets/strip-hdk.svg',
          sub: `RCKiK • ${isJan ? 'ZHDK (18,5 L)' : 'HDK (' + litry + ')'}`,
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: `Grupa krwi ${grupa}, ${litry} oddanej krwi`,
          f: [
            ['Grupa krwi', grupa],
            ['Oddana krew', litry],
            ['Ostatnia donacja', dataOst],
            ['Kolejna donacja', `od ${kolejna}`]
          ],
          rows: [
            ['Dawca', imieNazw],
            ['PESEL', pesel],
            ['Tytuł dawcy', tytul],
            ['Grupa krwi', `${grupa} (potwierdzona laboratoryjnie)`],
            ['Łącznie oddano', `${litry} krwi pełnej`],
            ['Numer legitymacji', nrLeg],
            ['Ostatnia donacja', `${dataOst} (RCKiK)`],
            ['Termin kolejnej donacji', `${kolejna} (odstęp min. 8 tyg.)`],
            ['Centrum Krwiodawstwa', centrum],
            ['Przysługujące uprawnienia', ulgi]
          ]
        };
      }
    },
    {
      id: 'osp',
      kategoria: 'zawodowe',
      kategoriaLabel: 'Służby i uprawnienia',
      nazwa: 'Legitymacja Członka OSP',
      instytucja: 'Związek Ochotniczych Straży Pożarnych RP',
      badge: 'ZOSP RP',
      ikona: 'shield',
      opis: 'Elektroniczna legitymacja strażaka Ochotniczej Straży Pożarnej: stopień funkcyjny, jednostka OSP, numer legitymacji, ważne badania lekarskie i certyfikaty KPP / AODO.',
      build: function (os) {
        const pesel = (os && os.moje && os.moje.pesel) || '83051203455';
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Jan Wiśniewski';
        const isJan = os && os.id === 'jan';
        const stopien = isJan ? 'Dowódca Sekcji OSP / Ratownik' : 'Ratownik OSP';
        const jednostka = isJan ? 'OSP Kraków-Kościelniki' : 'OSP Warszawa-Wesoła';
        const nrLeg = isJan ? 'OSP/MP/2019/084' : 'OSP/MZ/2022/190';
        const badania = isJan ? '14.04.2027' : '10.11.2027';
        const certyfikaty = 'KPP (Kwalifikowana Pierwsza Pomoc, ważna do 2028), Aparaty Ochrony Dróg Oddechowych (AODO), Kurs Podstawowy Strażaka-Ratownika OSP';

        return {
          id: 'osp',
          name: 'Legitymacja Członka OSP',
          img: 'assets/card-osp.svg',
          strip: 'assets/strip-osp.svg',
          sub: `${jednostka} • ${stopien.split(' / ')[0]}`,
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: `OSP nr ${nrLeg}, ${stopien.split(' / ')[0]}`,
          f: [
            ['Stopień', stopien.split(' / ')[0]],
            ['Jednostka', isJan ? 'OSP Kościelniki' : 'OSP Wesoła'],
            ['Nr legitymacji', nrLeg],
            ['Badania lekarskie', `do ${badania}`]
          ],
          rows: [
            ['Strażak-ratownik', imieNazw],
            ['PESEL', pesel],
            ['Stopień służbowy', stopien],
            ['Jednostka OSP', jednostka],
            ['Numer legitymacji', nrLeg],
            ['Badania lekarskie', `Ważne do ${badania} (zdolność bojowa)`],
            ['Certyfikaty i kwalifikacje', certyfikaty],
            ['Organ wydający', 'Zarząd Oddziału Powiatowego Związku OSP RP'],
            ['Status operacyjny', 'Uprawniony do bezpośredniego udziału w działaniach ratowniczo-gaśniczych']
          ]
        };
      }
    },
    {
      id: 'pz',
      kategoria: 'tozsamosc',
      kategoriaLabel: 'Tożsamość i status',
      nazwa: 'Profil Zaufany (PZ)',
      instytucja: 'Ministerstwo Cyfryzacji • Centralny Ośrodek Informatyki',
      badge: 'PZ / MC',
      ikona: 'shield',
      opis: 'Karta i cyfrowy certyfikat Profilu Zaufanego (PZ): potwierdzona ważność do 2028 r., metoda weryfikacji tożsamości oraz powiązane dane kontaktowe (e-mail, telefon).',
      build: function (os) {
        const pesel = (os && os.moje && os.moje.pesel) || '83051203455';
        const imieNazw = (os && os.moje && os.moje.imie_nazwisko) || 'Jan Wiśniewski';
        const isJan = os && os.id === 'jan';
        const isMarta = os && os.id === 'marta';
        const isEwa = os && os.id === 'ewa';
        const waznosc = isJan ? '12.05.2028' : (isMarta ? '14.07.2028' : (isEwa ? '03.02.2028' : '21.03.2028'));
        const metoda = isJan 
          ? 'Bankowość elektroniczna (mBank S.A.) + e-Dowód'
          : (isMarta ? 'Bankowość elektroniczna (PKO Bank Polski) + mObywatel' : (isEwa ? 'Bank Pekao S.A. / Placówka ZUS' : 'Santander Bank Polska / e-Dowód'));
        const metodaKrotka = isJan ? 'mBank / e-Dowód' : (isMarta ? 'PKO BP / mObywatel' : (isEwa ? 'Pekao S.A.' : 'Santander'));
        const email = isJan 
          ? 'jan.wisniewski@instalacje-krakow.pl'
          : (isMarta ? 'marta.kowalska@gmail.com' : (isEwa ? 'ewa.nowak@szkola.lublin.pl' : 'kacper.zielinski@student.pg.edu.pl'));
        const tel = isJan ? '+48 602 ••• 312' : (isMarta ? '+48 501 ••• 412' : (isEwa ? '+48 603 ••• 882' : '+48 791 ••• 119'));
        const idPZ = isJan ? 'PZ-830512-WIŚN' : (isMarta ? 'PZ-910714-KOWA' : (isEwa ? 'PZ-690203-NOWA' : 'PZ-062321-ZIEL'));

        return {
          id: 'pz',
          name: 'Profil Zaufany (PZ)',
          img: 'assets/card-pz.svg',
          strip: 'assets/strip-pz.svg',
          sub: `Węzeł Krajowy • Ważny do ${waznosc.slice(-4)}`,
          photo: 1,
          holder: imieNazw.toUpperCase(),
          line: `Profil Zaufany ważny do ${waznosc}`,
          f: [
            ['Status', 'Aktywny'],
            ['Ważny do', waznosc],
            ['Weryfikacja', metodaKrotka],
            ['Powiązany tel.', tel]
          ],
          rows: [
            ['Użytkownik', imieNazw],
            ['PESEL', pesel],
            ['Identyfikator profilu', idPZ],
            ['Status Profilu Zaufanego', 'Aktywny i potwierdzony (login.gov.pl)'],
            ['Data ważności', `${waznosc} (odnowienie online przed upływem terminu)`],
            ['Metoda weryfikacji', metoda],
            ['Powiązany adres e-mail', email],
            ['Powiązany numer telefonu', tel],
            ['Uprawnienia podpisu', 'Zdolność do składania Podpisu Zaufanego (ePUAP / gov.pl)'],
            ['Poziom zaufania', 'Średni (Substantial) zgodnie z unijnym rozporządzeniem eIDAS']
          ]
        };
      }
    }
  ];

  // Stan aktywnego filtru w modalnym katalogu
  let activeFilter = 'wszystkie';
  let searchQuery = '';

  // --- 3. Wstrzykiwanie kontenera modalu do DOM ---
  function ensureModalElement() {
    let m = document.getElementById('katalogKartModal');
    if (m) return m;

    m = document.createElement('div');
    m.id = 'katalogKartModal';
    m.className = 'sheet-modal katalog-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'katalogModalTitle');

    m.innerHTML = `
      <div class="scrim" onclick="closeKatalogKartModal()"></div>
      <div class="modal-box katalog-modal-box">
        <div class="modal-head">
          <div>
            <h2 id="katalogModalTitle">Dodaj dokument</h2>
            <p class="modal-sub" style="margin:2px 0 0">Katalog oficjalnych dokumentów państwowych</p>
          </div>
          <button type="button" class="tx-close" onclick="closeKatalogKartModal()" aria-label="Zamknij">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
          </button>
        </div>

        <!-- Wyszukiwarka i filtry kategorii -->
        <div class="katalog-search-bar">
          <input type="text" id="katalogSearchInput" placeholder="Szukaj dokumentu (np. ZUS, lekarz, szkoła)…" enterkeyhint="search" aria-label="Wyszukaj dokument w katalogu">
        </div>

        <div class="katalog-filters" role="tablist" aria-label="Kategorie dokumentów">
          <button type="button" class="chip-sm active" data-filter="wszystkie" onclick="setKatalogFilter('wszystkie')">Wszystkie</button>
          <button type="button" class="chip-sm" data-filter="zdrowie" onclick="setKatalogFilter('zdrowie')">Zdrowie i krew</button>
          <button type="button" class="chip-sm" data-filter="tozsamosc" onclick="setKatalogFilter('tozsamosc')">Tożsamość</button>
          <button type="button" class="chip-sm" data-filter="zawodowe" onclick="setKatalogFilter('zawodowe')">Zawodowe i służby</button>
          <button type="button" class="chip-sm" data-filter="rodzina" onclick="setKatalogFilter('rodzina')">Rodzina i KDR</button>
          <button type="button" class="chip-sm" data-filter="emerytura" onclick="setKatalogFilter('emerytura')">ZUS i emerytury</button>
          <button type="button" class="chip-sm" data-filter="edukacja" onclick="setKatalogFilter('edukacja')">Edukacja i nauka</button>
        </div>

        <!-- Lista dokumentów do wyboru -->
        <div class="katalog-items-list" id="katalogItemsList" role="list"></div>
      </div>
    `;

    (document.getElementById('app') || document.body).appendChild(m);   // jak pozostałe arkusze: w ramce telefonu, nie na całe okno

    // Obsługa wpisywania w wyszukiwarkę
    const input = m.querySelector('#katalogSearchInput');
    if (input) {
      input.addEventListener('input', (e) => {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        renderKatalogList();
      });
    }

    return m;
  }

  // --- 4. Renderowanie listy dokumentów w modalu ---
  function renderKatalogList() {
    const listEl = document.getElementById('katalogItemsList');
    if (!listEl) return;

    const currentDocs = (typeof DOCS !== 'undefined') ? DOCS : ((typeof OS !== 'undefined' && OS.docs) ? OS.docs : []);

    const filtered = KATALOG_DOKUMENTOW.filter(item => {
      // Filtr kategorii
      if (activeFilter !== 'wszystkie' && item.kategoria !== activeFilter) {
        return false;
      }
      // Filtr tekstu wyszukiwania
      if (searchQuery) {
        const text = (item.nazwa + ' ' + item.instytucja + ' ' + item.opis + ' ' + item.badge).toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="katalog-empty">
          <p>Nie znaleziono dokumentów dla podanych kryteriów.</p>
          <button type="button" class="btn ghost btn-sm" onclick="setKatalogFilter('wszystkie')">Pokaż wszystkie dokumenty</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const alreadyInWallet = currentDocs.some(d => d.id === item.id);
      return `
        <div class="katalog-card ${alreadyInWallet ? 'in-wallet' : ''}" role="listitem">
          <div class="kc-preview" style="background-image:url(&quot;${item.build ? item.build(typeof OS !== 'undefined' ? OS : {}).img : ''}&quot;)">
            <span class="kc-badge">${item.badge}</span>
          </div>
          <div class="kc-info">
            <div class="kc-inst">${item.instytucja}</div>
            <h3 class="kc-title">${item.nazwa}</h3>
            <p class="kc-desc">${item.opis}</p>
          </div>
          <div class="kc-action">
            ${alreadyInWallet
              ? `<button type="button" class="btn secondary btn-sm kc-btn" onclick="openDoc('${item.id}');closeKatalogKartModal();" aria-label="Otwórz dokument ${item.nazwa}">
                   <span class="kc-check"><i class="ik ik-check" aria-hidden="true"></i></span> W portfelu
                 </button>`
              : `<button type="button" class="btn primary btn-sm kc-btn" onclick="dodajDokumentDoPortfela('${item.id}')" aria-label="Dodaj ${item.nazwa} do portfela">
                   + Dodaj
                 </button>`
            }
          </div>
        </div>
      `;
    }).join('');
  }

  // Zmiana aktywnego filtru w modalu
  window.setKatalogFilter = function (filter) {
    activeFilter = filter;
    const m = document.getElementById('katalogKartModal');
    if (m) {
      m.querySelectorAll('.katalog-filters .chip-sm').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }
    renderKatalogList();
    if (typeof haptic === 'function') haptic('tap');
  };

  // --- 5. Otwieranie i zamykanie modalu katalogu ---
  function openKatalogKartModal() {
    const m = ensureModalElement();
    activeFilter = 'wszystkie';
    searchQuery = '';
    const input = m.querySelector('#katalogSearchInput');
    if (input) input.value = '';

    m.querySelectorAll('.katalog-filters .chip-sm').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === 'wszystkie');
    });

    renderKatalogList();
    m.classList.add('open');

    if (typeof haptic === 'function') haptic('tap');
    if (typeof openDialogFocus === 'function') openDialogFocus('katalogKartModal', m, '#katalogSearchInput');
    if (typeof announceSR === 'function') announceSR('Otwarto katalog dokumentów państwowych. Wybierz dokument do dodania.');
  }

  function closeKatalogKartModal() {
    const m = document.getElementById('katalogKartModal');
    if (m) {
      m.classList.remove('open');
      if (typeof restoreDialogFocus === 'function') restoreDialogFocus('katalogKartModal');
    }
  }

  // --- 6. Dynamiczne dodawanie dokumentu do portfela ---
  function dodajDokumentDoPortfela(docId) {
    const item = KATALOG_DOKUMENTOW.find(x => x.id === docId);
    if (!item) {
      if (typeof showToast === 'function') showToast('Nie znaleziono szablonu dokumentu.');
      return;
    }

    const currentOS = (typeof OS !== 'undefined') ? OS : null;
    const docObj = item.build(currentOS);

    // Sprawdzenie czy dokument jest już w DOCS
    if (typeof DOCS !== 'undefined') {
      if (DOCS.some(d => d.id === docId)) {
        if (typeof showToast === 'function') showToast(`Dokument "${docObj.name}" znajduje się już w Twoim portfelu.`);
        closeKatalogKartModal();
        if (typeof openDoc === 'function') openDoc(docId);
        return;
      }
      DOCS.push(docObj);
    }

    if (currentOS && currentOS.docs && !currentOS.docs.some(d => d.id === docId)) {
      currentOS.docs.push(docObj);
    }

    // Synchronizacja kolejności stosu (STACK_ORDER)
    if (typeof STACK_ORDER !== 'undefined') {
      STACK_ORDER.length = 0;
      STACK_ORDER.push(...DOCS.map(d => d.id).reverse());
    }

    // Przeliczenie stosu kart i układu
    if (typeof renderStack === 'function') {
      renderStack();
    }
    if (typeof buildAlt === 'function') {
      buildAlt();
    }
    if (typeof layout === 'function') {
      layout();
    }

    // Haptyka i powiadomienie
    if (typeof haptic === 'function') haptic('success');
    if (typeof showToast === 'function') {
      showToast(`Pomyślnie dodano: ${docObj.name}`);
    }
    if (typeof announceSR === 'function') {
      announceSR(`Pomyślnie dodano dokument ${docObj.name} do Twojego portfela.`);
    }

    // Zamknięcie modalu
    closeKatalogKartModal();

    // Opcjonalne otwarcie podglądu nowo dodanego dokumentu po krótkiej animacji
    setTimeout(() => {
      if (typeof openDoc === 'function') {
        openDoc(docId);
      }
    }, 380);
  }

  // --- 7. Wstrzykiwanie przycisku "+ Dodaj dokument" w widoku dokumentów ---
  function injectDodajBtn() {
    if (document.getElementById('btnDodajDokument')) return;

    // Przycisk tworzymy jako elegancki element nad sekcją przypomnień / bezpośrednio pod kartami
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-dodaj-dok-bar';
    btn.id = 'btnDodajDokument';
    btn.setAttribute('aria-label', 'Dodaj nowy dokument państwowy do portfela');
    btn.onclick = openKatalogKartModal;

    btn.innerHTML = `
      <svg class="bdd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke-width="1.6"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
      <span class="bdd-label">+ Dodaj dokument</span>
      <span class="bdd-badge">Katalog</span>
    `;

    // Szukamy sekcji reminders lub stackwrap
    const rem = document.getElementById('reminders');
    const searchPill = document.getElementById('searchPill');

    if (rem && searchPill) {
      rem.insertBefore(btn, searchPill);
    } else if (rem) {
      rem.prepend(btn);
    } else {
      const app = document.getElementById('app');
      if (app) app.appendChild(btn);
    }

    // Przeliczenie układu po dodaniu przycisku
    if (typeof layout === 'function') {
      layout();
    }
  }

  // --- 8. Style CSS specyficzne dla modułu katalogu i przycisku dodawania ---
  function injectStyles() {
    if (document.getElementById('katalogKartStyles')) return;
    const s = document.createElement('style');
    s.id = 'katalogKartStyles';
    s.textContent = `
      /* Przycisk "+ Dodaj dokument" na ekranie głównym */
      .btn-dodaj-dok-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        padding: 9px 14px;
        margin-bottom: 8px;
        background: var(--surface, #ffffff);
        border: 1px dashed rgba(0, 82, 165, 0.35);
        border-radius: 14px;
        color: var(--brand, #0052a5);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(15, 25, 60, 0.03);
        transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
      }
      .btn-dodaj-dok-bar:hover {
        background: rgba(0, 82, 165, 0.05);
        border-color: var(--brand, #0052a5);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 82, 165, 0.1);
      }
      .btn-dodaj-dok-bar:active {
        transform: scale(0.985);
      }
      .btn-dodaj-dok-bar .bdd-icon {
        width: 18px;
        height: 18px;
        flex: none;
        color: var(--brand, #0052a5);
      }
      .btn-dodaj-dok-bar .bdd-label {
        flex: 1;
        text-align: left;
        color: var(--brand, #0052a5);
        letter-spacing: -0.01em;
      }
      .btn-dodaj-dok-bar .bdd-badge {
        flex: none;
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(0, 82, 165, 0.1);
        color: var(--brand, #0052a5);
      }
      .phone.dark-mode .btn-dodaj-dok-bar {
        background: #1e293b;
        border-color: rgba(96, 165, 250, 0.3);
        color: #93c5fd;
      }
      .phone.dark-mode .btn-dodaj-dok-bar .bdd-icon,
      .phone.dark-mode .btn-dodaj-dok-bar .bdd-label,
      .phone.dark-mode .btn-dodaj-dok-bar .bdd-badge {
        color: #93c5fd;
      }
      .phone.dark-mode .btn-dodaj-dok-bar .bdd-badge {
        background: rgba(96, 165, 250, 0.18);
      }
      .high-contrast .btn-dodaj-dok-bar {
        background: #000 !important;
        color: #ffd700 !important;
        border: 2px solid #ffd700 !important;
      }
      .high-contrast .btn-dodaj-dok-bar .bdd-icon,
      .high-contrast .btn-dodaj-dok-bar .bdd-label,
      .high-contrast .btn-dodaj-dok-bar .bdd-badge {
        color: #ffd700 !important;
      }
      .high-contrast .btn-dodaj-dok-bar .bdd-badge {
        background: #ffd700 !important;
        color: #000000 !important;
      }
      .phone.dark-mode .katalog-search-bar input {
        background: #181d28 !important;
        border-color: rgba(255,255,255,0.15) !important;
        color: #ffffff !important;
      }
      .phone.dark-mode .katalog-card {
        background: #1e2433 !important;
        border-color: rgba(255,255,255,0.08) !important;
        color: #f0f3fa !important;
      }
      .phone.dark-mode .kc-title {
        color: #ffffff !important;
      }
      .phone.dark-mode .kc-desc {
        color: #9ea7ba !important;
      }
      .phone.dark-mode .chip-sm {
        background: #1e2433 !important;
        color: #9ea7ba !important;
        border-color: rgba(255,255,255,0.1) !important;
      }
      .phone.dark-mode .chip-sm.active {
        background: var(--red) !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-modal-box {
        background: #000000 !important;
        border: 2px solid #ffd700 !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-search-bar input {
        background: #000000 !important;
        border: 2px solid #ffd700 !important;
        color: #ffffff !important;
      }
      .high-contrast .katalog-search-bar input::placeholder {
        color: #ffd700 !important;
        opacity: 0.9 !important;
      }
      .high-contrast .katalog-card {
        background: #000000 !important;
        border: 2px solid #ffffff !important;
        color: #ffffff !important;
      }
      .high-contrast .kc-title {
        color: #ffffff !important;
      }
      .high-contrast .kc-desc {
        color: #ffd700 !important;
      }
      .high-contrast .kc-inst {
        color: #00ff66 !important;
      }
      .high-contrast .chip-sm {
        background: #000000 !important;
        border: 1.5px solid #ffffff !important;
        color: #ffffff !important;
      }
      .high-contrast .chip-sm.active {
        background: #ffd700 !important;
        color: #000000 !important;
        border-color: #ffd700 !important;
        font-weight: 700 !important;
      }
      .high-contrast .kc-btn.primary {
        background: #ffd700 !important;
        color: #000000 !important;
        border: 2px solid #ffffff !important;
        font-weight: 700 !important;
      }
      .high-contrast .kc-btn.secondary {
        background: #000000 !important;
        color: #00ff66 !important;
        border: 2px solid #00ff66 !important;
      }
      .phone.compact-h .btn-dodaj-dok-bar {
        padding: 6px 10px;
        font-size: 12px;
        margin-bottom: 5px;
      }

      /* Modal Katalogu */
      .katalog-modal-box {
        max-height: 88% !important;
        display: flex;
        flex-direction: column;
      }
      .katalog-search-bar {
        margin: 12px 0 10px;
      }
      .katalog-search-bar input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid var(--border, #d1d5db);
        background: var(--bg, #f9fafb);
        color: var(--ink, #111827);
        font-family: inherit;
        font-size: 13.5px;
        outline: none;
        transition: border-color .18s ease;
      }
      .katalog-search-bar input:focus {
        border-color: var(--brand, #0052a5);
        background: #ffffff;
      }
      .katalog-filters {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 10px;
        -webkit-overflow-scrolling: touch;
      }
      .katalog-filters::-webkit-scrollbar {
        display: none;
      }
      .katalog-items-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        padding-right: 2px;
        flex: 1;
      }
      .katalog-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: var(--surface, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 16px;
        transition: border-color .18s ease, background .18s ease;
      }
      .katalog-card.in-wallet {
        background: rgba(16, 185, 129, 0.04);
        border-color: rgba(16, 185, 129, 0.25);
      }
      .kc-preview {
        width: 60px;
        height: 40px;
        border-radius: 8px;
        flex: none;
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.12);
      }
      .kc-badge {
        font-size: 8.5px;
        font-weight: 800;
        background: rgba(0,0,0,0.6);
        color: #fff;
        padding: 1px 4px;
        border-radius: 4px;
        letter-spacing: 0.02em;
      }
      .kc-info {
        flex: 1;
        min-width: 0;
      }
      .kc-inst {
        font-size: 10.5px;
        font-weight: 600;
        color: var(--ink2, #6b7280);
        margin-bottom: 1px;
      }
      .kc-title {
        font-size: 13.5px;
        line-height: 17px;
        font-weight: 700;
        color: var(--ink, #111827);
        margin: 0 0 2px 0;
      }
      .kc-desc {
        font-size: 11px;
        line-height: 15px;
        color: var(--ink2, #4b5563);
        margin: 0;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .kc-action {
        flex: none;
      }
      .kc-btn {
        padding: 7px 12px !important;
        font-size: 12px !important;
        border-radius: 10px !important;
      }
      .kc-check {
        font-weight: 800;
        color: #10b981;
        margin-right: 3px;
      }
      .katalog-empty {
        padding: 24px 12px;
        text-align: center;
        color: var(--ink2, #6b7280);
        font-size: 13px;
      }
      .phone.dark-mode .katalog-card {
        background: #1e293b;
        border-color: #334155;
      }
      .phone.dark-mode .kc-title {
        color: #f1f5f9;
      }
      .phone.dark-mode .kc-desc {
        color: #94a3b8;
      }
      .phone.dark-mode .kc-inst {
        color: #cbd5e1;
      }
    `;
    document.head.appendChild(s);
  }

  // --- 9. Inicjalizacja modułu ---
  function init() {
    injectStyles();
    injectDodajBtn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // --- 10. Eksport globalnych funkcji API ---
  window.KATALOG_DOKUMENTOW = KATALOG_DOKUMENTOW;
  window.openKatalogKartModal = openKatalogKartModal;
  window.closeKatalogKartModal = closeKatalogKartModal;
  window.dodajDokumentDoPortfela = dodajDokumentDoPortfela;
  window.injectDodajBtn = injectDodajBtn;

})();
