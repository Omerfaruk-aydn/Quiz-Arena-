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

function normalizeTitle(title) {
  return title.replace(/^File:/, '').replace(/_/g, ' ').trim().toLowerCase();
}

function extractFilename(url) {
  try {
    const normalized = normalizeWikimediaUrl(url);
    if (!normalized) return null;
    if (normalized.includes('flagcdn.com')) return null;
    const u = new URL(normalized);
    const match = u.pathname.match(/Special:FilePath\/(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

const entryByNormalized = new Map();
const filenames = [];

for (const [libName, map] of Object.entries(libraries)) {
  for (const [key, url] of Object.entries(map)) {
    if (!url) {
      console.log(`⚠️  ${libName}[${key}]: empty URL`);
      continue;
    }
    const filename = extractFilename(url);
    if (!filename) {
      console.log(`⚠️  ${libName}[${key}]: could not extract filename from ${url}`);
      continue;
    }
    const norm = normalizeTitle(filename);
    if (!entryByNormalized.has(norm)) {
      entryByNormalized.set(norm, { filename, libraries: [] });
      filenames.push(filename);
    }
    entryByNormalized.get(norm).libraries.push(`${libName}[${key}]`);
  }
}

console.log(`Checking ${filenames.length} unique Wikimedia files...\n`);

const batchSize = 50;
let missing = [];

for (let i = 0; i < filenames.length; i += batchSize) {
  const batch = filenames.slice(i, i + batchSize);
  const titles = batch.map((f) => `File:${f}`).join('|');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`API error ${res.status} for batch ${i / batchSize + 1}`);
      continue;
    }
    const data = await res.json();
    for (const page of Object.values(data.query.pages)) {
      const normTitle = normalizeTitle(page.title);
      const entry = entryByNormalized.get(normTitle);
      if (!entry || page.missing !== undefined || !page.imageinfo) {
        missing.push({
          title: page.title,
          normalized: normTitle,
          entry,
        });
      }
    }
  } catch (err) {
    console.log(`Fetch error for batch ${i / batchSize + 1}:`, err.message);
  }

  if (i + batchSize < filenames.length) {
    await new Promise((r) => setTimeout(r, 2000));
  }
}

if (missing.length === 0) {
  console.log('✅ All Wikimedia files in the library exist.');
} else {
  console.log(`❌ ${missing.length} missing files:\n`);
  for (const item of missing) {
    const locations = item.entry ? item.entry.libraries.join(', ') : 'unknown';
    console.log(`  ${item.title} (used in: ${locations})`);
  }
  process.exit(1);
}
