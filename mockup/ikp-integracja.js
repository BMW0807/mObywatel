/* ==========================================================================
   mObywatel 2.0 - Pełna Integracja Internetowego Konta Pacjenta (IKP / mojeIKP)
   (ikp-integracja.js)
   ========================================================================== */

const IKP = {
  // Aktywny profil w ramach rodziny (self lub dziecko)
  activeProfile: 'self',

  db: {
    jan: {
      profiles: [
        { id: 'self', name: 'Jan Wiśniewski', role: 'Właściciel konta', pesel: '83021409214' },
        { id: 'c1', name: 'Zofia Wiśniewska', role: 'Dziecko (11 lat)', pesel: '15271904128' },
        { id: 'c2', name: 'Stanisław Wiśniewski', role: 'Dziecko (7 lat)', pesel: '19231408119' },
        { id: 'c3', name: 'Franciszek Wiśniewski', role: 'Dziecko (3 lata)', pesel: '23281005234' }
      ],
      recepty: [
        { id: 'rx_ventolin', forProfile: 'self', drug: 'Ventolin aerozol (100 µg/dawkę)', pack: '200 dawek', pin: '1904', barcode: '830214092141904', doctor: 'lek. med. Tomasz Lis (POZ)', date: '01.11.2026', exp: '01.12.2026', refund: 'Odpłatność 100% (19,80 zł)', status: 'Aktywna' },
        { id: 'rx_amoks', forProfile: 'c1', drug: 'Amoksiklav (875 mg + 125 mg)', pack: '14 tabletek', pin: '4821', barcode: '152719041284821', doctor: 'lek. med. Anna Jabłońska', date: '06.11.2026', exp: '06.12.2026', refund: 'Odpłatność 30% (11,40 zł)', status: 'Aktywna' },
        { id: 'rx_d3', forProfile: 'c2', drug: 'Vigantol krople (20 000 IU/ml)', pack: '10 ml', pin: '2209', barcode: '192314081192209', doctor: 'lek. med. Tomasz Lis', date: '15.10.2026', exp: '15.01.2027', refund: 'Odpłatność 100% (24,50 zł)', status: 'Aktywna' }
      ],
      skierowania: [
        { id: 'sk_pulmo', forProfile: 'self', name: 'Poradnia Pulmonologiczna (diagnostyka kaszlu)', code: '3819', doctor: 'lek. med. Tomasz Lis', date: '28.10.2026', status: 'Aktywne do rejestracji' },
        { id: 'sk_rtg', forProfile: 'self', name: 'RTG klatki piersiowej PA + bok', code: '8812', doctor: 'Szpital Dietla, Kraków', date: '14.10.2026', status: 'Wykonane / wynik w IKP' }
      ],
      ewus: {
        status: 'Zielony (Uprawniony do świadczeń)',
        insurance: 'Ubezpieczenie z działalności gospodarczej (Wiśniewski Instalacje, NIP 6792345679)',
        branch: 'Małopolski Oddział Wojewódzki NFZ w Krakowie',
        validUntil: 'Bezterminowo (składki opłacane bieżąco)'
      },
      poz: {
        clinic: 'NZOZ Przychodnia Rejonowa Kraków-Śródmieście',
        address: 'ul. Dietla 42, 31-039 Kraków',
        phone: '12 421 88 00',
        doctor: 'lek. med. Tomasz Lis (specjalista medycyny rodzinnej)',
        nurse: 'mgr piel. Danuta Wójcik',
        lastVisit: '14.10.2026 (Konsultacja stacjonarna)'
      },
      ekuz: {
        number: 'PL 801200 0001 9284 1029',
        validUntil: '31.08.2029',
        coverage: 'Wszystkie kraje Unii Europejskiej, EFTA i Wielka Brytania'
      },
      zdarzenia: [
        { date: '14.10.2026', name: 'Porada lekarska w POZ – diagnostyka pulmonologiczna', where: 'NZOZ Kraków-Śródmieście', cost: '85,00 zł ze środków NFZ' },
        { date: '02.06.2026', name: 'Program Profilaktyka 40 PLUS – pakiet badań diagnostycznych', where: 'Diagnostyka Sp. z o.o.', cost: '140,00 zł ze środków NFZ' },
        { date: '18.01.2026', name: 'Ambulatoryjne zaopatrzenie urazu palca ręki', where: 'Szpital Specjalistyczny im. Dietla', cost: '210,00 zł ze środków NFZ' }
      ]
    },

    marta: {
      profiles: [
        { id: 'self', name: 'Marta Kowalska', role: 'Właściciel konta', pesel: '91071427765' },
        { id: 'c1', name: 'Zofia Kowalska', role: 'Dziecko (9 lat)', pesel: '17281409124' },
        { id: 'c2', name: 'Antoni Kowalski', role: 'Dziecko (5 lat)', pesel: '21241008291' }
      ],
      recepty: [
        { id: 'rx_letrox', forProfile: 'self', drug: 'Letrox 75 µg (50 tabl.)', pack: '1 op.', pin: '7730', barcode: '910714277657730', doctor: 'dr n. med. Marek Szymański, endokrynolog', date: '20.10.2026', exp: '20.10.2027', refund: 'Ryczałt 3,20 zł', status: 'Aktywna (stały lek)' },
        { id: 'rx_amoks_m', forProfile: 'c1', drug: 'Amoksiklav zawiesina 457 mg/5ml', pack: '70 ml', pin: '4821', barcode: '172814091244821', doctor: 'lek. med. Anna Jabłońska', date: '06.11.2026', exp: '06.12.2026', refund: 'Odpłatność 30% (9,80 zł)', status: 'Aktywna' }
      ],
      skierowania: [
        { id: 'sk_usg', forProfile: 'self', name: 'Badanie USG jamy brzusznej', code: '7712', doctor: 'lek. med. Anna Jabłońska (POZ)', date: '28.10.2026', status: 'Aktywne do rejestracji' },
        { id: 'sk_dilo', forProfile: 'self', name: 'Karta DiLO – Poradnia Onkologiczna (Konsylium)', code: '9901', doctor: 'Mazowiecki Szpital Onkologiczny', date: '15.10.2026', status: 'Koordynacja aktywna' }
      ],
      ewus: {
        status: 'Zielony (Uprawniona do bezpłatnych świadczeń)',
        insurance: 'Zgłoszenie do ZUS – umowa o pracę (Urząd m.st. Warszawy)',
        branch: 'Mazowiecki Oddział Wojewódzki NFZ w Warszawie',
        validUntil: 'Bieżące zatrudnienie'
      },
      poz: {
        clinic: 'NZOZ Przychodnia Rodzinna Mokotów',
        address: 'ul. Puławska 112, 02-620 Warszawa',
        phone: '22 844 19 20',
        doctor: 'lek. med. Anna Jabłońska (pediatra i lekarz rodzinny)',
        nurse: 'mgr Danuta Wieczorek',
        lastVisit: '28.10.2026'
      },
      ekuz: {
        number: 'PL 802100 0002 8192 4410',
        validUntil: '15.06.2028',
        coverage: 'Kraje UE, EFTA i Wielka Brytania'
      },
      zdarzenia: [
        { date: '28.10.2026', name: 'Wizyta lekarska POZ + wystawienie e-skierowania USG', where: 'NZOZ Mokotów', cost: '90,00 zł ze środków NFZ' },
        { date: '15.09.2026', name: 'Profilaktyczna mammografia przesiewowa', where: 'Centrum Onkologii w Warszawie', cost: '160,00 zł ze środków NFZ' }
      ]
    },

    kacper: {
      profiles: [
        { id: 'self', name: 'Kacper Zieliński', role: 'Student PG', pesel: '06232141719' }
      ],
      recepty: [],
      skierowania: [
        { id: 'sk_sport', forProfile: 'self', name: 'Badania w Poradni Medycyny Sportowej', code: '4401', doctor: 'Akademicka Przychodnia Studencka', date: '01.10.2026', status: 'Ważne' }
      ],
      ewus: {
        status: 'Zielony (Student ubezpieczony przez uczelnię)',
        insurance: 'Zgłoszenie do NFZ przez Politechnikę Gdańską',
        branch: 'Pomorski Oddział Wojewódzki NFZ w Gdańsku',
        validUntil: 'Okres trwania studiów'
      },
      poz: {
        clinic: 'Akademicka Przychodnia Studencka',
        address: 'al. Zwycięstwa 14, 80-219 Gdańsk-Wrzeszcz',
        phone: '58 349 10 10',
        doctor: 'lek. med. Piotr Czarnecki',
        nurse: 'Krystyna Nowak',
        lastVisit: '01.10.2026'
      },
      ekuz: {
        number: 'PL 804400 0003 1928 8841',
        validUntil: '30.09.2027',
        coverage: 'Kraje UE/EFTA (program Erasmus+)'
      },
      zdarzenia: [
        { date: '01.10.2026', name: 'Badanie wstępne do sekcji sportowej uczelni', where: 'Akademicka Przychodnia Studencka', cost: '75,00 zł ze środków NFZ' }
      ]
    },

    ewa: {
      profiles: [
        { id: 'self', name: 'Ewa Nowak', role: 'Emerytka (Senior 65+)', pesel: '55081402941' }
      ],
      recepty: [
        { id: 'rx_amlopin', forProfile: 'self', drug: 'Amlopin 5 mg (30 tabl.)', pack: '2 op.', pin: '5521', barcode: '550814029415521', doctor: 'lek. med. Janusz Kruk', date: '02.11.2026', exp: '02.11.2027', refund: 'Bezpłatny 65+ (0,00 zł z NFZ)', status: 'Aktywna (stały lek)' },
        { id: 'rx_polpril', forProfile: 'self', drug: 'Polpril 5 mg (28 kaps.)', pack: '3 op.', pin: '5521', barcode: '550814029415521', doctor: 'lek. med. Janusz Kruk', date: '02.11.2026', exp: '02.11.2027', refund: 'Bezpłatny 65+ (0,00 zł z NFZ)', status: 'Aktywna (stały lek)' }
      ],
      skierowania: [
        { id: 'sk_reum', forProfile: 'self', name: 'Poradnia Reumatologiczna', code: '9102', doctor: 'Przychodnia Wiejska w Niemcach', date: '12.09.2026', status: 'Aktywne do rejestracji' },
        { id: 'sk_sanatorium', forProfile: 'self', name: 'Leczenie Uzdrowiskowe (Sanatorium NFZ)', code: 'SAN/2026/8129', doctor: 'Lubelski OW NFZ', date: '10.05.2026', status: 'W kolejce oczekujących (nr 412)' }
      ],
      ewus: {
        status: 'Zielony (Ubezpieczenie emerytalne)',
        insurance: 'Zgłoszenie do NFZ przez Zakład Ubezpieczeń Społecznych (emerytura)',
        branch: 'Lubelski Oddział Wojewódzki NFZ w Lublinie',
        validUntil: 'Świadczenie emerytalne stałe'
      },
      poz: {
        clinic: 'Gminny Ośrodek Zdrowia w Niemcach',
        address: 'ul. Różana 4, 21-025 Niemce k. Lublina',
        phone: '81 756 12 12',
        doctor: 'lek. med. Janusz Kruk (lekarz rodzinny)',
        nurse: 'Bożena Mazur',
        lastVisit: '02.11.2026'
      },
      ekuz: {
        number: 'PL 803100 0004 8812 0019',
        validUntil: '14.08.2030',
        coverage: 'Kraje UE i EFTA'
      },
      zdarzenia: [
        { date: '02.11.2026', name: 'Wizyta domowa i odnowienie recept stałych 65+', where: 'Ośrodek Zdrowia w Niemcach', cost: '120,00 zł ze środków NFZ' },
        { date: '14.07.2026', name: 'Rehabilitacja narządu ruchu (10 zabiegów)', where: 'Centrum Rehabilitacji Lublin', cost: '480,00 zł ze środków NFZ' }
      ]
    }
  }
};

function getIkpData() {
  const pId = (typeof OS !== 'undefined' && OS.id) ? OS.id : 'jan';
  return IKP.db[pId] || IKP.db.jan;
}

// ----------------- GŁÓWNY MODAL INTERNETOWEGO KONTA PACJENTA -----------------
function openIkpModal(tab = 'recepty') {
  if (typeof haptic === 'function') haptic('card');
  const modal = document.getElementById('ikpModal');
  if (!modal) return;
  const pData = getIkpData();
  const profiles = pData.profiles;
  const curProf = profiles.find(p => p.id === IKP.activeProfile) || profiles[0];

  // Filtrowanie recept i skierowań wg aktywnego członka rodziny
  const myRecepty = pData.recepty.filter(r => r.forProfile === curProf.id);
  const mySkierowania = pData.skierowania.filter(s => s.forProfile === curProf.id || curProf.id === 'self');

  let tabContent = '';

  if (tab === 'recepty') {
    tabContent = `
      <div class="ikp-sec">
        <div class="ikp-sec-head">
          <div>
            <b>e-Recepty pacjenta: ${curProf.name} (${myRecepty.length})</b>
            <small>Pokaż kod kreskowy w aptece lub podaj 4-cyfrowy PIN i numer PESEL.</small>
          </div>
          <button type="button" class="btn-xs primary" onclick="openZamowRecepteModal()">+ Zamów stały lek</button>
        </div>

        ${myRecepty.length ? `
          <div class="rx-list">
            ${myRecepty.map(r => `
              <div class="rx-card" onclick="openAptekaModal('${r.id}')" style="cursor:pointer">
                <div class="rx-card-top">
                  <div>
                    <span class="rx-badge">${r.status}</span>
                    <b class="rx-name">${r.drug}</b>
                    <span class="rx-sub">${r.pack} • ${r.refund}</span>
                  </div>
                  <div class="rx-pin-wrap">
                    <span class="rx-pin-lbl">PIN</span>
                    <div class="rx-pin-val">${r.pin}</div>
                  </div>
                </div>
                <div class="rx-card-bot" style="margin-top:10px">
                  <span>Wystawił: <b>${r.doctor}</b></span>
                  <span>Ważna do: <b>${r.exp}</b></span>
                </div>
                <div class="rx-card-actions" style="margin-top:8px">
                  <button type="button" class="btn primary btn-sm" onclick="event.stopPropagation();openAptekaModal('${r.id}')">🔍 Pokaż kod kreskowy</button>
                  <button type="button" class="btn ghost btn-sm" onclick="event.stopPropagation();copyRxPin('${r.pin}')">Kopiuj PIN</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="ikp-empty-box">
            <span style="font-size:36px">💊</span>
            <b>Brak aktywnych e-recept</b>
            <p>Wszystkie recepty dla profilu ${curProf.name} zostały już zrealizowane.</p>
            <button type="button" class="btn secondary btn-sm" onclick="openZamowRecepteModal()">Zamów receptę na leki stałe</button>
          </div>
        `}
      </div>
    `;
  } else if (tab === 'skierowania') {
    tabContent = `
      <div class="ikp-sec">
        <div class="ikp-sec-head">
          <b>e-Skierowania na badania i do poradni (${mySkierowania.length})</b>
          <small>Skierowanie NFZ zrealizujesz w dowolnej placówce w Polsce.</small>
        </div>

        ${mySkierowania.length ? `
          <div class="rx-list">
            ${mySkierowania.map(s => `
              <div class="rx-card">
                <div class="rx-card-top">
                  <div>
                    <span class="rx-badge">${s.status}</span>
                    <b class="rx-name">${s.name}</b>
                    <span class="rx-sub">Wystawił: ${s.doctor} • Data: ${s.date}</span>
                  </div>
                  <div class="rx-pin-wrap">
                    <span class="rx-pin-lbl">KOD</span>
                    <div class="rx-pin-val">${s.code}</div>
                  </div>
                </div>
                <div class="rx-card-actions" style="margin-top:10px">
                  <button type="button" class="btn primary btn-sm" onclick="closeIkpModal();openERejestracjaModal()">🗓️ Umów termin (e-Rejestracja)</button>
                  <button type="button" class="btn ghost btn-sm" onclick="copyRxPin('${s.code}')">Kopiuj kod</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="ikp-empty-box">
            <span style="font-size:36px">📋</span>
            <b>Brak oczekujących skierowań</b>
            <p>Nie masz żadnych otwartych skierowań wymagających rejestracji.</p>
          </div>
        `}
      </div>
    `;
  } else if (tab === 'ewus') {
    tabContent = `
      <div class="ikp-sec">
        <div class="ikp-sec-head">
          <b>Ubezpieczenie zdrowotne i Europejska Karta EKUZ</b>
          <small>Elektroniczna Weryfikacja Uprawnień Świadczeniobiorców (eWUŚ).</small>
        </div>

        <div class="ewus-hero-box">
          <div class="ewus-status-tag ok">● eWUŚ: ZIELONY — UPRAWNIONY DO ŚWIADCZEŃ</div>
          <b>Prawo do bezpłatnego leczenia w ramach NFZ potwierdzone.</b>
          <p>Tytuł ubezpieczenia: <b>${pData.ewus.insurance}</b></p>
          <div style="font-size:12px;color:var(--ink2);margin-top:6px">Oddział: ${pData.ewus.branch}</div>
        </div>

        <div class="ekuz-card-preview" onclick="openEkuzModal()">
          <div class="ekp-head">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:24px">🇪🇺</span>
              <b>Karta EKUZ w mObywatelu</b>
            </div>
            <span class="bh-badge ok">AKTYWNA</span>
          </div>
          <div class="ekp-num">${pData.ekuz.number}</div>
          <small>Ważna do: <b>${pData.ekuz.validUntil}</b> • Dotknij, aby okazać za granicą</small>
        </div>

        <div class="ikp-action-grid" style="margin-top:12px">
          <button type="button" class="ikp-grid-btn" onclick="closeIkpModal();openOfficialCertificate('nfz')">
            <span class="ikp-gb-ic">📜</span>
            <span class="ikp-gb-tx"><b>Zaświadczenie NFZ (PDF)</b><small>Urzędowy odpis uprawnień z pieczęcią RP</small></span>
          </button>
          <button type="button" class="ikp-grid-btn" onclick="closeIkpModal();openDiloModal()">
            <span class="ikp-gb-ic">🛡️</span>
            <span class="ikp-gb-tx"><b>Karta DiLO (Onkologia)</b><small>Szybka ścieżka terapii onkologicznej</small></span>
          </button>
        </div>
      </div>
    `;
  } else if (tab === 'poz') {
    tabContent = `
      <div class="ikp-sec">
        <div class="ikp-sec-head">
          <b>Twój Lekarz POZ i Przychodnia Rodzinna</b>
          <small>Podstawowa Opieka Zdrowotna w ramach publicznej ochrony zdrowia.</small>
        </div>

        <div class="poz-card">
          <div class="poz-head">
            <span style="font-size:26px">🏥</span>
            <div>
              <b class="poz-title">${pData.poz.clinic}</b>
              <small class="poz-addr">📍 ${pData.poz.address}</small>
            </div>
          </div>
          <div class="poz-rows">
            <div class="poz-r"><span>Lekarz podstawowy:</span><b>${pData.poz.doctor}</b></div>
            <div class="poz-r"><span>Pielęgniarka POZ:</span><b>${pData.poz.nurse}</b></div>
            <div class="poz-r"><span>Numer telefonu:</span><b style="color:var(--red)"><a href="tel:${pData.poz.phone.replace(/\s/g,'')}">${pData.poz.phone}</a></b></div>
            <div class="poz-r"><span>Ostatnia wizyta:</span><b>${pData.poz.lastVisit}</b></div>
          </div>
          <div class="poz-actions" style="margin-top:12px;display:flex;gap:8px">
            <button type="button" class="btn primary btn-sm" style="flex:1" onclick="openZamowRecepteModal()">Zamów leki stałe</button>
            <button type="button" class="btn secondary btn-sm" style="flex:1" onclick="closeIkpModal();openERejestracjaModal()">Zapisz na wizytę</button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'historia') {
    tabContent = `
      <div class="ikp-sec">
        <div class="ikp-sec-head">
          <b>Wykaz świadczeń i leczenia sfinansowanych przez NFZ</b>
          <small>Informacje o kosztach pokrytych z Twoich składek zdrowotnych.</small>
        </div>

        <div class="zdarzenia-list">
          ${pData.zdarzenia.map(z => `
            <div class="zdarzenie-item">
              <div class="zi-head">
                <b>${z.name}</b>
                <span class="zi-cost">${z.cost}</span>
              </div>
              <div class="zi-foot">
                <small>📍 ${z.where}</small>
                <small>${z.date}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="scrim" onclick="closeIkpModal()"></div>
    <div class="modal-box ikp-full-box">
      <div class="modal-head">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">🏥</span>
          <div>
            <h2 id="ikpTitle">Internetowe Konto Pacjenta</h2>
            <small style="color:var(--ink2)">Zintegrowane w mObywatelu • Narodowy Fundusz Zdrowia</small>
          </div>
        </div>
        <button class="tx-close" onclick="closeIkpModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>

      <!-- Przełącznik członków rodziny / dzieci -->
      ${profiles.length > 1 ? `
        <div class="ikp-family-bar">
          <span class="ifb-lbl">Pacjent:</span>
          <div class="ifb-chips">
            ${profiles.map(pr => `
              <button type="button" class="chip-sm ${pr.id === curProf.id ? 'active' : ''}" onclick="IKP.switchProfile('${pr.id}', '${tab}')">
                ${pr.id === 'self' ? '👤 ' : '👶 '}${pr.name}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Zakładki IKP -->
      <div class="lmenu-tabs ikp-tabs" role="tablist">
        <button type="button" class="lmenu-tab ${tab==='recepty'?'active':''}" onclick="openIkpModal('recepty')">💊 Recepty</button>
        <button type="button" class="lmenu-tab ${tab==='skierowania'?'active':''}" onclick="openIkpModal('skierowania')">📋 Skierowania</button>
        <button type="button" class="lmenu-tab ${tab==='ewus'?'active':''}" onclick="openIkpModal('ewus')">🇪🇺 eWUŚ & EKUZ</button>
        <button type="button" class="lmenu-tab ${tab==='poz'?'active':''}" onclick="openIkpModal('poz')">👨‍⚕️ Lekarz POZ</button>
        <button type="button" class="lmenu-tab ${tab==='historia'?'active':''}" onclick="openIkpModal('historia')">📊 Koszty NFZ</button>
      </div>

      <div class="ikp-body-content">
        ${tabContent}
      </div>
    </div>
  `;

  modal.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('ikpModal', modal);
}

function closeIkpModal() {
  const m = document.getElementById('ikpModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('ikpModal');
  }
}

IKP.switchProfile = function(profileId, currentTab) {
  IKP.activeProfile = profileId;
  openIkpModal(currentTab || 'recepty');
  if (typeof showToast === 'function') {
    const pData = getIkpData();
    const pr = pData.profiles.find(x => x.id === profileId);
    showToast(`Przełączono na konto zdrowotne: ${pr ? pr.name : 'Pacjent'}`);
  }
};

// ----------------- MODAL: ZAMÓW E-RECEPTĘ NA LEKI STAŁE -----------------
function openZamowRecepteModal() {
  const pData = getIkpData();
  const drugName = prompt(`Podaj nazwę leku stałego i dawkę do przedłużenia przez ${pData.poz.doctor}:`, 'Letrox 75 µg');
  if (!drugName) return;

  if (typeof showToast === 'function') showToast(`Wysyłanie prośby o e-receptę na ${drugName} do przychodni POZ…`);

  setTimeout(() => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newRx = {
      id: 'rx_' + Date.now(),
      forProfile: IKP.activeProfile,
      drug: drugName,
      pack: '1 opakowanie (kuracja 3-miesięczna)',
      pin: pin,
      barcode: '910714' + pin + '99',
      doctor: pData.poz.doctor,
      date: 'Dzisiaj (e-Konsultacja POZ)',
      exp: 'Za 365 dni (recepta roczna)',
      refund: 'Ryczałt NFZ',
      status: 'Wystawiona automatycznie'
    };
    pData.recepty.unshift(newRx);

    if (typeof MobStore !== 'undefined') {
      MobStore.addUPO({
        title: `e-Recepta: ${drugName}`,
        source: `${pData.poz.clinic} / Rejestr e-Zdrowie (P1)`,
        rows: [['Lek', drugName], ['Kod PIN', pin], ['Lekarz', pData.poz.doctor], ['Status', 'Podpisana elektronicznie przez lekarza']]
      });
    }

    if (typeof showToast === 'function') showToast(`✅ Sukces! Lekarz wystawił e-receptę na ${drugName}. PIN: ${pin}`);
    openIkpModal('recepty');
  }, 1200);
}

// ----------------- MODAL: EUROPEJSKA KARTA UBEZPIECZENIA ZDROWOTNEGO (EKUZ) -----------------
function openEkuzModal() {
  let m = document.getElementById('ekuzModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'ekuzModal';
    m.className = 'sheet-modal';
    document.body.appendChild(m);
  }

  const pData = getIkpData();
  const ekuz = pData.ekuz;

  m.innerHTML = `
    <div class="scrim" onclick="closeEkuzModal()"></div>
    <div class="modal-box">
      <div class="modal-head">
        <h2>Europejska Karta Ubezpieczenia Zdrowotnego</h2>
        <button class="tx-close" onclick="closeEkuzModal()" aria-label="Zamknij"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      </div>
      <p class="modal-sub">Dokument uprawniający do bezpłatnego leczenia w krajach UE i EFTA</p>

      <div class="ekuz-plastic-card">
        <div class="epc-top">
          <div class="epc-eu-flag">🇪🇺</div>
          <b>EUROPEAN HEALTH INSURANCE CARD</b>
          <span class="epc-pl">PL</span>
        </div>
        <div class="epc-rows">
          <div class="epc-r"><span>Nazwisko / Name:</span><b>${OS.nazwisko.toUpperCase()}</b></div>
          <div class="epc-r"><span>Imię / Given names:</span><b>${OS.imie.toUpperCase()}</b></div>
          <div class="epc-r"><span>Data urodzenia:</span><b>14.07.1991</b></div>
          <div class="epc-r"><span>Osobisty numer identyfikacyjny:</span><b>${OS.docs[0].f.find(x=>x[0]==='PESEL') ? OS.docs[0].f.find(x=>x[0]==='PESEL')[1] : '91071427765'}</b></div>
          <div class="epc-r"><span>Numer identyfikacyjny karty:</span><b>${ekuz.number}</b></div>
          <div class="epc-r"><span>Data ważności:</span><b>${ekuz.validUntil}</b></div>
        </div>
      </div>

      <div class="bus-actions-row" style="margin-top:14px">
        <button type="button" class="btn secondary" onclick="if(typeof showToast==='function')showToast('Pobrano certyfikat EKUZ w formacie PDF');">📜 Pobierz certyfikat PDF</button>
        <button type="button" class="btn primary" onclick="closeEkuzModal();if(typeof askAssistantWithPrompt==='function')askAssistantWithPrompt('Jak skorzystać z karty EKUZ w przypadku nagłego zachorowania za granicą?')">Zapytaj asystenta AI</button>
      </div>
    </div>
  `;

  m.classList.add('open');
  if (typeof openDialogFocus === 'function') openDialogFocus('ekuzModal', m);
}

function closeEkuzModal() {
  const m = document.getElementById('ekuzModal');
  if (m) {
    m.classList.remove('open');
    if (typeof restoreDialogFocus === 'function') restoreDialogFocus('ekuzModal');
  }
}
