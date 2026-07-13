import fs from 'fs';
import path from 'path';
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

const LIBRARY_FILE = path.resolve('src/services/ai/imageLibrary.ts');

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
};

function scoreResult(result, subject) {
  const fn = result.filename.toLowerCase();
  const subj = subject.toLowerCase();
  let score = 0;

  if (fn.endsWith('.jpg') || fn.endsWith('.jpeg')) score += 20;
  if (fn.endsWith('.svg')) score += 5;

  const subjWords = subj.split(/\s+/).filter((w) => w.length > 2);
  for (const w of subjWords) {
    if (fn.includes(w)) score += 25;
  }

  const unrelated = ['locomotive', 'stamp', 'coin', 'banknote', 'diagram', 'signature', 'postage'];
  for (const u of unrelated) {
    if (fn.includes(u)) score -= 100;
  }

  // Prefer clear filenames, not overly long descriptive ones
  if (fn.length < 80) score += 10;

  return score;
}

async function findReplacement(subject, projectHost) {
  const searchTerm = TRANSLATIONS[subject.toLowerCase()] || subject;
  const hosts = projectHost.includes('wikipedia.org')
    ? [projectHost]
    : ['commons.wikimedia.org', 'en.wikipedia.org'];

  for (const host of hosts) {
    const searchUrl = `https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=10&format=json`;
    try {
      const res = await fetch(searchUrl);
      if (!res.ok) continue;
      const data = await res.json();
      const results = (data.query?.search || []).map((r) => ({
        filename: r.title.replace('File:', ''),
        host,
      }));

      const scored = results
        .filter((r) => {
          const ext = path.extname(r.filename).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.svg'].includes(ext);
        })
        .map((r) => ({ ...r, score: scoreResult(r, searchTerm) }))
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0 && scored[0].score > 0) {
        const best = scored[0];
        return `https://${best.host}/wiki/Special:FilePath/${encodeURIComponent(best.filename)}?width=960`;
      }
    } catch (err) {
      console.log(`Search error on ${host} for "${searchTerm}":`, err.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
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

console.log(`Found ${missing.length} missing files. Searching replacements...\n`);

let fileContent = fs.readFileSync(LIBRARY_FILE, 'utf8');
let updated = 0;
let failed = 0;

for (const item of missing) {
  const locations = item.entry.libraries;
  const subject = locations[0]?.key || item.title.replace('File:', '');
  const cleanSubject = subject.replace(/[\(\)\[\]]/g, ' ').trim();

  const replacement = await findReplacement(cleanSubject, item.entry.projectHost);
  await new Promise((r) => setTimeout(r, 1500));

  if (!replacement) {
    console.log(`❌ No replacement found for "${subject}"`);
    failed++;
    continue;
  }

  // Replace the old URL in the source file. We replace the exact old URL string.
  const oldUrl = item.entry.url;
  if (!fileContent.includes(oldUrl)) {
    console.log(`⚠️  URL not found in source for "${subject}": ${oldUrl}`);
    failed++;
    continue;
  }

  fileContent = fileContent.replaceAll(oldUrl, replacement);
  console.log(`✅ "${subject}" → ${replacement}`);
  updated++;
}

fs.writeFileSync(LIBRARY_FILE, fileContent);
console.log(`\nUpdated ${updated} URLs, ${failed} failed.`);
