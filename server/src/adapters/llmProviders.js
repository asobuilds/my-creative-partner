/**
 * Extra LLM providers to add to the failover chain.
 * All are OpenAI-compatible except Gemini (which needs translation).
 */
import 'dotenv/config';

const {
  CEREBRAS_API_KEY,
  CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1',
  CEREBRAS_MODEL = 'llama3.1-70b',

  GEMINI_API_KEY,
  GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL = 'gemini-2.0-flash',

  HF_TOKEN,
  HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct',
} = process.env;

const isReal = (v) => Boolean(v) && String(v).trim().length > 8 && !/^(PASTE|YOUR_|REPLACE)/i.test(String(v));

export const extraProviders = {
  cerebras: isReal(CEREBRAS_API_KEY),
  gemini: isReal(GEMINI_API_KEY),
  huggingface: isReal(HF_TOKEN),
};

// ── OpenAI-compatible streaming (Cerebras)
export async function* streamCerebras({ messages, maxTokens = 2500, temperature = 0.85, signal }) {
  if (!extraProviders.cerebras) throw new Error('Cerebras not configured');
  yield* streamOpenAICompatible({
    baseUrl: CEREBRAS_BASE_URL, apiKey: CEREBRAS_API_KEY, model: CEREBRAS_MODEL,
    maxTokens, temperature, messages, signal,
    extraHeaders: {},
  });
}

// ── Gemini streaming (message format translation)
export async function* streamGemini({ messages, maxTokens = 2500, temperature = 0.85, signal }) {
  if (!extraProviders.gemini) throw new Error('Gemini not configured');

  const systemParts = messages.filter((m) => m.role === 'system').map((m) => ({ text: m.content }));
  const contents = messages.filter((m) => m.role !== 'system').map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  const timeout = setTimeout(() => ctl.abort(), 90000);

  try {
    const url = GEMINI_BASE_URL.replace(/\/$/, '') + '/models/' + GEMINI_MODEL + ':streamGenerateContent?alt=sse&key=' + GEMINI_API_KEY;
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
      const err = new Error('Gemini HTTP ' + res.status + ': ' + text.slice(0, 200));
      err.status = res.status;
      throw err;
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
          if (parts) for (const p of parts) if (p.text) yield p.text;
        } catch (e) {}
      }
    }
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

// ── HuggingFace Inference API (non-streaming — returns full text)
export async function completeHuggingFace({ messages, maxTokens = 2500, temperature = 0.85, signal }) {
  if (!extraProviders.huggingface) throw new Error('HuggingFace not configured');

  // Flatten to single prompt
  const prompt = messages.map((m) => (m.role === 'system' ? m.content : m.role === 'user' ? 'User: ' + m.content : 'Assistant: ' + m.content)).join('\n\n') + '\n\nAssistant:';

  const res = await fetch('https://api-inference.huggingface.co/models/' + HF_MODEL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxTokens, temperature, return_full_text: false },
      options: { wait_for_model: true, use_cache: false },
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error('HF HTTP ' + res.status + ': ' + text.slice(0, 200));
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  const out = Array.isArray(json) ? json[0]?.generated_text : json.generated_text;
  return out || '';
}

// ── Shared OpenAI-compatible streamer
async function* streamOpenAICompatible({ baseUrl, apiKey, model, maxTokens, temperature, messages, extraHeaders = {}, signal }) {
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  const timeout = setTimeout(() => ctl.abort(), 90000);

  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens, temperature }),
      signal: ctl.signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      const err = new Error('HTTP ' + res.status + ': ' + text.slice(0, 200));
      err.status = res.status;
      throw err;
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
