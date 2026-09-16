const DEFAULTS = {
  lang: (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
  interim: true, continuous: true, autoRestart: true,
  minConfidence: 0.45, silenceRestartDelayMs: 260, wakeWord: '',
};

export class VoiceEngine {
  constructor(opts = {}) {
    this.opts = { ...DEFAULTS, ...opts };
    this.recognition = null;
    this.listening = false;
    this.intentionallyStopped = false;
    this.restartTimer = null;
    this.listeners = new Map();
    this._lastFinal = '';
    this._lastFinalTs = 0;
    this._supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  get supported() { return this._supported; }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event) && this.listeners.get(event).delete(fn);
  }
  _emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((fn) => { try { fn(payload); } catch (e) {} });
  }
  _build() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new Ctor();
    r.lang = this.opts.lang;
    r.continuous = this.opts.continuous;
    r.interimResults = this.opts.interim;
    r.maxAlternatives = 1;
    r.onstart = () => { this.listening = true; this._emit('start'); };
    r.onresult = (event) => {
      let interim = '', finalText = '', finalConfidence = 0;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const alt = res[0];
        if (res.isFinal) { finalText += alt.transcript; finalConfidence = Math.max(finalConfidence, alt.confidence == null ? 1 : alt.confidence); }
        else interim += alt.transcript;
      }
      if (interim) this._emit('interim', { text: interim });
      if (finalText.trim()) {
        const text = finalText.trim();
        const now = performance.now();
        if (text === this._lastFinal && now - this._lastFinalTs < 800) return;
        this._lastFinal = text; this._lastFinalTs = now;
        if (finalConfidence >= this.opts.minConfidence) this._emit('final', { text, confidence: finalConfidence });
        else this._emit('lowconfidence', { text, confidence: finalConfidence });
      }
    };
    r.onerror = (e) => {
      const code = e.error || 'unknown';
      this._emit('error', { code });
      if (code === 'not-allowed' || code === 'service-not-allowed') { this.intentionallyStopped = true; this.listening = false; }
    };
    r.onend = () => {
      this.listening = false;
      this._emit('end');
      if (!this.intentionallyStopped && this.opts.autoRestart) {
        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => this._safeStart(), this.opts.silenceRestartDelayMs);
      }
    };
    return r;
  }
  _safeStart() {
    if (!this._supported || this.listening) return;
    try { if (!this.recognition) this.recognition = this._build(); this.recognition.start(); this.intentionallyStopped = false; } catch (e) {}
  }
  start() { this._safeStart(); }
  stop() {
    this.intentionallyStopped = true;
    if (this.restartTimer) { clearTimeout(this.restartTimer); this.restartTimer = null; }
    try { if (this.recognition) this.recognition.stop(); } catch (e) {}
    this.listening = false;
  }
  abort() {
    this.intentionallyStopped = true;
    if (this.restartTimer) { clearTimeout(this.restartTimer); this.restartTimer = null; }
    try { if (this.recognition) this.recognition.abort(); } catch (e) {}
    this.listening = false;
  }
  setLang(lang) { this.opts.lang = lang; if (this.listening) { this.abort(); setTimeout(() => this.start(), 80); } }
  _wakeWordPasses(text) { if (!this.opts.wakeWord) return true; return text.toLowerCase().startsWith(this.opts.wakeWord.toLowerCase()); }
  _stripWakeWord(text) { if (!this.opts.wakeWord) return text; return text.slice(this.opts.wakeWord.length).trim(); }
  bind(onFinal, onInterim) {
    const offFinal = this.on('final', ({ text }) => { if (!this._wakeWordPasses(text)) return; if (onFinal) onFinal(this._stripWakeWord(text)); });
    const offInterim = this.on('interim', ({ text }) => { if (onInterim) onInterim(text); });
    return () => { offFinal(); offInterim(); };
  }
}
