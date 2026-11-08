const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testRowStack() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9323',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9323/json', r => {
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
      const style = document.createElement('style');
      style.textContent = \`
        .ui .row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 3px 12px;
          padding: 9px 0;
          border-top: 1px solid var(--hair);
          font-size: 14px;
          line-height: 20px;
        }
        .ui .row span {
          color: var(--ink2);
          flex: 1 1 auto;
          min-width: 90px;
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .ui .row b {
          font-weight: 500;
          text-align: right;
          flex: 1 1 auto;
          min-width: 100px;
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .ui .row.row-stack {
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }
        .ui .row.row-stack b {
          text-align: left;
          width: 100%;
        }
      \`;
      document.head.appendChild(style);

      window.rowsH = function(rows) {
        return rows.map(([k, v]) => {
          const isStack = (k && k.length > 24) || (v && v.length > 32);
          return \`<div class="row\${isStack ? ' row-stack' : ''}"><span>\${k}</span><b>\${v}</b></div>\`;
        }).join('');
      };

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
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-row-stack-perfect.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-row-stack-perfect.png');

  ws.close();
  chrome.kill();
}

testRowStack().catch(console.error);
