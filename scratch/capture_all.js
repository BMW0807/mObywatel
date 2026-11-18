const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function captureAllViews() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9310',
    '--user-data-dir=C:\\Users\\Bartosz\\Documents\\mobywatel\\scratch\\chrome_profile_tmp',
    '--window-size=1200,960',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9310/json', r => {
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

  await send('Runtime.evaluate', { expression: "if (typeof zmienOsobe === 'function') zmienOsobe('jan');" });
  await new Promise(r => setTimeout(r, 500));

  const snap = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`C:/Users/Bartosz/.gemini/antigravity/brain/1d93a817-7f2a-4e0a-b285-8695252c222a/${name}.png`, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved', name);
  };

  // 1. Dark Mode
  await send('Runtime.evaluate', {
    expression: `
      A11Y.highContrast = false;
      A11Y.darkMode = true;
      A11Y.apply();
      switchNavTab('docs');
    `
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('dark-view-docs');

  // Dark Services
  await send('Runtime.evaluate', { expression: "switchNavTab('services');" });
  await new Promise(r => setTimeout(r, 600));
  await snap('dark-view-services');

  // Dark Aa Panel
  await send('Runtime.evaluate', { expression: "switchNavTab('docs'); document.getElementById('a11yBtn').click();" });
  await new Promise(r => setTimeout(r, 500));
  await snap('dark-view-a11ypanel');
  await send('Runtime.evaluate', { expression: "closeA11yPanel();" });

  // Dark Katalog Kart
  await send('Runtime.evaluate', { expression: "if (typeof openKatalogModal === 'function') openKatalogModal();" });
  await new Promise(r => setTimeout(r, 600));
  await snap('dark-view-katalog');
  await send('Runtime.evaluate', { expression: "if (typeof closeKatalogModal === 'function') closeKatalogModal();" });

  // Dark Spotlight
  await send('Runtime.evaluate', { expression: "if (typeof openSpotlight === 'function') openSpotlight();" });
  await new Promise(r => setTimeout(r, 600));
  await snap('dark-view-spotlight');
  await send('Runtime.evaluate', { expression: "if (typeof closeSpotlight === 'function') closeSpotlight();" });

  // 2. High Contrast Mode
  await send('Runtime.evaluate', {
    expression: `
      A11Y.darkMode = false;
      A11Y.highContrast = true;
      A11Y.apply();
      switchNavTab('docs');
    `
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('hc-view-docs');

  // HC Services
  await send('Runtime.evaluate', { expression: "switchNavTab('services');" });
  await new Promise(r => setTimeout(r, 600));
  await snap('hc-view-services');

  // HC Katalog
  await send('Runtime.evaluate', { expression: "if (typeof openKatalogModal === 'function') openKatalogModal();" });
  await new Promise(r => setTimeout(r, 600));
  await snap('hc-view-katalog');
  await send('Runtime.evaluate', { expression: "if (typeof closeKatalogModal === 'function') closeKatalogModal();" });

  // HC Spotlight
  await send('Runtime.evaluate', { expression: "if (typeof openSpotlight === 'function') openSpotlight();" });
  await new Promise(r => setTimeout(r, 600));
  await snap('hc-view-spotlight');
  await send('Runtime.evaluate', { expression: "if (typeof closeSpotlight === 'function') closeSpotlight();" });

  ws.close();
  chrome.kill();
}

captureAllViews().catch(console.error);
