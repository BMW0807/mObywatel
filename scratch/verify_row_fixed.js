const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function verifyRowFixed() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9324',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9324/json', r => {
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

  await send('Runtime.evaluate', {
    expression: `(() => {
      enterChat();
      A11Y.darkMode = true;
      A11Y.apply();
      info({
        icon: 'coin',
        title: 'Do zapłaty',
        source: 'ZUS, ePłatności',
        rows: [
          ['Składki społeczne ZUS za 10.2026 (działalność)', '1 926,76 zł do 20.11.2026, w mZUS dla Płatnika lub przelewem na Twój rachunek składkowy'],
          ['Podatek od nieruchomości, IV rata 2026', '186,00 zł do 16.11.2026'],
          ['Status', 'Opłacone w terminie'],
          ['PESEL', '83051203455']
        ]
      });
    })()`
  });

  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-row-fixed-final.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-row-fixed-final.png');

  // Also check computed styles and heights
  const infoData = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = [...document.querySelectorAll('.ui .row')];
      return rows.map(r => {
        const span = r.querySelector('span');
        const b = r.querySelector('b');
        return {
          rowClass: r.className,
          rowWidth: r.offsetWidth,
          rowHeight: r.offsetHeight,
          spanWidth: span ? span.offsetWidth : 0,
          bWidth: b ? b.offsetWidth : 0,
          bHeight: b ? b.offsetHeight : 0,
          bText: b ? b.textContent : ''
        };
      });
    })()`,
    returnByValue: true
  });
  console.log('Computed Row Metrics:');
  console.log(JSON.stringify(infoData.result.result.value, null, 2));

  ws.close();
  chrome.kill();
}

verifyRowFixed().catch(console.error);
