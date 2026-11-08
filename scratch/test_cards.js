const http = require('http');
const { spawn } = require('child_process');

async function testCards() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9312',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9312/json', r => {
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
  await send('Network.enable');

  const failedRequests = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Network.responseReceived') {
      const resp = msg.params.response;
      if (resp.status >= 400) {
        failedRequests.push({ url: resp.url, status: resp.status });
      }
    } else if (msg.method === 'Network.loadingFailed') {
      failedRequests.push({ url: msg.params.requestId, error: msg.params.errorText });
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Check each persona
  const report = {};
  for (const osoba of ['jan', 'marta', 'ewa', 'kacper']) {
    await send('Runtime.evaluate', { expression: `zmienOsobe('${osoba}')` });
    await new Promise(r => setTimeout(r, 600));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const cards = [...document.querySelectorAll('#stack .card')];
        return cards.map(c => {
          const bg = window.getComputedStyle(c).backgroundImage;
          return {
            label: c.getAttribute('aria-label'),
            bg: bg.substring(0, 100) + (bg.length > 100 ? '...' : '')
          };
        });
      })()`,
      returnByValue: true
    });
    report[osoba] = res.result.result.value;
  }

  // Also test adding all cards from Katalog
  await send('Runtime.evaluate', { expression: `zmienOsobe('jan');` });
  await new Promise(r => setTimeout(r, 500));

  const katalogCards = await send('Runtime.evaluate', {
    expression: `(() => {
      if (typeof KATALOG_DOKUMENTOW === 'undefined') return [];
      return KATALOG_DOKUMENTOW.map(k => k.id);
    })()`,
    returnByValue: true
  });
  console.log('Katalog card ids:', katalogCards.result.result.value);

  const katalogReport = [];
  for (const cid of (katalogCards.result.result.value || [])) {
    await send('Runtime.evaluate', { expression: `dodajDokumentDoPortfela('${cid}')` });
    await new Promise(r => setTimeout(r, 300));
  }

  const resAfterAdd = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = [...document.querySelectorAll('#stack .card')];
      return cards.map(c => {
        const bg = window.getComputedStyle(c).backgroundImage;
        return {
          label: c.getAttribute('aria-label'),
          bg: bg.substring(0, 100) + (bg.length > 100 ? '...' : '')
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Cards by persona:');
  console.log(JSON.stringify(report, null, 2));

  console.log('\nCards after adding all from Katalog:');
  console.log(JSON.stringify(resAfterAdd.result.result.value, null, 2));

  console.log('\nFailed requests:');
  console.log(JSON.stringify(failedRequests, null, 2));

  ws.close();
  chrome.kill();
}

testCards().catch(console.error);
