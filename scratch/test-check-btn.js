const http = require('http');
const { spawn } = require('child_process');

async function checkEl() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9296',
    'http://localhost:8790/'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9296/json', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
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
  await send('Runtime.enable');
  const res = await send('Runtime.evaluate', {
    expression: 'Boolean(document.getElementById("btnDodajDokument"))',
    returnByValue: true
  });
  console.log('btnDodajDokument exists:', res.result.result.value);
  ws.close();
  chrome.kill();
}
checkEl().catch(console.error);
