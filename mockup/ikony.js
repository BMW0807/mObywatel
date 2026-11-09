/* ---------- Ikony aplikacji (zamiast systemowych emoji) ----------
   Jeden styl: obrys 1,8 px na siatce 24×24, zaokrąglone końce. Ikona to <i class="ik ik-nazwa"> z maską CSS,
   więc przyjmuje kolor tekstu (currentColor) i sama dopasowuje się do trybu ciemnego i wysokiego kontrastu.
   Flagi języków są kolorowe (<i class="ikf ikf-pl">).
   Użycie w kodzie: ikona('pill') albo flaga('pl'); w HTML: <i class="ik ik-pill" aria-hidden="true"></i>. */
(function () {
  const IKONY = {
    moon: '<path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.4 6.4 0 0 0 10.6 10.6z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    car: '<path d="M5.2 12.3 7 7.7a2 2 0 0 1 1.9-1.2h6.2a2 2 0 0 1 1.9 1.2l1.8 4.6"/><rect x="3.5" y="12.3" width="17" height="5" rx="1.5"/><path d="M6 17.3v2.2M18 17.3v2.2M7.3 14.8h.01M16.7 14.8h.01"/>',
    shield: '<path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.9 7 9.8 4.1-1.9 7-5.5 7-9.8V5.8z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    baby: '<circle cx="12" cy="9" r="4.6"/><path d="M10.4 8.6h.01M13.6 8.6h.01M10.6 10.8s.6.6 1.4.6 1.4-.6 1.4-.6M6.8 20c1-2.8 3-4.3 5.2-4.3s4.2 1.5 5.2 4.3"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    id: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 15.5c.6-1.3 1.7-2 3-2s2.4.7 3 2M14.5 10h3M14.5 13h3"/>',
    hospital: '<path d="M4.5 20.5V8.2L12 4l7.5 4.2v12.3"/><path d="M3 20.5h18"/><path d="M12 9.5v6M9 12.5h6"/>',
    building: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h1.5M13.5 7.5H15M9 11h1.5M13.5 11H15M9 14.5h1.5M13.5 14.5H15M10.5 20.5v-3h3v3"/>',
    cert: '<path d="M14.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4.5"/><path d="M14.5 3.5 19 8v3.2"/><path d="M14.5 3.5V8H19"/><path d="M8.5 11h6M8.5 14h3"/><circle cx="16.5" cy="15.3" r="2.6"/><path d="m15.1 17.5-.6 3.5 2-1.1 2 1.1-.6-3.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
    ribbon: '<path d="M12 2.8c-2 0-3.3 1.5-3.3 3.4 0 2.6 2 5.6 3.3 7.3 1.3-1.7 3.3-4.7 3.3-7.3 0-1.9-1.3-3.4-3.3-3.4z"/><path d="M9.3 13.3 6 21l3-1.2L10.6 22l2.5-5.3M14.7 13.3 18 21l-3-1.2-1.6 2.2"/>',
    doctor: '<path d="M6 3.5H5a1.5 1.5 0 0 0-1.5 1.5v4a5 5 0 0 0 10 0V5A1.5 1.5 0 0 0 12 3.5h-1"/><path d="M8.5 14v1.5a5 5 0 0 0 10 0V13"/><circle cx="18.5" cy="11" r="2"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.6"/>',
    sign: '<path d="m15.5 4.5 4 4L9 19H5v-4z"/><path d="m13.5 6.5 4 4M13.5 20.5h7"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>',
    retry: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4.5h-4.5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4.5h4.5"/>',
    camera: '<path d="M4 8h3l1.8-2.5h6.4L17 8h3a.5.5 0 0 1 .5.5v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-10A.5.5 0 0 1 4 8z"/><circle cx="12" cy="13.5" r="3.5"/>',
    file: '<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19M9 13h6M9 16.5h6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
    pill: '<path d="M10.2 20.2a5 5 0 0 1-7-7l6.6-6.6a5 5 0 0 1 7 7z"/><path d="m6.5 10 7.5 7.5"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><rect x="9" y="3" width="6" height="3" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    chart: '<path d="M4 20.5h16M7 20.5V13M11 20.5V6.5M15 20.5V15M19 20.5V9.5"/>',
    trend: '<path d="m3.5 17.5 5.5-5.5 3.5 3.5 8-8"/><path d="M15 7.5h5.5V13"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1-3.7 4-5.8 7.5-5.8s6.5 2.1 7.5 5.8"/>',
    layers: '<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.5 7.5 0 0 0-2.6 1.5L4.6 5.6l-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4z"/>',
    siren: '<path d="M6.5 17.5V13a5.5 5.5 0 0 1 11 0v4.5"/><rect x="4.5" y="17.5" width="15" height="3" rx="1"/><path d="M12 3v2.2M4.4 6.4 6 8M19.6 6.4 18 8M12 10.5A2.5 2.5 0 0 0 9.5 13"/>',
    institution: '<path d="M3.5 9 12 4l8.5 5z"/><path d="M5.5 9.5v8M10 9.5v8M14 9.5v8M18.5 9.5v8M3.5 20.5h17M4.5 17.5h15"/>',
    bank: '<path d="M3.5 9 12 4l8.5 5z"/><path d="M6 9.5v7.5M18 9.5v7.5M3.5 20.5h17M4.5 17h15"/><circle cx="12" cy="13" r="2.2"/>',
    arrow: '<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',
    police: '<path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.9 7 9.8 4.1-1.9 7-5.5 7-9.8V5.8z"/><path d="m12 8.3 1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z"/>',
    hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 2.5h5M12 2.5V6M18.4 6.6 20 5"/>',
    warning: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17h.01"/>',
    grad: '<path d="m12 4.5 10 4.5-10 4.5L2 9z"/><path d="M6 11v4.5c0 1.6 2.7 3 6 3s6-1.4 6-3V11M22 9v5"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>',
    inbox: '<path d="M3.5 13.5h4.5l1.5 2.5h5l1.5-2.5h4.5"/><path d="M5.5 5.5h13l2 8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-5.5z"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>',
    clip: '<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"/>',
    faceid: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1.5M15 9.5v1.5M12 9.5v4h-1M9.5 16s1 1 2.5 1 2.5-1 2.5-1"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3M12 14.5V17"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 7.8-1.3M12 14.5V17"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.7 6.3A4 4 0 0 1 19.5 4.5l-2.6 2.6.6 2.2 2.2.6 2.6-2.6"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.2"/><path d="M2.5 10h19M6 15h4"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10.5" r="3.2"/><path d="M8.8 10.5h6.4M12 7.3c-1.2 1.2-1.2 5.2 0 6.4M12 7.3c1.2 1.2 1.2 5.2 0 6.4M9 17.5h6"/>',
    family: '<circle cx="7.5" cy="6.5" r="2.5"/><circle cx="16.5" cy="6.5" r="2.5"/><path d="M3 20v-3.5A3.5 3.5 0 0 1 6.5 13h2a3.4 3.4 0 0 1 2.2.8M21 20v-3.5a3.5 3.5 0 0 0-3.5-3.5h-2a3.4 3.4 0 0 0-2.2.8"/><circle cx="12" cy="14.5" r="1.9"/><path d="M9.3 20.5a2.7 2.7 0 0 1 5.4 0"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>',
    home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
    docs: '<path d="M8 3.5h7l4 4V17a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 17V5A1.5 1.5 0 0 1 8 3.5z"/><path d="M15 3.5v4h4M3.5 7v12A1.5 1.5 0 0 0 5 20.5h9.5"/>',
    wallet: '<path d="M4 7.5V18a2 2 0 0 0 2 2h13.5a1 1 0 0 0 1-1v-3M4 7.5a2 2 0 0 1 2-2h11.5v2"/><path d="M4 7.5h15.5a1 1 0 0 1 1 1V12h-4a2 2 0 0 0 0 4h4"/>',
    crash: '<path d="m12 2.5 1.8 5.3 5.2-2.2-2.2 5.2 5.2 1.7-5.2 1.8 2.2 5.2-5.2-2.2-1.8 5.2-1.8-5.2L5 19.5l2.2-5.2L2 12.5l5.2-1.7L5 5.6l5.2 2.2z"/>',
    plane: '<path d="M21 15.5v-2l-7.5-4.5V4a1.5 1.5 0 0 0-3 0v5L3 13.5v2l7.5-2.3V18l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.8z"/>',
    ballot: '<path d="M7 13.5V5.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8"/><path d="m9.5 9 1.8 1.8 3.2-3.3M3 13.5h18M4.5 13.5v7h15v-7"/>',
    leaf: '<path d="M5 19C5 11 10 5.5 20 4.5c-.5 10-6 15-14 15"/><path d="M5 19c3-4 6-6.5 10-8.5"/>',
    sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/><path d="M19 15.5c.2 1.4 1 2.2 2.4 2.4-1.4.2-2.2 1-2.4 2.4-.2-1.4-1-2.2-2.4-2.4 1.4-.2 2.2-1 2.4-2.4z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    chat: '<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.6A8 8 0 1 1 20.5 11.5z"/>',
    go: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
    mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    backspace: '<path d="M8.5 5.5h11a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-11L3 12z"/><path d="m11 9.5 5 5M16 9.5l-5 5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M8.5 15.5c-1.6-1.2-3-3-3-5.5a6.5 6.5 0 0 1 13 0c0 2.5-1.4 4.3-3 5.5z"/>',
    lungs: '<path d="M12 3.5v7.5M12 9.5c-1.4 1.1-2.4 1.5-3.5 1.5M12 9.5c1.4 1.1 2.4 1.5 3.5 1.5"/><path d="M8.5 6.5C6 6.5 3.5 11 3.5 16.5c0 2.5 1.5 3.5 3.5 3.5 2.5 0 3-1.5 3-4V8.5c0-1-.6-2-1.5-2zM15.5 6.5c2.5 0 5 4.5 5 10 0 2.5-1.5 3.5-3.5 3.5-2.5 0-3-1.5-3-4V8.5c0-1 .6-2 1.5-2z"/>',
    run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="m8 21 3.2-6 3 2.5V22M5.5 11l3-3.5h4.5l2.5 4 3 1M12.6 8l-1.9 7"/>',
    bus: '<rect x="4.5" y="3.5" width="15" height="14.5" rx="2.5"/><path d="M4.5 11h15M4.5 7h15M8 14.5h.01M16 14.5h.01M7 18v2.5M17 18v2.5"/>',
    book: '<path d="M12 6.5c-2-1.5-4.5-2-8.5-2v14c4 0 6.5.5 8.5 2 2-1.5 4.5-2 8.5-2v-14c-4 0-6.5.5-8.5 2zM12 6.5v14"/>',
    bell: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5zM10 20.5a2 2 0 0 0 4 0"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'
  };

  // flagi języków (kolorowe, nie maski); gwiazdy UE liczone na okręgu
  const gwiazdy = Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * Math.PI * 2;
    return `<circle cx="${(15 + Math.cos(a) * 6).toFixed(2)}" cy="${(10 + Math.sin(a) * 6).toFixed(2)}" r="0.9" fill="#ffcc00"/>`;
  }).join('');
  const FLAGI = {
    pl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#dc143c"/></svg>',
    ua: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16"><rect width="24" height="8" fill="#0057b7"/><rect y="8" width="24" height="8" fill="#ffd700"/></svg>',
    gb: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="c"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0 0 30" clip-path="url(#c)" stroke="#c8102e" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>',
    eu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#003399"/>${gwiazdy}</svg>`
  };

  const url = s => 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
  const maska = p => url('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>');
  let css = '.ik{display:inline-block;flex:none;width:1.15em;height:1.15em;vertical-align:-.2em;background-color:currentColor;' +
    '-webkit-mask:var(--ik) center/contain no-repeat;mask:var(--ik) center/contain no-repeat}' +
    '.ikf{display:inline-block;flex:none;width:1.4em;height:.95em;vertical-align:-.12em;border-radius:3px;background:center/cover no-repeat;box-shadow:0 0 0 1px rgba(0,0,0,.14)}';
  for (const [k, v] of Object.entries(IKONY)) css += `.ik-${k}{--ik:${maska(v)}}`;
  for (const [k, v] of Object.entries(FLAGI)) css += `.ikf-${k}{background-image:${url(v)}}`;
  const st = document.createElement('style');
  st.id = 'ikony-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  window.IKONY = IKONY;
  window.ikona = (n, cls) => `<i class="ik ik-${n}${cls ? ' ' + cls : ''}" aria-hidden="true"></i>`;
  window.flaga = k => `<i class="ikf ikf-${k}" aria-hidden="true"></i>`;
})();
