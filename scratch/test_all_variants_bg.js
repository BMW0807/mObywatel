const http = require('http');
const { spawn } = require('child_process');

async function testAllVariantsBg() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9317',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9317/json', r => {
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

  await send('Runtime.evaluate', { expression: `zmienOsobe('jan');` });
  await new Promise(r => setTimeout(r, 500));

  // Add emeryt and pwz_lekarz
  await send('Runtime.evaluate', { expression: `dodajDokumentDoPortfela('emeryt'); dodajDokumentDoPortfela('pwz_lekarz');` });
  await new Promise(r => setTimeout(r, 400));

  const variantReport = {};
  for (const v of ['stos', 'karuzela', 'pion', 'lista', 'siatka']) {
    await send('Runtime.evaluate', { expression: `setVariant('${v}');` });
    await new Promise(r => setTimeout(r, 400));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        let els = [];
        if ('${v}' === 'stos') els = [...document.querySelectorAll('#stack .card')];
        else if ('${v}' === 'karuzela') els = [...document.querySelectorAll('#car .ccard')];
        else if ('${v}' === 'pion') els = [...document.querySelectorAll('#vcar .vcard')];
        else if ('${v}' === 'lista') els = [...document.querySelectorAll('#alt .strip')];
        else if ('${v}' === 'siatka') els = [...document.querySelectorAll('#alt .gmini')];
        return els.map(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          return {
            valid: bg !== 'none' && bg !== '',
            bgSnippet: (bg || '').substring(0, 60)
          };
        });
      })()`,
      returnByValue: true
    });
    variantReport[v] = res.result.result.value;
  }

  console.log('Variants background report:');
  console.log(JSON.stringify(variantReport, null, 2));

  ws.close();
  chrome.kill();
}

testAllVariantsBg().catch(console.error);
