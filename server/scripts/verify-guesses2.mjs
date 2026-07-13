const guesses = [
  { lib: 'LANDMARK_IMAGES', key: 'forbidden city', filename: 'Sunset of the Forbidden City 2006.JPG' },
  { lib: 'ANIMAL_IMAGES', key: 'balina', filename: 'Blue whale fluke.jpg' },
  { lib: 'INSTRUMENT_IMAGES', key: 'kanun', filename: 'Qanun (instrument).jpg' },
  { lib: 'INSTRUMENT_IMAGES', key: 'saz', filename: 'Turkish saz.jpg' },
  { lib: 'ARTWORK_IMAGES', key: 'guernica', filename: 'Guernica (Picasso).jpg', host: 'en.wikipedia.org' },
  { lib: 'FOOD_IMAGES', key: 'döner', filename: 'Döner kebab.jpg' },
  { lib: 'FOOD_IMAGES', key: 'çiğ köfte', filename: 'Çiğ köfte.jpg' },
  { lib: 'FOOD_IMAGES', key: 'macaron', filename: 'Macarons.jpg' },
  { lib: 'FOOD_IMAGES', key: 'dim sum', filename: 'Dim sum.jpg' },
  { lib: 'NATURE_IMAGES', key: 'sahara', filename: 'Sahara desert.jpg' },
  { lib: 'NATURE_IMAGES', key: 'great barrier reef', filename: 'Great Barrier Reef.jpg' },
  { lib: 'NATURE_IMAGES', key: 'eyjafjallajökull', filename: 'Eyjafjallajökull.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'burj al arab', filename: 'Burj Al Arab.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'taipei 101', filename: 'Taipei 101.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'petronas towers', filename: 'Petronas Towers.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'guggenheim museum', filename: 'Guggenheim Museum Bilbao.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'fallingwater', filename: 'Fallingwater.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'sydney harbour bridge', filename: 'Sydney Harbour Bridge.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'pantheon', filename: 'Pantheon Rome.jpg' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const g of guesses) {
  const host = g.host || 'commons.wikimedia.org';
  const url = `https://${host}/w/api.php?action=query&titles=File:${encodeURIComponent(g.filename)}&prop=imageinfo&iiprop=url&format=json`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    if (text.includes('You are making too many requests')) {
      console.log(`⏸️  RATE LIMITED at ${g.lib}[${g.key}]`);
      break;
    }
    const data = JSON.parse(text);
    const page = Object.values(data.query.pages)[0];
    if (page.missing === undefined && page.imageinfo) {
      const fileUrl = `https://${host}/wiki/Special:FilePath/${encodeURIComponent(g.filename)}?width=960`;
      console.log(`✅ ${g.lib}[${g.key}] → ${fileUrl}`);
    } else {
      console.log(`❌ ${g.lib}[${g.key}] - ${g.filename} missing`);
    }
  } catch (err) {
    console.log(`❌ ${g.lib}[${g.key}] - error: ${err.message}`);
  }
  await sleep(2500);
}
