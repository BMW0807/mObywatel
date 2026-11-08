const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testUI() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9297',
    '--window-size=430,932',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9297/json', r => {
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
      if (msg.id === mid) {
        ws.removeEventListener('message', handler);
        res(msg);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  // Switch to Jan Wiśniewski if needed
  await send('Runtime.evaluate', {
    expression: `
      if (typeof pickPerson === 'function') {
        pickPerson('jan');
      }
    `
  });

  await new Promise(r => setTimeout(r, 1000));

  // Check bounding boxes of Kod QR text and homebar
  const checkBoxes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const qrBtn = document.querySelector('.bnav-btn.qr-center span');
        const homebar = document.querySelector('.homebar');
        const bnav = document.querySelector('.bnav');
        const qrBox = qrBtn ? qrBtn.getBoundingClientRect() : null;
        const hbBox = homebar ? homebar.getBoundingClientRect() : null;
        const bnavBox = bnav ? bnav.getBoundingClientRect() : null;
        
        let collision = false;
        if (qrBox && hbBox && getComputedStyle(homebar).display !== 'none') {
          // Check vertical overlap
          if (qrBox.bottom > hbBox.top && qrBox.top < hbBox.bottom) {
            collision = true;
          }
        }
        return {
          qrBox: qrBox ? { top: qrBox.top, bottom: qrBox.bottom, height: qrBox.height } : null,
          hbBox: hbBox ? { top: hbBox.top, bottom: hbBox.bottom, height: hbBox.height, display: getComputedStyle(homebar).display } : null,
          bnavBox: bnavBox ? { top: bnavBox.top, bottom: bnavBox.bottom, height: bnavBox.height } : null,
          gapBetweenQrAndHomebar: (qrBox && hbBox) ? (hbBox.top - qrBox.bottom) : null,
          collision
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Layout check:', JSON.stringify(checkBoxes.result.result.value, null, 2));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.result.data, 'base64');
  const outPath = 'C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/jan-fixed-screen.png';
  fs.writeFileSync(outPath, buf);
  console.log('Saved screenshot to:', outPath);

  ws.close();
  chrome.kill();
}

testUI().catch(console.error);
