import 'dotenv/config';

const {
  LLM_PROVIDER = 'groq',
  LLM_FALLBACK = 'openrouter',

  GROQ_API_KEY, GROQ_BASE_URL = 'https://api.groq.com/openai/v1',
  GROQ_MODEL = 'llama-3.3-70b-versatile',
  GROQ_MAX_TOKENS = '512', GROQ_TEMPERATURE = '0.75',

  OPENROUTER_API_KEY, OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1',
  OPENROUTER_MODEL = 'anthropic/claude-3.5-sonnet',
  OPENROUTER_APP_NAME = 'Synthetix', OPENROUTER_APP_URL = 'http://localhost:5173',
  OPENROUTER_MAX_TOKENS = '512', OPENROUTER_TEMPERATURE = '0.75',

  GEMINI_API_KEY, GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL = 'gemini-2.0-flash-exp',
} = process.env;

const isReal = (v) => Boolean(v) && !String(v).startsWith('PASTE_');

export const providerStatus = {
  groq: isReal(GROQ_API_KEY),
  openrouter: isReal(OPENROUTER_API_KEY),
  gemini: isReal(GEMINI_API_KEY),
};

export const llmReady = providerStatus.groq || providerStatus.openrouter || providerStatus.gemini;

function pickOrder(preferred) {
  const order = [preferred || LLM_PROVIDER, LLM_FALLBACK, 'groq', 'openrouter', 'gemini'];
  const seen = new Set();
  return order.filter((p) => p && providerStatus[p] && !seen.has(p) && seen.add(p));
}

async function* streamOpenAICompatible({ baseUrl, apiKey, model, maxTokens, temperature, messages, extraHeaders = {}, signal, json }) {
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  const timeout = setTimeout(() => ctl.abort(), 45000);

  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify({
        model, messages, stream: true, max_tokens: maxTokens, temperature,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: ctl.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') return;
        try {
          const j = JSON.parse(payload);
          const d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
          if (d) yield d;
        } catch (e) {}
      }
    }
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

async function* streamGemini({ apiKey, baseUrl, model, messages, maxTokens, temperature, signal }) {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => ({ text: m.content }));
  const contents = messages.filter((m) => m.role !== 'system').map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  const timeout = setTimeout(() => ctl.abort(), 45000);

  try {
    const url = baseUrl.replace(/\/$/, '') + '/models/' + model + ':streamGenerateContent?alt=sse&key=' + apiKey;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        ...(systemParts.length ? { systemInstruction: { parts: systemParts } } : {}),
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      }),
      signal: ctl.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          const j = JSON.parse(payload);
          const parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
          if (parts && parts.length && parts[0].text) yield parts[0].text;
        } catch (e) {}
      }
    }
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

async function* streamFromProvider(provider, messages, opts) {
  if (provider === 'groq') {
    yield* streamOpenAICompatible({
      baseUrl: GROQ_BASE_URL, apiKey: GROQ_API_KEY, model: opts.model || GROQ_MODEL,
      maxTokens: Number(opts.maxTokens || GROQ_MAX_TOKENS),
      temperature: Number(opts.temperature || GROQ_TEMPERATURE),
      messages, signal: opts.signal, json: opts.json,
    });
    return;
  }
  if (provider === 'openrouter') {
    yield* streamOpenAICompatible({
      baseUrl: OPENROUTER_BASE_URL, apiKey: OPENROUTER_API_KEY, model: opts.model || OPENROUTER_MODEL,
      maxTokens: Number(opts.maxTokens || OPENROUTER_MAX_TOKENS),
      temperature: Number(opts.temperature || OPENROUTER_TEMPERATURE),
      messages, signal: opts.signal, json: opts.json,
      extraHeaders: { 'HTTP-Referer': OPENROUTER_APP_URL, 'X-Title': OPENROUTER_APP_NAME },
    });
    return;
  }
  if (provider === 'gemini') {
    yield* streamGemini({
      apiKey: GEMINI_API_KEY, baseUrl: GEMINI_BASE_URL, model: opts.model || GEMINI_MODEL,
      messages,
      maxTokens: Number(opts.maxTokens || 512),
      temperature: Number(opts.temperature || 0.75),
      signal: opts.signal,
    });
    return;
  }
  throw new Error('Unknown provider: ' + provider);
}

export async function* streamChat(messages, opts = {}) {
  const order = pickOrder(opts.provider);
  if (order.length === 0) throw new Error('No LLM provider configured');

  let lastErr = null;
  for (const provider of order) {
    try {
      let yielded = false;
      for await (const delta of streamFromProvider(provider, messages, opts)) {
        yielded = true;
        yield delta;
      }
      return;
    } catch (e) {
      lastErr = e;
      const msg = String(e && e.message || e);
      console.warn('[llm] provider ' + provider + ' failed: ' + msg.slice(0, 120));
      if (opts.signal && opts.signal.aborted) throw e;
      continue;
    }
  }
  throw lastErr || new Error('All LLM providers failed');
}

export async function completeJSON(messages, opts = {}) {
  let raw = '';
  for await (const delta of streamChat(messages, { ...opts, json: true })) raw += delta;
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); } catch (e) { return null; }
}
