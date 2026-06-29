// ============================================================
// AI Görsel Soru Kütüphaneleri
// ------------------------------------------------------------
// Bu dosyada görsel tabanlı sorular için güvenilir, önceden
// seçilmiş görsel URL'leri tutulur. AI'dan gelen imageQuery
// bu kütüphanelerle eşleştirilerek gerçek görsel URL'leri üretilir.
// ============================================================

// Ülke bayrakları: ISO 3166-1 alpha-2 kodları
// https://flagcdn.com üzerinden yüksek kaliteli PNG bayraklar sunulur.
export const COUNTRY_FLAGS: Record<string, string> = {
  // Türkçe ve İngilizce isimler
  türkiye: 'tr',
  turkey: 'tr',
  'türkiye cumhuriyeti': 'tr',
  almanya: 'de',
  germany: 'de',
  fransa: 'fr',
  france: 'fr',
  i̇talya: 'it',
  italy: 'it',
  i̇spanya: 'es',
  spain: 'es',
  i̇ngiltere: 'gb',
  'united kingdom': 'gb',
  uk: 'gb',
  abd: 'us',
  'united states': 'us',
  'united states of america': 'us',
  amerika: 'us',
  'amerika birleşik devletleri': 'us',
  kanada: 'ca',
  canada: 'ca',
  brezilya: 'br',
  brazil: 'br',
  arjantin: 'ar',
  argentina: 'ar',
  mısır: 'eg',
  egypt: 'eg',
  çin: 'cn',
  china: 'cn',
  japonya: 'jp',
  japan: 'jp',
  hindistan: 'in',
  india: 'in',
  rusya: 'ru',
  russia: 'ru',
  'güney kore': 'kr',
  'south korea': 'kr',
  'kuzey kore': 'kp',
  'north korea': 'kp',
  avustralya: 'au',
  australia: 'au',
  'yeni zelanda': 'nz',
  'new zealand': 'nz',
  meksika: 'mx',
  mexico: 'mx',
  'güney afrika': 'za',
  'south africa': 'za',
  nijerya: 'ng',
  nigeria: 'ng',
  'suudi arabistan': 'sa',
  'saudi arabia': 'sa',
  i̇ran: 'ir',
  iran: 'ir',
  i̇srail: 'il',
  israel: 'il',
  yunanistan: 'gr',
  greece: 'gr',
  portekiz: 'pt',
  portugal: 'pt',
  hollanda: 'nl',
  netherlands: 'nl',
  belçika: 'be',
  belgium: 'be',
  i̇sviçre: 'ch',
  switzerland: 'ch',
  avusturya: 'at',
  austria: 'at',
  i̇sveç: 'se',
  sweden: 'se',
  norveç: 'no',
  norway: 'no',
  danimarka: 'dk',
  denmark: 'dk',
  finlandiya: 'fi',
  finland: 'fi',
  polonya: 'pl',
  poland: 'pl',
  ukrayna: 'ua',
  ukraine: 'ua',
  macaristan: 'hu',
  hungary: 'hu',
  çekya: 'cz',
  'czech republic': 'cz',
  romanya: 'ro',
  romania: 'ro',
  bulgaristan: 'bg',
  bulgaria: 'bg',
  sırbistan: 'rs',
  serbia: 'rs',
  hırvatistan: 'hr',
  croatia: 'hr',
  'bosna hersek': 'ba',
  'bosnia and herzegovina': 'ba',
  slovenya: 'si',
  slovenia: 'si',
  slovakya: 'sk',
  slovakia: 'sk',
  litvanya: 'lt',
  lithuania: 'lt',
  letonya: 'lv',
  latvia: 'lv',
  estonya: 'ee',
  estonia: 'ee',
  'beyaz rusya': 'by',
  belarus: 'by',
  moldova: 'md',
  azerbaycan: 'az',
  azerbaijan: 'az',
  gürcistan: 'ge',
  georgia: 'ge',
  ermenistan: 'am',
  armenia: 'am',
  kazakistan: 'kz',
  kazakhstan: 'kz',
  özbekistan: 'uz',
  uzbekistan: 'uz',
  türkmenistan: 'tm',
  turkmenistan: 'tm',
  kırgızistan: 'kg',
  kyrgyzstan: 'kg',
  pakistan: 'pk',
  bangladeş: 'bd',
  bangladesh: 'bd',
  endonezya: 'id',
  indonesia: 'id',
  malezya: 'my',
  malaysia: 'my',
  tayland: 'th',
  thailand: 'th',
  vietnam: 'vn',
  filipinler: 'ph',
  philippines: 'ph',
  myanmar: 'mm',
  kamboçya: 'kh',
  cambodia: 'kh',
  singapur: 'sg',
  singapore: 'sg',
  moğolistan: 'mn',
  mongolia: 'mn',
  nepal: 'np',
  'sri lanka': 'lk',
  umman: 'om',
  oman: 'om',
  'birleşik arap emirlikleri': 'ae',
  'united arab emirates': 'ae',
  uae: 'ae',
  katar: 'qa',
  qatar: 'qa',
  kuveyt: 'kw',
  kuwait: 'kw',
  bahreyn: 'bh',
  bahrain: 'bh',
  ürdün: 'jo',
  jordan: 'jo',
  lübnan: 'lb',
  lebanon: 'lb',
  irak: 'iq',
  iraq: 'iq',
  suriye: 'sy',
  syria: 'sy',
  fas: 'ma',
  morocco: 'ma',
  cezayir: 'dz',
  algeria: 'dz',
  tunus: 'tn',
  tunisia: 'tn',
  libya: 'ly',
  sudan: 'sd',
  etiyopya: 'et',
  ethiopia: 'et',
  kenya: 'ke',
  tanzanya: 'tz',
  tanzania: 'tz',
  uganda: 'ug',
  ruanda: 'rw',
  rwanda: 'rw',
  zimbabwe: 'zw',
  zambiya: 'zm',
  zambia: 'zm',
  botsvana: 'bw',
  botswana: 'bw',
  namibya: 'na',
  namibia: 'na',
  mozambik: 'mz',
  mozambique: 'mz',
  madagaskar: 'mg',
  madagascar: 'mg',
  senegal: 'sn',
  gana: 'gh',
  ghana: 'gh',
  kamerun: 'cm',
  cameroon: 'cm',
  'demokratik kongo cumhuriyeti': 'cd',
  'democratic republic of the congo': 'cd',
  'fildişi sahili': 'ci',
  'ivory coast': 'ci',
  mali: 'ml',
  'burkina faso': 'bf',
  nijer: 'ne',
  niger: 'ne',
  çad: 'td',
  chad: 'td',
  angola: 'ao',
  ekvador: 'ec',
  ecuador: 'ec',
  kolombiya: 'co',
  colombia: 'co',
  peru: 'pe',
  şili: 'cl',
  chile: 'cl',
  venezüella: 've',
  venezuela: 've',
  uruguay: 'uy',
  paraguay: 'py',
  bolivya: 'bo',
  bolivia: 'bo',
  küba: 'cu',
  cuba: 'cu',
  jamaika: 'jm',
  jamaica: 'jm',
  'dominik cumhuriyeti': 'do',
  'dominican republic': 'do',
  haiti: 'ht',
  panama: 'pa',
  'kosta rika': 'cr',
  'costa rica': 'cr',
  honduras: 'hn',
  guatemala: 'gt',
  nikaragua: 'ni',
  elsalvador: 'sv',
  'el salvador': 'sv',
};

// Wikimedia Commons üzerinden yüksek kaliteli landmark fotoğrafları
export const LANDMARK_IMAGES: Record<string, string> = {
  'eiffel tower':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/640px-Tour_Eiffel_Wikimedia_Commons.jpg',
  'eyfel kulesi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/640px-Tour_Eiffel_Wikimedia_Commons.jpg',
  'statue of liberty':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Lady_Liberty_under_a_blue_sky_%28cropped%29.jpg/640px-Lady_Liberty_under_a_blue_sky_%28cropped%29.jpg',
  'özgürlük heykeli':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Lady_Liberty_under_a_blue_sky_%28cropped%29.jpg/640px-Lady_Liberty_under_a_blue_sky_%28cropped%29.jpg',
  colosseum:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/640px-Colosseo_2020.jpg',
  'taj mahal':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/640px-Taj_Mahal_%28Edited%29.jpeg',
  'big ben':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Big%20Ben%20at%20sunset%20-%202014-10-27%2017-30.jpg?width=960',
  pyramids:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/640px-Kheops-Pyramid.jpg',
  'giza pyramids':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/640px-Kheops-Pyramid.jpg',
  'great wall of china':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/640px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
  'çin seddi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/640px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
  'sydney opera house':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sydney_Opera_House_-_Dec_2008.jpg/640px-Sydney_Opera_House_-_Dec_2008.jpg',
  'machu picchu':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/640px-Machu_Picchu%2C_Peru.jpg',
  petra:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Petra_Jordan_BW_36.JPG/640px-Petra_Jordan_BW_36.JPG',
  'christ the redeemer':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/480px-Christ_the_Redeemer_-_Cristo_Redentor.jpg',
  'kurtarıcı i̇sa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/480px-Christ_the_Redeemer_-_Cristo_Redentor.jpg',
  'burj khalifa':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Burj_Khalifa_(16260269606).jpg?width=960',
  'sagrada familia':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Sagrada%20Familia%20March%202015-19bw.jpg?width=960',
  'leaning tower of pisa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/The_Leaning_Tower_of_Pisa_SB.jpeg/480px-The_Leaning_Tower_of_Pisa_SB.jpeg',
  'pisa kulesi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/The_Leaning_Tower_of_Pisa_SB.jpeg/480px-The_Leaning_Tower_of_Pisa_SB.jpeg',
  'times square':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/640px-New_york_times_square-terabass.jpg',
  'louvre museum':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/640px-Louvre_Museum_Wikimedia_Commons.jpg',
  'louvre müzesi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/640px-Louvre_Museum_Wikimedia_Commons.jpg',
  acropolis:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Attica%2006-13%20Athens%2050%20View%20from%20Philopappos%20-%20Acropolis%20Hill.jpg?width=960',
  akropol:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Attica%2006-13%20Athens%2050%20View%20from%20Philopappos%20-%20Acropolis%20Hill.jpg?width=960',
  'mount fuji':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Mount_Fuji_from_Lake_Kawaguchi.jpg/640px-Mount_Fuji_from_Lake_Kawaguchi.jpg',
  'fuji dağı':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Mount_Fuji_from_Lake_Kawaguchi.jpg/640px-Mount_Fuji_from_Lake_Kawaguchi.jpg',
  santorini:
    'https://commons.wikimedia.org/wiki/Special:FilePath/1000%20Three%20domes%20of%20Oia%20in%20Santorini%20Photo%20by%20Giles%20Laurent.jpg?width=960',
  'hagia sophia':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/640px-Hagia_Sophia_Mars_2013.jpg',
  ayasofya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/640px-Hagia_Sophia_Mars_2013.jpg',
  'blue mosque':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_Mosque_(Istanbul).jpg?width=960',
  'sultanahmet camii':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_Mosque_(Istanbul).jpg?width=960',
  'topkapi palace':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Istanbul%20asv2020-02%20img19%20Topkap%C4%B1%20Palace.jpg?width=960',
  'topkapı sarayı':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Istanbul%20asv2020-02%20img19%20Topkap%C4%B1%20Palace.jpg?width=960',
  cappadocia:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cappadocia_balloons.jpg/640px-Cappadocia_balloons.jpg',
  kapadokya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cappadocia_balloons.jpg/640px-Cappadocia_balloons.jpg',
  pamukkale:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Pamukkale_1.jpg/640px-Pamukkale_1.jpg',
  'niagara falls':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/640px-3Falls_Niagara.jpg',
  'niagara şelalesi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/640px-3Falls_Niagara.jpg',
  'grand canyon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Grand_Canyon_view_from_Pima_Point_2010.jpg/640px-Grand_Canyon_view_from_Pima_Point_2010.jpg',
  'victoria falls':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Victoria_Falls_2012.jpg/640px-Victoria_Falls_2012.jpg',
  'angkor wat': 'https://commons.wikimedia.org/wiki/Special:FilePath/Angkor%20Wat.jpg?width=960',
  stonehenge:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/640px-Stonehenge2007_07_30.jpg',
  'neuschwanstein castle':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Schloss_Neuschwanstein_2013.jpg/480px-Schloss_Neuschwanstein_2013.jpg',
  'mont saint-michel':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Le_Mont-Saint-Michel.jpg/640px-Le_Mont-Saint-Michel.jpg',
  'forbidden city':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Sunset%20of%20the%20Forbidden%20City%202006.JPG?width=960',
  'buckingham palace':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Buckingham%20Palace.jpg?width=960',
  'white house':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_north_and_south_sides.jpg/640px-White_House_north_and_south_sides.jpg',
  'beyaz saray':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_north_and_south_sides.jpg/640px-White_House_north_and_south_sides.jpg',
  kremlin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Moscow_Kremlin_and_Bolshoy_Kamenny_Bridge.jpg/640px-Moscow_Kremlin_and_Bolshoy_Kamenny_Bridge.jpg',
};

// Wikimedia Commons üzerinden ünlü kişi portreleri
export const PEOPLE_IMAGES: Record<string, string> = {
  'mustafa kemal atatürk':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Ataturk1930s.jpg/440px-Ataturk1930s.jpg',
  atatürk:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Ataturk1930s.jpg/440px-Ataturk1930s.jpg',
  'albert einstein':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
  einstein:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
  'marie curie':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg',
  curie:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg',
  'isaac newton':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/440px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg',
  newton:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/440px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg',
  'charles darwin':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/440px-Charles_Darwin_seated_crop.jpg',
  darwin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/440px-Charles_Darwin_seated_crop.jpg',
  'leonardo da vinci':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/440px-Leonardo_self.jpg',
  'vincent van gogh':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/440px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
  'pablo picasso':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Portrait_de_Picasso%2C_1908.jpg/440px-Portrait_de_Picasso%2C_1908.jpg',
  'wolfgang amadeus mozart':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/440px-Wolfgang-amadeus-mozart_1.jpg',
  mozart:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/440px-Wolfgang-amadeus-mozart_1.jpg',
  beethoven:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/440px-Beethoven.jpg',
  'ludwig van beethoven':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/440px-Beethoven.jpg',
  'william shakespeare':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/440px-Shakespeare.jpg',
  shakespeare:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/440px-Shakespeare.jpg',
  'napoleon bonaparte':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/440px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg',
  napolyon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/440px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg',
  cleopatra:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/440px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg',
  kLEOPATRA:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/440px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg',
  'mahatma gandhi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg',
  gandhi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg',
  'nelson mandela':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/440px-Nelson_Mandela_1994.jpg',
  mandela:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/440px-Nelson_Mandela_1994.jpg',
  'winston churchill':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/440px-Sir_Winston_Churchill_-_19086236948.jpg',
  churchill:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/440px-Sir_Winston_Churchill_-_19086236948.jpg',
  'nikola tesla':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/440px-N.Tesla.JPG',
  tesla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/440px-N.Tesla.JPG',
  'thomas edison':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/440px-Thomas_Edison2.jpg',
  edison:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/440px-Thomas_Edison2.jpg',
  'marie antoinette':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Marie-Antoinette%2C_1775_-_Mus%C3%A9e_Antoine_L%C3%A9cuyer.jpg/440px-Marie-Antoinette%2C_1775_-_Mus%C3%A9e_Antoine_L%C3%A9cuyer.jpg',
  'alexander the great':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Alexander_the_Great_mosaic.jpg/440px-Alexander_the_Great_mosaic.jpg',
  'büyük i̇skender':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Alexander_the_Great_mosaic.jpg/440px-Alexander_the_Great_mosaic.jpg',
  'julius caesar':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Statue%20of%20Julius%20Caesar%20in%20Turin.jpg?width=960',
  sezar:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Statue%20of%20Julius%20Caesar%20in%20Turin.jpg?width=960',
  'leonardo dicaprio':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/440px-Leonardo_Dicaprio_Cannes_2019.jpg',
  'marilyn monroe':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Marilyn_Monroe_photo_pose_Seven_Year_Itch.jpg/440px-Marilyn_Monroe_photo_pose_Seven_Year_Itch.jpg',
  'audrey hepburn':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Audrey_Hepburn_1956.jpg/440px-Audrey_Hepburn_1956.jpg',
};

// Hayvan fotoğrafları
export const ANIMAL_IMAGES: Record<string, string> = {
  aslan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg',
  lion: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg',
  kaplan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Walking_tiger_female.jpg/640px-Walking_tiger_female.jpg',
  tiger:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Walking_tiger_female.jpg/640px-Walking_tiger_female.jpg',
  fil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/640px-African_Bush_Elephant.jpg',
  elephant:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/640px-African_Bush_Elephant.jpg',
  zürafa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/640px-Giraffe_Mikumi_National_Park.jpg',
  giraffe:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/640px-Giraffe_Mikumi_National_Park.jpg',
  panda:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/640px-Grosser_Panda.JPG',
  'giant panda':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/640px-Grosser_Panda.JPG',
  'dev panda':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/640px-Grosser_Panda.JPG',
  penguen:
    'https://commons.wikimedia.org/wiki/Special:FilePath/A_chinstrap_penguin_(Pygoscelis_antarcticus)_on_Deception_Island_in_Antarctica.jpg?width=960',
  penguin:
    'https://commons.wikimedia.org/wiki/Special:FilePath/A_chinstrap_penguin_(Pygoscelis_antarcticus)_on_Deception_Island_in_Antarctica.jpg?width=960',
  'beyaz ayı':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Polar%20bear%20(Ursus%20maritimus)%20in%20the%20drift%20ice%20region%20north%20of%20Svalbard.jpg?width=960',
  'polar bear':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Polar%20bear%20(Ursus%20maritimus)%20in%20the%20drift%20ice%20region%20north%20of%20Svalbard.jpg?width=960',
  ' kutup ayısı':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Polar%20bear%20(Ursus%20maritimus)%20in%20the%20drift%20ice%20region%20north%20of%20Svalbard.jpg?width=960',
  kanguru:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Eastern%20Grey%20Kangaroo%20Feeding%20edited.jpg?width=960',
  kangaroo:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Eastern%20Grey%20Kangaroo%20Feeding%20edited.jpg?width=960',
  koala:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Koala_climbing_tree.jpg/640px-Koala_climbing_tree.jpg',
  baykuş:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Athene_noctua_%28cropped%29.jpg/640px-Athene_noctua_%28cropped%29.jpg',
  owl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Athene_noctua_%28cropped%29.jpg/640px-Athene_noctua_%28cropped%29.jpg',
  kartal:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Golden_Eagle_flying.jpg/640px-Golden_Eagle_flying.jpg',
  eagle:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Golden_Eagle_flying.jpg/640px-Golden_Eagle_flying.jpg',
  yunus:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Eilat%20Dolphin%20Reef%20(3).jpg?width=960',
  dolphin:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Eilat%20Dolphin%20Reef%20(3).jpg?width=960',
  köpekbalığı:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Great_white_shark_south_africa.jpg/640px-Great_white_shark_south_africa.jpg',
  shark:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Great_white_shark_south_africa.jpg/640px-Great_white_shark_south_africa.jpg',
  'büyük beyaz köpekbalığı':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Great_white_shark_south_africa.jpg/640px-Great_white_shark_south_africa.jpg',
  'great white shark':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Great_white_shark_south_africa.jpg/640px-Great_white_shark_south_africa.jpg',
  flamingo:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flamingos_Laguna_Colorada.jpg/640px-Flamingos_Laguna_Colorada.jpg',
  timsah:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Nile_crocodile_head.jpg/640px-Nile_crocodile_head.jpg',
  crocodile:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Nile_crocodile_head.jpg/640px-Nile_crocodile_head.jpg',
  'nile crocodile':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Nile_crocodile_head.jpg/640px-Nile_crocodile_head.jpg',
  goril:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Male_gorilla_in_SF_zoo.jpg/640px-Male_gorilla_in_SF_zoo.jpg',
  gorilla:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Male_gorilla_in_SF_zoo.jpg/640px-Male_gorilla_in_SF_zoo.jpg',
  şempanze:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Pan_troglodytes_%28male%29.jpg/640px-Pan_troglodytes_%28male%29.jpg',
  chimpanzee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Pan_troglodytes_%28male%29.jpg/640px-Pan_troglodytes_%28male%29.jpg',
  tilki:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Vulpes_vulpes_sitting.jpg/640px-Vulpes_vulpes_sitting.jpg',
  fox: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Vulpes_vulpes_sitting.jpg/640px-Vulpes_vulpes_sitting.jpg',
  'red fox':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Vulpes_vulpes_sitting.jpg/640px-Vulpes_vulpes_sitting.jpg',
  kurt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Eurasian_wolf_2.jpg/640px-Eurasian_wolf_2.jpg',
  wolf: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Eurasian_wolf_2.jpg/640px-Eurasian_wolf_2.jpg',
  geyik: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red%20Deer%20Poing.JPG?width=960',
  deer: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red%20Deer%20Poing.JPG?width=960',
  reindeer: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red%20Deer%20Poing.JPG?width=960',
  'ren geyiği':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Red%20Deer%20Poing.JPG?width=960',
  balina: 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Whale.jpg?width=960',
  whale: 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Whale.jpg?width=960',
  'mavi balina': 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Whale.jpg?width=960',
  'blue whale': 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Whale.jpg?width=960',
  kelebek:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Monarch_In_May.jpg/640px-Monarch_In_May.jpg',
  butterfly:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Monarch_In_May.jpg/640px-Monarch_In_May.jpg',
  'monarch butterfly':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Monarch_In_May.jpg/640px-Monarch_In_May.jpg',
  arı: 'https://commons.wikimedia.org/wiki/Special:FilePath/European%20honey%20bee%20extracts%20nectar.jpg?width=960',
  bee: 'https://commons.wikimedia.org/wiki/Special:FilePath/European%20honey%20bee%20extracts%20nectar.jpg?width=960',
  'honey bee':
    'https://commons.wikimedia.org/wiki/Special:FilePath/European%20honey%20bee%20extracts%20nectar.jpg?width=960',
};

// Müzik aletleri
export const INSTRUMENT_IMAGES: Record<string, string> = {
  gitar:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/GuitareClassique5.png/480px-GuitareClassique5.png',
  guitar:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/GuitareClassique5.png/480px-GuitareClassique5.png',
  keman:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Violin_VL100.jpg/480px-Violin_VL100.jpg',
  violin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Violin_VL100.jpg/480px-Violin_VL100.jpg',
  piyano:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Steinway_%26_Sons_concert_grand_piano%2C_model_D-274%2C_manufactured_at_Steinway%27s_factory_in_Hamburg%2C_Germany.png/480px-Steinway_%26_Sons_concert_grand_piano%2C_model_D-274%2C_manufactured_at_Steinway%27s_factory_in_Hamburg%2C_Germany.png',
  piano:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Steinway_%26_Sons_concert_grand_piano%2C_model_D-274%2C_manufactured_at_Steinway%27s_factory_in_Hamburg%2C_Germany.png/480px-Steinway_%26_Sons_concert_grand_piano%2C_model_D-274%2C_manufactured_at_Steinway%27s_factory_in_Hamburg%2C_Germany.png',
  davul:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drum_kit.jpg/480px-Drum_kit.jpg',
  drums:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drum_kit.jpg/480px-Drum_kit.jpg',
  'drum kit':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drum_kit.jpg/480px-Drum_kit.jpg',
  flüt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Western_concert_flute.jpg/480px-Western_concert_flute.jpg',
  flute:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Western_concert_flute.jpg/480px-Western_concert_flute.jpg',
  trampet:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Yamaha%20Trumpet%20YTR-8335LA%20crop.jpg?width=960',
  trumpet:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Yamaha%20Trumpet%20YTR-8335LA%20crop.jpg?width=960',
  saksofon: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Saxophone.jpg?width=960',
  saxophone: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Saxophone.jpg?width=960',
  korno:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/French_horn_front.png/480px-French_horn_front.png',
  'french horn':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/French_horn_front.png/480px-French_horn_front.png',
  arp: 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20musical%20instrument.%20A%20harp.jpg?width=960',
  harp: 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20musical%20instrument.%20A%20harp.jpg?width=960',
  viyola:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bratsche.jpg/480px-Bratsche.jpg',
  viola:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bratsche.jpg/480px-Bratsche.jpg',
  çello:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Cello_front_side.png/480px-Cello_front_side.png',
  cello:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Cello_front_side.png/480px-Cello_front_side.png',
  kontrabas:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/AGK_bass1_full.jpg/480px-AGK_bass1_full.jpg',
  'double bass':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/AGK_bass1_full.jpg/480px-AGK_bass1_full.jpg',
  bateri:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drum_kit.jpg/480px-Drum_kit.jpg',
  akordeon:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Blind%20accordion%20player.jpg?width=960',
  accordion:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Blind%20accordion%20player.jpg?width=960',
  mandolin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mandolin_1.jpg/480px-Mandolin_1.jpg',
  ukulele: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ukulele.jpg?width=960',
  kanun:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Qanun%20(instrument)%20Musical%20Instrument%2001.jpg?width=960',
  saz: 'https://commons.wikimedia.org/wiki/Special:FilePath/SAZ%20Instrument%205270.jpg?width=960',
  ney: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ney.jpg/480px-Ney.jpg',
};

// Sanat eserleri
export const ARTWORK_IMAGES: Record<string, string> = {
  'mona lisa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/480px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  'the scream':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/480px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
  çığlık:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/480px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
  'starry night':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  'yıldızlı gece':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  'the persistence of memory':
    'https://en.wikipedia.org/wiki/Special:FilePath/The%20Persistence%20of%20Memory.jpg?width=960',
  memory:
    'https://en.wikipedia.org/wiki/Special:FilePath/The%20Persistence%20of%20Memory.jpg?width=960',
  'the last supper':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/640px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
  'son akşam yemeği':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/640px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
  'girl with a pearl earring':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/480px-1665_Girl_with_a_Pearl_Earring.jpg',
  'incili küpeyle kız':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/480px-1665_Girl_with_a_Pearl_Earring.jpg',
  'the birth of venus':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/640px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
  'venüsün doğuşu':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/640px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
  'the great wave':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/640px-Great_Wave_off_Kanagawa2.jpg',
  kanagawa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/640px-Great_Wave_off_Kanagawa2.jpg',
  'kanagawa büyük dalgası':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/640px-Great_Wave_off_Kanagawa2.jpg',
  guernica:
    'https://en.wikipedia.org/wiki/Special:FilePath/Pablo%20Picasso%27s%20Guernica.jpg?width=960',
  'the night watch':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/640px-The_Night_Watch_-_HD.jpg',
  'gece nöbeti':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/640px-The_Night_Watch_-_HD.jpg',
  'american gothic':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/480px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg',
  'the kiss':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/480px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
  öpücük:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/480px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
};

// Yemekler
export const FOOD_IMAGES: Record<string, string> = {
  sushi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/640px-Sushi_platter.jpg',
  pizza:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/640px-Eq_it-na_pizza-margherita_sep2005_sml.jpg',
  hamburger:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/640px-Hamburger_%28black_bg%29.jpg',
  döner: 'https://commons.wikimedia.org/wiki/Special:FilePath/D%C3%B6ner%20kebab.jpg?width=960',
  'döner kebap':
    'https://commons.wikimedia.org/wiki/Special:FilePath/D%C3%B6ner%20kebab.jpg?width=960',
  lahmacun:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Lahmacun.jpg/640px-Lahmacun.jpg',
  baklava:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Baklava%281%29.png/640px-Baklava%281%29.png',
  mantı: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Manti.jpg/640px-Manti.jpg',
  'çiğ köfte':
    'https://commons.wikimedia.org/wiki/Special:FilePath/%C3%87i%C4%9F%20k%C3%B6fte.jpg?width=960',
  pide: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Turkish_pide.jpg/640px-Turkish_pide.jpg',
  paella:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Paella_de_marisco.jpg/640px-Paella_de_marisco.jpg',
  tacos:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg/640px-001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg',
  pasta: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pasta.jpg?width=960',
  spaghetti: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pasta.jpg?width=960',
  ramen:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shoyu_Ramen.jpg/640px-Shoyu_Ramen.jpg',
  croissant:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Croissant%2C_cross_section.jpg/640px-Croissant%2C_cross_section.jpg',
  macaron: 'https://commons.wikimedia.org/wiki/Special:FilePath/Macarons.jpg?width=960',
  falafel:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Falafel_balls.jpg/640px-Falafel_balls.jpg',
  hummus:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hummus_from_The_Nile.jpg/640px-Hummus_from_The_Nile.jpg',
  kimchi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Korean_cuisine-Kimchi-01.jpg/640px-Korean_cuisine-Kimchi-01.jpg',
  'dim sum': 'https://commons.wikimedia.org/wiki/Special:FilePath/Dim%20sum.jpg?width=960',
  burrito:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Burrito_with_rice.jpg/640px-Burrito_with_rice.jpg',
};

// Doğa ve manzara
export const NATURE_IMAGES: Record<string, string> = {
  'aurora borealis':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg/640px-Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg',
  'kutup ışıkları':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg/640px-Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg',
  'grand canyon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Grand_Canyon_view_from_Pima_Point_2010.jpg/640px-Grand_Canyon_view_from_Pima_Point_2010.jpg',
  'victoria falls':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Victoria_Falls_2012.jpg/640px-Victoria_Falls_2012.jpg',
  'niagara falls':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/640px-3Falls_Niagara.jpg',
  'mount everest':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg/640px-Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg',
  everest:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg/640px-Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg',
  sahara: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sahara%20desert.jpg?width=960',
  'amazon rainforest':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Amazon_rainforest.jpg/640px-Amazon_rainforest.jpg',
  'amazon yağmur ormanları':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Amazon_rainforest.jpg/640px-Amazon_rainforest.jpg',
  'great barrier reef':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Barrier%20Reef.jpg?width=960',
  'büyük set resifi':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Barrier%20Reef.jpg?width=960',
  matterhorn:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg/640px-Matterhorn_from_Domh%C3%BCtte_-_2.jpg',
  uluru:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Uluru_Australia.jpg/640px-Uluru_Australia.jpg',
  eyjafjallajökull:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Eyjafjallaj%C3%B6kull.jpg?width=960',
};

// Mimarlık yapıları (landmark dışında)
export const ARCHITECTURE_IMAGES: Record<string, string> = {
  'burj al arab':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Burj%20Al%20Arab%2C%20Dubai.jpg?width=960',
  'burj khalifa':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Burj_Khalifa_(16260269606).jpg?width=960',
  'empire state building':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/480px-Empire_State_Building_%28aerial_view%29.jpg',
  'taipei 101': 'https://commons.wikimedia.org/wiki/Special:FilePath/Taipei%20101.jpg?width=960',
  'petronas towers':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Petronas%20Towers.jpg?width=960',
  'guggenheim museum':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Guggenheim%20Bilbao.jpg?width=960',
  fallingwater:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Wrightfallingwater.jpg?width=960',
  'sydney harbour bridge':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Sydney%20Harbour%20Bridge.jpg?width=960',
  pantheon: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pantheon%20Rome.jpg?width=960',
  'notre dame':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Notre-Dame_de_Paris_2013-07-24.jpg/480px-Notre-Dame_de_Paris_2013-07-24.jpg',
};

// Marka logoları (Wikimedia Commons / Wikipedia üzerinden)
export const LOGO_IMAGES: Record<string, string> = {
  apple:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png',
  nike: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/250px-Logo_NIKE.svg.png',
  mcdonalds:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/200px-McDonald%27s_Golden_Arches.svg.png',
  mercedes:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png',
  bmw: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png',
  adidas:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/250px-Adidas_Logo.svg.png',
  puma: 'https://commons.wikimedia.org/wiki/Special:FilePath/Puma-logo-(text).svg?width=960',
  'coca cola':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/300px-Coca-Cola_logo.svg.png',
  cocacola:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/300px-Coca-Cola_logo.svg.png',
  pepsi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Pepsi_logo_2014.svg/200px-Pepsi_logo_2014.svg.png',
  starbucks:
    'https://en.wikipedia.org/wiki/Special:FilePath/Starbucks%20Coffee%20Logo.svg?width=960',
  amazon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/300px-Amazon_logo.svg.png',
  google:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/300px-Google_2015_logo.svg.png',
  microsoft:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
  facebook:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/200px-2021_Facebook_icon.svg.png',
  twitter:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/200px-Logo_of_Twitter.svg.png',
  x: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/200px-X_logo_2023.svg.png',
  instagram:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/200px-Instagram_logo_2016.svg.png',
  youtube:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_squircle_%282017%29.svg/200px-YouTube_social_white_squircle_%282017%29.svg.png',
  spotify:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png',
  netflix:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/300px-Netflix_2015_logo.svg.png',
  tesla:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/200px-Tesla_Motors.svg.png',
  toyota:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/200px-Toyota_carlogo.svg.png',
  volkswagen:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png',
  audi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi_logo.svg/200px-Audi_logo.svg.png',
  ferrari: 'https://en.wikipedia.org/wiki/Special:FilePath/Prancing%20horse.svg?width=960',
  lamborghini: 'https://en.wikipedia.org/wiki/Special:FilePath/Lamborghini%20Logo.svg?width=960',
  porsche:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Porsche-Automarken-Logo.jpg?width=960',
};

// Ülke haritaları (orthographic projection)
export const MAP_IMAGES: Record<string, string> = {
  türkiye:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Turkey_%28orthographic_projection%29.svg/400px-Turkey_%28orthographic_projection%29.svg.png',
  turkey:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Turkey_%28orthographic_projection%29.svg/400px-Turkey_%28orthographic_projection%29.svg.png',
  almanya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/EU-Germany_%28orthographic_projection%29.svg/400px-EU-Germany_%28orthographic_projection%29.svg.png',
  germany:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/EU-Germany_%28orthographic_projection%29.svg/400px-EU-Germany_%28orthographic_projection%29.svg.png',
  fransa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/EU-France_%28orthographic_projection%29.svg/400px-EU-France_%28orthographic_projection%29.svg.png',
  france:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/EU-France_%28orthographic_projection%29.svg/400px-EU-France_%28orthographic_projection%29.svg.png',
  i̇talya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Italy_%28orthographic_projection%29.svg/400px-Italy_%28orthographic_projection%29.svg.png',
  italy:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Italy_%28orthographic_projection%29.svg/400px-Italy_%28orthographic_projection%29.svg.png',
  i̇spanya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/EU-Spain_%28orthographic_projection%29.svg/400px-EU-Spain_%28orthographic_projection%29.svg.png',
  spain:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/EU-Spain_%28orthographic_projection%29.svg/400px-EU-Spain_%28orthographic_projection%29.svg.png',
  i̇ngiltere:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/United_Kingdom_%28orthographic_projection%29.svg/400px-United_Kingdom_%28orthographic_projection%29.svg.png',
  'united kingdom':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/United_Kingdom_%28orthographic_projection%29.svg/400px-United_Kingdom_%28orthographic_projection%29.svg.png',
  uk: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/United_Kingdom_%28orthographic_projection%29.svg/400px-United_Kingdom_%28orthographic_projection%29.svg.png',
  abd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/United_States_%28orthographic_projection%29.svg/400px-United_States_%28orthographic_projection%29.svg.png',
  'united states':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/United_States_%28orthographic_projection%29.svg/400px-United_States_%28orthographic_projection%29.svg.png',
  brezilya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/BRA_orthographic.svg/400px-BRA_orthographic.svg.png',
  brazil:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/BRA_orthographic.svg/400px-BRA_orthographic.svg.png',
  çin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/China_%28orthographic_projection%29.svg/400px-China_%28orthographic_projection%29.svg.png',
  china:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/China_%28orthographic_projection%29.svg/400px-China_%28orthographic_projection%29.svg.png',
  hindistan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/India_%28orthographic_projection%29.svg/400px-India_%28orthographic_projection%29.svg.png',
  india:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/India_%28orthographic_projection%29.svg/400px-India_%28orthographic_projection%29.svg.png',
  rusya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Russian_Federation_%28orthographic_projection%29.svg/400px-Russian_Federation_%28orthographic_projection%29.svg.png',
  russia:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Russian_Federation_%28orthographic_projection%29.svg/400px-Russian_Federation_%28orthographic_projection%29.svg.png',
  avustralya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Australia_%28orthographic_projection%29.svg/400px-Australia_%28orthographic_projection%29.svg.png',
  australia:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Australia_%28orthographic_projection%29.svg/400px-Australia_%28orthographic_projection%29.svg.png',
  mısır:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/EGY_orthographic.svg/400px-EGY_orthographic.svg.png',
  egypt:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/EGY_orthographic.svg/400px-EGY_orthographic.svg.png',
  japonya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Japan_%28orthographic_projection%29.svg/400px-Japan_%28orthographic_projection%29.svg.png',
  japan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Japan_%28orthographic_projection%29.svg/400px-Japan_%28orthographic_projection%29.svg.png',
  kanada:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Canada_%28orthographic_projection%29.svg/400px-Canada_%28orthographic_projection%29.svg.png',
  canada:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Canada_%28orthographic_projection%29.svg/400px-Canada_%28orthographic_projection%29.svg.png',
};
