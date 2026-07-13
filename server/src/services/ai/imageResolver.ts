import {
  ANIMAL_IMAGES,
  ARCHITECTURE_IMAGES,
  ARTWORK_IMAGES,
  COUNTRY_FLAGS,
  FILM_IMAGES,
  FOOD_IMAGES,
  INSTRUMENT_IMAGES,
  LANDMARK_IMAGES,
  LOGO_IMAGES,
  MAP_IMAGES,
  NATURE_IMAGES,
  PEOPLE_IMAGES,
} from './imageLibrary.js';
import { LOGO_DOMAINS } from './logoDomains.js';
import { config } from '../../config/index.js';
import type { ImageType } from './types.js';

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

// AI'ın imageQuery alanına yazdığı gereksiz kelimeleri temizle.
// Örn: "Bu Apple logosudur" → "apple", "Türkiye'nin bayrağı" → "turkiye"
const STOPWORDS = [
  'bu', 'hangi', 'marka', 'markanin', 'logosu', 'logosudur', 'sirketi',
  'sirket', 'ulke', 'ulkenin', 'bayragi', 'bayragidir', 'baskent',
  'baskenti', 'baskentidir', 'film', 'filmi', 'sahne', 'poster',
  'kime', 'ait', 'nedir', 'kimdir', 'nerede', 'hangisi',
  'dogru', 'cevap', 'secenegi', 'secenek',
];

function extractSearchQuery(raw: string): string {
  const n = normalize(raw);
  if (n.length < 2) return n;
  const words = n.split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.includes(w));
  return words.length > 0 ? words.join(' ') : n;
}

function findPartial(query: string, map: Record<string, string>): string | undefined {
  const q = normalize(query);
  if (q.length < 2) return undefined;

  // Temizlenmiş sorgu ile de dene (AI gereksiz kelimeler eklemiş olabilir)
  const cleaned = extractSearchQuery(query);
  const queries = [q];
  if (cleaned !== q && cleaned.length >= 2) queries.push(cleaned);

  const keys = Object.keys(map);

  for (const tryQ of queries) {
    // 1) Key contains query (query = "türkiye", key = "türkiye cumhuriyeti")
    const keyContainsQuery = keys.find((k) => normalize(k).includes(tryQ));
    if (keyContainsQuery) return map[keyContainsQuery];

    // 2) Query contains key (query = long question text, key = "mona lisa")
    const queryContainsKey = keys.find((k) => {
      const nk = normalize(k);
      return nk.length >= 2 && tryQ.includes(nk);
    });
    if (queryContainsKey) return map[queryContainsKey];
  }

  return undefined;
}

function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DEFAULT_WIKIMEDIA_WIDTH = 960;

/**
 * Convert any Wikimedia Commons / Wikipedia file URL into a stable
 * Special:FilePath redirect URL with a standard thumbnail width.
 * This fixes two common breakage modes:
 * 1. Non-standard thumbnail widths (e.g. 440px, 640px) now return 400.
 * 2. Wrong hash directory segments in manually constructed URLs.
 *
 * Browser <img> tags follow the 302 redirect automatically.
 */
export function normalizeWikimediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.includes('wikimedia.org')) return url;

  // Already a Special:FilePath / Special:Redirect URL
  if (url.includes('Special:FilePath') || url.includes('Special:Redirect')) {
    return ensureStandardWidth(url);
  }

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    // Detect project: /wikipedia/commons/... or /wikipedia/en/... etc.
    let projectHost = 'commons.wikimedia.org';
    const wpIdx = pathParts.indexOf('wikipedia');
    if (wpIdx !== -1 && pathParts[wpIdx + 1]) {
      const project = pathParts[wpIdx + 1];
      if (project !== 'commons') {
        projectHost = `${project}.wikipedia.org`;
      }
    }

    let filename = pathParts[pathParts.length - 1];
    if (!filename) return url;

    // Strip thumbnail width prefix: "640px-Filename.jpg"
    filename = filename.replace(/^\d+px-/, '');

    // SVGs rendered as PNG have a double extension in thumb URLs
    if (filename.endsWith('.svg.png')) {
      filename = filename.slice(0, -4);
    }

    // Decode then re-encode so we don't double-encode
    filename = encodeURIComponent(decodeURIComponent(filename));

    return `https://${projectHost}/wiki/Special:FilePath/${filename}?width=${DEFAULT_WIKIMEDIA_WIDTH}`;
  } catch {
    return url;
  }
}

function ensureStandardWidth(url: string): string {
  const match = url.match(/[?&]width=(\d+)/);
  if (!match) return url;
  const width = parseInt(match[1], 10);
  const standard = nearestStandardWidth(width);
  if (standard === width) return url;
  return url.replace(/([?&]width=)\d+/, `$1${standard}`);
}

function nearestStandardWidth(width: number): number {
  const standard = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840];
  // Prefer the closest standard width, but cap at 960 for quiz images
  // to keep payloads reasonable while still looking sharp.
  const effective = Math.min(width, 960);
  let best = standard[0];
  let bestDiff = Infinity;
  for (const s of standard) {
    if (s > 960) continue;
    const diff = Math.abs(s - effective);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  return best;
}

export function resolveImageUrl(
  type: ImageType | string | undefined,
  query: string | undefined,
): string | undefined {
  if (!type || !query) return undefined;

  const t = normalize(String(type)).replace(/\s+/g, '_') as ImageType;
  const q = normalize(query);
  const cleaned = extractSearchQuery(query); // AI'ın gereksiz kelimelerini temizle

  let result: string | undefined;

  switch (t) {
    case 'flag': {
      // Doğrudan eşleşme (normalize edilmiş sorgu)
      const direct = COUNTRY_FLAGS[q] || COUNTRY_FLAGS[cleaned];
      if (direct) {
        // ISO kod mu yoksa tam URL mi kontrol et
        const isUrl = direct.startsWith('http://') || direct.startsWith('https://');
        result = isUrl ? direct : `https://flagpedia.net/data/flags/w580/${direct}.png`;
      } else {
        const partial = findPartial(query, COUNTRY_FLAGS);
        if (partial) {
          const isUrl = partial.startsWith('http://') || partial.startsWith('https://');
          result = isUrl ? partial : `https://flagpedia.net/data/flags/w580/${partial}.png`;
        }
      }
      break;
    }

    case 'landmark': {
      result = LANDMARK_IMAGES[q] || LANDMARK_IMAGES[cleaned] || findPartial(query, LANDMARK_IMAGES);
      break;
    }

    case 'person': {
      result = PEOPLE_IMAGES[q] || PEOPLE_IMAGES[cleaned] || findPartial(query, PEOPLE_IMAGES);
      break;
    }

    case 'logo': {
      // 1. Önce hardcoded görsel kütüphanesinde ara
      result = LOGO_IMAGES[q] || LOGO_IMAGES[cleaned] || findPartial(query, LOGO_IMAGES);

      // 2. Hardcoded'ta yoksa logo.dev/clearbit ile dene
      if (!result && cleaned) {
        const mappedDomain = LOGO_DOMAINS[cleaned] || LOGO_DOMAINS[q];
        let domain = mappedDomain;

        // Mapping yoksa, marka adından domain üret (basit heuristic)
        if (!domain) {
          const base = cleaned.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          if (base.length >= 2) {
            // Türk marka olabilir → önce .com.tr dene
            const isTurkish = /[çğıöşü]/i.test(cleaned) ||
              ['tr', 'türk', 'turk', 'türkiye', 'turkiye'].some((t) => cleaned.includes(t));
            domain = isTurkish ? `${base}.com.tr` : `${base}.com`;
          }
        }

        if (domain) {
          if (config.logoDev.apiKey) {
            result = `https://img.logo.dev/${domain}?token=${config.logoDev.apiKey}&size=256`;
          } else {
            // Fallback: clearbit.com API key yoksa
            result = `https://logo.clearbit.com/${domain}?size=256`;
          }
        }
      }
      break;
    }

    case 'film': {
      result = FILM_IMAGES[q] || FILM_IMAGES[cleaned] || findPartial(query, FILM_IMAGES);
      break;
    }

    case 'map': {
      result = MAP_IMAGES[q] || MAP_IMAGES[cleaned] || findPartial(query, MAP_IMAGES);
      break;
    }

    case 'artwork': {
      result = ARTWORK_IMAGES[q] || ARTWORK_IMAGES[cleaned] || findPartial(query, ARTWORK_IMAGES);
      break;
    }

    case 'animal': {
      result = ANIMAL_IMAGES[q] || ANIMAL_IMAGES[cleaned] || findPartial(query, ANIMAL_IMAGES);
      break;
    }

    case 'instrument': {
      result = INSTRUMENT_IMAGES[q] || INSTRUMENT_IMAGES[cleaned] || findPartial(query, INSTRUMENT_IMAGES);
      break;
    }

    case 'food': {
      result = FOOD_IMAGES[q] || FOOD_IMAGES[cleaned] || findPartial(query, FOOD_IMAGES);
      break;
    }

    case 'nature': {
      result = NATURE_IMAGES[q] || NATURE_IMAGES[cleaned] || findPartial(query, NATURE_IMAGES);
      break;
    }

    case 'architecture': {
      result = ARCHITECTURE_IMAGES[q] || ARCHITECTURE_IMAGES[cleaned] || findPartial(query, ARCHITECTURE_IMAGES);
      break;
    }

    default: {
      // Type bilinmiyorsa tüm kütüphanelerde ara
      const allMaps = [
        COUNTRY_FLAGS,
        LANDMARK_IMAGES,
        PEOPLE_IMAGES,
        LOGO_IMAGES,
        FILM_IMAGES,
        MAP_IMAGES,
        ARTWORK_IMAGES,
        ANIMAL_IMAGES,
        INSTRUMENT_IMAGES,
        FOOD_IMAGES,
        NATURE_IMAGES,
        ARCHITECTURE_IMAGES,
      ];
      for (const map of allMaps) {
        const found = map[q] || map[cleaned] || findPartial(query, map);
        if (found) {
          result = found;
          break;
        }
      }
    }
  }

  // Flag tipi için URL'yi özel olarak oluştur (normalizeWikimediaUrl flagcdn URL'lerini bozabilir)
  if (t === 'flag' && result && result.includes('flagcdn.com')) {
    return result;
  }

  return normalizeWikimediaUrl(result);
}

export function getRandomImageByType(type: ImageType): string | undefined {
  let result: string | undefined;

  switch (type) {
    case 'flag': {
      const codes = Object.values(COUNTRY_FLAGS);
      const code = pickRandom(codes);
      result = code ? `https://flagcdn.com/w640/${code}.png` : undefined;
      break;
    }
    case 'landmark':
      result = pickRandom(Object.values(LANDMARK_IMAGES));
      break;
    case 'person':
      result = pickRandom(Object.values(PEOPLE_IMAGES));
      break;
    case 'logo':
      result = pickRandom(Object.values(LOGO_IMAGES));
      break;
    case 'film':
      result = pickRandom(Object.values(FILM_IMAGES));
      break;
    case 'map':
      result = pickRandom(Object.values(MAP_IMAGES));
      break;
    case 'artwork':
      result = pickRandom(Object.values(ARTWORK_IMAGES));
      break;
    case 'animal':
      result = pickRandom(Object.values(ANIMAL_IMAGES));
      break;
    case 'instrument':
      result = pickRandom(Object.values(INSTRUMENT_IMAGES));
      break;
    case 'food':
      result = pickRandom(Object.values(FOOD_IMAGES));
      break;
    case 'nature':
      result = pickRandom(Object.values(NATURE_IMAGES));
      break;
    case 'architecture':
      result = pickRandom(Object.values(ARCHITECTURE_IMAGES));
      break;
    default:
      result = undefined;
  }

  return normalizeWikimediaUrl(result);
}

const TYPE_PATTERNS: Array<{ type: ImageType; patterns: RegExp[] }> = [
  // Very specific visual types first
  {
    type: 'flag',
    patterns: [/bayrak/, /hangi ulke/, /ulke bayragi/, /ulke hangi/],
  },
  {
    type: 'artwork',
    patterns: [/tablo/, /ressam/, /eser/, /kime ait/],
  },
  {
    type: 'instrument',
    patterns: [/muzik aleti/, /calgi/, /enstruman/],
  },
  {
    type: 'animal',
    patterns: [/hayvan/, /memeli/, /kus\b/, /balk\b/],
  },
  {
    type: 'food',
    patterns: [/yemek/, /yemegi/, /yiyecek/, /icecek/, /tatli\b/],
  },
  {
    type: 'landmark',
    patterns: [/unlu yapi/, /bu yapi/, /hangi sehir/, /sehir hangisi/, /nerede\b/, /anit\b/],
  },
  {
    type: 'logo',
    patterns: [/marka/, /logo/, /logosu/, /sirketi/],
  },
  {
    type: 'map',
    patterns: [/harita/, /haritadaki/],
  },
  {
    type: 'nature',
    patterns: [/dag\b/, /nehir/, /gol\b/, /orman/, /cologne/, /sahil/, /ada\b/, /yanardag/],
  },
  {
    type: 'architecture',
    patterns: [/bina/, /gokdelen/, /kopru/, /mimari/, /saray/, /kule\b/],
  },
  // Generic "person" patterns last so specific types win
  {
    type: 'person',
    patterns: [
      /bu kisi/,
      /hangi kisi/,
      /hangi bilim insani/,
      /hangi sanatci/,
      /hangi sporcu/,
      /hangi yazar/,
      /hangi lider/,
    ],
  },
];

export function detectImageType(text: string): ImageType | undefined {
  const t = normalize(text);
  for (const item of TYPE_PATTERNS) {
    if (item.patterns.some((p) => p.test(t))) {
      return item.type;
    }
  }
  return undefined;
}

export function fallbackResolveImage(
  text: string,
  correctAnswer: string,
): { url: string; type: ImageType } | undefined {
  const type = detectImageType(text);
  if (!type) {
    // Type tespit edilemediyse, doğru cevapla tüm kütüphanelerde ara
    const allTypes: ImageType[] = ['logo', 'flag', 'landmark', 'person', 'film', 'map', 'artwork', 'animal', 'instrument', 'food', 'nature', 'architecture'];
    for (const t of allTypes) {
      const resolved = resolveImageUrl(t, correctAnswer);
      if (resolved) return { url: resolved, type: t };
    }
    return undefined;
  }

  // 1. Doğru cevapla dene
  const resolved = resolveImageUrl(type, correctAnswer);
  if (resolved) return { url: resolved, type };

  // 2. Soru metniyle dene (bazı modlarda doğru bilgi soru metninde olabilir)
  const fromText = resolveImageUrl(type, text);
  if (fromText) return { url: fromText, type };

  // 3. Tüm kütüphanelerde ara (type yanlış tespit edilmiş olabilir)
  const allTypes: ImageType[] = ['logo', 'flag', 'landmark', 'person', 'film', 'map', 'artwork', 'animal', 'instrument', 'food', 'nature', 'architecture'];
  for (const t of allTypes) {
    if (t === type) continue; // zaten denendi
    const resolved2 = resolveImageUrl(t, correctAnswer);
    if (resolved2) return { url: resolved2, type: t };
  }

  return undefined;
}

/** Return true if the URL looks like a valid, non-empty image address. */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}
