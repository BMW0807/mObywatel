const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const LAYOUTS = ['stos', 'karuzela', 'pion', 'lista', 'siatka'];
const VIEWPORTS = [
  { w: 375, h: 667, name: 'iPhoneSE' },
  { w: 390, h: 844, name: 'iPhone13' },
  { w: 360, h: 740, name: 'Android360' }
];

async function runTests() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9302',
    '--window-size=400,900',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9302/json', r => {
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

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 2,
      mobile: true
    });

    for (const l of LAYOUTS) {
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            setVariant('${l}');
            if (typeof zmienOsobe === 'function') zmienOsobe('jan');
          })()
        `
      });

      await new Promise(r => setTimeout(r, 600));

      const report = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const H = window.innerHeight;
            const W = window.innerWidth;
            const bnav = document.querySelector('.bnav');
            const reminders = document.querySelector('#reminders');
            const searchBar = document.querySelector('#docSearchBar');
            const alt = document.querySelector('#alt');
            const stack = document.querySelector('#stack');
            const btnDodaj = document.querySelector('#btnDodajDokument');

            const bnavTop = bnav ? bnav.getBoundingClientRect().top : H;
            const remTop = reminders ? reminders.getBoundingClientRect().top : 0;
            const remBottom = reminders ? reminders.getBoundingClientRect().bottom : 0;
            const searchTop = searchBar ? searchBar.getBoundingClientRect().top : 0;
            const searchBottom = searchBar ? searchBar.getBoundingClientRect().bottom : 0;
            const altBottom = alt ? alt.getBoundingClientRect().bottom : 0;
            const altTop = alt ? alt.getBoundingClientRect().top : 0;

            return {
              layout: '${l}',
              viewport: '${vp.name}',
              W, H,
              remTop, remBottom,
              searchTop, searchBottom,
              bnavTop,
              altTop, altBottom,
              searchOverlapsBnav: searchBottom > bnavTop,
              remOverlapsBnav: remBottom > bnavTop,
              altOverlapsReminders: altBottom > remTop
            };
          })()
        `,
        returnByValue: true
      });

      console.log(JSON.stringify(report.result.result.value));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/layout-${l}-${vp.name}.png`, Buffer.from(shot.result.data, 'base64'));
    }
  }

  ws.close();
  chrome.kill();
}

runTests().catch(console.error);
