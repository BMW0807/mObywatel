const http = require('http');
const { spawn } = require('child_process');

async function testBgFix2() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9316',
    'http://localhost:8790/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9316/json', r => {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      try {
        // Improved cardImgUrl:
        window.cardImgUrl = function(u) {
          if (!u) return '';
          if (u.startsWith('data:')) return u;
          return u + (u.indexOf('?') !== -1 ? '&' : '?') + 'v=41';
        };

        // Improved svgToUri:
        function safeSvgToUri(str) {
          return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str.trim())
            .replace(/\\(/g, '%28')
            .replace(/\\)/g, '%29')
            .replace(/'/g, '%27');
        }

        // Test one card:
        const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g"><stop offset="0%" stop-color="rgba(0,100,50,0.8)"/><stop offset="100%" stop-color="rgba(0,50,20,1)"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/></svg>';
        const uriUnsafe = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawSvg);
        const uriSafe = safeSvgToUri(rawSvg);

        const d1 = document.createElement('div');
        d1.style.backgroundImage = 'url(' + uriUnsafe + ')';

        const d2 = document.createElement('div');
        d2.style.backgroundImage = 'url(' + uriSafe + ')';

        const d3 = document.createElement('div');
        d3.style.backgroundImage = 'url("' + uriSafe + '")';

        return {
          d1_unsafe_unquoted: d1.style.backgroundImage ? d1.style.backgroundImage.substring(0, 40) : 'EMPTY',
          d2_safe_unquoted: d2.style.backgroundImage ? d2.style.backgroundImage.substring(0, 40) : 'EMPTY',
          d3_safe_quoted: d3.style.backgroundImage ? d3.style.backgroundImage.substring(0, 40) : 'EMPTY'
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    returnByValue: true
  });

  console.log('Results:', res.result);

  ws.close();
  chrome.kill();
}

testBgFix2().catch(console.error);
