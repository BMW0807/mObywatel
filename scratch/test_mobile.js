const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testMobileViewport(w, h, name) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9301',
    `--window-size=${w},${h}`,
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 1800));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9301/json', r => {
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1000));

  // Switch layouts and check overflow
  const check = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const bodyW = document.body.clientWidth;
        const htmlW = document.documentElement.clientWidth;
        const app = document.getElementById('app');
        const appBox = app.getBoundingClientRect();

        // Check for any elements sticking out beyond viewport width
        const overflowing = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1) {
            overflowing.push({
              tag: el.tagName,
              id: el.id,
              cls: el.className,
              right: r.right,
              width: r.width,
              windowW: window.innerWidth
            });
          }
        }

        // Check cards in stack
        const cards = Array.from(document.querySelectorAll('.card')).map(c => {
          const r = c.getBoundingClientRect();
          return { w: r.width, h: r.height, left: r.left, right: r.right };
        });

        return {
          windowW: window.innerWidth,
          windowH: window.innerHeight,
          bodyW,
          htmlW,
          appBox: { left: appBox.left, right: appBox.right, width: appBox.width },
          overflowCount: overflowing.length,
          topOverflow: overflowing.slice(0, 5),
          cards
        };
      })()
    `,
    returnByValue: true
  });

  console.log(`=== VIEWPORT ${w}x${h} (${name}) ===`);
  console.log(JSON.stringify(check.result.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/mobile-${w}x${h}.png`, Buffer.from(shot.result.data, 'base64'));

  ws.close();
  chrome.kill();
}

async function runAll() {
  await testMobileViewport(390, 844, 'iPhone 13/14');
  await testMobileViewport(360, 740, 'Android Standard');
  await testMobileViewport(412, 915, 'Pixel / Samsung');
}

runAll().catch(console.error);
