import {
  LANDMARK_IMAGES,
  PEOPLE_IMAGES,
  ANIMAL_IMAGES,
  INSTRUMENT_IMAGES,
  ARTWORK_IMAGES,
  FOOD_IMAGES,
  NATURE_IMAGES,
  ARCHITECTURE_IMAGES,
  LOGO_IMAGES,
  MAP_IMAGES,
} from '../dist/services/ai/imageLibrary.js';
import { normalizeWikimediaUrl } from '../dist/services/ai/imageResolver.js';

const libraries = {
  LANDMARK_IMAGES,
  PEOPLE_IMAGES,
  ANIMAL_IMAGES,
  INSTRUMENT_IMAGES,
  ARTWORK_IMAGES,
  FOOD_IMAGES,
  NATURE_IMAGES,
  ARCHITECTURE_IMAGES,
  LOGO_IMAGES,
  MAP_IMAGES,
};

const TRANSLATIONS = {
  'beyaz ayı': 'polar bear',
  kanguru: 'kangaroo',
  yunus: 'dolphin',
  geyik: 'deer',
  balina: 'whale',
  arı: 'honey bee',
  trampet: 'trumpet',
  arp: 'harp',
  akordeon: 'accordion',
  kanun: 'qanun instrument',
  saz: 'saz instrument',
  döner: 'doner kebab',
  'çiğ köfte': 'cig kofte',
  pasta: 'pasta dish',
  macaron: 'macaron',
  'dim sum': 'dim sum',
  sahara: 'sahara desert',
  'great barrier reef': 'Great Barrier Reef',
  eyjafjallajökull: 'Eyjafjallajokull',
  'burj al arab': 'Burj Al Arab',
  'taipei 101': 'Taipei 101',
  'petronas towers': 'Petronas Towers',
  'the persistence of memory': 'The Persistence of Memory',
  guernica: 'Guernica',
};

function normalizeTitle(title) {
  return title.replace(/^File:/, '').replace(/_/g, ' ').trim().toLowerCase();
}

function extractFilename(url) {
  try {
    const normalized = normalizeWikimediaUrl(url);
    if (!normalized || normalized.includes('flagcdn.com')) return null;
    const u = new URL(normalized);
    const match = u.pathname.match(/Special:FilePath\/(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function getProjectHost(url) {
  const normalized = normalizeWikimediaUrl(url);
  if (!normalized) return 'commons.wikimedia.org';
  try {
    return new URL(normalized).host;
  } catch {
    return 'commons.wikimedia.org';
  }
}

async function searchFiles(subject, projectHost) {
  const hosts = projectHost.includes('wikipedia.org')
    ? [projectHost]
    : ['commons.wikimedia.org', 'en.wikipedia.org'];
  const results = [];

  for (const host of hosts) {
    const searchUrl = `https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(subject)}&srnamespace=6&srlimit=10&format=json`;
    try {
      const res = await fetch(searchUrl);
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.query?.search || [];
      for (const r of items) {
        const filename = r.title.replace('File:', '');
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) {
          results.push({ host, filename, title: r.title });
        }
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 800));
  }
  return results;
}

function scoreResult(result, subject, isLogo) {
  const fn = result.filename.toLowerCase();
  const subj = subject.toLowerCase();
  let score = 0;

  if (isLogo) {
    if (fn.includes('logo')) score += 50;
    if (fn.endsWith('.svg')) score += 30;
    if (fn.includes('icon')) score += 10;
  } else {
    if (fn.endsWith('.jpg') || fn.endsWith('.jpeg')) score += 20;
  }

  // Prefer files whose name contains the subject words
  const subjWords = subj.split(/\s+/).filter((w) => w.length > 2);
  for (const w of subjWords) {
    if (fn.includes(w)) score += 15;
  }

  // Penalize unrelated terms
  const unrelated = ['locomotive', 'stamp', 'coin', 'banknote', 'diagram', 'map', 'signature'];
  for (const u of unrelated) {
    if (fn.includes(u)) score -= 40;
  }

  // Prefer shorter, clearer filenames
  if (fn.length < 60) score += 10;

  return score;
}

// Build missing list
const entryByNormalized = new Map();
const filenames = [];

for (const [libName, map] of Object.entries(libraries)) {
  for (const [key, url] of Object.entries(map)) {
    if (!url) continue;
    const filename = extractFilename(url);
    if (!filename) continue;
    const norm = normalizeTitle(filename);
    if (!entryByNormalized.has(norm)) {
      entryByNormalized.set(norm, { filename, url, projectHost: getProjectHost(url), libraries: [] });
      filenames.push(filename);
    }
    entryByNormalized.get(norm).libraries.push({ libName, key });
  }
}

const batchSize = 50;
const missing = [];

for (let i = 0; i < filenames.length; i += batchSize) {
  const batch = filenames.slice(i, i + batchSize);
  const titles = batch.map((f) => `File:${f}`).join('|');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) continue;
    const data = await res.json();
    for (const page of Object.values(data.query.pages)) {
      const normTitle = normalizeTitle(page.title);
      const entry = entryByNormalized.get(normTitle);
      if (!entry || page.missing !== undefined || !page.imageinfo) {
        missing.push({
          title: page.title,
          entry: entry || { url: '', projectHost: 'commons.wikimedia.org', libraries: [] },
        });
      }
    }
  } catch {}
  if (i + batchSize < filenames.length) await new Promise((r) => setTimeout(r, 2000));
}

console.log(`Found ${missing.length} missing files.\n`);

for (const item of missing) {
  const loc = item.entry.libraries[0];
  const subject = loc?.key || item.title.replace('File:', '');
  const searchTerm = TRANSLATIONS[subject.toLowerCase()] || subject;
  const isLogo = loc?.libName === 'LOGO_IMAGES';

  console.log(`\n--- ${loc?.libName}[${subject}] ---`);
  console.log(`Search: ${searchTerm}`);

  const results = await searchFiles(searchTerm, item.entry.projectHost);
  if (results.length === 0) {
    console.log('No candidates found');
    continue;
  }

  const scored = results
    .map((r) => ({ ...r, score: scoreResult(r, searchTerm, isLogo) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  for (const r of scored) {
    const url = `https://${r.host}/wiki/Special:FilePath/${encodeURIComponent(r.filename)}?width=960`;
    console.log(`  [${r.score}] ${url}`);
  }
}
