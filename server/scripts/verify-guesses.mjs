const guesses = [
  { lib: 'LANDMARK_IMAGES', key: 'angkor wat', filename: 'Angkor Wat.jpg' },
  { lib: 'LANDMARK_IMAGES', key: 'forbidden city', filename: 'Forbidden City Beijing.jpg' },
  { lib: 'LANDMARK_IMAGES', key: 'buckingham palace', filename: 'Buckingham Palace.jpg' },
  { lib: 'ANIMAL_IMAGES', key: 'balina', filename: 'Blue whale.jpg' },
  { lib: 'INSTRUMENT_IMAGES', key: 'kanun', filename: 'Qanun.jpg' },
  { lib: 'INSTRUMENT_IMAGES', key: 'saz', filename: 'Saz.jpg' },
  { lib: 'ARTWORK_IMAGES', key: 'the persistence of memory', filename: 'The Persistence of Memory.jpg', host: 'en.wikipedia.org' },
  { lib: 'ARTWORK_IMAGES', key: 'guernica', filename: 'Guernica.jpg', host: 'en.wikipedia.org' },
  { lib: 'FOOD_IMAGES', key: 'döner', filename: 'Doner kebab.jpg' },
  { lib: 'FOOD_IMAGES', key: 'çiğ köfte', filename: 'Cig kofte.jpg' },
  { lib: 'FOOD_IMAGES', key: 'pasta', filename: 'Pasta.jpg' },
  { lib: 'FOOD_IMAGES', key: 'macaron', filename: 'Macarons.jpg' },
  { lib: 'FOOD_IMAGES', key: 'dim sum', filename: 'Dim sum.jpg' },
  { lib: 'NATURE_IMAGES', key: 'sahara', filename: 'Sahara desert.jpg' },
  { lib: 'NATURE_IMAGES', key: 'great barrier reef', filename: 'Great Barrier Reef.jpg' },
  { lib: 'NATURE_IMAGES', key: 'eyjafjallajökull', filename: 'Eyjafjallajokull.jpg' },
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
    const data = await res.json();
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
  await sleep(1500);
}
