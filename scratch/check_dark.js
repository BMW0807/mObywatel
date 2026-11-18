const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function debugDarkMode() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9309',
    '--user-data-dir=C:\\Users\\Bartosz\\Documents\\mobywatel\\scratch\\chrome_profile_tmp',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9309/json', r => {
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
  await new Promise(r => setTimeout(r, 1000));

  // Switch to Jan
  await send('Runtime.evaluate', { expression: "if (typeof zmienOsobe === 'function') zmienOsobe('jan');" });
  await new Promise(r => setTimeout(r, 500));

  // Toggle Dark Mode
  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      A11Y.darkMode = true;
      A11Y.apply();
      const app = document.getElementById('app');
      return {
        appClasses: app.className,
        appBg: window.getComputedStyle(app).backgroundColor,
        phoneVarBg: window.getComputedStyle(app).getPropertyValue('--bg'),
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        bodyVarBg: window.getComputedStyle(document.body).getPropertyValue('--bg'),
        remindersBg: window.getComputedStyle(document.getElementById('reminders')).backgroundColor,
        tileBg: document.querySelector('.tile') ? window.getComputedStyle(document.querySelector('.tile')).backgroundColor : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Styles in Dark Mode:', res.result.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/debug-dark-main.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved debug-dark-main.png');

  ws.close();
  chrome.kill();
}

debugDarkMode().catch(console.error);
