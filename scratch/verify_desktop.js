const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testDesktop() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9298/json', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const mid = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === mid) { ws.removeEventListener('message', handler); res(msg); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Runtime.evaluate', { expression: "if (typeof zmienOsobe === 'function') zmienOsobe('jan');" });
  await new Promise(r => setTimeout(r, 600));
  await send('Runtime.evaluate', { expression: "if (typeof openDoc === 'function') openDoc('firma');" });
  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/jan-firma-detail-fixed2.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved screenshot of firma detail');
  console.log('Saved screenshot to jan-desktop-fixed.png');
  ws.close();
  chrome.kill();
}
testDesktop().catch(console.error);
