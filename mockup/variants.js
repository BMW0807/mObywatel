/* Warianty układu dokumentów: ?uklad=stos | karuzela | pion | lista | siatka */
const LAYOUTS=[
 ['stos','Stos','Jak dziś w mObywatelu i Apple Wallet'],
 ['karuzela','Karuzela','Duża karta przewijana w bok, akcje pod spodem'],
 ['pion','Pionowa karuzela','Karta na środku, przewijanie w górę i w dół'],
 ['lista','Lista ze statusem','Zdjęcie, dane i alerty w jednym wierszu'],
 ['siatka','Siatka 2×2','Wszystkie dokumenty naraz']
];
let VARIANT=(()=>{const v=new URLSearchParams(location.search).get('uklad');return LAYOUTS.some(l=>l[0]===v)?v:'stos'})();
app.dataset.v=VARIANT;
const ALT=$('#alt');
let carIdx=0;

function openDocQR(id){qrFlow({doc:id})}
function docActions(d){
 const base=[['scan','Potwierdź dane',()=>openDocQR(d.id)],['doc','Szczegóły',()=>openDoc(d.id)]];
 const ctx={dowod:['shield','Zastrzeż PESEL',()=>startTopic('Zastrzeż mój PESEL')],
  kdr:['coin','Partnerzy KDR',()=>startTopic('Gdzie mogę użyć Karty Dużej Rodziny?')],
  leg:['coin','Ulgi studenta',()=>startTopic(OS.ask.leg)],
  pj:['clock','Punkty karne',()=>startTopic('Ile mam punktów karnych?')],
  auto:['car','OC i badanie',()=>startTopic(OS.ask.auto)]}[d.id];
 if(d.id==='dowod')base[0]=['scan','Potwierdź dane',()=>openDocQR(d.id)];
 const ask=['dots','Zapytaj',()=>startTopic(OS.ask[d.id]||'Opowiedz mi o tym dokumencie')];
 return [...base,ctx,ask];
}
const statusH=d=>d.alert?`<span class="bad">${svg('alert')}${d.alert}</span>`:`<span class="good">${svg('check')}${d.sub}</span>`;

function buildAlt(){
 ALT.innerHTML='';ALT.className='alt';
 if(VARIANT==='stos')return;
 if(VARIANT==='karuzela'){
  ALT.innerHTML=`<div class="car" id="car">${DOCS.map(d=>`<button class="ccard dface" style="background-image:url(${d.img})" aria-label="${d.name}" data-id="${d.id}">${faceHTML(d)}</button>`).join('')}</div>
   <div class="dots">${DOCS.map((d,i)=>`<i class="${i===carIdx?'on':''}"></i>`).join('')}</div><div class="cstat" id="cstat"></div><div class="acts" id="acts"></div>`;
  const car=$('#car');
  car.querySelectorAll('.ccard').forEach((c,i)=>c.onclick=()=>{if(i!==carIdx){car.scrollTo({left:i*(c.offsetWidth+12),behavior:'smooth'});return}openDoc(c.dataset.id)});
  let t;car.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const w=car.querySelector('.ccard').offsetWidth+12;const i=Math.max(0,Math.min(DOCS.length-1,Math.round(car.scrollLeft/w)));if(i!==carIdx){carIdx=i;renderActs()}},60)});
  renderActs();
 }
 if(VARIANT==='pion'){
  ALT.innerHTML=`<div class="vwrap"><div class="vcar" id="vcar">${DOCS.map(d=>`<button class="vcard dface" style="background-image:url(${d.img})" aria-label="${d.name}" data-id="${d.id}">${faceHTML(d)}</button>`).join('')}</div>
   <div class="dots vdots">${DOCS.map((d,i)=>`<i class="${i===carIdx?'on':''}"></i>`).join('')}</div></div><div class="cstat" id="cstat"></div><div class="acts" id="acts"></div>`;
  const vc=$('#vcar');
  vc.querySelectorAll('.vcard').forEach((c,i)=>c.onclick=()=>{if(i!==carIdx){vc.scrollTo({top:i*(c.offsetHeight+12),behavior:'smooth'});return}openDoc(c.dataset.id)});
  let raf=0;vc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;vDepth()})},{passive:true});
  renderActs();
 }
 if(VARIANT==='lista'){
  ALT.innerHTML=DOCS.map(d=>`<button class="strip" style="background-image:url(${d.strip})" data-id="${d.id}">
   <span class="lead">${d.photo?`<span class="avatar">${PHOTO}</span>`:d.plate?plateH(d.plate):''}</span>
   <span class="st"><b>${d.name}</b><small>${d.id==='dowod'?PRIV(OS.imie+' '+OS.nazwisko,OS.imie):(d.who||OS.imie+' '+OS.nazwisko)}</small><em>${d.id==='dowod'?PRIV(d.line,'Dane ukryte'):d.line}</em></span>
   ${d.alert?`<span class="pill">${d.alert}</span>`:`<span class="chev">${svg('chev')}</span>`}</button>`).join('');
  ALT.querySelectorAll('.strip').forEach(b=>b.onclick=()=>openDoc(b.dataset.id));
 }
 if(VARIANT==='siatka'){
  ALT.innerHTML=`<div class="grid">${DOCS.map(d=>`<button class="gitem" data-id="${d.id}"><span class="gmini dface" style="background-image:url(${d.img})">${faceHTML(d)}</span><span class="gcap"><b>${d.name}</b>${statusH(d)}</span></button>`).join('')}</div>`;
  ALT.querySelectorAll('.gitem').forEach(b=>b.onclick=()=>openDoc(b.dataset.id));
 }
}
function renderActs(){
 const d=DOCS[carIdx];const a=$('#acts');if(!a)return;
 a.innerHTML=docActions(d).map((x,i)=>`<button data-i="${i}"><i>${svg(x[0])}</i><span>${x[1]}</span></button>`).join('');
 const acts=docActions(d);a.querySelectorAll('button').forEach(b=>b.onclick=()=>acts[+b.dataset.i][2]());
 document.querySelectorAll('.alt .dots i').forEach((x,i)=>x.classList.toggle('on',i===carIdx));
 const cs=$('#cstat');if(cs)cs.innerHTML=d.alert?`<span class="bad">${svg('alert')}${d.alert}</span><span class="sep"></span>${d.sub}`:`<span class="good">${svg('check')}Dokument ważny</span><span class="sep"></span>${d.sub}`;
}

function vDepth(){
 const vc=$('#vcar');if(!vc)return;const cards=[...vc.querySelectorAll('.vcard')];if(!cards.length)return;
 const step=cards[0].offsetHeight+12,pos=vc.scrollTop/step;
 cards.forEach((c,i)=>{const d=Math.min(1.4,Math.abs(i-pos));c.style.transform=`scale(${1-0.1*Math.min(1,d)})`;c.style.opacity=1-0.35*Math.min(1,d)});
 const i=Math.max(0,Math.min(DOCS.length-1,Math.round(pos)));if(i!==carIdx){carIdx=i;renderActs()}
}
/* zwraca wysokość zajętą przez wariant */
function layoutAlt(top,h,W){
 ALT.style.top=top+'px';
 const narrow=W<360,padSide=narrow?20:32;
 if(VARIANT==='karuzela'){
  const compact=h<330;ALT.classList.toggle('compact',compact);
  const actH=0,dotH=10,gaps=12+12+24;
  const cardW=W-(narrow?24:36),maxH=Math.max(126,h-actH-dotH-gaps),cardH=Math.min(Math.round(cardW/1.5),maxH),pad=(W-cardW)/2;
  const car=$('#car');car.style.paddingInline=pad+'px';car.style.scrollPaddingInline=pad+'px';car.style.height=cardH+'px';
  car.querySelectorAll('.ccard').forEach(c=>{c.style.width=cardW+'px';c.style.height=cardH+'px';c.classList.toggle('short-card',cardH<cardW/1.5*0.86)});
  car.scrollLeft=carIdx*(cardW+12);
  $('.alt .dots').style.marginTop='12px';$('#cstat').style.marginTop='10px';
  ALT.style.height=h+'px';return h;
 }
 if(VARIANT==='pion'){
  const compact=h<360;ALT.classList.toggle('compact',compact);
  const actH=0,statH=20,gaps=10+10;
  const vh=Math.max(120,h-actH-statH-gaps);
  const cardW=W-(narrow?28:44),cardH=Math.min(Math.round(cardW/1.5),Math.max(118,vh-(compact?28:46)));
  const vc=$('#vcar');vc.style.height=vh+'px';const pad=(vh-cardH)/2;vc.style.paddingBlock=pad+'px';vc.style.scrollPaddingBlock=pad+'px';
  vc.querySelectorAll('.vcard').forEach(c=>{c.style.width=cardW+'px';c.style.height=cardH+'px';c.classList.toggle('short-card',cardH<cardW/1.5*0.86)});
  vc.scrollTop=carIdx*(cardH+12);vDepth();
  $('#cstat').style.marginTop='8px';$('#acts').style.marginTop='10px';
  ALT.style.height=h+'px';return h;
 }
 if(VARIANT==='lista'){
  const rowW=W-padSide,rowH=Math.max(40,Math.min(104,(h-3*8)/4));
  const s=Math.max(rowW/400,rowH/100),av=Math.round(Math.min(52*s+4,rowH-6)),pl=Math.round(24*s+(52*s-av)/2);ALT.style.setProperty('--av',av+'px');
  ALT.classList.toggle('tight',rowH<70);ALT.classList.toggle('xtight',rowH<52);
  ALT.querySelectorAll('.strip').forEach(b=>{b.style.height=rowH+'px';b.style.paddingLeft=pl+'px'});
  const used=4*rowH+3*8;ALT.style.height=used+'px';return Math.max(used,h);
 }
 if(VARIANT==='siatka'){
  const tw=(W-padSide-10)/2;let capH=40,ch=Math.round(tw/1.5);
  if(2*(ch+capH)+12>h){capH=34;ch=Math.max(76,Math.floor((h-12)/2-capH))}
  ALT.classList.toggle('tight',capH<40);
  ALT.querySelectorAll('.gitem').forEach(b=>{b.style.width=tw+'px'});
  ALT.querySelectorAll('.gmini').forEach(m=>{m.style.width=tw+'px';m.style.height=ch+'px';m.classList.toggle('short-card',ch<tw/1.5*0.86)});
  const used=2*(ch+capH)+12;ALT.style.height=used+'px';return Math.max(used,h);
 }
 return 0;
}

/* menu rozwijane z góry: przełączanie wariantów i osoby */
function setVariant(v){
 if(v===VARIANT){closeMenu();return}
 VARIANT=v;app.dataset.v=v;carIdx=0;buildAlt();layout();renderMenu();closeMenu();
 const lv=LAYOUTS.find(l=>l[0]===v);
 if(lv&&typeof announceSR==='function')announceSR('Zmieniono układ dokumentów na: '+lv[1]);
 try{const u=new URL(location.href);u.searchParams.set('uklad',v);history.replaceState(null,'',u.toString())}catch(e){}
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
 m.querySelector('.ml').innerHTML=LAYOUTS.map(([k,t,s])=>`<button type="button" data-k="${k}" class="${k===VARIANT?'on':''}" aria-current="${k===VARIANT?'true':'false'}"><span class="mi mi-${k}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="mt"><b>${t}</b><small>${s}</small></span>${k===VARIANT?svg('check'):''}</button>`).join('');
 m.querySelectorAll('.ml button').forEach(b=>b.onclick=()=>setVariant(b.dataset.k));
 const ma=m.querySelector('.ma11y');if(ma&&typeof A11Y!=='undefined'){
  const errCnt=(typeof MobStore!=='undefined'&&MobStore.getAiErrors)?MobStore.getAiErrors().length:0;
  const curLang=new URLSearchParams(location.search).get('lang')||(function(){try{return localStorage.getItem('mobLang')}catch(e){return null}})()||'pl';
  ma.innerHTML=`
   <div class="ap-lang-row" style="margin-bottom:8px">
    <button type="button" class="lang-btn ${curLang==='pl'?'active':''}" data-lang="pl" onclick="A11Y.setLang('pl')"><span class="flag">🇵🇱</span> Polski</button>
    <button type="button" class="lang-btn ${curLang==='uk'?'active':''}" data-lang="uk" onclick="A11Y.setLang('uk')"><span class="flag">🇺🇦</span> Українська</button>
    <button type="button" class="lang-btn ${curLang==='en'?'active':''}" data-lang="en" onclick="A11Y.setLang('en')"><span class="flag">🇬🇧</span> English</button>
   </div>
   <div class="ma-row">
    <button type="button" class="ma-btn" onclick="A11Y.toggleDarkMode();renderMenu()">
     <span>Motyw: <b>${A11Y.darkMode?'🌙 Ciemny':'☀️ Jasny'}</b></span>
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
     <span>📖 Słowniczek „Po ludzku”</span>
    </button>
    <button type="button" class="ma-btn" onclick="closeMenu();openErrorHistory()">
     <span>⚠️ Błędy AI${errCnt?` (<b>${errCnt}</b>)`:''}</span>
    </button>
   </div>
   <div class="ma-row" style="margin-top:6px">
    <button type="button" class="ma-btn" onclick="closeMenu();openOfficialCertificate('pesel')">
     <span>📜 Zaświadczenie PESEL</span>
    </button>
    <button type="button" class="ma-btn" onclick="closeMenu();openOfficialCertificate('punkty')">
     <span>📜 Odpis CEPiK (PDF)</span>
    </button>
   </div>
   <div class="ma-row" style="margin-top:6px">
    <button type="button" class="ma-btn reset" onclick="if(confirm('Zresetować dane demonstracyjne wybranej osoby?')){MobStore.reset();location.reload()}">
     <span>↺ Resetuj dane demo (${OS.imie})</span>
    </button>
   </div>
  `;
 }
}
let currentMenuTab = 'osoba';
function setMenuTab(tab) {
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
 if(secUklad) secUklad.hidden = (tab !== 'uklad');
 if(secA11y) secA11y.hidden = (tab !== 'a11y');
 const panel = m.querySelector('.panel');
 if(panel) panel.scrollTop = 0;
}

function openMenu(tabOrFocusPersona){
 if(app.classList.contains('chatting'))return;
 closeHist();renderMenu();
 let targetTab = 'osoba';
 if(tabOrFocusPersona === 'uklad' || tabOrFocusPersona === false) targetTab = 'uklad';
 else if(tabOrFocusPersona === 'a11y') targetTab = 'a11y';
 else if(tabOrFocusPersona === 'osoba' || tabOrFocusPersona === true) targetTab = 'osoba';
 setMenuTab(targetTab);
 if(typeof openDialogFocus==='function')openDialogFocus('lmenu',$('#lmenu .panel'),targetTab==='osoba'?'#lmenu .mo button.on':(targetTab==='uklad'?'#lmenu .ml button.on':'.lmenu-tab.active'));
 app.classList.add('menu');
 $('#title').setAttribute('aria-expanded','true');
 const pb=$('#personBtn');if(pb)pb.setAttribute('aria-expanded','true');
 if(typeof announceSR==='function')announceSR('Otwarto menu: ' + (targetTab === 'osoba' ? 'wybór osoby' : (targetTab === 'uklad' ? 'układ kart' : 'opcje i dostępność')));
}
function closeMenu(){
 if(!app.classList.contains('menu'))return;
 app.classList.remove('menu');
 $('#title').setAttribute('aria-expanded','false');
 const pb=$('#personBtn');if(pb)pb.setAttribute('aria-expanded','false');
 if(typeof restoreDialogFocus==='function')restoreDialogFocus('lmenu');
}
$('#title').onclick=()=>app.classList.contains('menu')?closeMenu():openMenu('uklad');
$('#lmenu .scrim').onclick=closeMenu;
$('#personBtn').onclick=()=>{
 if(app.classList.contains('chatting'))return;
 if(app.classList.contains('menu') && currentMenuTab === 'osoba'){closeMenu();return}
 openMenu('osoba');
};
renderMenu();
buildAlt();
