import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5000/api/stream');
let gotHello = false;
const start = Date.now();

ws.on('open', () => {
  console.log('[test] WS_OPEN after', Date.now() - start, 'ms');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  const t = Date.now() - start;
  const short = JSON.stringify(msg).slice(0, 140);
  console.log('[test ' + t + 'ms]', msg.type, short);
  if (msg.type === 'hello') {
    gotHello = true;
    console.log('[test] sending graph:run...');
    ws.send(JSON.stringify({ type: 'graph:run', prompt: 'a blue sphere', graph: { nodes: [], edges: [] } }));
  }
  if (msg.type === 'phase' && msg.phase === 'done') {
    console.log('[test] DONE in', t, 'ms');
    ws.close();
    process.exit(0);
  }
  if (msg.type === 'error') {
    console.log('[test] ERROR:', msg.message);
  }
});

ws.on('error', (e) => {
  console.log('[test] WS_ERROR:', e.message);
});

setTimeout(() => {
  console.log('[test] TIMEOUT after 60s. gotHello=' + gotHello);
  ws.close();
  process.exit(1);
}, 60000);
