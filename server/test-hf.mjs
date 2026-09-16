import 'dotenv/config';
const { HF_API_KEY_ID, HF_API_KEY_SECRET, HF_BASE_URL='https://api.higgsfield.ai', HF_MODEL='higgsfield-ai/soul/v2/standard' } = process.env;
console.log('id set:', !!HF_API_KEY_ID, 'secret set:', !!HF_API_KEY_SECRET);
console.log('id preview:', HF_API_KEY_ID ? HF_API_KEY_ID.slice(0, 4) + '...' : 'MISSING');

const auth = 'Key ' + HF_API_KEY_ID + ':' + HF_API_KEY_SECRET;
try {
  const res = await fetch(HF_BASE_URL + '/' + HF_MODEL, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'a calm blue ocean at sunset' }),
  });
  console.log('status:', res.status);
  const txt = await res.text();
  console.log('body:', txt.slice(0, 500));
} catch (e) {
  console.log('THREW:', e.message);
}
