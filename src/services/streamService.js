const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');
const MAX_BACKOFF = 15000;

export class StreamClient {
  constructor({ path = '/api/stream', onMessage, onStatus, onError, onHello } = {}) {
    this.url = API_BASE + path;
    this.wsUrl = this.url.replace(/^http/, 'ws');
    this.onMessage = onMessage || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onError = onError || (() => {});
    this.onHello = onHello || (() => {});
    this.retry = 0;
    this.closed = false;
    this.ws = null;
    this.pingTimer = null;
    this.retryTimer = null;
    this.connId = null;
    this.outbox = [];
    this._graceMs = 350;
    this._graceTimer = null;
    this._closedForReal = false;
  }

  connect() {
    if (this._closedForReal) return;
    if (this._graceTimer) { clearTimeout(this._graceTimer); this._graceTimer = null; }
    this.closed = false;
    this.onStatus('connecting');
    try { this._connectWS(); } catch (e) { this.onError(e); }
  }

  _connectWS() {
    try {
      const ws = new WebSocket(this.wsUrl);
      this.ws = ws;
      ws.onopen = () => {
        this.retry = 0;
        this.onStatus('open');
        this._startPing();
        while (this.outbox.length) {
          try { ws.send(JSON.stringify(this.outbox.shift())); } catch (e) {}
        }
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'hello') { this.connId = msg.connId; this.onHello(msg.connId); return; }
          this.onMessage(msg);
        } catch (err) {}
      };
      ws.onerror = (e) => { /* swallow — onclose handles recovery */ };
      ws.onclose = () => { if (!this._closedForReal) this._scheduleReconnect(); };
    } catch (e) {
      this.onError(e);
      this._scheduleReconnect();
    }
  }

  async send(payload) {
    const frame = this.connId ? { connId: this.connId, ...payload } : payload;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(frame)); return true; } catch (e) {}
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.outbox.push(frame);
      return true;
    }
    try {
      const res = await fetch(API_BASE + '/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(frame),
      });
      return res.ok;
    } catch (e) {
      this.onError(e);
      return false;
    }
  }

  _startPing() {
    this._stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try { this.ws.send(JSON.stringify({ type: 'ping' })); } catch (e) {}
      }
    }, 22000);
  }
  _stopPing() { if (this.pingTimer) clearInterval(this.pingTimer); this.pingTimer = null; }

  _scheduleReconnect() {
    if (this.retryTimer || this._closedForReal) return;
    this.onStatus('retrying');
    const base = Math.min(1000 * Math.pow(2, this.retry++), MAX_BACKOFF);
    const jitter = base * (0.5 + Math.random() * 0.5);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this._closedForReal) this.connect();
    }, jitter);
  }

  close() {
    if (this._graceTimer) clearTimeout(this._graceTimer);
    this._graceTimer = setTimeout(() => {
      this._graceTimer = null;
      this._closedForReal = true;
      this._stopPing();
      if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
      try { if (this.ws) this.ws.close(); } catch (e) {}
      this.onStatus('closed');
    }, this._graceMs);
  }
}
