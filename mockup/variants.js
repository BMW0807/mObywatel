/* Stały układ dokumentów: Siatka 2x2 */
const LAYOUTS=[
 ['siatka','Siatka 2×2','Wszystkie dokumenty naraz']
];
let VARIANT='siatka';
app.dataset.v=VARIANT;
try{
 const u=new URL(location.href);
 if(u.searchParams.has('uklad')){
  u.searchParams.delete('uklad');
  history.replaceState(null,'',u.toString());
 }
}catch(e){}
const ALT=$('#alt');

/* Rejestr szablonów i pól dla kart tożsamości i uprawnień (mObywatel 2.0) */
const CARD_TEMPLATES = {
  hdk: {
    id: 'hdk',
    name: 'Książeczka Krwiodawcy (HDK / ZHDK)',
    badge: 'HDK / RCKiK',
    kategoria: 'zdrowie',
    img: 'assets/card-hdk.svg',
    strip: 'assets/strip-hdk.svg',
    fields: [
      { key: 'Grupa krwi', label: 'Grupa krwi', sample: '0 Rh+ (dodatnia)' },
      { key: 'Oddana krew', label: 'Oddana krew', sample: '18,5 L' },
      { key: 'Ostatnia donacja', label: 'Ostatnia donacja', sample: '14.10.2026' },
      { key: 'Kolejna donacja', label: 'Kolejna donacja', sample: 'od 09.12.2026' }
    ],
    uprawnienia: ['2 dni wolnego od pracy/szkoły', 'Bezpłatne leki z listy Zasłużonych', 'Ulgi na komunikację miejską', 'Pierwszeństwo w aptece i POZ']
  },
  osp: {
    id: 'osp',
    name: 'Legitymacja Członka OSP',
    badge: 'ZOSP RP',
    kategoria: 'zawodowe',
    img: 'assets/card-osp.svg',
    strip: 'assets/strip-osp.svg',
    fields: [
      { key: 'Stopień', label: 'Stopień służbowy', sample: 'Ratownik OSP / Dowódca Sekcji' },
      { key: 'Jednostka', label: 'Jednostka OSP', sample: 'OSP Kraków-Kościelniki' },
      { key: 'Nr legitymacji', label: 'Numer legitymacji', sample: 'OSP/MP/2019/084' },
      { key: 'Badania lekarskie', label: 'Badania lekarskie', sample: 'ważne do 14.04.2027' }
    ],
    certyfikaty: ['KPP (Kwalifikowana Pierwsza Pomoc)', 'Aparaty Dróg Oddechowych (AODO)', 'Szkolenie Podstawowe Strażaka-Ratownika OSP']
  },
  pz: {
    id: 'pz',
    name: 'Profil Zaufany (PZ)',
    badge: 'PZ / MC',
    kategoria: 'tozsamosc',
    img: 'assets/card-pz.svg',
    strip: 'assets/strip-pz.svg',
    fields: [
      { key: 'Status', label: 'Status profilu', sample: 'Aktywny (Węzeł Krajowy)' },
      { key: 'Ważny do', label: 'Data ważności', sample: '12.05.2028' },
      { key: 'Weryfikacja', label: 'Metoda weryfikacji', sample: 'Bankowość elektroniczna' },
      { key: 'Powiązany tel.', label: 'Numer telefonu', sample: '+48 602 ••• 312' }
    ],
    uprawnienia: ['Podpis Zaufany na gov.pl i ePUAP', 'Logowanie do portali administracji publicznej (Węzeł Krajowy)', 'Ważność certyfikatu przez 3 lata']
  }
};
window.CARD_TEMPLATES = CARD_TEMPLATES;

const statusH=d=>d.alert?`<span class="bad">${svg('alert')}${d.alert}</span>`:`<span class="good">${svg('check')}${d.sub}</span>`;

function buildAlt(){
 ALT.innerHTML='';ALT.className='alt';
 const imgUrl = d => (typeof cardImgUrl === 'function' ? cardImgUrl(d.img) : d.img);
 ALT.innerHTML=`<div class="grid">${DOCS.map(d=>`<button class="gitem" data-id="${d.id}"><span class="gmini dface" style="background-image:url(&quot;${imgUrl(d)}&quot;)">${faceHTML(d)}</span><span class="gcap"><b>${d.name}</b>${statusH(d)}</span></button>`).join('')}</div>`;
 ALT.querySelectorAll('.gitem').forEach(b=>b.onclick=()=>openDoc(b.dataset.id));
}

/* zwraca wysokość zajętą przez siatkę 2x2 */
function layoutAlt(top,h,W){
 ALT.style.top=top+'px';
 const narrow=W<360,padSide=narrow?20:32;
 const n=DOCS.length;
 const rows=Math.ceil(n/2);
 const tw=Math.floor((W-padSide-10)/2);
 let capH=34;
 let maxCh=Math.floor((h-(rows-1)*8)/rows-capH);
 let ch=Math.round(tw/1.55);
 let scrollable=false;

 if(ch>maxCh){
  if(maxCh>=65){
   ch=maxCh;
   capH=28;
  }else{
   ch=Math.max(74,Math.min(104,Math.round(tw/1.55)));
   capH=32;
   scrollable=true;
  }
 }
 ALT.classList.toggle('tight',capH<34);
 ALT.classList.toggle('grid-scroll',scrollable);
 const grid=ALT.querySelector('.grid');
 if(grid){
  grid.style.maxHeight=h+'px';
  grid.style.overflowY=scrollable?'auto':'visible';
  grid.style.paddingBottom=scrollable?'8px':'0';
 }
 ALT.querySelectorAll('.gitem').forEach(b=>{b.style.width=tw+'px'});
 ALT.querySelectorAll('.gmini').forEach(m=>{
  m.style.width=tw+'px';
  m.style.height=ch+'px';
  m.classList.toggle('short-card',ch<tw/1.55*0.86);
 });
 const used=Math.min(h,rows*(ch+capH)+(rows-1)*8);
 ALT.style.height=used+'px';
 return used;
}

/* menu rozwijane z góry: wybór osoby i opcje */
function setVariant(v){
 VARIANT='siatka';app.dataset.v='siatka';
 try{const u=new URL(location.href);if(u.searchParams.has('uklad')){u.searchParams.delete('uklad');history.replaceState(null,'',u.toString())}}catch(e){}
 closeMenu();
}
function renderMenu(){
 const m=$('#lmenu');if(!m)return;
 const picker=$('#personBtn');
 if(picker){
  const av=picker.querySelector('.person-avatar'),nm=picker.querySelector('.person-name'),ds=picker.querySelector('.person-desc');
  if(av)av.style.backgroundImage=`url(assets/foto-${OS.id}.webp)`;
  if(nm)nm.textContent=`${OS.imie} ${OS.nazwisko}`;
  if(ds)ds.textContent=OS.opis;
  picker.setAttribute('aria-label',`Aktywna osoba: ${OS.imie} ${OS.nazwisko}, ${OS.opis}. Kliknij, aby zmienić osobę.`);
 }
 const mo=m.querySelector('.mo');
 if(mo){
  mo.innerHTML=Object.values(OSOBY).map(o=>`<button type="button" data-o="${o.id}" class="${o.id===OS.id?'on':''}" aria-current="${o.id===OS.id?'true':'false'}" aria-label="${o.imie} ${o.nazwisko} — ${o.opis}"><span class="oav" style="background-image:url(assets/foto-${o.id}.webp)" aria-hidden="true"></span><span class="otx"><b>${o.imie} ${o.nazwisko}</b><small>${o.opis}</small></span>${o.id===OS.id?svg('check'):''}</button>`).join('');
  mo.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.o===OS.id){closeMenu();return}zmienOsobe(b.dataset.o)});
 }
 const ml=m.querySelector('.ml');
 if(ml) ml.innerHTML='';
 const ma=m.querySelector('.ma11y');if(ma&&typeof A11Y!=='undefined'){
  const errCnt=(typeof MobStore!=='undefined'&&MobStore.getAiErrors)?MobStore.getAiErrors().length:0;
  const curLang=new URLSearchParams(location.search).get('lang')||(function(){try{return localStorage.getItem('mobLang')}catch(e){return null}})()||'pl';
  ma.innerHTML=`
   <div class="ap-lang-row" style="margin-bottom:8px">
    <button type="button" class="lang-btn ${curLang==='pl'?'active':''}" data-lang="pl" onclick="A11Y.setLang('pl')"><span class="flag"><i class="ikf ikf-pl" aria-hidden="true"></i></span> Polski</button>
    <button type="button" class="lang-btn ${curLang==='uk'?'active':''}" data-lang="uk" onclick="A11Y.setLang('uk')"><span class="flag"><i class="ikf ikf-ua" aria-hidden="true"></i></span> Українська</button>
    <button type="button" class="lang-btn ${curLang==='en'?'active':''}" data-lang="en" onclick="A11Y.setLang('en')"><span class="flag"><i class="ikf ikf-gb" aria-hidden="true"></i></span> English</button>
   </div>
   <div class="ma-row">
    <button type="button" class="ma-btn" onclick="A11Y.toggleDarkMode();renderMenu()">
     <span>Motyw: <b>${A11Y.darkMode?'<i class="ik ik-moon" aria-hidden="true"></i> Ciemny':'<i class="ik ik-sun" aria-hidden="true"></i> Jasny'}</b></span>
    </button>
    <button type="button" class="ma-btn" onclick="A11Y.toggleLargeText();renderMenu()">
     <span>Tekst: <b>${A11Y.largeText?'Duży (A+)':'Standard'}</b></span>
    </button>
    <button type="button" class="ma-btn" onclick="A11Y.toggleHighContrast();renderMenu()">
     <span>Kontrast: <b>${A11Y.highContrast?'Wysoki':'Normalny'}</b></span>
    </button>
   </div>
   <div class="ma-row" style="margin-top:6px">
    <button type="button" class="ma-btn" onclick="closeMenu();openGlossary()">
     <span><i class="ik ik-book" aria-hidden="true"></i> Słowniczek „Po ludzku”</span>
    </button>
    <button type="button" class="ma-btn" onclick="closeMenu();openErrorHistory()">
     <span><i class="ik ik-warning" aria-hidden="true"></i> Błędy AI${errCnt?` (<b>${errCnt}</b>)`:''}</span>
    </button>
   </div>
   <div class="ma-row" style="margin-top:6px">
    <button type="button" class="ma-btn" onclick="closeMenu();openOfficialCertificate('pesel')">
     <span><i class="ik ik-cert" aria-hidden="true"></i> Zaświadczenie PESEL</span>
    </button>
    <button type="button" class="ma-btn" onclick="closeMenu();openOfficialCertificate('punkty')">
     <span><i class="ik ik-cert" aria-hidden="true"></i> Odpis CEPiK (PDF)</span>
    </button>
   </div>
   <div class="ma-row" style="margin-top:6px">
    <button type="button" class="ma-btn reset" onclick="if(confirm('Zresetować dane demonstracyjne wybranej osoby?')){MobStore.reset();location.reload()}">
     <span><i class="ik ik-reset" aria-hidden="true"></i> Resetuj dane demo (${OS.imie})</span>
    </button>
   </div>
  `;
 }
}
let currentMenuTab = 'osoba';
function setMenuTab(tab) {
 if (tab !== 'a11y') tab = 'osoba';
 currentMenuTab = tab;
 const m = $('#lmenu');
 if(!m) return;
 m.querySelectorAll('.lmenu-tab').forEach(b => {
  const on = b.dataset.tab === tab;
  b.classList.toggle('active', on);
  b.setAttribute('aria-selected', on ? 'true' : 'false');
 });
 const secOsoba = $('#secOsoba');
 const secUklad = $('#secUklad');
 const secA11y = $('#secA11y');
 if(secOsoba) secOsoba.hidden = (tab !== 'osoba');
 if(secUklad) secUklad.hidden = true;
 if(secA11y) secA11y.hidden = (tab !== 'a11y');
 const panel = m.querySelector('.panel');
 if(panel) panel.scrollTop = 0;
}

function openMenu(tabOrFocusPersona){
 if(app.classList.contains('chatting'))return;
 closeHist();renderMenu();
 let targetTab = (tabOrFocusPersona === 'a11y') ? 'a11y' : 'osoba';
 setMenuTab(targetTab);
 if(typeof openDialogFocus==='function')openDialogFocus('lmenu',$('#lmenu .panel'),targetTab==='osoba'?'#lmenu .mo button.on':'.lmenu-tab.active');
 app.classList.add('menu');
 $('#title').setAttribute('aria-expanded','true');
 const pb=$('#personBtn');if(pb)pb.setAttribute('aria-expanded','true');
 if(typeof announceSR==='function')announceSR('Otwarto menu: ' + (targetTab === 'osoba' ? 'wybór osoby' : 'opcje i dostępność'));
}
function closeMenu(){
 if(!app.classList.contains('menu'))return;
 app.classList.remove('menu');
 $('#title').setAttribute('aria-expanded','false');
 const pb=$('#personBtn');if(pb)pb.setAttribute('aria-expanded','false');
 if(typeof restoreDialogFocus==='function')restoreDialogFocus('lmenu');
}
$('#title').onclick=()=>app.classList.contains('menu')?closeMenu():openMenu('osoba');
$('#lmenu .scrim').onclick=closeMenu;
$('#personBtn').onclick=()=>{
 if(app.classList.contains('chatting'))return;
 if(app.classList.contains('menu') && currentMenuTab === 'osoba'){closeMenu();return}
 openMenu('osoba');
};
renderMenu();
buildAlt();
