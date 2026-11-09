/* tryb skryptowy (bez serwera): zastrzec = w bankach (SDZ), zablokować = zawieszenie e-dowodu na 14 dni, unieważnić = na stałe */
const OFF={zastrz:false,zab:false,uniew:false};
const dPlus=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString('pl-PL',{day:'2-digit',month:'2-digit',year:'numeric'})};
/* dane bieżącej osoby (osoby.js): scenariusze były pisane dla Marty i pokazywały jej dowód, PESEL, auto i urząd każdej osobie */
const SK=OS.skrypt||{},KTO=OS.imie+' '+OS.nazwisko,NR_DOW=OS.moje.nr_dowodu,PESEL_M=OS.moje.pesel.slice(0,6)+'•••'+OS.moje.pesel.slice(-2);
const DOC=id=>DOCS.find(d=>d.id===id),KAFEL=k=>OS.tiles.find(t=>t.k===k),MARTA=OS.id==='marta';
const AUTO_NR=(DOC('auto')||{}).plate||'',AUTO_TY=(OS.moje.pojazd||'')+(OS.moje.oc?', OC '+OS.moje.oc.split(',')[0]:'');
/* nazwisko dziecka w formie żeńskiej albo męskiej (Kowalska/Kowalski, Nowak/Nowak) */
const nazwiskoDziecka=fem=>{const n=OS.nazwisko;if(/(sk|ck|dzk)a$/.test(n))return fem?n:n.replace(/a$/,'i');if(/(sk|ck|dzk)i$/.test(n))return fem?n.replace(/i$/,'a'):n;return n};
const S={
 async portfel(){
  await say('Przykro mi. Najpierw zadbajmy, żeby nikt nie użył Twoich dokumentów. Co było w portfelu?');
  multi(['Dowód osobisty','Prawo jazdy','Karty płatnicze'].concat(DOC('kdr')?['Karta Dużej Rodziny']:[]),async sel=>{
   const dowod=sel.includes('Dowód osobisty'),pj=sel.includes('Prawo jazdy'),kdr=sel.includes('Karta Dużej Rodziny'),cards=sel.includes('Karty płatnicze');
   S.reszta={pj,kdr,cards};
   if(!dowod){await S.reszty();await S.koniec();return}
   await S.zastrzez();
  });
 },
 async zastrzez(){
  if(SK.e_dowod===0){   // dowód bez warstwy elektronicznej (sprzed 03.2019) można tylko zastrzec w bankach, nie zablokować
   await say('Twój dowód nie ma warstwy elektronicznej, więc nie da się go zablokować. Zastrzegę go w bankach, a jeśli portfel się znajdzie, cofniesz to tutaj.');
   await confirmCard({icon:'shield',title:'Zastrzeżenie dowodu',source:'System Dokumenty Zastrzeżone (ZBP)',rows:[['Dowód osobisty',NR_DOW],['Zastrzeżenie','w bankach']],note:'Banki i operatorzy od razu zobaczą, że dowód jest zastrzeżony. Jeśli go znajdziesz, cofniesz to tutaj.',label:'Zastrzeż',then:async()=>{
    OFF.zastrz=true;
    await result({title:'Dowód zastrzeżony',source:'godz. '+now(),rows:[['Zastrzeżenie','w bankach']]});
    await S.reszty();
    await say('Jeśli portfel się nie znajdzie, unieważnij dowód. Wtedy PESEL zastrzeże się sam.');
    chips([{label:'Unieważnij dowód na stałe',go:S.uniewaznij},{label:'Na razie wystarczy',go:S.koniec2}]);
   }});
   return;
  }
  await say('Zastrzegę dowód w bankach i zablokuję go na 14 dni. Jeśli portfel się znajdzie, odblokujesz go tutaj.');
  await confirmCard({icon:'shield',title:'Zastrzeżenie i blokada dowodu',source:'System Dokumenty Zastrzeżone (ZBP), Rejestr Dowodów Osobistych',rows:[['Dowód osobisty',NR_DOW],['Zastrzeżenie','w bankach'],['Blokada','do '+dPlus(14)]],note:'Banki i operatorzy od razu zobaczą, że dowód jest zastrzeżony. Zastrzeżenie i blokadę cofniesz tutaj. Jeśli w ciągu 14 dni nie odblokujesz dowodu, zostanie unieważniony.',label:'Zastrzeż i zablokuj',then:async()=>{
   OFF.zastrz=true;OFF.zab=true;
   await result({title:'Dowód zastrzeżony i zablokowany',source:'godz. '+now(),rows:[['Zastrzeżenie','w bankach'],['Blokada','do '+dPlus(14)]]});
   await S.reszty();
   await S.koniec();
  }});
 },
 async reszty(){
  const r=S.reszta||{};S.reszta=null;
  if(r.pj)await say('Prawa jazdy nie zastrzeżesz w aplikacji. Utratę zgłosisz razem z wnioskiem o wtórnik przez ePUAP albo w wydziale komunikacji, opłata 100 zł.');
  if(r.kdr)await say('Karta Dużej Rodziny w telefonie działa dalej. Duplikat karty plastikowej zamówisz w gminie za 16 zł.');
  if(r.cards)await S.cards();
 },
 async koniec(){
  if(OFF.uniew){
   await say('Co dalej?');
   chips([{label:'Wniosek o nowy dowód',go:()=>S.renew('utrata')},{label:'Na razie wystarczy',go:()=>say('Gotowe. Zaświadczenie o utracie znajdziesz w skrzynce e-Doręczeń.')}]);
   return;
  }
  if(!OFF.zab){await say('Gotowe.');return}
  await say('Blokada nie zastrzega PESEL. Chcesz zastrzec go osobno?');
  chips([{label:'Zastrzeż PESEL',go:()=>S.pesel(S.koniec2)},{label:'Unieważnij dowód na stałe',go:S.uniewaznij},{label:'Na razie wystarczy',go:S.koniec2}]);
 },
 async koniec2(){await say('Gotowe. Jeśli portfel się nie znajdzie, unieważnię dowód i złożysz wniosek o nowy. Jeśli się znajdzie, napisz „'+rodz('znalazłam','znalazłem')+' portfel”.')},
 async uniewaznij(){
  await say('Unieważnię dowód na stałe. Tego nie da się cofnąć, a PESEL zastrzeże się wtedy sam.');
  await confirmCard({icon:'shield',title:'Unieważnienie dowodu',source:'Rejestr Dowodów Osobistych',rows:[['Dowód osobisty',NR_DOW],['Unieważnienie','na stałe']],note:'Unieważnienia nie da się cofnąć, nawet gdy dokument się znajdzie. Twój PESEL zostanie zastrzeżony automatycznie. Zaświadczenie o utracie przyjdzie do skrzynki e-Doręczeń, ważne do 2 miesięcy, ale nie jest dokumentem tożsamości.',label:'Unieważnij',then:async()=>{
   OFF.uniew=true;OFF.zab=false;
   await result({title:'Dowód unieważniony',source:'Rejestr Dowodów Osobistych, godz. '+now(),rows:[['Dowód osobisty','unieważniony'],['PESEL','zastrzeżony z urzędu']]});
   await say('Jeśli ktoś go ukradł, zgłoś kradzież na policji.');
   await S.koniec();
  }});
 },
 async znaleziony(){
  if(OFF.uniew){await say('Ten dowód jest już unieważniony i nie da się go przywrócić. Oddaj go w dowolnym urzędzie gminy. Nowy wniosek złożysz tutaj.');chips([{label:'Wniosek o nowy dowód',go:()=>S.renew('utrata')}]);return}
  if(!OFF.zastrz&&!OFF.zab){await say('Świetnie. Dowód nie był zastrzeżony ani zablokowany, więc nic nie trzeba cofać.');return}
  await confirmCard({icon:'shield',title:'Odblokowanie dowodu',source:'System Dokumenty Zastrzeżone, Rejestr Dowodów Osobistych',rows:[['Dowód osobisty',NR_DOW]].concat(OFF.zastrz?[['Zastrzeżenie w bankach','cofnę']]:[]).concat(OFF.zab?[['Blokada','cofnę']]:[]),note:'Cofniesz tylko zastrzeżenie zrobione w aplikacji. Zastrzeżenie z banku cofniesz w banku.',label:'Odblokuj dowód',then:async()=>{
   OFF.zastrz=false;OFF.zab=false;
   await result({title:'Dowód odblokowany',source:'godz. '+now(),rows:[['Dowód osobisty','ważny, możesz go używać']]});
  }});
 },
 async cards(after){await say((after?'Zostały karty płatnicze. ':'')+'Kart nie zastrzegę za Ciebie, zrobi to bank. Najszybciej w aplikacji banku albo pod numerem <b>+48 828 828 828</b>, jeśli Twój bank jest w systemie Zastrzegam.pl. Zastrzeżonej karty nie da się odblokować, bank wyda nową.')},
 async pesel(next){
  if(OFF.uniew){await say('Twój PESEL jest już zastrzeżony z urzędu, bo dowód został unieważniony.');return}
  if(typeof MobStore!=='undefined'&&MobStore.isPeselBlocked()){await say('Twój PESEL jest już zastrzeżony. Czasowe odblokowanie zrobisz w usłudze Zastrzeż PESEL.');if(typeof next==='function')await next();return}
  await confirmCard({icon:'shield',title:'Zastrzeżenie numeru PESEL',source:'Rejestr Zastrzeżeń PESEL',rows:[['PESEL',PESEL_M],['Od','teraz'],['Do','do odwołania']],note:'Bank czy firma pożyczkowa muszą sprawdzić zastrzeżenie przed udzieleniem kredytu. Do lekarza, apteki czy urzędu pójdziesz jak dotąd. Czasowe odblokowanie zrobisz tutaj w kilka sekund.',label:'Zastrzeż PESEL',then:async()=>{if(typeof MobStore!=='undefined')MobStore.setPeselBlocked(true);await result({title:'PESEL zastrzeżony',source:'Rejestr Zastrzeżeń PESEL',rows:[['Status','zastrzeżony od '+now()],['Historia sprawdzeń','zobaczysz tutaj, kto i kiedy sprawdzał']]});if(typeof next==='function')await next()}});
 },
 async renew(powod){
  const pw=powod==='utrata'?'utrata dowodu':'kończy się ważność';
  await say('Wniosek wyślę stąd, ale w ciągu 30 dni musisz pójść do urzędu na odciski palców. Dowód odbierzesz tam osobiście.');
  await confirmCard({icon:'id',title:'Wniosek o dowód osobisty',source:'Rejestr PESEL, Rejestr Dowodów Osobistych',rows:[[rodz('Wnioskodawczyni','Wnioskodawca'),KTO],['Powód',pw],['Zdjęcie','z aparatu, urząd może poprosić o inne'],['Urząd',SK.urzad||'urząd gminy'],['Wizyta w urzędzie','do '+dPlus(30)+', odciski palców i podpis'],['Opłata','bezpłatnie']],label:'Podpisz i wyślij',then:async()=>{
   await result({title:'Wniosek złożony',source:'Twoje sprawy',rows:[['Numer wniosku','DO/2026/104 552'],['Teraz','idź do urzędu do '+dPlus(30).slice(0,5)+', odciski palców i podpis'],['Gotowy','do 30 dni od wizyty'],['Odbiór','osobiście w tym samym urzędzie']]});
   await say('Przypomnieć Ci o wizycie w urzędzie?');
   chips([{label:'Przypomnij o wizycie',go:()=>result({title:'Przypomnienie ustawione',rows:[['Kiedy',dPlus(23)+', 9:00']]})},{label:'Na razie nie'}]);
  }});
 },
 async stluczka(){
  await say('Najpierw najważniejsze: czy ktoś jest ranny?');
  chips([{label:'Tak',go:()=>info({icon:'alert',tone:'warn',title:'Zadzwoń pod 112',body:'Przy rannych nie spisujemy oświadczenia. Zadbaj o bezpieczeństwo, włącz światła awaryjne i ustaw trójkąt.'})},
   {label:'Nie, nikt nie jest ranny',go:S.stl2}]);
 },
 async stl2(){
  await say('Dobrze. mStłuczka zadziała, jeśli oboje macie mObywatela, oba auta mają polską rejestrację i zgadzacie się, kto zawinił. Pokażę Twój znak, a drugi kierowca zeskanuje go w swoim mObywatelu i przekaże Ci swoje dane.');
  await sleep(500);przyjmijFlow({cel:'mstluczka'}).then(async()=>{
   await say('Mam dane obu stron z CEPiK i rejestru PESEL.');
   await info({icon:'car',title:'Uczestnicy zdarzenia',source:'CEPiK, rejestr PESEL, lokalizacja z GPS',rows:[['Ty',AUTO_TY],['Drugi kierowca','Piotr Nowak, Skoda Octavia, WPI 22R31, OC PZU']]});
   await say('Kto spowodował zdarzenie?');
   chips([{label:'Drugi kierowca',go:()=>S.stl3('Piotr Nowak, WPI 22R31',true)},{label:'Ja',go:()=>S.stl3(KTO+(AUTO_NR?', '+AUTO_NR:''),false)},{label:'Nie jesteśmy zgodni',go:()=>say('Wtedy mStłuczka nie zadziała. Wezwij policję pod numer <b>112</b>. Dane obu pojazdów mam zapisane, przekażę je funkcjonariuszom.')}]);
  });
 },
 async stl3(sprawca,poszkodowana){
  await say('Co się stało? Wybierz albo opisz własnymi słowami.');
  const fin=async opis=>{await say('Dodaj zdjęcia uszkodzeń, dołączę je do oświadczenia.');
   chips([{label:'Dodaj 3 zdjęcia',say:'Dodano 3 zdjęcia',go:async()=>{
    await confirmCard({icon:'doc',title:'Oświadczenie o zdarzeniu drogowym',source:'mStłuczka, CEPiK, rejestr PESEL',rows:[['Data',today()+', '+now()],['Miejsce','parking, lokalizacja z GPS'],['Sprawca',sprawca],['Okoliczności',opis],['Zdjęcia','3'],['Potwierdzenie','obie strony w mObywatelu']],note:'Dostaniecie oboje PDF z pieczęcią elektroniczną ministra cyfryzacji.',label:'Potwierdź oświadczenie',then:async()=>{
     await result({title:'Oświadczenie potwierdzone',source:'Zapisane w mStłuczce',rows:[['Numer','mS/2026/88 410'],['PDF','u obu kierowców']]});
     if(!poszkodowana){await say('Szkodę zgłosi drugi kierowca do Twojego ubezpieczyciela. Oświadczenie już ma.');return}
     await say('Zgłosić szkodę do ubezpieczyciela sprawcy? Przekażę oświadczenie i zdjęcia.');
     chips([{label:'Zgłoś szkodę',go:()=>result({title:'Szkoda zgłoszona',source:'Przekazane do ubezpieczyciela',rows:[['Numer szkody','2026/11/553 017'],['Dalej','ubezpieczyciel potwierdzi i zacznie likwidację w 7 dni'],['Wypłata','zwykle do 30 dni']]})},{label:'Nie teraz'}]);
    }});
   }}]);
  };
  chips(['Cofał z miejsca parkingowego','Nie zachował odstępu','Wymusił pierwszeństwo'].map(o=>({label:o,go:()=>fin(o)})));
  pending=t=>fin(t);
 },
 async auto(){
  await say('Sprawdzę historię auta, OC i badania. Potrzebuję numeru rejestracyjnego, VIN i daty pierwszej rejestracji. Najprościej zrób zdjęcie dowodu rejestracyjnego.');
  chips([{label:'Zrób zdjęcie dowodu rejestracyjnego',say:'Zdjęcie dowodu rejestracyjnego',go:S.auto2},{label:'WE 4K221',go:S.autoNr}]);
  pending=()=>S.autoNr();
 },
 async autoNr(){
  await say('Do historii pojazdu potrzebuję jeszcze VIN i daty pierwszej rejestracji. Poproś sprzedającego o zdjęcie dowodu rejestracyjnego.');
  chips([{label:'Mam zdjęcie dowodu rejestracyjnego',say:'Zdjęcie dowodu rejestracyjnego',go:S.auto2}]);
 },
 async auto2(){
  await say('Odczytałem: <b>WE 4K221</b>, VIN WVWZZZAUZKW118204, pierwsza rejestracja 14.03.2019. Sprawdzam historię pojazdu i bazę UFG.');
  await info({icon:'car',title:'Volkswagen Golf 1.5 TSI, 2019',source:'Historia pojazdu (CEPiK), UFG',rows:[['Właściciele','3, ostatnia zmiana 08.2026'],['OC','ważne do 02.2027'],['Badanie techniczne','ważne do 05.2027'],['Szkoda istotna','1 (2022), zgłosił ubezpieczyciel'],['Kradzież, wyrejestrowanie','brak']],flag:'Przebieg się nie zgadza: w 2024 r. 112 300 km, w 2025 r. 87 400 km. Możliwe cofnięcie licznika.'});
  await say('Zapytaj sprzedającego o różnicę w przebiegu. Coś jeszcze?');
  chips([{label:'Ile zapłacę PCC?',go:()=>say('Podatek PCC to 2% wartości rynkowej auta. Przy wartości 62 000 zł wyjdzie <b>1 240 zł</b>, płatne w 14 dni od umowy. Nie płacisz go, gdy kupujesz od firmy na fakturę. PCC-3 złożę tutaj, w e-Urzędzie Skarbowym.')},
   {label:'Przygotuj umowę kupna-sprzedaży',go:async()=>{await say('Przygotuję umowę. Podpiszecie ją oboje w mObywatelu, podpisem zaufanym albo osobistym. Potem złożysz tutaj PCC-3, a auto zarejestrujesz w wydziale komunikacji w ciągu 30 dni. Tablice i dowód rejestracyjny odbierzesz w urzędzie.');
    await confirmCard({icon:'doc',title:'Umowa kupna-sprzedaży pojazdu',source:'CEPiK, rejestr PESEL',rows:[['Pojazd','VW Golf, WE 4K221'],['Sprzedający','Marek Zieliński'],[rodz('Kupująca','Kupujący'),KTO],['Cena','62 000 zł'],['Podpis','podpis zaufany lub osobisty, Twój i sprzedającego']],label:'Wyślij do podpisu',then:()=>result({title:'Umowa wysłana do sprzedającego',source:'Czeka na podpis sprzedającego',rows:[['Dalej','PCC-3 w 14 dni, tutaj'],['Rejestracja','w wydziale komunikacji w 30 dni']]})})}}]);
 },
 async dziecko(){
  if(OS.plec==='M'&&!SK.drugi_rodzic){await say('Gratulacje! Ojciec, który nie jest mężem mamy dziecka, zgłosi urodzenie online dopiero po uznaniu ojcostwa w USC. Zgłoszenie może też wysłać mama w swoim mObywatelu.');return}
  await say('Gratulacje! Na zgłoszenie urodzenia masz 21 dni od wystawienia karty urodzenia. Zrobimy to teraz. Jak dziecko będzie miało na imię?');
  chips([{label:'Helena',go:()=>S.dz2('Helena')},{label:'Ignacy',go:()=>S.dz2('Ignacy')},{label:rodz('Wpiszę sama','Wpiszę sam'),go:async()=>{await say('Napisz imię poniżej. Najwyżej dwa imiona, w pełnej formie, nie zdrobnienie.');pending=t=>S.dz2(t.trim());input.focus()}}]);
  pending=t=>S.dz2(t.trim());
 },
 async dz2(name){
  const nm=name.charAt(0).toUpperCase()+name.slice(1),fem=/a$/i.test(nm);
  await say('Sprawdź dane. Szpital przekazuje kartę urodzenia prosto do USC.');
  await confirmCard({icon:'baby',title:'Zgłoszenie urodzenia dziecka',source:'Rejestr PESEL, USC',rows:[['Dziecko',nm+' '+nazwiskoDziecka(fem)],['Data urodzenia','16.10.2026'],['Miejsce',SK.szpital||'szpital'],['Drugi rodzic',SK.drugi_rodzic||'brak'],['Zameldowanie',OS.moje.adres],['Odpis aktu','elektronicznie, do skrzynki'],['Termin','21 dni od wystawienia karty urodzenia'],['Opłata','bezpłatnie']],label:'Podpisz i wyślij',then:async()=>{
   await result({title:'Zgłoszenie wysłane do USC',source:'Twoje sprawy',rows:[['Status','zgłoszenie wysłane do USC'],['PESEL i akt','zwykle następnego dnia roboczego'],['Odpis skrócony aktu','bezpłatnie, do Twojej skrzynki'],['Ubezpieczenie zdrowotne',DOC('firma')?'zgłosisz w eZUS (ZUS ZCNA) w ciągu 7 dni':'zgłosi pracodawca (ZUS ZCNA), przekaż mu PESEL dziecka w ciągu 7 dni']]});
   await say('Mogę też złożyć wniosek o 800+ i o Kartę Dużej Rodziny dla '+(fem?'córki':'syna')+'.');
   chips([{label:'Złóż wniosek o 800+',go:()=>confirmCard({icon:'coin',title:'Wniosek o świadczenie 800+',source:'ZUS, rejestr PESEL',rows:[['Dziecko',nm],['Kwota','800 zł miesięcznie'],['Od kiedy','od dnia urodzenia, jeśli wyślesz w ciągu 3 miesięcy'],['Okres','do 31.05.2027, potem nowy wniosek od 1 lutego'],['Konto do wypłaty',SK.konto||'']],label:'Wyślij do ZUS',then:()=>result({title:'Wniosek wysłany do ZUS',rows:[['Odpowiedź','na Twoje konto w eZUS, zwykle w ciągu miesiąca'],['Wypłata','z wyrównaniem od dnia urodzenia']]})})},
    {label:'Karta Dużej Rodziny',go:()=>confirmCard({icon:'doc',title:'Wniosek o Kartę Dużej Rodziny',source:'Emp@tia, '+(SK.gmina||'urząd gminy'),rows:[['Dla',nm],['Rodzaj','karta w mObywatelu'],['Karty dzieci w Twoim mObywatelu','tak'],['Opłata','bezpłatnie']],label:'Podpisz i wyślij',then:()=>result({title:'Wniosek wysłany do gminy',source:'Emp@tia',rows:[['Karta dziecka','w portfelu po przyznaniu przez gminę'],['Karta plastikowa','odbiór w urzędzie, dostaniesz SMS']]})})}]);
  }});
 },
 async todo(){
  await say('Oto, co czeka na Ciebie:');
  // sprawy z kafelków tej osoby (wcześniej trzy sprawy Marty u każdego)
  const c=await card(`<div class="ui list">${hd('bell','Do załatwienia')}
   ${OS.tiles.map((t,i)=>`<button class="it" data-i="${i}"><span class="pip"></span><span class="x"><b>${t.h}</b><small>${t.d}</small></span><span class="go">${t.k==='pay'?'Zapłać':t.k==='letter'?'Otwórz':'Sprawdź'}</span></button>`).join('')}${srcH('Skrzynka, ePłatności, CEPiK')}</div>`);
  c.querySelectorAll('.it').forEach(b=>b.onclick=()=>act(()=>{const t=OS.tiles[+b.dataset.i];addUser(t.h);(S[t.k]&&t.k!=='todo'?S[t.k]:S.kafel)(t)}));
 },
 async letter(t){
  if(!MARTA||(t&&t!==KAFEL('letter')))return S.kafel(t||KAFEL('letter'));
  await info({icon:'mail',title:'Wezwanie do złożenia wyjaśnień',source:'e-Doręczenia, Urząd Skarbowy Warszawa-Mokotów, odebrane 17.10',body:'Urząd prosi o udokumentowanie ulgi termomodernizacyjnej z zeznania PIT-37 za 2025 r. za dom jednorodzinny przy ul. Kwiatowej 12. Wymagane są faktury za materiały i usługi. Termin: <b>7 dni</b> od odebrania. 24.10 to sobota, więc masz czas do poniedziałku 26.10.'});
  await say('W Twoich plikach są 3 faktury za docieplenie z 2025 r. Przygotować odpowiedź z załącznikami?');
  chips([{label:'Przygotuj odpowiedź',go:async()=>{
   await info({icon:'doc',title:'Szkic odpowiedzi',body:'W odpowiedzi na wezwanie z dnia 16.10.2026 przekazuję faktury dokumentujące wydatki na termomodernizację domu jednorodzinnego przy ul. Kwiatowej 12, objęte ulgą w zeznaniu PIT-37 za 2025 r.<br><br>Załączniki: FV 2025/03/118, FV 2025/04/022, FV 2025/05/301.'});
   await confirmCard({icon:'mail',title:'Wysyłka przez e-Doręczenia',source:'Do: US Warszawa-Mokotów',rows:[['Załączniki','3 faktury (PDF)'],['Podpis','podpis zaufany']],label:'Podpisz i wyślij',then:()=>result({title:'Pismo doręczone',source:'e-Doręczenia, dowód otrzymania',rows:[['Dowód otrzymania','godz. '+now()],['Sprawa','w Twoich sprawach']]})});
  }},{label:'Później'}]);
 },
 async oc(t){
  if(!MARTA||(t&&t!==KAFEL('oc')))return S.kafel(t||KAFEL('oc'));
  await info({icon:'car',title:'OC: Toyota Corolla, WX 4521K',source:'UFG, CEPiK',rows:[['Ubezpieczyciel','Warta'],['Koniec okresu','29.10.2026']],note:'Umowa OC zwykle przedłuża się sama na kolejny rok, jeśli jej nie wypowiesz. Sprawdź to u ubezpieczyciela.'});
  await say('Przypomnieć Ci kilka dni przed terminem?');
  chips([{label:'Przypomnij 25.10',go:()=>result({title:'Przypomnienie ustawione',rows:[['Kiedy','25.10.2026, 9:00']]})},{label:'Nie trzeba'}]);
 },
 async pay(t){
  if(!MARTA||(t&&t!==KAFEL('pay')))return S.kafel(t||KAFEL('pay'));
  const afterPayment=()=>{if(typeof MobStore!=='undefined')MobStore.setTaxPaid(true);return result({title:'Zapłacono',source:'ePłatności',rows:[['Kwota','210,00 zł'],['Potwierdzenie','EP/2026/7 214 088'],['Prowizja','brak']]})};
  await confirmCard({icon:'coin',title:'Podatek od nieruchomości',source:'ePłatności, Urząd m.st. Warszawy',rows:[['Rata','IV, 2026'],['Kwota','210,00 zł'],['Termin','16.11.2026'],['Płatność','Apple Pay']],label:'Zapłać 210 zł',then:afterPayment});
 },
 async sms(){
  await say('Wklej treść albo zrzut ekranu wiadomości.');
  chips([{label:'Wklej z SMS-a',say:'„Poczta: paczka zatrzymana z powodu braku opłaty 1,20 zł. Opłać: poczta-dostawa24.top/pl”',go:S.sms2}]);
  pending=()=>S.sms2();
 },
 async sms2(){
  await info({icon:'alert',tone:'warn',title:'To oszustwo (phishing)',source:'Lista Ostrzeżeń CERT Polska',rows:[['Domena','poczta-dostawa24.top'],['Zarejestrowana','3 dni temu'],['Na Liście Ostrzeżeń','tak, od wczoraj'],['Wzorzec','fałszywa dopłata do przesyłki']]});
  await say('Nie otwieraj linku. Czy '+rodz('podałaś','podałeś')+' na tej stronie dane karty albo logowania do banku?');
  chips([{label:rodz('Nie, tylko przeczytałam','Nie, tylko przeczytałem'),go:S.cert},{label:rodz('Tak, podałam dane karty','Tak, podałem dane karty'),go:async()=>{await S.cards();await S.cert()}}]);
 },
 async cert(){
  await confirmCard({icon:'shield',title:'Zgłoszenie do CERT Polska',source:'Bezpiecznie w sieci',rows:[['Kategoria','Złośliwa strona internetowa'],['Adres','poczta-dostawa24.top'],['Skąd','link z SMS-a']],label:'Wyślij zgłoszenie',then:async()=>{await result({title:'Zgłoszenie wysłane',source:'Bezpiecznie w sieci',rows:[['Status','przekazane do CERT Polska'],['SMS','prześlij go jeszcze na bezpłatny numer 8080']]});await say('Zgłosiłem stronę do CERT Polska. Prześlij jeszcze tego SMS-a na bezpłatny numer <b>8080</b>, wtedy operatorzy szybciej zablokują nadawcę.')}});
 },
 async punkty(){
  if(MARTA){await info({icon:'clock',title:'Punkty karne: 5',source:'CEPiK',rows:[['Wykroczenie','prędkość +21–25 km/h, 12.05.2026'],['Wygasają','12.05.2027'],['Limit','24 pkt']],note:'Punkty wygasają po roku od opłacenia mandatu.'});return}
  const pj=DOC('pj');
  if(!pj){await say('Nie masz prawa jazdy w portfelu, więc nie ma tu punktów karnych.');return}
  const n=+((pj.f.find(x=>/Punkt/.test(x[0]))||[])[1]||0);
  const rows=(n?[]:[['Wykroczenia','brak']]).concat([['Punkty karne',String(n)],['Limit',((pj.rows.find(r=>/Limit/.test(r[0]))||[])[1])||'24 pkt']],pj.rows.filter(r=>/Okres próbny/.test(r[0])));
  await info({icon:'clock',title:'Punkty karne: '+n,source:'CEPiK',rows,note:'Punkty wygasają po roku od opłacenia mandatu.'});
 },
 async docShow(id){
  const d=DOCS.find(x=>x.id===id)||DOCS[0];
  const c=await card(`<div class="ui"><div style="padding:12px 12px 0"><div class="bigcard" style="background-image:url(${d.img});box-shadow:none">${faceHTML(d)}</div></div><div class="rows" style="padding-top:6px">${rowsH(d.rows)}</div><div class="actions"><button class="btn primary">Potwierdź swoje dane</button></div></div>`);
  c.querySelector('.btn').onclick=()=>qrFlow({doc:id});
 },
 async dowodWaz(){
  // data ważności dowodu tej osoby (wcześniej 20.05.2031 u wszystkich, także u Ewy, której dowód traci ważność 05.12.2026)
  const m=(OS.moje.dowod||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if(!m){await say('Nie widzę daty ważności Twojego dowodu.');return}
  const dni=Math.round((new Date(+m[3],+m[2]-1,+m[1])-new Date())/864e5);
  if(dni<120){await say('Twój dowód traci ważność <b>'+m[0]+'</b>. Złóż wniosek o nowy już teraz: wyślesz go stąd, a w ciągu 30 dni pójdziesz do urzędu na odciski palców.');chips([{label:'Złóż wniosek o nowy dowód',go:()=>S.renew('uplyw')},{label:'Później'}]);return}
  const MIES=['styczniu','lutym','marcu','kwietniu','maju','czerwcu','lipcu','sierpniu','wrześniu','październiku','listopadzie','grudniu'];
  const p=new Date(+m[3],+m[2]-3,+m[1]),pd=String(p.getDate()).padStart(2,'0')+'.'+String(p.getMonth()+1).padStart(2,'0')+'.'+p.getFullYear();
  await say('Twój dowód jest ważny do <b>'+m[0]+'</b>. '+(SK.e_dowod===0?'To dowód bez warstwy elektronicznej.':'To e-dowód z warstwą elektroniczną.')+' Na nowy wniosek masz jeszcze czas, przypomnę Ci o nim wcześniej.');
  chips([{label:'Przypomnij w '+MIES[p.getMonth()]+' '+p.getFullYear(),go:()=>result({title:'Przypomnienie ustawione',rows:[['Kiedy',pd+', 9:00']]})},{label:'Nie trzeba'}]);
 },
 async kdr(){if(!DOC('kdr')){await say('Nie masz Karty Dużej Rodziny. Przysługuje rodzicom co najmniej trojga dzieci, wniosek złożysz na empatia.gov.pl albo w urzędzie gminy.');return}await say('Z Kartą Dużej Rodziny masz ulgę 37% na pociągi (49% na bilet miesięczny), bezpłatny wstęp do parków narodowych i zniżki u partnerów. Pokazać partnerów w Twojej okolicy?');chips([{label:'Pokaż w okolicy',go:()=>info({icon:'doc',title:'Partnerzy KDR w pobliżu',source:'Wyszukiwarka partnerów KDR (empatia.gov.pl)',rows:[['Muzeum w okolicy','zniżka na bilet rodzinny'],['Basen miejski','zniżka na wejście'],['Orlen','8 gr/l, paliwa premium 10 gr/l']]})}])},
 async ikp(){
  await info({
   icon: 'doc',
   title: 'Internetowe Konto Pacjenta (IKP)',
   source: 'Ministerstwo Zdrowia / NFZ',
   rows: (DOC('ikp') || {}).rows || []   // dane z karty IKP tej osoby (wcześniej recepty i DiLO Marty u wszystkich)
  });
  await say('Możesz od razu otworzyć e-Recepty z kodem PIN i kodem kreskowym do apteki lub umówić wizytę przez e-Rejestrację NFZ.');
  chips([
   { label: 'Otwórz e-Recepty (PIN)', go: () => { if (typeof openIkpModal === 'function') openIkpModal('recepty'); } },
   { label: 'e-Rejestracja NFZ', go: () => { if (typeof openERejestracjaModal === 'function') openERejestracjaModal(); } },
   ...(maDilo() ? [{ label: 'Karta DiLO (Onkologia)', go: () => { if (typeof openDiloModal === 'function') openDiloModal(); } }] : []),
   { label: 'Zaświadczenie NFZ (PDF)', go: () => { if (typeof openOfficialCertificate === 'function') openOfficialCertificate('nfz'); } }
  ]);
 },
 async erejestracja(){
  await say('W centralnym systemie e-Rejestracji NFZ masz dostępne bezpłatne terminy do lekarza POZ oraz poradni specjalistycznych.');
  if (typeof openERejestracjaModal === 'function') openERejestracjaModal();
 },
 async dilo(){
  if(!maDilo()){await say('Nie masz aktywnej Karty DiLO. Wystawia ją lekarz, gdy podejrzewa nowotwór, a zobaczysz ją wtedy w IKP.');return}
  await info({
   icon: 'shield',
   title: 'Karta DiLO – Szybka Terapia Onkologiczna',
   source: 'Krajowa Sieć Onkologiczna / NFZ',
   rows: [
    ['Numer Karty', 'DILO/NFZ/2026/84102'],
    ['Koordynator', 'mgr Anna Wójcik (tel. +48 22 546 20 00)'],
    ['Etap leczenia', 'Etap 3: Diagnostyka pogłębiona (Konsylium: 12.11.2026)'],
    ['Placówka', 'Narodowy Instytut Onkologii w Warszawie']
   ]
  });
  chips([
   { label: 'Szczegóły Karty DiLO', go: () => { if (typeof openDiloModal === 'function') openDiloModal(); } },
   { label: 'Pobierz odpis DiLO (PDF)', go: () => { if (typeof openOfficialCertificate === 'function') openOfficialCertificate('dilo'); } }
  ]);
 },
 async firma(){
  if(!DOC('firma'))return S.bezFirmy();
  await info({
   icon: 'shield',
   title: 'Moja Firma – Wiśniewski Instalacje',
   source: 'CEIDG / Ministerstwo Rozwoju i Technologii',
   rows: [
    ['Przedsiębiorca', `${OS.imie} ${OS.nazwisko}`],
    ['Numer NIP', '679 234 56 79 (REGON 381920145)'],
    ['Przeważające PKD', '43.22.Z – Instalacje wod.-kan. i gazowe'],
    ['Status w CEIDG', 'Aktywny przedsiębiorca'],
    ['Biała Lista VAT', 'Czynny podatnik VAT (Konto rozliczeniowe zweryfikowane)']
   ]
  });
  await say('Możesz wygenerować cyfrowe poświadczenie reprezentacji z kodem QR, podpisać dokument firmowy certyfikatem z e-dowodu lub pobrać oficjalny odpis z CEIDG.');
  chips([
   { label: 'Poświadcz za firmę (QR)', go: () => { if (typeof openFirmaPoswiadczModal === 'function') openFirmaPoswiadczModal(); } },
   { label: 'Podpisz e-dowodem', go: () => { if (typeof openFirmaPodpisModal === 'function') openFirmaPodpisModal(); } },
   { label: 'Zaświadczenie CEIDG PDF', go: () => { if (typeof openOfficialCertificate === 'function') openOfficialCertificate('ceidg'); } }
  ]);
 },
 async poswiadczFirme(){
  if(!DOC('firma'))return S.bezFirmy();
  if (typeof openFirmaPoswiadczModal === 'function') openFirmaPoswiadczModal();
 },
 async podpiszFirme(){
  if(!DOC('firma'))return S.bezFirmy();
  if (typeof openFirmaPodpisModal === 'function') openFirmaPodpisModal();
 },
 async bezFirmy(){await say('Nie prowadzisz działalności gospodarczej, więc nie ma tu danych z CEIDG. Firmę założysz wnioskiem CEIDG-1 na biznes.gov.pl.')},
 /* sprawa z kafelka „Do załatwienia”, dla której nie ma osobnego scenariusza (dane z osoby.js) */
 async kafel(t){
  if(!t)return S.fallback();
  await info({icon:t.i||'doc',title:t.h,source:'Do załatwienia, mObywatel',body:'<b>'+t.d+'</b>'+(t.s?'<br>'+t.s+'.':'')});
  const kwota=((t.d||'').match(/^[\d\s ,]+zł/)||[''])[0];
  const blik=t.k==='pay'&&/BLIK/.test(t.s||'')&&kwota;
  if(t.k==='pay'&&!blik){
   const jak=/ZUS|[Ss]kładk/.test(t.h+t.s)?'składki opłacisz w mZUS dla Płatnika albo przelewem na swój rachunek składkowy':/[Mm]andat/.test(t.h)?'mandat opłacisz przelewem według instrukcji z mandatu':'zapłacisz przelewem na rachunek z decyzji, ta gmina nie jest w ePłatnościach';
   await say('Tego nie zapłacisz w aplikacji: '+jak+'. Przypomnieć Ci o terminie?');
  }else await say(blik?'Zapłacić teraz BLIK-iem?':'Przypomnieć Ci o tym?');
  const opcje=[];
  if(blik)opcje.push({label:'Zapłać '+kwota,go:()=>confirmCard({icon:'coin',title:t.h,source:'ePłatności',rows:[['Kwota',kwota],['Termin',(t.d.match(/do (.+)$/)||['',''])[1]],['Płatność','BLIK']],label:'Zapłać '+kwota,then:()=>{if(typeof MobStore!=='undefined')MobStore.setTaxPaid(true);return result({title:'Zapłacono',source:'ePłatności',rows:[['Kwota',kwota],['Prowizja','brak']]})}})});
  opcje.push({label:'Przypomnij mi',go:()=>result({title:'Przypomnienie ustawione',rows:[['O czym',t.h],['Kiedy',dPlus(3)+', 9:00']]})},{label:'Nie trzeba'});
  chips(opcje);
 },
 async fallback(){await say('Tego w tej wersji jeszcze nie załatwię. Najbliżej pasuje:');chips([{label:'Co mam do załatwienia?',go:S.todo},{label:rodz('Zgubiłam portfel','Zgubiłem portfel'),go:S.portfel},{label:'Kupuję używane auto',go:S.auto}])}
};

function maDilo(){return /DiLO/.test(JSON.stringify(((DOC('ikp')||{}).rows)||[]))}
const norm=t=>t.toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function route(t){
 if(pending){const p=pending;pending=null;return p(t)}
 const n=norm(t);
 if(/pokaz.*(ikp|pacjent|zdrow|recept)/.test(n))return S.docShow('ikp');
 if(/pokaz.*(firm|dzialaln|ceidg)/.test(n))return S.docShow('firma');
 if(/pokaz.*(dowod|mdowod)/.test(n))return S.docShow('dowod');
 if(/pokaz.*(prawo|prawk)/.test(n))return S.docShow('pj');
 if(/pokaz.*(auto|pojazd|samoch)/.test(n))return S.docShow('auto');
 if(/pokaz.*(kdr|duzej rodziny)/.test(n))return S.docShow('kdr');
 if(/recept|skierowani|lekarz|ikp|pacjent|medycyn|ewus/.test(n))return S.ikp();
 if(/rejestracj|umow.*(lekarz|wizyt)|zapisz.*(lekarz|wizyt)/.test(n))return S.erejestracja();
 if(/dilo|onkolog|nowotwor|rak\b/.test(n))return S.dilo();
 if(/poswiadcz.*firm|reprezentacj.*firm|token.*ceidg/.test(n))return S.poswiadczFirme();
 if(/podpis.*(firm|e-dowod|dowod.*osob)/.test(n))return S.podpiszFirme();
 if(/firma|ceidg|nip|biala lista|dzialalnosc/.test(n))return S.firma();
 if(/dowod.*(waz|traci)|waznosc dowodu/.test(n))return S.dowodWaz();
 if(/zastrz.*pesel/.test(n))return S.pesel();
 if(/znalaz|odblok\w* dowod/.test(n))return S.znaleziony();
 if(/portfel|zgubil|ukradl|ukradzi|zastrz/.test(n))return S.portfel();
 if(/stluczk|kolizj|wypadek|stluk|uderzyl|obtar/.test(n))return S.stluczka();
 if(/kupuj|uzywan|historia pojazdu|sprawdz (auto|samoch)|kupic auto/.test(n))return S.auto();
 if(/urodzil|urodzi|noworod|urodzenie/.test(n))return S.dziecko();
 if(/sms|phishing|oszust|dziwn|podejrzan/.test(n))return S.sms();
 if(/punkt/.test(n))return S.punkty();
 if(/skrzynk|pismo|list z urzedu|e-doreczen/.test(n))return S.letter();
 if(/\boc\b|ubezpiecz/.test(n))return S.oc();
 if(/podatek|zaplac|oplac|oplat/.test(n))return S.pay();
 if(/duzej rodziny|\bkdr\b/.test(n))return S.kdr();
 if(/do zalatwienia|co mam|zaleg|przypomn|sprawy|powiadom/.test(n))return S.todo();
 return S.fallback();
}

$('#histBtn').onclick=()=>app.classList.contains('hist')?closeHist():openHist();
$('#newBtn').onclick=()=>{closeHist();newConv();input.focus()};
$('#hmenu .scrim').onclick=closeHist;
$('#hnew').onclick=()=>{closeHist();newConv();input.focus()};
$('#homeBtn').onclick=()=>{
 // na ekranie głównym orzełek prowadzi na stronę startową (z prefiksem języka, np. /de/)
 if(!app.classList.contains('chatting')&&!$('#detail').classList.contains('on')){const m=location.pathname.match(/^\/([a-z]{2})\//);location.href=m?'/'+m[1]+'/':'/';return}
 if(typeof closeDoc==='function')closeDoc();else $('#detail').classList.remove('on');
 exitChat();$('#tiles').scrollTo({left:0,behavior:'smooth'})};
$('#mailBtn').onclick=()=>{closeHist();startTopic('Co mam w skrzynce?')};
$('#bellBtn').onclick=()=>{closeHist();startTopic('Co mam do załatwienia?')};
input.addEventListener('focus',enterChat);
$('#composer').onsubmit=e=>{e.preventDefault();const t=input.value.trim();input.value='';send(t)};
$('#mic').onclick=async()=>{enterChat();const bar=$('.bar');bar.classList.add('listening');input.placeholder='Słucham…';await sleep(1600);bar.classList.remove('listening');input.placeholder='Co chcesz załatwić?';send('Miałam stłuczkę na parkingu')};
$('#cam').onclick=()=>{enterChat();act(()=>{addUser('Zdjęcie dowodu rejestracyjnego');S.auto2()})};
layout();
document.fonts&&document.fonts.ready.then(layout);
