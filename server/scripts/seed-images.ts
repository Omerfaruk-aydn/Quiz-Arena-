import 'dotenv/config';
import { prisma } from '../config/prisma.js';
import {
  COUNTRY_FLAGS,
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
  FILM_IMAGES,
} from '../services/ai/imageLibrary.js';

type Category = 'flag' | 'logo' | 'film' | 'landmark' | 'person' | 'animal' | 'instrument' | 'artwork' | 'food' | 'nature' | 'architecture' | 'map';

const libraries: Array<{ category: Category; data: Record<string, string> }> = [
  { category: 'flag', data: COUNTRY_FLAGS },
  { category: 'logo', data: LOGO_IMAGES },
  { category: 'film', data: FILM_IMAGES },
  { category: 'landmark', data: LANDMARK_IMAGES },
  { category: 'person', data: PEOPLE_IMAGES },
  { category: 'animal', data: ANIMAL_IMAGES },
  { category: 'instrument', data: INSTRUMENT_IMAGES },
  { category: 'artwork', data: ARTWORK_IMAGES },
  { category: 'food', data: FOOD_IMAGES },
  { category: 'nature', data: NATURE_IMAGES },
  { category: 'architecture', data: ARCHITECTURE_IMAGES },
  { category: 'map', data: MAP_IMAGES },
];

function extractTagsFromUrl(url: string): string[] {
  const tags: string[] = [];
  const lower = url.toLowerCase();
  if (lower.includes('flagcdn')) tags.push('flagcdn');
  if (lower.includes('wikimedia')) tags.push('wikimedia');
  if (lower.includes('wikipedia')) tags.push('wikipedia');
  if (lower.includes('svg')) tags.push('svg');
  if (lower.includes('png')) tags.push('png');
  if (lower.includes('jpg')) tags.push('jpg');
  return tags;
}

async function seed() {
  console.log('🎨 Görsel Veritabanı seed başlıyor...\n');

  let total = 0;
  let success = 0;
  let fail = 0;

  for (const { category, data } of libraries) {
    const entries = Object.entries(data);
    console.log(`📁 ${category.toUpperCase()} (${entries.length} kayıt)`);

    for (const [keyword, url] of entries) {
      try {
        await prisma.gameImage.upsert({
          where: { category_keyword: { category, keyword: keyword.toLowerCase().trim() } },
          update: { url, tags: extractTagsFromUrl(url), isActive: true },
          create: {
            category,
            keyword: keyword.toLowerCase().trim(),
            url,
            thumbnail: url.replace(/width=\d+/, 'width=120'),
            source: 'wikimedia',
            tags: extractTagsFromUrl(url),
          },
        });
        success++;
      } catch (err) {
        fail++;
        process.stdout.write('x');
      }
      total++;
    }
    process.stdout.write(` ✓ ${entries.length} kayıt işlendi\n`);
  }

  console.log(`\n✅ Seed tamamlandı!`);
  console.log(`   Toplam: ${total}`);
  console.log(`   Başarılı: ${success}`);
  console.log(`   Hatalı: ${fail}`);

  const stats = await prisma.gameImage.groupBy({
    by: ['category'],
    _count: { id: true },
  });
  console.log(`\n📊 Kategori dağılımı:`);
  for (const s of stats.sort((a, b) => b._count.id - a._count.id)) {
    console.log(`   ${s.category}: ${s._count.id} görsel`);
  }

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
