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

function pickProvider(preferred) {
  const order = [preferred || LLM_PROVIDER, LLM_FALLBACK, 'groq', 'openrouter', 'gemini'];
  for (const p of order) {
    if (p && providerStatus[p]) return p;
  }
  return null;
}

async function* streamOpenAICompatible({ baseUrl, apiKey, model, maxTokens, temperature, messages, extraHeaders = {}, signal, json }) {
  const res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error('LLM ' + res.status + ': ' + text.slice(0, 240));
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
        const json2 = JSON.parse(payload);
        const delta = json2.choices && json2.choices[0] && json2.choices[0].delta && json2.choices[0].delta.content;
        if (delta) yield delta;
      } catch (e) {}
    }
  }
}

async function* streamGemini({ apiKey, baseUrl, model, messages, maxTokens, temperature, signal }) {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => ({ text: m.content }));
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  const url = baseUrl.replace(/\/$/, '') + '/models/' + model + ':streamGenerateContent?alt=sse&key=' + apiKey;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(systemParts.length ? { systemInstruction: { parts: systemParts } } : {}),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error('Gemini ' + res.status + ': ' + text.slice(0, 240));
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
        const json = JSON.parse(payload);
        const parts = json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts;
        if (parts && parts.length && parts[0].text) yield parts[0].text;
      } catch (e) {}
    }
  }
}

export async function* streamChat(messages, opts = {}) {
  const provider = pickProvider(opts.provider);
  if (!provider) throw new Error('No LLM provider configured');

  const maxTokens = Number(opts.maxTokens || (provider === 'groq' ? GROQ_MAX_TOKENS : provider === 'openrouter' ? OPENROUTER_MAX_TOKENS : 512));
  const temperature = Number(opts.temperature || (provider === 'groq' ? GROQ_TEMPERATURE : provider === 'openrouter' ? OPENROUTER_TEMPERATURE : 0.75));

  if (provider === 'groq') {
    yield* streamOpenAICompatible({
      baseUrl: GROQ_BASE_URL, apiKey: GROQ_API_KEY,
      model: opts.model || GROQ_MODEL,
      maxTokens, temperature, messages,
      signal: opts.signal, json: opts.json,
    });
    return;
  }
  if (provider === 'openrouter') {
    yield* streamOpenAICompatible({
      baseUrl: OPENROUTER_BASE_URL, apiKey: OPENROUTER_API_KEY,
      model: opts.model || OPENROUTER_MODEL,
      maxTokens, temperature, messages,
      signal: opts.signal, json: opts.json,
      extraHeaders: { 'HTTP-Referer': OPENROUTER_APP_URL, 'X-Title': OPENROUTER_APP_NAME },
    });
    return;
  }
  if (provider === 'gemini') {
    yield* streamGemini({
      apiKey: GEMINI_API_KEY, baseUrl: GEMINI_BASE_URL,
      model: opts.model || GEMINI_MODEL,
      messages, maxTokens, temperature, signal: opts.signal,
    });
    return;
  }
}

export async function completeJSON(messages, opts = {}) {
  let raw = '';
  for await (const delta of streamChat(messages, { ...opts, json: true })) raw += delta;
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); } catch (e) { return null; }
}
