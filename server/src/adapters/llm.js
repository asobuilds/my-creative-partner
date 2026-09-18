import 'dotenv/config';
import { extraProviders, streamCerebras, streamGemini, completeHuggingFace } from './llmProviders.js';

const {
  LLM_PROVIDER = 'openrouter',
  LLM_FALLBACK = 'groq',

  OPENROUTER_API_KEY, OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1',
  OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct',
  OPENROUTER_APP_NAME = '9jaWonderPal', OPENROUTER_APP_URL = 'http://localhost:5173',
  OPENROUTER_MAX_TOKENS = '3000', OPENROUTER_TEMPERATURE = '0.85',

  GROQ_API_KEY, GROQ_BASE_URL = 'https://api.groq.com/openai/v1',
  GROQ_MODEL = 'llama-3.3-70b-versatile',
  GROQ_MAX_TOKENS = '3000', GROQ_TEMPERATURE = '0.85',
} = process.env;

const isReal = (v) => Boolean(v) && String(v).trim().length > 4 && !/^(PASTE|YOUR_|REPLACE)/i.test(String(v));

export const providerStatus = {
  cerebras: extraProviders.cerebras,
  openrouter: isReal(OPENROUTER_API_KEY),
  groq: isReal(GROQ_API_KEY),
  gemini: extraProviders.gemini,
  huggingface: extraProviders.huggingface,
};

export const llmReady = Object.values(providerStatus).some(Boolean);

// ── Request queue
const queue = { chain: Promise.resolve(), last: 0 };
const MIN_GAP_MS = 1000;

function enqueue(fn) {
  const run = queue.chain.then(async () => {
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - queue.last));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    queue.last = Date.now();
    return fn();
  });
  queue.chain = run.catch(() => {});
  return run;
}

// ── Provider cooldown
const cooldown = { openrouter: 0, groq: 0, cerebras: 0, gemini: 0, huggingface: 0 };
const COOLDOWN_MS = 20000;

function pickOrder(preferred) {
  const now = Date.now();
  const order = [preferred || LLM_PROVIDER, LLM_FALLBACK, 'cerebras', 'groq', 'openrouter', 'gemini', 'huggingface'];
  const seen = new Set();
  const result = [];
  for (const p of order) {
    if (!p || seen.has(p)) continue;
    seen.add(p);
    if (!providerStatus[p]) continue;
    if (cooldown[p] > now) continue;
    result.push(p);
  }
  if (result.length === 0) {
    for (const p of seen) if (providerStatus[p]) result.push(p);
  }
  return result;
}

function markCooldown(provider) {
  cooldown[provider] = Date.now() + COOLDOWN_MS;
  console.warn('[llm] ' + provider + ' cooldown ' + (COOLDOWN_MS / 1000) + 's');
}

// ── Streaming call
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

async function* streamFromProvider(provider, messages, opts) {
  if (provider === 'openrouter') {
    yield* streamOpenAICompatible({
      baseUrl: OPENROUTER_BASE_URL, apiKey: OPENROUTER_API_KEY,
      model: opts.model || OPENROUTER_MODEL,
      maxTokens: Number(opts.maxTokens || OPENROUTER_MAX_TOKENS),
      temperature: Number(opts.temperature || OPENROUTER_TEMPERATURE),
      messages, signal: opts.signal,
      extraHeaders: { 'HTTP-Referer': OPENROUTER_APP_URL, 'X-Title': OPENROUTER_APP_NAME },
    });
    return;
  }
  if (provider === 'groq') {
    yield* streamOpenAICompatible({
      baseUrl: GROQ_BASE_URL, apiKey: GROQ_API_KEY,
      model: opts.model || GROQ_MODEL,
      maxTokens: Number(opts.maxTokens || GROQ_MAX_TOKENS),
      temperature: Number(opts.temperature || GROQ_TEMPERATURE),
      messages, signal: opts.signal,
    });
    return;
  }
  if (provider === 'cerebras') {
    yield* streamCerebras({ messages, maxTokens: Number(opts.maxTokens || OPENROUTER_MAX_TOKENS), temperature: Number(opts.temperature || OPENROUTER_TEMPERATURE), signal: opts.signal });
    return;
  }
  if (provider === 'gemini') {
    yield* streamGemini({ messages, maxTokens: Number(opts.maxTokens || OPENROUTER_MAX_TOKENS), temperature: Number(opts.temperature || OPENROUTER_TEMPERATURE), signal: opts.signal });
    return;
  }
  if (provider === 'huggingface') {
    const text = await completeHuggingFace({ messages, maxTokens: Number(opts.maxTokens || 1500), temperature: Number(opts.temperature || OPENROUTER_TEMPERATURE), signal: opts.signal });
    if (text) yield text;
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
      for await (const delta of streamFromProvider(provider, messages, opts)) yield delta;
      return;
    } catch (e) {
      lastErr = e;
      const status = e.status || 0;
      console.warn('[llm] ' + provider + ' failed:', String(e.message).slice(0, 100));
      if (status === 429) markCooldown(provider);
      if (opts.signal && opts.signal.aborted) throw e;
      continue;
    }
  }
  throw lastErr || new Error('All LLM providers failed');
}

// ── Robust JSON extraction — handles truncation and markdown
function repairAndParse(raw) {
  if (!raw) return null;
  let s = raw.trim();

  // Strip markdown code fences
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();

  // Find first { and last }
  const first = s.indexOf('{');
  if (first < 0) return null;
  let body = s.slice(first);

  // If truncated, cut to last complete key-value or close braces
  try { return JSON.parse(body); } catch (e) {}

  // Attempt repair: cut to last comma and close all open braces/brackets
  const lastComplete = Math.max(body.lastIndexOf(','), body.lastIndexOf('"'));
  if (lastComplete > 0) {
    let attempt = body.slice(0, lastComplete + 1);
    // Count unclosed
    const open = { '{': 0, '[': 0 };
    let inStr = false;
    let esc = false;
    for (let i = 0; i < attempt.length; i++) {
      const ch = attempt[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') open['{']++;
      else if (ch === '}') open['{']--;
      else if (ch === '[') open['[']++;
      else if (ch === ']') open['[']--;
    }
    // Remove trailing comma
    attempt = attempt.replace(/,\s*$/, '');
    // Close structures
    while (open['[']-- > 0) attempt += ']';
    while (open['{']-- > 0) attempt += '}';
    try { return JSON.parse(attempt); } catch (e) {}
  }

  return null;
}

export async function completeJSON(messages, opts = {}) {
  const attempts = opts.attempts || 2;
  let lastErr = null;

  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1200 * i));
    try {
      const raw = await enqueue(async () => {
        let acc = '';
        for await (const delta of streamChat(messages, opts)) acc += delta;
        return acc;
      });

      if (!raw || raw.trim().length < 10) {
        console.warn('[llm] attempt ' + (i + 1) + ' empty');
        lastErr = new Error('Empty response');
        continue;
      }

      console.log('[llm] attempt ' + (i + 1) + ' raw len=' + raw.length);
      const parsed = repairAndParse(raw);
      if (parsed) return parsed;

      console.warn('[llm] attempt ' + (i + 1) + ' parse failed. First 150: ' + raw.slice(0, 150));
      console.warn('[llm] attempt ' + (i + 1) + ' last 150: ' + raw.slice(-150));
      lastErr = new Error('Unparseable JSON');
      continue;
    } catch (e) {
      lastErr = e;
      console.warn('[llm] attempt ' + (i + 1) + ' threw:', String(e.message).slice(0, 100));
    }
  }
  throw lastErr || new Error('completeJSON failed');
}

export async function completeText(messages, opts = {}) {
  return await enqueue(async () => {
    let acc = '';
    for await (const delta of streamChat(messages, opts)) acc += delta;
    return acc.trim();
  });
}
