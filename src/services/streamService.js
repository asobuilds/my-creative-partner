const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const MAX_BACKOFF = 15000;

export class StreamClient {
  constructor({ path = '/api/stream', onMessage, onStatus, onError } = {}) {
    this.url = `${API_BASE}${path}`;
    this.wsUrl = this.url.replace(/^http/, 'ws');
    this.onMessage = onMessage || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onError = onError || (() => {});
    this.retry = 0;
    this.closed = false;
    this.ws = null;
    this.es = null;
    this.pingTimer = null;
    this.retryTimer = null;
  }

  connect() {
    this.closed = false;
    this.onStatus('connecting');
    try {
      this._connectWS();
    } catch {
      this._connectSSE();
    }
  }

  _connectWS() {
    const ws = new WebSocket(this.wsUrl);
    this.ws = ws;
    const fail = () => { if (!this.closed) this._scheduleReconnect(); };

    ws.onopen = () => {
      this.retry = 0;
      this.onStatus('open');
      this._startPing();
    };
    ws.onmessage = (e) => {
      try { this.onMessage(JSON.parse(e.data)); } catch { /* binary frames ignored */ }
    };
    ws.onerror = (e) => this.onError?.(e);
    ws.onclose = fail;
  }

  _connectSSE() {
    const es = new EventSource(this.url);
    this.es = es;
    es.onopen = () => { this.retry = 0; this.onStatus('open'); };
    es.onmessage = (e) => {
      try { this.onMessage(JSON.parse(e.data)); } catch { /* keep-alive comment */ }
    };
    es.onerror = () => {
      es.close();
      if (!this.closed) this._scheduleReconnect();
    };
  }

  async send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return;
    }
    // SSE is one-way → use REST for outbound
    try {
      await fetch(`${API_BASE}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      this.onError?.(err);
    }
  }

  _startPing() {
    this._stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type: 'ping' }));
    }, 25000);
  }
  _stopPing() { if (this.pingTimer) clearInterval(this.pingTimer); this.pingTimer = null; }

  _scheduleReconnect() {
    if (this.retryTimer) return;
    this.onStatus('retrying');
    const delay = Math.min(1000 * 2 ** this.retry++, MAX_BACKOFF);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.closed) this.connect();
    }, delay);
  }

  close() {
    this.closed = true;
    this._stopPing();
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.ws?.close();
    this.es?.close();
    this.onStatus('closed');
  }
}