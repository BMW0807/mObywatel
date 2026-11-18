const http = require('http');
const { spawn } = require('child_process');

async function testBgFix() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9313',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9313/json', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });

  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p={}) => new Promise(res => {
    const mid = id++;
    const h = (e) => { const msg = JSON.parse(e.data); if (msg.id === mid) { ws.removeEventListener('message', h); res(msg); }};
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 500));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      
      const item = KATALOG_DOKUMENTOW.find(x => x.id === 'emeryt');
      const doc = item.build(OS);
      
      // Test 1: current cardImgUrl
      el.style.backgroundImage = 'url(' + cardImgUrl(doc.img) + ')';
      const r1 = el.style.backgroundImage;
      
      // Test 2: quoted url
      el.style.backgroundImage = 'url(\"' + cardImgUrl(doc.img) + '\")';
      const r2 = el.style.backgroundImage;

      // Test 3: without adding ?v=40 if data:
      const cleanImg = doc.img;
      el.style.backgroundImage = 'url(\"' + cleanImg + '\")';
      const r3 = el.style.backgroundImage;

      // Test 4: unquoted cleanImg
      el.style.backgroundImage = 'url(' + cleanImg + ')';
      const r4 = el.style.backgroundImage;

      return {
        cardImgUrlResult: cardImgUrl(doc.img).substring(0, 60),
        r1_current: r1 ? r1.substring(0, 60) : 'EMPTY',
        r2_quoted_with_v: r2 ? r2.substring(0, 60) : 'EMPTY',
        r3_clean_quoted: r3 ? r3.substring(0, 60) : 'EMPTY',
        r4_clean_unquoted: r4 ? r4.substring(0, 60) : 'EMPTY'
      };
    })()`,
    returnByValue: true
  });

  console.log('Results:', res.result.result.value);

  ws.close();
  chrome.kill();
}

testBgFix().catch(console.error);
