/* ==========================================================================
   mObywatel 2.0 - Moduł Powiadomień Systemowych Push oraz Eksportu Danych
   Plik: mockup/powiadomienia-eksport.js
   
   Zawiera:
   1. Dynamic Island / iOS In-App Push Banners (showSystemPush, triggerDemoNotification)
      - Płynne zsuwanie z góry ekranu (4.5 sekundy)
      - Obsługa gestu przesunięcia palcem w górę (swipe up)
      - Kliknięcie wykonujące akcję (e-Recepta, Pismo z US, Alert RCB, Kalendarz)
      - Okresowa symulacja powiadomień
   2. Eksport do pliku kalendarza iCalendar (.ics) (exportEventToCalendar)
   3. Eksport Urzędowego Poświadczenia Odbioru UPO XML / TXT (exportUpoToFile)
   ========================================================================== */

(function (global) {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. STYLE CSS DLA SYSTEMOWYCH POWIADOMIEŃ PUSH (DYNAMIC ISLAND)
  // -------------------------------------------------------------------------
  const PUSH_STYLES = `
    /* Kontener dla banerów push w telefonie */
    .mob-push-host {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    /* Baner Powiadomienia w stylu iOS Dynamic Island / Android Pill */
    .mob-push-banner {
      pointer-events: auto;
      position: relative;
      width: 100%;
      max-width: 382px;
      margin: 0 auto;
      background: rgba(18, 22, 34, 0.95);
      background: linear-gradient(165deg, rgba(26, 32, 48, 0.97) 0%, rgba(13, 16, 26, 0.96) 100%);
      color: #ffffff;
      border-radius: 26px;
      box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.55),
                  0 0 0 1px rgba(255, 255, 255, 0.14) inset,
                  0 2px 8px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      padding: 10px 14px 11px 12px;
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y;
      transform: translateY(-130%) scale(0.92);
      opacity: 0;
      transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.3s ease,
                  box-shadow 0.2s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .mob-push-banner.active {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    .mob-push-banner.swiping {
      transition: none !important;
    }

    .mob-push-banner.dismissing {
      transform: translateY(-140%) scale(0.88);
      opacity: 0;
      transition: transform 0.32s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease;
    }

    /* Uchwyt do przeciągania (swipe up pill) */
    .mob-push-pill {
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 36px;
      height: 3.5px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.28);
      pointer-events: none;
    }

    .mob-push-banner:hover .mob-push-pill {
      background: rgba(255, 255, 255, 0.45);
    }

    /* Układ wnętrza */
    .mob-push-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    /* Ikona powiadomienia */
    .mob-push-icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      overflow: hidden;
    }

    .mob-push-icon img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }

    .mob-push-icon svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    /* Treść tekstowa */
    .mob-push-body-wrap {
      flex: 1 1 auto;
      min-width: 0;
    }

    .mob-push-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 2px;
      font-size: 11px;
    }

    .mob-push-badge {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #93c5fd;
      background: rgba(59, 130, 246, 0.16);
      padding: 1.5px 6.5px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .mob-push-badge.rcb {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.22);
    }

    .mob-push-badge.zdrowie {
      color: #86efac;
      background: rgba(34, 197, 94, 0.18);
    }

    .mob-push-badge.pojazd {
      color: #fde047;
      background: rgba(234, 179, 8, 0.18);
    }

    .mob-push-time {
      color: rgba(255, 255, 255, 0.55);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .mob-push-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .mob-push-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.84);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Strzałka akcji */
    .mob-push-arrow {
      flex: 0 0 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.4);
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .mob-push-banner:hover .mob-push-arrow {
      color: #ffffff;
      transform: translateX(2px);
    }

    /* Wskaźnik postępu czasu (4.5s) */
    .mob-push-progress {
      position: absolute;
      bottom: 0;
      left: 14px;
      right: 14px;
      height: 2.5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .mob-push-progress-bar {
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #3b82f6, #ef4444);
      transform-origin: left;
      animation: mobPushTimer 4.5s linear forwards;
    }

    @keyframes mobPushTimer {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `;

  // Wstrzyknięcie stylów jeśli jeszcze nie istnieją
  function ensurePushStyles() {
    if (document.getElementById('mobPushStyles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'mobPushStyles';
    styleEl.textContent = PUSH_STYLES;
    document.head.appendChild(styleEl);
  }

  // Odnalezienie właściwego hosta w aplikacji (kontener telefonu lub body)
  function getPushHost() {
    ensurePushStyles();
    let phone = document.getElementById('app') || document.querySelector('.phone');
    if (!phone) phone = document.body;

    let host = phone.querySelector('.mob-push-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'mob-push-host';
      host.setAttribute('aria-live', 'assertive');
      host.setAttribute('aria-atomic', 'true');
      phone.appendChild(host);
    }
    return host;
  }

  // Pomocnik wibracji / haptyki
  function triggerPushHaptic(type = 'warn') {
    if (typeof global.haptic === 'function') {
      try { global.haptic(type); } catch (e) {}
    } else if (navigator.vibrate) {
      try { navigator.vibrate([25, 45, 25]); } catch (e) {}
    }
  }

  // -------------------------------------------------------------------------
  // 2. FUNKCJA: showSystemPush({ title, body, icon, badge, onClick, duration })
  // -------------------------------------------------------------------------
  let activePushTimeout = null;
  let activePushBanner = null;

  function showSystemPush({
    title = 'Powiadomienie z mObywatela',
    body = '',
    icon = null,
    badge = 'mObywatel',
    onClick = null,
    duration = 4500
  } = {}) {
    const host = getPushHost();

    // Jeśli baner już jest widoczny, zamknij go natychmiast przed otwarciem kolejnego
    if (activePushBanner) {
      clearTimeout(activePushTimeout);
      activePushBanner.classList.remove('active');
      activePushBanner.classList.add('dismissing');
      const old = activePushBanner;
      setTimeout(() => old.remove(), 250);
      activePushBanner = null;
    }

    // Dobór ikony
    let iconContent = '';
    if (icon) {
      if (typeof icon === 'string' && (icon.startsWith('<svg') || icon.startsWith('<span'))) {
        iconContent = icon;
      } else if (typeof icon === 'string' && (icon.includes('.svg') || icon.includes('.png') || icon.startsWith('http') || icon.startsWith('assets/'))) {
        iconContent = `<img src="${icon}" alt="" />`;
      } else {
        // Emoji lub krótki znak
        iconContent = `<span aria-hidden="true">${icon}</span>`;
      }
    } else {
      // Domyślne logo mObywatela
      iconContent = `
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#dc143c"/>
          <path d="M12 5l2 4 4.5.5-3.2 3.2.8 4.3-4.1-2.2-4.1 2.2.8-4.3L5.5 9.5 10 9l2-4z" fill="#ffffff"/>
        </svg>
      `;
    }

    // Kolorystyka i klasa etykiety
    let badgeClass = 'mob-push-badge';
    const lowerBadge = String(badge).toLowerCase();
    if (lowerBadge.includes('rcb')) badgeClass += ' rcb';
    else if (lowerBadge.includes('zdrow') || lowerBadge.includes('ikp') || lowerBadge.includes('recept')) badgeClass += ' zdrowie';
    else if (lowerBadge.includes('pojazd') || lowerBadge.includes('cepik') || lowerBadge.includes('auto')) badgeClass += ' pojazd';

    // Budowa elementu banera
    const banner = document.createElement('div');
    banner.className = 'mob-push-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('tabindex', '0');
    banner.setAttribute('aria-label', `${badge}: ${title}. ${body}. Naciśnij Enter, aby otworzyć.`);

    banner.innerHTML = `
      <div class="mob-push-pill" aria-hidden="true"></div>
      <div class="mob-push-inner">
        <div class="mob-push-icon">${iconContent}</div>
        <div class="mob-push-body-wrap">
          <div class="mob-push-meta">
            <span class="${badgeClass}">${badge}</span>
            <span class="mob-push-time">Teraz</span>
          </div>
          <div class="mob-push-title">${title}</div>
          <div class="mob-push-text">${body}</div>
        </div>
        <div class="mob-push-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
      <div class="mob-push-progress" aria-hidden="true">
        <div class="mob-push-progress-bar" style="animation-duration: ${duration}ms"></div>
      </div>
    `;

    host.appendChild(banner);
    activePushBanner = banner;

    // Haptyka i odczyt dla czytników ekranu
    triggerPushHaptic('warn');
    if (typeof global.announceSR === 'function') {
      global.announceSR(`Powiadomienie: ${badge}. ${title}. ${body}`);
    }

    // Płynne zsunięcie z góry ekranu
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add('active');
      });
    });

    // Funkcja zamykania banera
    let isClosed = false;
    function dismiss(swiped = false) {
      if (isClosed) return;
      isClosed = true;
      clearTimeout(activePushTimeout);
      banner.classList.remove('active', 'swiping');
      banner.classList.add('dismissing');
      if (swiped) {
        banner.style.transform = 'translateY(-140%) scale(0.85)';
      }
      setTimeout(() => {
        banner.remove();
        if (activePushBanner === banner) activePushBanner = null;
      }, 340);
    }

    // Automatyczne zamykanie po czasie trwania (domyślnie 4.5 s)
    activePushTimeout = setTimeout(() => {
      dismiss(false);
    }, duration);

    // -----------------------------------------------------------------------
    // Gesty: Swipe Up do odrzucenia oraz obsługa kliknięcia akcji
    // -----------------------------------------------------------------------
    let startY = 0;
    let currentDeltaY = 0;
    let isDragging = false;
    let hasMovedSignificantly = false;

    function onPointerDown(e) {
      // Ignoruj prawy przycisk myszy
      if (e.button && e.button !== 0) return;
      isDragging = true;
      hasMovedSignificantly = false;
      startY = e.clientY;
      currentDeltaY = 0;
      clearTimeout(activePushTimeout);
      banner.classList.add('swiping');
      try { banner.setPointerCapture(e.pointerId); } catch (err) {}
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // Obsługa przeciągania w górę (deltaY ujemne)
      if (deltaY < 0) {
        currentDeltaY = deltaY;
        if (deltaY < -10) hasMovedSignificantly = true;
        const scale = Math.max(0.86, 1 - Math.abs(deltaY) / 300);
        const opacity = Math.max(0.4, 1 - Math.abs(deltaY) / 180);
        banner.style.transform = `translateY(${deltaY}px) scale(${scale})`;
        banner.style.opacity = `${opacity}`;
      } else {
        // Bardzo lekki opór w dół
        const dampY = deltaY * 0.18;
        banner.style.transform = `translateY(${dampY}px)`;
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      banner.classList.remove('swiping');

      // Jeśli przeciągnięto w górę o ponad 24px - odrzuć powiadomienie (Swipe Up)
      if (currentDeltaY < -24) {
        triggerPushHaptic('tap');
        dismiss(true);
        return;
      }

      // Jeśli nie przesunięto znacząco, traktuj jako kliknięcie / aktywację
      if (!hasMovedSignificantly && Math.abs(currentDeltaY) < 8) {
        banner.style.transform = '';
        banner.style.opacity = '';
        triggerPushHaptic('success');
        if (typeof onClick === 'function') {
          try {
            onClick({ title, body, badge });
          } catch (err) {
            console.error('Błąd w akcji onClick powiadomienia push:', err);
          }
        }
        dismiss(false);
        return;
      }

      // Sprężysty powrót na pozycję jeśli gest był za słaby
      banner.style.transform = '';
      banner.style.opacity = '';
      activePushTimeout = setTimeout(() => dismiss(false), 2400);
    }

    banner.addEventListener('pointerdown', onPointerDown);
    banner.addEventListener('pointermove', onPointerMove);
    banner.addEventListener('pointerup', onPointerUp);
    banner.addEventListener('pointercancel', onPointerUp);

    // Klawisz Enter / Spacja dla dostępności (a11y)
    banner.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPushHaptic('success');
        if (typeof onClick === 'function') onClick({ title, body, badge });
        dismiss(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        dismiss(true);
      }
    });

    // Zatrzymanie odliczania przy najechaniu myszką
    banner.addEventListener('mouseenter', () => {
      clearTimeout(activePushTimeout);
      const bar = banner.querySelector('.mob-push-progress-bar');
      if (bar) bar.style.animationPlayState = 'paused';
    });

    banner.addEventListener('mouseleave', () => {
      const bar = banner.querySelector('.mob-push-progress-bar');
      if (bar) bar.style.animationPlayState = 'running';
      clearTimeout(activePushTimeout);
      activePushTimeout = setTimeout(() => dismiss(false), 2000);
    });

    return {
      dismiss: () => dismiss(false),
      element: banner
    };
  }

  // -------------------------------------------------------------------------
  // 3. SYMULACJA POWIADOMIEŃ DEMO: triggerDemoNotification(typ)
  // -------------------------------------------------------------------------
  const DEMO_NOTIFICATIONS = {
    rcb: {
      title: 'ALERT RCB – SILNY WIATR',
      body: 'Dziś w nocy i jutro prognozowany silny wiatr w porywach do 90 km/h. Zabezpiecz luźne przedmioty na balkonie.',
      icon: '🚨',
      badge: 'ALERT RCB',
      action: () => {
        if (typeof global.openPowiadomieniaModal === 'function') {
          global.openPowiadomieniaModal();
        } else if (typeof global.showToast === 'function') {
          global.showToast('🚨 Otwarto szczegóły ostrzeżenia RCB');
        }
      }
    },
    recepta: {
      title: 'Nowa e-Recepta w IKP',
      body: 'Lek. med. Tomasz Lis wystawił e-receptę na Amoksiklav (kod PIN: 4821). Recepta gotowa do realizacji w aptece.',
      icon: '💊',
      badge: 'Centrum e-Zdrowia',
      action: () => {
        if (typeof global.openIkpPrescriptionModal === 'function') {
          global.openIkpPrescriptionModal('rx_amoks');
        } else if (typeof global.openPowiadomieniaModal === 'function') {
          global.openPowiadomieniaModal();
        } else if (typeof global.showToast === 'function') {
          global.showToast('💊 Otwarto e-receptę w IKP. Kod PIN: 4821');
        }
      }
    },
    oc: {
      title: 'Ważność polisy OC (Fiat Panda)',
      body: 'Polisa OC dla pojazdu Fiat Panda (LU 5521P) kończy się za 14 dni. Zapisz przypomnienie w kalendarzu.',
      icon: '🚗',
      badge: 'mPojazd / CEPiK',
      action: () => {
        exportEventToCalendar({
          title: 'Ważność polisy OC - Fiat Panda (LU 5521P)',
          description: 'Koniec polisy ubezpieczeniowej OC w PZU dla samochodu Fiat Panda. Termin odnowienia.',
          startDate: '2026-11-22T09:00:00',
          location: 'Aplikacja mObywatel 2.0'
        });
      }
    },
    pismo: {
      title: 'Decyzja o zwrocie nadpłaty PIT-37',
      body: 'Pierwszy Urząd Skarbowy w Krakowie doręczył decyzję o zwrocie 1 482,00 zł. Pobierz oficjalne UPO.',
      icon: '🏛️',
      badge: 'e-Doręczenia',
      action: () => {
        if (typeof global.openLetterDetail === 'function') {
          global.openLetterDetail('let_us_01');
        } else if (typeof global.openPocztaModal === 'function') {
          global.openPocztaModal();
        } else {
          exportUpoToFile({
            tytul: 'Decyzja o zwrocie nadpłaty podatku dochodowego (PIT-37)',
            nadawca: 'Pierwszy Urząd Skarbowy w Krakowie',
            odbiorca: 'Jan Wiśniewski (PESEL: 83021409214)',
            dataDoreczenia: '2026-11-05T10:14:00+01:00',
            sumaKontrolna: 'UPO/2026/11/05/982143'
          });
        }
      }
    },
    badanie: {
      title: 'Badanie techniczne pojazdu',
      body: 'Zbliża się termin badania technicznego pojazdu Fiat Panda (LU 5521P) – upływa za 21 dni.',
      icon: '🔧',
      badge: 'CEPiK 2.0',
      action: () => {
        exportEventToCalendar({
          title: 'Badanie techniczne pojazdu Fiat Panda',
          description: 'Okresowe badanie techniczne w stacji kontroli pojazdów dla pojazdu LU 5521P',
          startDate: '2026-11-29T10:00:00',
          location: 'Okręgowa Stacja Kontroli Pojazdów'
        });
      }
    },
    podatek: {
      title: 'Rata podatku od nieruchomości',
      body: 'Termin płatności IV raty podatku od nieruchomości (148,00 zł) mija 15.11.2026 r. Opłać BLIK-iem.',
      icon: '💳',
      badge: 'e-Płatności',
      action: () => {
        if (typeof global.directPaymentClick === 'function') {
          global.directPaymentClick();
        } else if (typeof global.showToast === 'function') {
          global.showToast('💳 Otwarto moduł ePłatności');
        }
      }
    }
  };

  function triggerDemoNotification(type) {
    let key = (type || '').toLowerCase().trim();
    if (key === 'ikp' || key === 'zdrowie') key = 'recepta';
    if (key === 'auto' || key === 'pojazd') key = 'oc';
    if (key === 'us' || key === 'doreczenia' || key === 'doręczenia') key = 'pismo';
    if (key === 'przeglad' || key === 'przegląd') key = 'badanie';
    if (key === 'platnosci' || key === 'płatności') key = 'podatek';

    const keys = Object.keys(DEMO_NOTIFICATIONS);
    if (!key || key === 'random' || !DEMO_NOTIFICATIONS[key]) {
      key = keys[Math.floor(Math.random() * keys.length)];
    }

    const demo = DEMO_NOTIFICATIONS[key];
    return showSystemPush({
      title: demo.title,
      body: demo.body,
      icon: demo.icon,
      badge: demo.badge,
      onClick: demo.action,
      duration: 4500
    });
  }

  // Okresowa symulacja w tle (opcjonalna)
  let pushSimulationInterval = null;
  function startPushSimulation({ intervalMs = 60000, initialDelayMs = 20000 } = {}) {
    stopPushSimulation();
    setTimeout(() => {
      triggerDemoNotification('random');
      pushSimulationInterval = setInterval(() => {
        triggerDemoNotification('random');
      }, intervalMs);
    }, initialDelayMs);
  }

  function stopPushSimulation() {
    if (pushSimulationInterval) {
      clearInterval(pushSimulationInterval);
      pushSimulationInterval = null;
    }
  }

  // -------------------------------------------------------------------------
  // 4. EKSPORT DO KALENDARZA: exportEventToCalendar(...)
  // -------------------------------------------------------------------------
  function formatIcsDateTime(dateInput, defaultHour = 9) {
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      // Format ISO YYYY-MM-DD lub YYYY-MM-DDTHH:mm:ss
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const parts = trimmed.split(/[\sT]+/);
        const [yr, mon, day] = parts[0].split('-').map(Number);
        let hr = defaultHour;
        let min = 0;
        let sec = 0;
        if (parts[1] && parts[1].includes(':')) {
          const tParts = parts[1].split(':').map(Number);
          hr = tParts[0] || 0;
          min = tParts[1] || 0;
          sec = tParts[2] || 0;
        }
        d = new Date(yr, mon - 1, day, hr, min, sec);
      }
      // Format polski: DD.MM.YYYY lub DD.MM.YYYY HH:mm
      else if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(trimmed)) {
        const parts = trimmed.split(/[\sT]+/);
        const [day, mon, yr] = parts[0].split('.').map(Number);
        let hr = defaultHour;
        let min = 0;
        let sec = 0;
        if (parts[1] && parts[1].includes(':')) {
          const tParts = parts[1].split(':').map(Number);
          hr = tParts[0] || 0;
          min = tParts[1] || 0;
          sec = tParts[2] || 0;
        }
        d = new Date(yr, mon - 1, day, hr, min, sec);
      } else {
        d = new Date(trimmed);
      }
    } else {
      d = new Date();
    }

    if (isNaN(d.getTime())) {
      d = new Date();
    }

    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function escapeIcsText(str) {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function exportEventToCalendar({
    title = 'Zdarzenie z mObywatela',
    description = '',
    startDate = new Date(),
    endDate = null,
    location = 'mObywatel 2.0 / Rzeczpospolita Polska'
  } = {}) {
    try {
      const dtStart = formatIcsDateTime(startDate, 9);
      let dtEnd = endDate ? formatIcsDateTime(endDate, 10) : null;
      if (!dtEnd) {
        // Domyślnie 1 godzina po dacie rozpoczęcia
        let sDateObj = new Date();
        if (startDate instanceof Date) sDateObj = new Date(startDate.getTime() + 3600000);
        else {
          const parts = dtStart.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
          if (parts) {
            sDateObj = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]);
            sDateObj = new Date(sDateObj.getTime() + 3600000);
          }
        }
        dtEnd = formatIcsDateTime(sDateObj, 10);
      }

      const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `mob-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@mobywatel.gov.pl`;

      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ministerstwo Cyfryzacji//mObywatel 2.0//PL',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeIcsText(title)}`,
        `DESCRIPTION:${escapeIcsText(description + '\n\nOficjalne przypomnienie wygenerowane z aplikacji mObywatel 2.0.')}`,
        `LOCATION:${escapeIcsText(location)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Przypomnienie: ${escapeIcsText(title)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      const icsContent = icsLines.join('\r\n');
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanFileName = title.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_-]/g, '_').substring(0, 48);
      a.download = `${cleanFileName || 'zdarzenie'}_mobywatel.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2500);

      triggerPushHaptic('success');
      if (typeof global.showToast === 'function') {
        global.showToast('📅 Pobrano przypomnienie do kalendarza (.ics)');
      }
      if (typeof global.announceSR === 'function') {
        global.announceSR('Pobrano zdarzenie do kalendarza: ' + title);
      }
      return true;
    } catch (err) {
      console.error('Błąd podczas eksportu do pliku iCalendar:', err);
      if (typeof global.showToast === 'function') {
        global.showToast('Błąd eksportu do kalendarza');
      }
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // 5. EKSPORT URZĘDOWEGO POŚWIADCZENIA ODBIORU (UPO): exportUpoToFile(...)
  // -------------------------------------------------------------------------
  async function computeSha256(inputString) {
    if (global.crypto && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {}
    }
    // Deterministyczny skrót fallback
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < inputString.length; i++) {
      const ch = inputString.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    const hexPart = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
    return (hexPart + '9e4c7d0a2f1b8830e5f2a1b4c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3').substring(0, 64);
  }

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  async function exportUpoToFile({
    tytul,
    nadawca,
    odbiorca,
    dataDoreczenia,
    sumaKontrolna,
    // Aliases
    title,
    sender,
    recipient,
    deliveryDate,
    checksum,
    format = 'xml'
  } = {}) {
    try {
      const vTytul = tytul || title || 'Pismo z organu administracji publicznej';
      const vNadawca = nadawca || sender || 'Pierwszy Urząd Skarbowy w Krakowie';
      const currentUserName = (typeof global.OS !== 'undefined' && global.OS && global.OS.imie) 
        ? `${global.OS.imie} ${global.OS.nazwisko} (PESEL: ${global.OS.moje?.pesel || '83021409214'})`
        : 'Jan Wiśniewski (PESEL: 83021409214)';
      const vOdbiorca = odbiorca || recipient || currentUserName;
      const vData = dataDoreczenia || deliveryDate || new Date().toLocaleString('pl-PL');
      const nowIso = new Date().toISOString();
      const upoId = `UPO/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.floor(100000 + Math.random() * 900000)}`;

      // Obliczenie sumy kontrolnej SHA-256 jeśli nie podano
      const seed = sumaKontrolna || checksum || `${vTytul}|${vNadawca}|${vOdbiorca}|${vData}|${upoId}`;
      const sha256Digest = (sumaKontrolna && sumaKontrolna.length === 64) ? sumaKontrolna : await computeSha256(seed);

      let fileContent = '';
      let mimeType = 'application/xml;charset=utf-8';
      let extension = 'xml';

      if (String(format).toLowerCase() === 'txt') {
        extension = 'txt';
        mimeType = 'text/plain;charset=utf-8';
        fileContent = [
          '================================================================================',
          '                     RZECZPOSPOLITA POLSKA - MINISTERSTWO CYFRYZACJI',
          '                 URZĘDOWE POŚWIADCZENIE ODBIORU (UPO / e-DORĘCZENIA)',
          '================================================================================',
          '',
          `Identyfikator poświadczenia:  ${upoId}`,
          `Data i czas doręczenia:       ${vData}`,
          `Status prawny doręczenia:     DORĘCZONO ZE SKUTKIEM PRAWNYM`,
          `Podstawa prawna:              Art. 41 Ustawy o doręczeniach elektronicznych (Dz.U. 2023 poz. 285)`,
          '                              oraz art. 39[1] Kodeksu postępowania administracyjnego.',
          '',
          '--------------------------------------------------------------------------------',
          '1. DANE STRON',
          '--------------------------------------------------------------------------------',
          `Nadawca:                      ${vNadawca}`,
          `Adresat / Odbiorca:           ${vOdbiorca}`,
          `System teleinformatyczny:     Krajowy Węzeł Doręczeń Elektronicznych (mObywatel 2.0)`,
          '',
          '--------------------------------------------------------------------------------',
          '2. DANE PRZESYŁKI I INTEGRALNOŚCI',
          '--------------------------------------------------------------------------------',
          `Tytuł sprawy / dokumentu:     ${vTytul}`,
          `Suma kontrolna (SHA-256):     ${sha256Digest}`,
          `Algorytm skrótu:              SHA-256 (FIPS 180-4)`,
          `Kwalifikowany znacznik czasu: RFC 3161 (Zaufany Dostawca CERTUM QTSA)`,
          `Czas wygenerowania:           ${nowIso}`,
          '',
          '--------------------------------------------------------------------------------',
          '3. PODPIS ELEKTRONICZNY I PIECZĘĆ',
          '--------------------------------------------------------------------------------',
          `Rodzaj podpisu:               Kwalifikowana Pieczęć Elektroniczna Rzeczypospolitej Polskiej`,
          `Wystawca certyfikatu:         Centrum Certyfikacji Ministerstwa Cyfryzacji (PL-CC-MC)`,
          `Status certyfikatu:           WAŻNY, ZWERYFIKOWANY POMYŚLNIE`,
          '',
          '================================================================================',
          ' Niniejszy dokument stanowi oficjalny dowód doręczenia w rozumieniu prawa RP.',
          '                   Wygenerowano w aplikacji mObywatel 2.0',
          '================================================================================'
        ].join('\r\n');
      } else {
        // Standard ePUAP / e-Doręczenia XML
        extension = 'xml';
        mimeType = 'application/xml;charset=utf-8';
        fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<DokumentUPO xmlns="http://crd.gov.pl/xml/schematy/upo/2023/10/01/"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <!-- Oficjalne Urzędowe Poświadczenie Odbioru mObywatel 2.0 / e-Doręczenia -->
  <Naglowek>
    <IdentyfikatorPoświadczenia>${escapeXml(upoId)}</IdentyfikatorPoświadczenia>
    <DataDoreczenia>${escapeXml(vData)}</DataDoreczenia>
    <StatusDoreczenia>DORECZONO_ZE_SKUTKIEM_PRAWNYM</StatusDoreczenia>
    <PodstawaPrawna>Art. 41 Ustawy z dnia 18 listopada 2020 r. o doręczeniach elektronicznych (Dz.U. z 2023 r. poz. 285 ze zm.) oraz art. 39[1] Kodeksu postępowania administracyjnego</PodstawaPrawna>
    <OrganRejestrujacy>Krajowy System Doręczeń Elektronicznych (Ministerstwo Cyfryzacji)</OrganRejestrujacy>
    <SystemNadawczy>mObywatel 2.0 - Węzeł Krajowy</SystemNadawczy>
  </Naglowek>
  <Strony>
    <Nadawca>
      <NazwaPodmiotu>${escapeXml(vNadawca)}</NazwaPodmiotu>
      <TypPodmiotu>Organ Administracji Publicznej</TypPodmiotu>
      <AdresElektroniczny>AE:PL-84210-99120-WXYZ-11</AdresElektroniczny>
    </Nadawca>
    <Odbiorca>
      <NazwaPodmiotu>${escapeXml(vOdbiorca)}</NazwaPodmiotu>
      <TypPodmiotu>Osoba Fizyczna</TypPodmiotu>
      <AdresElektroniczny>AE:PL-11920-55410-ABCD-89</AdresElektroniczny>
    </Odbiorca>
  </Strony>
  <TrescDokumentu>
    <TytulSprawy>${escapeXml(vTytul)}</TytulSprawy>
    <SumaKontrolnaDokumentu algorytm="SHA-256">${escapeXml(sha256Digest)}</SumaKontrolnaDokumentu>
    <CzasZnakowaniaCzasem>${escapeXml(nowIso)}</CzasZnakowaniaCzasem>
    <KwalifikowanyZnacznikCzasu>Zaufany Dostawca Usług Zaufania CERTUM QTSA</KwalifikowanyZnacznikCzasu>
  </TrescDokumentu>
  <PodpisKwalifikowany>
    <Typ>Kwalifikowana Pieczęć Elektroniczna Rzeczypospolitej Polskiej</Typ>
    <Wystawca>Centrum Certyfikacji Ministerstwa Cyfryzacji</Wystawca>
    <WartoscPodpisu>${escapeXml(sha256Digest.split('').reverse().join('') + '==')}</WartoscPodpisu>
    <StatusPodpisu>PRAWIDLOWY</StatusPodpisu>
  </PodpisKwalifikowany>
</DokumentUPO>`;
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanUpoId = upoId.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${cleanUpoId}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2500);

      triggerPushHaptic('success');
      if (typeof global.showToast === 'function') {
        global.showToast(`📜 Pobrano Urzędowe Poświadczenie Odbioru (${extension.toUpperCase()})`);
      }
      if (typeof global.announceSR === 'function') {
        global.announceSR('Pobrano plik Urzędowego Poświadczenia Odbioru.');
      }
      return true;
    } catch (err) {
      console.error('Błąd podczas generowania pliku UPO:', err);
      if (typeof global.showToast === 'function') {
        global.showToast('Błąd pobierania pliku UPO');
      }
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // 6. EKSPORT DO GLOBALNEJ PRZESTRZENI
  // -------------------------------------------------------------------------
  global.showSystemPush = showSystemPush;
  triggerDemoNotification.show = showSystemPush;
  global.triggerDemoNotification = triggerDemoNotification;
  global.startPushSimulation = startPushSimulation;
  global.stopPushSimulation = stopPushSimulation;
  global.exportEventToCalendar = exportEventToCalendar;
  global.exportUpoToFile = exportUpoToFile;

  // Automatyczna inicjalizacja stylów po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensurePushStyles);
  } else {
    ensurePushStyles();
  }

})(typeof window !== 'undefined' ? window : this);
