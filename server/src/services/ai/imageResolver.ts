import {
  ANIMAL_IMAGES,
  ARCHITECTURE_IMAGES,
  ARTWORK_IMAGES,
  COUNTRY_FLAGS,
  FOOD_IMAGES,
  INSTRUMENT_IMAGES,
  LANDMARK_IMAGES,
  LOGO_IMAGES,
  MAP_IMAGES,
  NATURE_IMAGES,
  PEOPLE_IMAGES,
} from './imageLibrary.js';
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

function findPartial(query: string, map: Record<string, string>): string | undefined {
  const q = normalize(query);
  if (q.length < 2) return undefined;

  // Query, key'in tamamını veya bir kısmını içeriyorsa (query = "türkiye", key = "türkiye cumhuriyeti")
  const exact = Object.keys(map).find((k) => normalize(k).includes(q));
  if (exact) return map[exact];

  return undefined;
}

function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function resolveImageUrl(
  type: ImageType | string | undefined,
  query: string | undefined,
): string | undefined {
  if (!type || !query) return undefined;

  const t = normalize(String(type)).replace(/\s+/g, '_') as ImageType;
  const q = normalize(query);

  switch (t) {
    case 'flag': {
      const direct = COUNTRY_FLAGS[q];
      if (direct) return `https://flagcdn.com/w640/${direct}.png`;
      const partial = findPartial(q, COUNTRY_FLAGS);
      if (partial) return `https://flagcdn.com/w640/${partial}.png`;
      return undefined;
    }

    case 'landmark': {
      return LANDMARK_IMAGES[q] || findPartial(q, LANDMARK_IMAGES);
    }

    case 'person': {
      return PEOPLE_IMAGES[q] || findPartial(q, PEOPLE_IMAGES);
    }

    case 'logo': {
      return LOGO_IMAGES[q] || findPartial(q, LOGO_IMAGES);
    }

    case 'map': {
      return MAP_IMAGES[q] || findPartial(q, MAP_IMAGES);
    }

    case 'artwork': {
      return ARTWORK_IMAGES[q] || findPartial(q, ARTWORK_IMAGES);
    }

    case 'animal': {
      return ANIMAL_IMAGES[q] || findPartial(q, ANIMAL_IMAGES);
    }

    case 'instrument': {
      return INSTRUMENT_IMAGES[q] || findPartial(q, INSTRUMENT_IMAGES);
    }

    case 'food': {
      return FOOD_IMAGES[q] || findPartial(q, FOOD_IMAGES);
    }

    case 'nature': {
      return NATURE_IMAGES[q] || findPartial(q, NATURE_IMAGES);
    }

    case 'architecture': {
      return ARCHITECTURE_IMAGES[q] || findPartial(q, ARCHITECTURE_IMAGES);
    }

    default: {
      // Type bilinmiyorsa tüm kütüphanelerde ara
      const allMaps = [
        COUNTRY_FLAGS,
        LANDMARK_IMAGES,
        PEOPLE_IMAGES,
        LOGO_IMAGES,
        MAP_IMAGES,
        ARTWORK_IMAGES,
        ANIMAL_IMAGES,
        INSTRUMENT_IMAGES,
        FOOD_IMAGES,
        NATURE_IMAGES,
        ARCHITECTURE_IMAGES,
      ];
      for (const map of allMaps) {
        const found = map[q] || findPartial(q, map);
        if (found) return found;
      }
      return undefined;
    }
  }
}

export function getRandomImageByType(type: ImageType): string | undefined {
  switch (type) {
    case 'flag': {
      const codes = Object.values(COUNTRY_FLAGS);
      const code = pickRandom(codes);
      return code ? `https://flagcdn.com/w640/${code}.png` : undefined;
    }
    case 'landmark':
      return pickRandom(Object.values(LANDMARK_IMAGES));
    case 'person':
      return pickRandom(Object.values(PEOPLE_IMAGES));
    case 'logo':
      return pickRandom(Object.values(LOGO_IMAGES));
    case 'map':
      return pickRandom(Object.values(MAP_IMAGES));
    case 'artwork':
      return pickRandom(Object.values(ARTWORK_IMAGES));
    case 'animal':
      return pickRandom(Object.values(ANIMAL_IMAGES));
    case 'instrument':
      return pickRandom(Object.values(INSTRUMENT_IMAGES));
    case 'food':
      return pickRandom(Object.values(FOOD_IMAGES));
    case 'nature':
      return pickRandom(Object.values(NATURE_IMAGES));
    case 'architecture':
      return pickRandom(Object.values(ARCHITECTURE_IMAGES));
    default:
      return undefined;
  }
}

const TYPE_PATTERNS: Array<{ type: ImageType; patterns: RegExp[] }> = [
  {
    type: 'flag',
    patterns: [/bayrak/, /hangi ulke/, /ulke bayragi/, /ulke hangi/],
  },
  {
    type: 'landmark',
    patterns: [/unlu yapi/, /bu yapi/, /hangi sehir/, /sehir hangisi/, /nerede\b/],
  },
  {
    type: 'person',
    patterns: [/bu kisi/, /kimdir\b/, /hangi bilim insani/, /hangi sanatci/, /hangi sporcu/],
  },
  {
    type: 'animal',
    patterns: [/bu hayvan/, /hangi hayvan/, /hayvanin adi/],
  },
  {
    type: 'instrument',
    patterns: [/bu muzik aleti/, /hangi muzik aleti/, /muzik aletinin adi/],
  },
  {
    type: 'food',
    patterns: [/bu yemek/, /hangi yemek/, /yemegin adi/, /yemek nedir/],
  },
  {
    type: 'artwork',
    patterns: [/bu eser/, /hangi eser/, /tablo/, /kime ait/],
  },
  {
    type: 'logo',
    patterns: [/bu marka/, /hangi marka/, /logo/, /logosudur/],
  },
  {
    type: 'map',
    patterns: [/haritada/, /bu harita/, /hangi ulke.*harita/],
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
  if (!type) return undefined;

  const resolved = resolveImageUrl(type, correctAnswer);
  if (resolved) return { url: resolved, type };

  if (type === 'artwork' || type === 'landmark' || type === 'person') {
    const fromText = resolveImageUrl(type, text);
    if (fromText) return { url: fromText, type };
  }

  return undefined;
}
