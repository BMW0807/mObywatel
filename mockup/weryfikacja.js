/* ---------- mObywatel 2.0 - Weryfikacja tożsamości, Hologram & Ekran Apteczny (weryfikacja.js) ---------- */

const WERYFIKACJA = {
  receptyData: {
    'rx_amoks': {
      id: 'rx_amoks',
      drug: 'Amoksiklav (875 mg + 125 mg)',
      substance: 'Amoxicillinum + Acidum clavulanicum',
      pack: '14 tabletek powlekanych',
      dosage: '1 tabletka co 12 godzin (rano i wieczorem) podczas posiłku przez 7 dni',
      pin: '4821',
      barcode: '910714277654821',
      patient: 'ZOFIA WIŚNIEWSKA (córka)',
      doctor: 'lek. med. Anna Jabłońska (NPWZ: 3829104)',
      clinic: 'NZOZ Przychodnia Rodzinna Mokotów, Warszawa',
      issued: '06.11.2026',
      validUntil: '06.12.2026 (ważna jeszcze 28 dni)',
      refund: 'Odpłatność 30% (Cena: 11,40 zł, z refundacją NFZ)',
      status: 'Aktywna – do wykupienia'
    },
    'rx_letrox': {
      id: 'rx_letrox',
      drug: 'Letrox 75 µg',
      substance: 'Levothyroxinum natricum',
      pack: '50 tabletek',
      dosage: '1 tabletka rano na czczo, co najmniej 30 min przed śniadaniem',
      pin: '7730',
      barcode: '910714277657730',
      patient: 'MARTA KOWALSKA',
      doctor: 'dr n. med. Marek Szymański, endokrynolog',
      clinic: 'Centrum Medyczne NZOZ Medycyna',
      issued: '20.10.2026',
      validUntil: '20.10.2027 (recepta roczna – ważna 346 dni)',
      refund: 'Ryczałt 3,20 zł (Wskazanie: Niedoczynność tarczycy)',
      status: 'Częściowo zrealizowana (1/3 op.)'
    },
    'rx_ventolin': {
      id: 'rx_ventolin',
      drug: 'Ventolin aerozol wziewny (100 µg/dawkę)',
      substance: 'Salbutamolum',
      pack: '1 pojemnik 200 dawek',
      dosage: 'Doraźnie 1-2 inhalacje w przypadku duszności',
      pin: '1904',
      barcode: '830214092141904',
      patient: 'JAN WIŚNIEWSKI',
      doctor: 'lek. med. Tomasz Lis, pulmonolog',
      clinic: 'Szpital Specjalistyczny im. Dietla, Kraków',
      issued: '01.11.2026',
      validUntil: '01.12.2026',
      refund: 'Odpłatność 100% (Cena: 19,80 zł)',
      status: 'Aktywna – do wykupienia'
    }
  }
};

// Generowanie wektorowego kodu kreskowego Code128 (Pattern B/C dla cyfr)
function generateBarcodeSVG(codeStr) {
  // Prosty, estetyczny generator pasków o zróżnicowanej szerokości
  const digits = String(codeStr).replace(/\D/g, '') || '910714277654821';
  const bars = [];
  let x = 12;
  
  // Znacznik startowy
  bars.push(`<rect x="${x}" y="0" width="3" height="64" fill="#000"/>`); x += 5;
  bars.push(`<rect x="${x}" y="0" width="1.5" height="64" fill="#000"/>`); x += 4;

  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10);
    const w1 = (d % 3 === 0 ? 3 : (d % 2 === 0 ? 2 : 1.2));
    const gap = (d > 5 ? 3 : 2);
    bars.push(`<rect x="${x}" y="0" width="${w1}" height="64" fill="#000"/>`);
    x += w1 + gap;
    const w2 = (d % 4 === 0 ? 2.5 : 1.2);
    bars.push(`<rect x="${x}" y="0" width="${w2}" height="64" fill="#000"/>`);
    x += w2 + 2;
  }

  // Znacznik końcowy
  bars.push(`<rect x="${x}" y="0" width="3" height="64" fill="#000"/>`); x += 5;
  bars.push(`<rect x="${x}" y="0" width="1.5" height="64" fill="#000"/>`); x += 12;

  return `
    <svg viewBox="0 0 ${x} 64" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${x}" height="64" fill="#fff"/>
      ${bars.join('')}
    </svg>
  `;
}

// ----------------- MODAL APTECZNY DLA E-RECEPTY -----------------
// Recepta z IKP bieżącej osoby (ikp-integracja.js); stała lista wyżej dodaje tylko substancję i dawkowanie.
// Wcześniej każdy identyfikator spoza tej listy (np. leki Ewy czy recepta Zofii Kowalskiej) pokazywał Amoksiklav innej osoby.
function aptekaRecepta(rxId) {
  const extra = WERYFIKACJA.receptyData[rxId] || null;
  const ikp = (typeof getIkpData === 'function') ? getIkpData() : null;
  const r = ikp && (ikp.recepty || []).find(x => x.id === rxId);
  if (!r) return extra;
  const prof = (ikp.profiles || []).find(p => p.id === r.forProfile);
  const tenLek = extra && extra.drug.split(' ')[0] === r.drug.split(' ')[0];
  return {
    id: r.id,
    drug: r.drug,
    substance: (tenLek && extra.substance) || '',
    pack: r.pack,
    dosage: (tenLek && extra.dosage) || '',
    pin: r.pin,
    barcode: r.barcode,
    patient: prof ? prof.name.toUpperCase() : '',
    doctor: r.doctor,
    clinic: (ikp.poz && ikp.poz.clinic) || '',
    issued: r.date,
    validUntil: r.exp,
    refund: r.refund,
    status: r.status
  };
}

function openAptekaModal(rxId) {
  const m = document.getElementById('aptekaModal');
  if (!m) return;
  const rx = aptekaRecepta(rxId);
  if (!rx) return;
  const barcodeSvg = generateBarcodeSVG(rx.barcode);

  const box = m.querySelector('.apteka-box');
  if (box) {
    box.innerHTML = `
      <div class="modal-head">
        <h2>e-Recepta dla Farmaceuty</h2>
        <button class="tx-close" onclick="closeAptekaModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>

      <div class="rx-pharm-card">
        <div class="rx-screen-light-badge">💡 Maksymalna jasność ekranu włączona dla czytnika</div>
        <div class="rx-code-wrap">
          ${barcodeSvg}
          <div class="rx-barcode-num">${rx.barcode}</div>
        </div>

        <div class="rx-pin-hero">
          <small class="rx-pin-lbl">KOD PIN DO RECEPTY:</small>
          <div class="rx-pin-val">${rx.pin}</div>
          <small class="rx-pin-sub">Podaj farmaceucie ten 4-cyfrowy kod wraz z numerem PESEL</small>
        </div>
      </div>

      <div class="rx-drug-details">
        <h3 class="rx-drug-name">${rx.drug}</h3>
        <div class="rx-substance">${rx.substance ? rx.substance + ' (' + rx.pack + ')' : rx.pack}</div>
        ${rx.dosage ? `<div class="rx-dosage-box">
          <b>Zalecone dawkowanie:</b>
          <p>${rx.dosage}</p>
        </div>` : ''}

        <div class="rx-meta-grid">
          <div class="rxm-item"><span>Pacjent:</span><b>${rx.patient}</b></div>
          <div class="rxm-item"><span>Odpłatność:</span><b style="color:#059669">${rx.refund}</b></div>
          <div class="rxm-item"><span>Wystawił:</span><b>${rx.doctor}</b></div>
          <div class="rxm-item"><span>Placówka:</span><b>${rx.clinic}</b></div>
          <div class="rxm-item"><span>Data wystawienia:</span><b>${rx.issued}</b></div>
          <div class="rxm-item"><span>Termin realizacji:</span><b>${rx.validUntil}</b></div>
        </div>
      </div>

      <div class="rx-actions-row">
        <button type="button" class="btn secondary" onclick="copyRxPin('${rx.pin}')">📋 Kopiuj kod PIN</button>
        <button type="button" class="btn primary" onclick="closeAptekaModal();if(typeof askAssistantWithPrompt==='function')askAssistantWithPrompt('Czy lek ${rx.drug} ma tańsze zamienniki i jak go poprawnie dawkować?')">Zapytaj o zamienniki AI</button>
      </div>
    `;
  }

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('aptekaModal', m);
}

function closeAptekaModal() {
  const m = document.getElementById('aptekaModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('aptekaModal');
  }
}

function copyRxPin(pin) {
  try {
    navigator.clipboard.writeText(pin);
    if (typeof showToast === 'function') showToast(`Skopiowano kod PIN: ${pin}`);
  } catch (e) {
    if (typeof showToast === 'function') showToast(`Kod PIN: ${pin}`);
  }
}

// ----------------- ZEGAR WERYFIKACYJNY I HOLOGRAM DLA mDOWODU -----------------
let _verifTimer = null;

function initVerifClock() {
  const clockEl = document.getElementById('mdowodVerifClock');
  if (!clockEl) return;

  function update() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(d.getMilliseconds() / 100));
    clockEl.innerHTML = `Czas weryfikacji: <b>${h}:${m}:${s}</b><small>.${ms}</small> <span class="verif-pulse">●</span>`;
  }

  if (_verifTimer) clearInterval(_verifTimer);
  _verifTimer = setInterval(update, 100);
  update();
}

// Obsługa żyroskopu i interakcji z hologramem
function initHologramEffect(cardEl) {
  if (!cardEl) return;
  cardEl.addEventListener('pointermove', e => {
    const rect = cardEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * -14;
    const ry = (x - 0.5) * 18;
    cardEl.style.setProperty('--holoX', `${x * 100}%`);
    cardEl.style.setProperty('--holoY', `${y * 100}%`);
    cardEl.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  cardEl.addEventListener('pointerleave', () => {
    cardEl.style.transform = 'none';
  });
}

// ----------------- HUB KODÓW QR I WERYFIKACJI (bnav QR) -----------------
function openQrHubModal() {
  if (typeof haptic === 'function') haptic('tap');
  let modal = document.getElementById('qrHubModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qrHubModal';
    modal.className = 'sheet-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'qrHubTitle');
    document.getElementById('app').appendChild(modal);
  }

  modal.innerHTML = `
    <div class="scrim" onclick="closeQrHubModal()"></div>
    <div class="modal-box">
      <div class="modal-head">
        <h2 id="qrHubTitle">Znak mObywatela i Kod QR</h2>
        <button class="tx-close" onclick="closeQrHubModal()" aria-label="Zamknij">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
        </button>
      </div>
      <p class="modal-sub">Wybierz sposób bezpiecznej wymiany i weryfikacji danych tożsamości.</p>

      <div class="qr-hub-grid">
        <button type="button" class="qr-hub-card primary" onclick="closeQrHubModal();if(typeof qrFlow==='function')qrFlow({})">
          <div class="qrh-icon">📷</div>
          <div class="qrh-info">
            <b>Zeskanuj kod QR</b>
            <small>Skieruj aparat na znak mObywatela w urzędzie, firmie lub telefonie obok i przekaż dane.</small>
          </div>
          <span class="qrh-arrow">→</span>
        </button>

        <button type="button" class="qr-hub-card" onclick="closeQrHubModal();if(typeof przyjmijFlow==='function')przyjmijFlow({})">
          <div class="qrh-icon">🛡️</div>
          <div class="qrh-info">
            <b>Okaż mój Znak mObywatela</b>
            <small>Wyświetl animowany żeton kryptograficzny, aby inna osoba lub instytucja mogła przyjąć Twoje dane.</small>
          </div>
          <span class="qrh-arrow">→</span>
        </button>

        <button type="button" class="qr-hub-card" onclick="closeQrHubModal();if(typeof openDoc==='function')openDoc('dowod')">
          <div class="qrh-icon">✨</div>
          <div class="qrh-info">
            <b>mDowód z hologramem</b>
            <small>Ekran weryfikacyjny z żyroskopowym hologramem 3D, orłem RP i zegarem milisekundowym.</small>
          </div>
          <span class="qrh-arrow">→</span>
        </button>
      </div>

      <div class="modal-actions" style="margin-top:16px">
        <button type="button" class="btn ghost wide" onclick="closeQrHubModal()">Zamknij</button>
      </div>
    </div>
  `;

  if (typeof openDialogFocus === 'function') openDialogFocus('qrhub', modal.querySelector('.modal-box'), '.tx-close');
  modal.classList.add('open');
  if (typeof announceSR === 'function') announceSR('Otwarto Znak mObywatela i kody QR');
}

function closeQrHubModal() {
  const modal = document.getElementById('qrHubModal');
  if (modal && modal.classList.contains('open')) {
    modal.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('qrhub');
  }
}
