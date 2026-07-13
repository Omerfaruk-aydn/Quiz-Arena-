import {
  resolveImageUrl,
  getRandomImageByType,
  normalizeWikimediaUrl,
} from '../dist/services/ai/imageResolver.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const samples = [
  { type: 'flag', query: 'türkiye' },
  { type: 'flag', query: 'abd' },
  { type: 'artwork', query: 'mona lisa' },
  { type: 'artwork', query: 'the scream' },
  { type: 'person', query: 'leonardo da vinci' },
  { type: 'landmark', query: 'eyfel kulesi' },
  { type: 'landmark', query: 'taj mahal' },
  { type: 'animal', query: 'aslan' },
  { type: 'animal', query: 'penguen' },
  { type: 'food', query: 'pizza' },
  { type: 'food', query: 'sushi' },
  { type: 'instrument', query: 'gitar' },
  { type: 'instrument', query: 'piyano' },
  { type: 'logo', query: 'apple' },
  { type: 'logo', query: 'google' },
  { type: 'map', query: 'türkiye' },
  { type: 'map', query: 'almanya' },
  { type: 'nature', query: 'grand canyon' },
  { type: 'architecture', query: 'burj khalifa' },
];

async function checkUrl(url, label) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const ok = res.ok;
    const size = res.headers.get('content-length');
    console.log(ok ? '✅' : '❌', label, res.status, size ? `(${size} bytes)` : '');
    if (!ok) console.log('   ', url);
    return ok;
  } catch (err) {
    console.log('❌', label, 'ERROR:', err.message);
    console.log('   ', url);
    return false;
  }
}

console.log('=== Verifying image resolver URLs ===\n');
let ok = 0;
let fail = 0;

for (const s of samples) {
  const url = resolveImageUrl(s.type, s.query);
  if (!url) {
    console.log('❌', `${s.type}/${s.query}`, 'no URL resolved');
    fail++;
    continue;
  }
  const passed = await checkUrl(url, `${s.type}/${s.query}`);
  passed ? ok++ : fail++;
  await sleep(2500);
}

console.log('\n=== Random samples ===\n');
const randomTypes = ['flag', 'landmark', 'person', 'animal', 'artwork', 'instrument', 'food', 'logo'];
for (const type of randomTypes) {
  const url = getRandomImageByType(type);
  if (!url) {
    console.log('❌', `random ${type}`, 'no URL');
    fail++;
    continue;
  }
  const passed = await checkUrl(url, `random ${type}`);
  passed ? ok++ : fail++;
  await sleep(2500);
}

console.log('\n=== Special:FilePath redirect samples ===\n');
const rawUrls = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/480px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Turkey_%28orthographic_projection%29.svg/400px-Turkey_%28orthographic_projection%29.svg.png',
];
for (const raw of rawUrls) {
  const normalized = normalizeWikimediaUrl(raw);
  const passed = await checkUrl(normalized, `normalized ${raw.slice(0, 60)}...`);
  passed ? ok++ : fail++;
  await sleep(2500);
}

console.log(`\n=== RESULT: ${ok} OK, ${fail} FAILED ===`);
process.exit(fail > 0 ? 1 : 0);
