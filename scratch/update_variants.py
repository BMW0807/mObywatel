with open('mockup/variants.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update buildAlt to use cardImgUrl
new_buildAlt = '''function buildAlt(){
 ALT.innerHTML='';ALT.className='alt';
 if(VARIANT==='stos')return;
 const imgUrl = d => (typeof cardImgUrl === 'function' ? cardImgUrl(d.img) : d.img);
 const stripUrl = d => (typeof cardImgUrl === 'function' ? cardImgUrl(d.strip) : d.strip);

 if(VARIANT==='karuzela'){
  ALT.innerHTML=`<div class="car" id="car">${DOCS.map(d=>`<button class="ccard dface" style="background-image:url(${imgUrl(d)})" aria-label="${d.name}" data-id="${d.id}">${faceHTML(d)}</button>`).join('')}</div>
   <div class="dots">${DOCS.map((d,i)=>`<i class="${i===carIdx?'on':''}"></i>`).join('')}</div><div class="cstat" id="cstat"></div><div class="acts" id="acts"></div>`;
  const car=$('#car');
  car.querySelectorAll('.ccard').forEach((c,i)=>c.onclick=()=>{if(i!==carIdx){car.scrollTo({left:i*(c.offsetWidth+12),behavior:'smooth'});return}openDoc(c.dataset.id)});
  let t;car.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const w=car.querySelector('.ccard').offsetWidth+12;const i=Math.max(0,Math.min(DOCS.length-1,Math.round(car.scrollLeft/w)));if(i!==carIdx){carIdx=i;renderActs()}},60)});
  renderActs();
 }
 if(VARIANT==='pion'){
  ALT.innerHTML=`<div class="vwrap"><div class="vcar" id="vcar">${DOCS.map(d=>`<button class="vcard dface" style="background-image:url(${imgUrl(d)})" aria-label="${d.name}" data-id="${d.id}">${faceHTML(d)}</button>`).join('')}</div>
   <div class="dots vdots">${DOCS.map((d,i)=>`<i class="${i===carIdx?'on':''}"></i>`).join('')}</div></div><div class="cstat" id="cstat"></div><div class="acts" id="acts"></div>`;
  const vc=$('#vcar');
  vc.querySelectorAll('.vcard').forEach((c,i)=>c.onclick=()=>{if(i!==carIdx){vc.scrollTo({top:i*(c.offsetHeight+12),behavior:'smooth'});return}openDoc(c.dataset.id)});
  let raf=0;vc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;vDepth()})},{passive:true});
  renderActs();
 }
 if(VARIANT==='lista'){
  ALT.innerHTML=DOCS.map(d=>`<button class="strip" style="background-image:url(${stripUrl(d)})" data-id="${d.id}">
   <span class="lead">${d.photo?`<span class="avatar">${PHOTO}</span>`:d.plate?plateH(d.plate):''}</span>
   <span class="st"><b>${d.name}</b><small>${d.id==='dowod'?PRIV(OS.imie+' '+OS.nazwisko,OS.imie):(d.who||OS.imie+' '+OS.nazwisko)}</small><em>${d.id==='dowod'?PRIV(d.line,'Dane ukryte'):d.line}</em></span>
   ${d.alert?`<span class="pill">${d.alert}</span>`:`<span class="chev">${svg('chev')}</span>`}</button>`).join('');
  ALT.querySelectorAll('.strip').forEach(b=>b.onclick=()=>openDoc(b.dataset.id));
 }
 if(VARIANT==='siatka'){
  ALT.innerHTML=`<div class="grid">${DOCS.map(d=>`<button class="gitem" data-id="${d.id}"><span class="gmini dface" style="background-image:url(${imgUrl(d)})">${faceHTML(d)}</span><span class="gcap"><b>${d.name}</b>${statusH(d)}</span></button>`).join('')}</div>`;
  ALT.querySelectorAll('.gitem').forEach(b=>b.onclick=()=>openDoc(b.dataset.id));
 }
}'''

# Replace buildAlt
start_idx = code.find('function buildAlt(){')
end_idx = code.find('function renderActs(){')
assert start_idx != -1 and end_idx != -1, "buildAlt not found"
code = code[:start_idx] + new_buildAlt + '\n' + code[end_idx:]

# 2. Update layoutAlt
new_layoutAlt = '''/* zwraca wysokość zajętą przez wariant */
function layoutAlt(top,h,W){
 ALT.style.top=top+'px';
 const narrow=W<360,padSide=narrow?20:32;
 const n=DOCS.length;

 if(VARIANT==='karuzela'){
  const cardW=Math.min(380,W-(narrow?20:32));
  const showActs=h>=260;
  const actH=showActs?56:0;
  const dotH=10,statH=20,gaps=8+8+(showActs?8:0);
  const maxH=Math.max(115,h-actH-dotH-statH-gaps);
  const cardH=Math.min(Math.round(cardW/1.55),maxH);
  const pad=(W-cardW)/2;
  const compact=h<330;
  ALT.classList.toggle('compact',compact);
  const car=$('#car');
  if(car){
   car.style.paddingInline=pad+'px';
   car.style.scrollPaddingInline=pad+'px';
   car.style.height=cardH+'px';
   car.querySelectorAll('.ccard').forEach(c=>{
    c.style.width=cardW+'px';
    c.style.height=cardH+'px';
    c.classList.toggle('short-card',cardH<cardW/1.55*0.86);
   });
   car.scrollLeft=carIdx*(cardW+12);
  }
  const a=$('#acts');
  if(a){
   a.style.display=showActs?'flex':'none';
   if(showActs){
    a.style.minHeight=compact?'44px':'54px';
    a.style.marginTop='6px';
   }
  }
  const dots=$('.alt .dots');if(dots)dots.style.marginTop='6px';
  const cs=$('#cstat');if(cs)cs.style.marginTop='4px';
  const used=Math.min(h,cardH+dotH+statH+(showActs?actH:0)+gaps);
  ALT.style.height=used+'px';
  return used;
 }

 if(VARIANT==='pion'){
  const cardW=Math.min(380,W-(narrow?24:36));
  const compact=h<340;
  ALT.classList.toggle('compact',compact);
  const showActs=h>=310;
  const actH=showActs?52:0;
  const statH=20,gaps=8+(showActs?8:0);
  const vh=Math.max(120,h-actH-statH-gaps);
  const cardH=Math.min(Math.round(cardW/1.55),Math.max(115,vh-(compact?24:38)));
  const vc=$('#vcar');
  if(vc){
   vc.style.height=vh+'px';
   const pad=Math.max(0,(vh-cardH)/2);
   vc.style.paddingBlock=pad+'px';
   vc.style.scrollPaddingBlock=pad+'px';
   vc.querySelectorAll('.vcard').forEach(c=>{
    c.style.width=cardW+'px';
    c.style.height=cardH+'px';
    c.classList.toggle('short-card',cardH<cardW/1.55*0.86);
   });
   vc.scrollTop=carIdx*(cardH+12);
   vDepth();
  }
  const a=$('#acts');
  if(a){
   a.style.display=showActs?'flex':'none';
   if(showActs){
    a.style.minHeight=compact?'44px':'50px';
    a.style.marginTop='6px';
   }
  }
  const cs=$('#cstat');if(cs)cs.style.marginTop='6px';
  const used=Math.min(h,vh+statH+(showActs?actH:0)+gaps);
  ALT.style.height=used+'px';
  return used;
 }

 if(VARIANT==='lista'){
  const rowW=W-padSide;
  const gap=6;
  let rowH=Math.floor((h-(n-1)*gap)/n);
  let scrollable=false;
  if(rowH<44){
   rowH=48;
   scrollable=true;
  }else if(rowH>68){
   rowH=68;
  }
  const s=Math.max(rowW/400,rowH/80);
  const av=Math.round(Math.min(46*s,rowH-8));
  const pl=Math.round(14*s+(46*s-av)/2);
  ALT.style.setProperty('--av',av+'px');
  ALT.classList.toggle('tight',rowH<60);
  ALT.classList.toggle('xtight',rowH<48);
  ALT.style.overflowY=scrollable?'auto':'visible';
  ALT.style.maxHeight=h+'px';
  ALT.querySelectorAll('.strip').forEach(b=>{
   b.style.height=rowH+'px';
   b.style.paddingLeft=pl+'px';
  });
  const used=Math.min(h,n*rowH+(n-1)*gap);
  ALT.style.height=used+'px';
  return used;
 }

 if(VARIANT==='siatka'){
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
 return 0;
}'''

start_layoutAlt = code.find('/* zwraca wysokość zajętą przez wariant */')
end_layoutAlt = code.find('/* menu rozwijane z góry: przełączanie wariantów i osoby */')
assert start_layoutAlt != -1 and end_layoutAlt != -1, "layoutAlt not found"
code = code[:start_layoutAlt] + new_layoutAlt + '\n\n' + code[end_layoutAlt:]

with open('mockup/variants.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print('Updated mockup/variants.js successfully!')
