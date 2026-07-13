const guesses = [
  { lib: 'INSTRUMENT_IMAGES', key: 'kanun', filename: 'Qanun (musical instrument).jpg' },
  { lib: 'INSTRUMENT_IMAGES', key: 'saz', filename: 'Saz (musical instrument).jpg' },
  { lib: 'ARTWORK_IMAGES', key: 'guernica', filename: 'Guernica (Mural).jpg', host: 'en.wikipedia.org' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'burj al arab', filename: 'Burj Al Arab, Dubai.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'guggenheim museum', filename: 'Guggenheim Bilbao.jpg' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'fallingwater', filename: 'Fallingwater - DSC05662.JPG' },
  { lib: 'ARCHITECTURE_IMAGES', key: 'fallingwater', filename: 'Wrightfallingwater.jpg' },
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
      console.log(`⏸️  RATE LIMITED at ${g.lib}[${g.key}] - ${g.filename}`);
      break;
    }
    const data = JSON.parse(text);
    const page = Object.values(data.query.pages)[0];
    if (page.missing === undefined && page.imageinfo) {
      const fileUrl = `https://${host}/wiki/Special:FilePath/${encodeURIComponent(g.filename)}?width=960`;
      console.log(`✅ ${g.lib}[${g.key}] (${g.filename}) → ${fileUrl}`);
    } else {
      console.log(`❌ ${g.lib}[${g.key}] - ${g.filename} missing`);
    }
  } catch (err) {
    console.log(`❌ ${g.lib}[${g.key}] - ${g.filename} error: ${err.message}`);
  }
  await sleep(2500);
}
