const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function captureThemes() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9305',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9305/json', r => {
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

  // 1. Light standard
  await send('Runtime.evaluate', { expression: "if (typeof zmienOsobe === 'function') zmienOsobe('jan');" });
  await new Promise(r => setTimeout(r, 800));

  // 2. Dark mode
  await send('Runtime.evaluate', {
    expression: `
      if (typeof A11Y !== 'undefined') {
        A11Y.highContrast = false;
        A11Y.darkMode = true;
        A11Y.apply();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-main.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-dark-main.png');

  // Open Aa panel in dark mode
  await send('Runtime.evaluate', { expression: "document.getElementById('a11yBtn').click();" });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-a11ypanel.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-dark-a11ypanel.png');

  // Close Aa panel and open Services tab in dark mode
  await send('Runtime.evaluate', { expression: "closeA11yPanel(); switchNavTab('services');" });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-services.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-dark-services.png');

  // 3. High contrast mode
  await send('Runtime.evaluate', {
    expression: `
      switchNavTab('docs');
      if (typeof A11Y !== 'undefined') {
        A11Y.darkMode = false;
        A11Y.highContrast = true;
        A11Y.apply();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-hc-main.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-hc-main.png');

  // Open Services tab in high contrast
  await send('Runtime.evaluate', { expression: "switchNavTab('services');" });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-hc-services.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved test-hc-services.png');

  ws.close();
  chrome.kill();
}

captureThemes().catch(console.error);
