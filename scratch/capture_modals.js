const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testModals() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9306',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9306/json', r => {
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

  // Test 1: Dark Mode with mDowód open
  await send('Runtime.evaluate', {
    expression: `
      if (typeof A11Y !== 'undefined') {
        A11Y.highContrast = false;
        A11Y.darkMode = true;
        A11Y.apply();
      }
      openDoc('dowod');
    `
  });
  await new Promise(r => setTimeout(r, 800));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-doc.png', Buffer.from(shot.result.data, 'base64'));

  // Test 2: High Contrast with mDowód open
  await send('Runtime.evaluate', {
    expression: `
      if (typeof A11Y !== 'undefined') {
        A11Y.darkMode = false;
        A11Y.highContrast = true;
        A11Y.apply();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-hc-doc.png', Buffer.from(shot.result.data, 'base64'));

  // Test 3: Dark Mode with Katalog Kart open
  await send('Runtime.evaluate', {
    expression: `
      closeDoc();
      if (typeof A11Y !== 'undefined') {
        A11Y.highContrast = false;
        A11Y.darkMode = true;
        A11Y.apply();
      }
      if (typeof openKatalogKartModal === 'function') openKatalogKartModal();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-katalog.png', Buffer.from(shot.result.data, 'base64'));

  // Test 4: High Contrast with Katalog Kart open
  await send('Runtime.evaluate', {
    expression: `
      if (typeof A11Y !== 'undefined') {
        A11Y.darkMode = false;
        A11Y.highContrast = true;
        A11Y.apply();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-hc-katalog.png', Buffer.from(shot.result.data, 'base64'));

  // Test 5: Dark Mode Spotlight Search
  await send('Runtime.evaluate', {
    expression: `
      if (typeof closeKatalogKartModal === 'function') closeKatalogKartModal();
      if (typeof A11Y !== 'undefined') {
        A11Y.highContrast = false;
        A11Y.darkMode = true;
        A11Y.apply();
      }
      if (typeof openSpotlight === 'function') openSpotlight();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-dark-spotlight.png', Buffer.from(shot.result.data, 'base64'));

  // Test 6: High Contrast Spotlight Search
  await send('Runtime.evaluate', {
    expression: `
      if (typeof A11Y !== 'undefined') {
        A11Y.darkMode = false;
        A11Y.highContrast = true;
        A11Y.apply();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/test-hc-spotlight.png', Buffer.from(shot.result.data, 'base64'));

  console.log('Finished capturing modals!');
  ws.close();
  chrome.kill();
}

testModals().catch(console.error);
