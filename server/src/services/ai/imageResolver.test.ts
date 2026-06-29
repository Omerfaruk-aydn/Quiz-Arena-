import {
  normalizeWikimediaUrl,
  resolveImageUrl,
  getRandomImageByType,
  fallbackResolveImage,
  isValidImageUrl,
} from './imageResolver.js';

describe('normalizeWikimediaUrl', () => {
  it('converts a Commons thumb URL with non-standard width to Special:FilePath', () => {
    const input =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/480px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg';
    const out = normalizeWikimediaUrl(input);
    expect(out).toBe(
      'https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg?width=960',
    );
  });

  it('converts a direct Commons file URL to Special:FilePath', () => {
    const input =
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg';
    const out = normalizeWikimediaUrl(input);
    expect(out).toBe(
      'https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg?width=960',
    );
  });

  it('preserves the Wikipedia project for non-Commons files', () => {
    const input = 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg';
    const out = normalizeWikimediaUrl(input);
    expect(out).toBe(
      'https://en.wikipedia.org/wiki/Special:FilePath/PicassoGuernica.jpg?width=960',
    );
  });

  it('converts an SVG thumb URL to Special:FilePath keeping the .svg filename', () => {
    const input =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Turkey_%28orthographic_projection%29.svg/400px-Turkey_%28orthographic_projection%29.svg.png';
    const out = normalizeWikimediaUrl(input);
    expect(out).toMatch(
      /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/Turkey_\(orthographic_projection\)\.svg\?width=\d+$/,
    );
  });

  it('leaves flagcdn URLs unchanged', () => {
    const input = 'https://flagcdn.com/w640/tr.png';
    expect(normalizeWikimediaUrl(input)).toBe(input);
  });

  it('leaves Special:FilePath URLs unchanged', () => {
    const input = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa.jpg?width=960';
    expect(normalizeWikimediaUrl(input)).toBe(input);
  });

  it('returns undefined for empty input', () => {
    expect(normalizeWikimediaUrl('')).toBeUndefined();
    expect(normalizeWikimediaUrl(undefined)).toBeUndefined();
  });
});

describe('resolveImageUrl', () => {
  it('returns a normalized flag URL for a known country', () => {
    const out = resolveImageUrl('flag', 'türkiye');
    expect(out).toBe('https://flagcdn.com/w640/tr.png');
  });

  it('returns a normalized Wikimedia URL for a known artwork', () => {
    const out = resolveImageUrl('artwork', 'mona lisa');
    expect(out).toBe(
      'https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg?width=960',
    );
  });

  it('returns undefined for unknown queries', () => {
    expect(resolveImageUrl('flag', 'unknown-country-xyz')).toBeUndefined();
  });

  it('handles missing type or query gracefully', () => {
    expect(resolveImageUrl(undefined, 'test')).toBeUndefined();
    expect(resolveImageUrl('flag', undefined)).toBeUndefined();
  });
});

describe('getRandomImageByType', () => {
  it('returns a valid flag URL', () => {
    const out = getRandomImageByType('flag');
    expect(out).toMatch(/^https:\/\/flagcdn\.com\/w640\/[a-z]{2}\.png$/);
  });

  it('returns a normalized Wikimedia URL for artwork', () => {
    const out = getRandomImageByType('artwork');
    expect(out).toMatch(
      /^https:\/\/(commons\.wikimedia\.org|en\.wikipedia\.org)\/wiki\/Special:FilePath\//,
    );
  });
});

describe('fallbackResolveImage', () => {
  it('detects a flag question and resolves the correct answer', () => {
    const out = fallbackResolveImage('Bu bayrak hangi ülkeye aittir?', 'Türkiye');
    expect(out).toBeDefined();
    expect(out?.type).toBe('flag');
    expect(out?.url).toBe('https://flagcdn.com/w640/tr.png');
  });

  it('detects an artwork question and resolves the correct answer', () => {
    const out = fallbackResolveImage(
      'Mona Lisa tablosunun ünlü İtalyan ressamı kimdir?',
      'Leonardo da Vinci',
    );
    expect(out).toBeDefined();
    expect(out?.type).toBe('artwork');
    expect(out?.url).toMatch(/Special:FilePath/);
  });

  it('returns undefined when no visual pattern matches', () => {
    const out = fallbackResolveImage('2+2 kaçtır?', '4');
    expect(out).toBeUndefined();
  });
});

describe('isValidImageUrl', () => {
  it('accepts https URLs', () => {
    expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
  });

  it('accepts http URLs', () => {
    expect(isValidImageUrl('http://example.com/image.png')).toBe(true);
  });

  it('rejects empty, whitespace-only or non-string values', () => {
    expect(isValidImageUrl('')).toBe(false);
    expect(isValidImageUrl('   ')).toBe(false);
    expect(isValidImageUrl(undefined)).toBe(false);
    expect(isValidImageUrl(null)).toBe(false);
  });

  it('rejects non-http protocols', () => {
    expect(isValidImageUrl('ftp://example.com/image.png')).toBe(false);
  });
});
