import type { GenerateInput, GameMode } from './types.js';

function getDifficultyLabel(d: string): string {
  return d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor';
}

const CLASSIC_TOPICS = [
  'Genel Kültür',
  'Bilim ve Teknoloji',
  'Tarih',
  'Coğrafya',
  'Spor',
  'Sanat ve Müzik',
  'Doğa ve Çevre',
  'Matematik',
  'Edebiyat',
  'Sinema ve TV',
  'Video Oyunları',
  'Yemek Kültürü',
  'Dünya Dilleri',
  'Uzay ve Astronomi',
  'İnsan Vücudu',
  'Hayvanlar',
  'Bitkiler',
  'Ekonomi',
  'Felsefe',
  'Mitoloji',
  'İcatlar ve Keşifler',
  'Dünya Mirasları',
  'Olimpiyatlar',
  'Mimari',
  'Okyanuslar',
  'Kimya ve Fizik',
  'Biyoloji',
  'Tıp',
  'Dünya Mutfağı',
  'Müzik Aletleri',
  'Sosyal Medya',
  'Robotik ve Yapay Zeka',
  'Enerji',
  'Antik Uygarlıklar',
  'Tiyatro',
  'Otomotiv',
  'Nobel Ödülleri',
];

const DIFFICULTY_RULES: Record<string, string> = {
  easy: `Genel kültür ve temel bilgiler. Yanlış şıklar doğrudan bariz şekilde farklı olsun.`,
  medium: `Daha spesifik bilgi (tarih yılları, terimler, detaylar). Yanlış şıklar aynı konudan inandırıcı olsun.`,
  hard: `Nadir ve teknik bilgi. Yanlış şıklar doğruya çok yakın olsun, ince ayrıntıyla ayırt edilsin.`,
};

const OUTPUT_JSON_INSTRUCTION = `ÇIKTI
Sadece şu JSON formatında çıktı ver, başka metin ekleme:

{
  "questions": [
    {
      "text": "Soru",
      "type": "multiple_choice",
      "answers": [
        { "text": "A", "isCorrect": true },
        { "text": "B", "isCorrect": false },
        { "text": "C", "isCorrect": false },
        { "text": "D", "isCorrect": false }
      ],
      "explanation": "Açıklama",
      "imageType": "logo|flag|person|landmark|film|animal|instrument|food|nature|architecture|map|artwork|object",
      "imageQuery": "doğru cevap için arama sorgusu"
    }
  ]
}

NOT: imageType sadece görsel gerektiren sorular için zorunludur. Görsel gerektirmeyen sorularda imageType="", imageQuery="" kullan.`;

const IMAGE_INSTRUCTIONS = `
GÖRSEL KURALLARI:
- Logo, bayrak, ünlü kişi, film, hayvan, enstrüman, yemek, doğa, mimari gibi GÖRSEL İÇEREN modlarda:
  * Soruların %80-100'ü görsel olsun
  * imageType kullan: flag, landmark, person, logo, film, map, artwork, animal, instrument, food, nature, architecture, object
  * imageQuery: doğru cevabın TAM metni; küçük harf, noktalama yok
  * Örnek: doğru cevap "Leonardo da Vinci" → imageQuery "leonardo da Vinci"
  
- Metin tabanlı modlarda (classic, true_false, math, fibbage, survey, meme_war, mastermind, sort_events, matching, memory_match, simon_says):
  * imageType="", imageQuery="" kullan
  * Görsel ZORUNLU DEĞİL

- Pictionary ve drawing_battle modları:
  * Görsel YOK — oyuncular kendi çizer
  * imageType="", imageQuery="" kullan
`;

export function buildPrompt(input: GenerateInput): string {
  const diffLabel = getDifficultyLabel(input.difficulty);
  const mode = input.gameMode ?? 'classic';

  const builder = MODE_PROMPT_BUILDERS[mode] ?? buildClassicPrompt;
  return builder({ ...input, difficultyLabel: diffLabel });
}

interface PromptInput extends GenerateInput {
  difficultyLabel: string;
}

const MODE_PROMPT_BUILDERS: Record<GameMode, ((input: PromptInput) => string) | undefined> = {
  classic: buildClassicPrompt,
  logo_guess: buildLogoGuessPrompt,
  flag_guess: buildFlagGuessPrompt,
  film_guess: buildFilmGuessPrompt,
  emoji_riddle: buildEmojiRiddlePrompt,
  true_false_storm: buildTrueFalseStormPrompt,
  math_sprint: buildMathSprintPrompt,
  millionaire: buildMillionairePrompt,
  sort_events: buildSortEventsPrompt,
  matching: buildMatchingPrompt,
  memory_match: buildMemoryMatchPrompt,
  simon_says: buildSimonSaysPrompt,
  pictionary: buildPictionaryPrompt,
  fibbage: buildFibbagePrompt,
  survey: buildSurveyPrompt,
  meme_war: buildMemeWarPrompt,
  mastermind: buildMastermindPrompt,
  drawing_battle: buildDrawingBattlePrompt,
};

function buildClassicPrompt(input: PromptInput): string {
  return `Sen deneyimli bir quiz yazarısın. Aşağıdaki kurallara göre ${input.questionCount} adet ${input.difficultyLabel} seviyede Türkçe çoktan seçmeli soru üret.

KONULAR
Bu listeden rastgele ve dengeli seç:
${CLASSIC_TOPICS.join(', ')}

ZORLUK: ${input.difficultyLabel}
${DIFFICULTY_RULES[input.difficulty]}

KURALLAR
- Her soruda 4 şık olsun: 1 doğru, 3 yanlış.
- Şıklar kısa (maks. 70 karakter), net ve birbirinden farklı olsun.
- Sorular anlaşılır ve teknik olarak doğru olsun (maks. 180 karakter).
- Doğru cevabı mutlaka işaretle; sonradan değiştirme.
- Açıklama sadece doğru cevabı destekleyen 1-2 cümle olsun; yanlış şıklardan veya düzeltmelerden bahsetme.
- Doğru cevabın yeri rastgele olsun.
- "Hiçbiri / Hepsi" gibi şıklar kullanma.
- Tüm içerikler Türkçe olsun; özel isimler dışında yabancı kelime kullanma.

${input.includeImages ? IMAGE_INSTRUCTIONS : 'Görsel yok. imageType="", imageQuery="".'}

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildLogoGuessPrompt(input: PromptInput): string {
  return `Sen bir logo tahmini oyunu yazarısın. ${input.questionCount} adet logo tahmin sorusu üret.

KURALLAR
- Her soruda büyük marka/kuruluş logoları olsun.
- Soru metni her zaman şu şekilde olsun: "Bu hangi markanın logosudur?" veya "Bu hangi şirketin logosudur?"
- 4 şık: 1 doğru marka, 3 yanlış ama bilinen marka.
- Şıklar sadece marka/şirket adı olsun (maks. 40 karakter).
- Açıklama: logonun sahibi hakkında 1 kısa cümle.
- imageType: "logo" ZORUNLU — HER soru için logo görseli olsun.
- imageQuery: doğru cevabın küçük harf, noktalamasız hali. Örnek: doğru cevap "Nike" ise imageQuery: "nike".
- Sorular birbirinden farklı markalar/kuruluşlar olsun.
- Tüm metinler Türkçe; marka isimleri özgün kalabilir.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFlagGuessPrompt(input: PromptInput): string {
  return `Sen bir bayrak/başkent tahmini oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Her soru ya "Bu hangi ülkenin bayrağıdır?" şeklinde bayrak sorusu, ya da "[Başkent] hangi ülkenin başkentidir?" şeklinde başkent sorusu olsun.
- Bayrak sorularında imageType: "flag" ZORUNLU, imageQuery: ülke adının küçük harf hali (örn: "türkiye", "japonya").
- Başkent sorularında imageType: "flag" ZORUNLU, imageQuery: doğru cevap ülke adının küçük harf hali.
- 4 şık: 1 doğru, 3 yanlış ülke. Yanlış şıklar coğrafi olarak yakın ülkelerden olsun.
- Şıklar ülke adı olsun.
- Açıklama kısa ve bilgilendirici olsun; bayrağın renklerini veya coğrafi bilgiyi kısaca belirt.
- Sorular birbirinden farklı ülkelerden olsun.
- Tüm metinler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFilmGuessPrompt(input: PromptInput): string {
  return `Sen bir film/sahne tahmini oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Soru metinleri şu şekilde olsun: "Bu sahne hangi filme aittir?" veya "Bu poster hangi filmin?"
- 4 şık: 1 doğru film, 3 yanlış ama bilinen film. Yanlış şıklar aynı türden olsun.
- Şıklar film adı olsun (maks. 60 karakter).
- Açıklama film hakkında 1 kısa cümle.
- imageType: "film" ZORUNLU — HER soru için film görseli olsun.
- imageQuery: doğru cevabın küçük harf, noktalamasız hali. Örnek: doğru cevap "Yüzüklerin Efendisi" ise imageQuery: "yuzuklerin efendisi".
- Klasik ve popüler yapımlardan seç; niş filmlerden kaçın.
- Tüm metinler Türkçe; film isimleri özgün kalabilir.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildEmojiRiddlePrompt(input: PromptInput): string {
  return `Sen bir emoji bulmaca uzmanısın. ${input.questionCount} adet emoji bulmacası üret.

KURALLAR
- Soru metni SADECE emoji dizisi olsun, kelime kullanma.
- Cevaplar emoji dizisinin anlamını oluşturan kelime/phrase olsun (film, ülke, yemek, meslek, hayvan, nesne vb.).
- 4 şık: 1 doğru, 3 yanlış ama mantıklı alternatif.
- Şıklar kısa (maks. 50 karakter).
- Açıklama: "Doğru cevap [cevap] çünkü [kısa açıklama]."
- imageType="", imageQuery="" (görsel yok).
- Örnekler:
  * 🎵🎤👑 → "Müzik Kralı" (müzik + mikrofon + taç)
  * 🍎📱💻 → "Apple" (elma + telefon + bilgisayar)
  * 🌍🔥💧🌬️ → "Dört Element" (dünya + ateş + su + rüzgar)
  * 🎬🦈🌊 → "Jaws" (film + köpekbalığı + dalga)
  * 🧀🐭👨‍🍳 → "Ratatouille" (peynir + fare + aşçı)

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildTrueFalseStormPrompt(input: PromptInput): string {
  return `Sen hızlı doğru/yanlış soruları yazarısın. ${input.questionCount} adet doğru/yanlış ifadesi üret.

KURALLAR
- Her soru type: "true_false" olacak.
- Her soruda SADECE 2 şık olacak: { "text": "Doğru", "isCorrect": true/false }, { "text": "Yanlış", "isCorrect": false/true }.
- İfadeler ilginç, şaşırtıcı veya kışkırtıcı olsun (maks. 120 karakter).
- Yarısı doğru, yarısı yanlış olsun (mümkünse dengeli).
- Açıklama: doğruysa neden doğru, yanlışsa doğrusu nedir (1-2 cümle, ilginç bir bilgi ekle).
- imageType="", imageQuery="".
- Konular: genel kültür, bilim, tarih, coğrafya, spor, sanat, teknoloji, doğa, insan vücudu.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMathSprintPrompt(input: PromptInput): string {
  return `Sen bir matematik sprint oyunu yazarısın. ${input.questionCount} adet matematik sorusu üret.

KURALLAR
- Sorular zihinden çözülebilecek basit-orta düzeyde olsun.
- Zorluk: ${input.difficultyLabel}.
  - Kolay: toplama, çıkarma, basit çarpma (ör: 12 + 35 = ?, 8 × 7 = ?).
  - Orta: çarpma, bölme, kare, karekök, yüzde (ör: 15'in %20'si = ?, √144 = ?).
  - Zor: üs, köklü sayılar, denklemler, problemler (ör: 2^8 = ?, 3x + 5 = 20 → x = ?).
- 4 şık: 1 doğru cevap (sayı), 3 yanlış ama yaygın hata sonucu olabilecek sayı.
- Şıklar sadece sayısal değer olsun.
- Açıklama çözümün kısa özeti olsun (adım adım göster).
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMillionairePrompt(input: PromptInput): string {
  const count = Math.max(5, input.questionCount);
  return `Sen "Kim Milyoner Olmak İster?" formatında soru yazarısın. ${count} adet soru üret.

KURALLAR
- Sorular zorluk sırasına göre artsın: ilk sorular çok kolay, son sorular çok zor.
- Toplam ${count} soru; zorluk dağılımı: ilk %40 kolay, orta %40 orta, son %20 zor.
- Her soruda 4 şık: 1 doğru, 3 yanlış.
- Yanlış şıklar inandırıcı olsun (bu formatın özelliği); bariz yanlışlardan kaçın.
- Konular: genel kültür, tarih, bilim, coğrafya, edebiyat, sanat, spor, teknoloji.
- Açıklama: doğru cevabın kaynağını veya mantığını kısaca açıkla.
- Görsel yok. imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildSortEventsPrompt(input: PromptInput): string {
  return `Sen tarihsel olayları sıralama oyunu yazarısın. ${input.questionCount} adet "hangisi önce gerçekleşti?" sorusu üret.

KURALLAR
- Her soruda 4 tarihsel olay ver; bunlardan biri diğerlerinden önce gerçekleşmiş olsun.
- Soru metni: "Aşağıdaki olaylardan hangisi diğerlerinden ÖNCE gerçekleşmiştir?"
- Şıklar olayın kısa adı (maks. 70 karakter).
- Doğru cevap en erken tarihli olay olsun.
- Açıklamada doğru cevabın yılı ve diğerlerinin yaklaşık yılları kısaca belirtilsin.
- Olaylar farklı alanlardan seçilsin (bilim, tarih, sanat, spor, politika).
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMatchingPrompt(input: PromptInput): string {
  return `Sen bir eşleştirme yarışması yazarısın. ${input.questionCount} adet "hangisi eşleşir?" sorusu üret.

KURALLAR
- Her soruda bir anahtar kavram verilir ve 4 eşleme seçeneği sunulur.
- Eşleme türleri: ülke-başkent, icat-mucit, yazar-eser, sporcu-spor dalı, film-yönetmen, sanatçı-eser, şarkı-sanatçı, hayvan-habitat, element-sembol.
- Soru metni: "[Anahtar] ile aşağıdakilerden hangisi eşleşir?"
- 4 şık: 1 doğru, 3 yanlış ama aynı kategoriden.
- Yanlış şıklar inandırıcı olsun; bariz yanlışlardan kaçın.
- Açıklama: doğru eşleşmeyi kısaca açıkla.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMemoryMatchPrompt(input: PromptInput): string {
  return `Sen bir hafıza kartları oyunu yazarısın. ${input.questionCount} adet "eşleşen kart hangisi?" sorusu üret.

KURALLAR
- Her soruda bir açık kart ve 4 kapalı kart seçeneği verilir.
- Açık kart bir emoji, kelime, renk veya kavram olsun.
- 4 şıktan biri açık kartın eşleniği olsun (örn: 🍎 → elma, 🔴 → kırmızı, 🐕 → köpek, 🎸 → gitar).
- Yanlış şıklar benzer kategoriden olsun (ör: 🍎 → armut, muz, portakal gibi yanlış meyveler).
- Açıklama: "Doğru eşleşme [cevap] çünkü [kısa açıklama]."
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildSimonSaysPrompt(input: PromptInput): string {
  return `Sen bir Simon Says / renk dizisi oyunu yazarısın. ${input.questionCount} adet "sıradaki renk hangisi?" sorusu üret.

KURALLAR
- Her soruda bir renk dizisi verilir; son renk eksik bırakılır.
- Diziler basit tekrar kalıpları izlesin (örn: "Kırmızı, Mavi, Kırmızı, Mavi, ?" → Kırmızı).
- Renkler: Kırmızı, Mavi, Yeşil, Sarı (Türkçe).
- 4 şık: 4 renkten biri doğru, diğerleri yanlış.
- Açıklama dizinin kuralını kısaca açıklasın (örn: "Dizi 2'li gruplar halinde tekrar ediyor").
- Kolaydan zora doğru sırala; başlangıç soruları basit kalıp, sonrakiler daha karmaşık.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildPictionaryPrompt(input: PromptInput): string {
  const PICTONARY_OBJECTS = [
    // Hayvanlar
    'kedi', 'köpek', 'kuş', 'balık', 'tavşan', 'at', 'inek', 'fil', 'aslan', 'zürafa',
    'penguen', 'kaplumbağa', 'kelebek', 'arı', 'karınca', 'yunus', 'köpekbalığı', 'papağan', 'baykuş', 'maymun',
    // Nesneler
    'elma', 'muz', 'araba', 'uçak', 'bisiklet', 'gemi', 'tren', 'telefon', 'bilgisayar', 'televizyon',
    'ev', 'bina', 'köprü', 'kule', 'gökdelen', 'kilise', 'cami', 'okul', 'hastane', 'stadyum',
    // Doğa
    'güneş', 'ay', 'yıldız', 'bulut', 'ağaç', 'çiçek', 'dağ', 'nehir', 'göl', 'şelale',
    'gökkuşağı', 'kar tanesi', 'dalga', 'volkan', 'ada', 'orman', 'çöl', 'buzul', 'mağara', 'kumsal',
    // Semboller
    'kalp', 'ok', 'haç', 'üçgen', 'kare', 'daire', 'yıldız (5 köşeli)', 'bayrak', 'flama', 'para',
    // Yiyecek
    'pasta', 'dondurma', 'hamburger', 'pizza', 'kek', 'çikolata', 'karpuz', 'kiraz', 'portakal', 'şeftali',
    // Spor
    'futbol topu', 'basketbol topu', 'tenis raketi', 'kayak', 'sörf tahtası', 'dambıl', 'kupa', 'madalya', 'gol', 'bayrak (yarış)',
    // Meslekler
    'doktor', 'itfaiyeci', 'polis', 'aşçı', 'pilot', 'astronot', 'ressam', 'müzisyen', 'sporcu', 'inşaatçı',
    // Enstrümanlar
    'gitar', 'piyano', 'davul', 'keman', 'flüt', 'trompet', 'saksafon', 'bateri', 'mızıka', 'mızıka',
    // Bitkiler
    'gül', 'lale', 'papatya', 'palmiye', 'çam ağacı', 'kaktüs', 'nilüfer', 'orkide', 'menekşe', 'zambak',
    // Diğer
    'yangın', 'deprem', 'göktaşı', 'UFO', 'robot', 'dinozor', 'balon', 'paraşüt', 'çadır', 'kamp ateşi',
    'şemsiye', 'bıçak', 'tabak', 'bardak', 'çatal', 'kaşık', 'tencere', 'lamba', 'ayna', 'resim',
    'gözlük', 'anahtar', 'çanta', 'saat', 'ayakkabı', 'şapka', 'kalem', 'kitap', 'masa', 'sandalye',
  ];

  return `Sen bir çiz-tahmin (Pictionary) oyunu yazarısın. ${input.questionCount} adet görsel temsil sorusu üret.

KURALLAR
- Her soru: "Bu çizim/sembol neyi temsil ediyor?" şeklinde olsun.
- Çizim nesneleri somut, kolayca çizilebilir ve tanınabilir olsun.
- Örnek nesneler: ${PICTONARY_OBJECTS.join(', ')}.
- 4 şık: 1 doğru nesne/kavram, 3 yanlış ama görsel olarak benzer olabilecek.
- Yanlış şıklar aynı kategoriden olsun (örneğin hayvan ise diğer hayvanlar, yiyecek ise diğer yiyecekler).
- Açıklama: "Bu çizim [doğru cevap] nesnesini temsil ediyor." şeklinde kısa olsun.
- imageType="", imageQuery="" (görsel yok, oyuncular kendi çizer).
- Tüm içerikler Türkçe.
- Sorular birbirinden farklı olsun, aynı nesne tekrar etmesin.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFibbagePrompt(input: PromptInput): string {
  return `Sen bir "Yalan Makinesi" (Fibbage) oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Her soru ilginç, az bilinen bir gerçek üzerine kurulu olsun.
- Soru metni boşluklu bir cümle olsun (örneğin: "Bir yunus balığının ... vardır.").
- 4 şık: 1 doğru cevap, 3 inandırıcı YALAN.
- Yanlış şıklar gerçekmiş gibi görünsün; absürt olmasın.
- Açıklama: doğru cevabın neden gerçek olduğunu kısaca açıkla.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildSurveyPrompt(input: PromptInput): string {
  return `Sen bir anket/tahmin oyunu yazarısın. ${input.questionCount} adet tartışmalı/opinion sorusu üret.

KURALLAR
- Soruların kesin doğru cevabı yok; oyuncular tercihlerini seçsin.
- Yine de 1 şıkkı "doğru" olarak işaretle; bu sadece sistemin çalışması için gerekli, oyunda herkes puan alacak.
- 4 şık: farklı görüş/tercih seçenekleri.
- Açıklama: "Bu bir anket sorusuydu; en popüler cevap şuydu..." gibi kısa bir yorum.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMemeWarPrompt(input: PromptInput): string {
  return `Sen bir "Meme Savaşı" / altyazı oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Her soruda absürt, komik veya dikkat çekici bir durum/sahne metni verilir.
- Soru metni: "Bu duruma en uygun altyazı hangisi?" gibi net bir ifade olsun.
- 4 şık: 1 en uygun altyazı (doğru), 3 alternatif (komik ama daha az uygun).
- Açıklama: neden doğru altyazının en iyi seçenek olduğu kısaca belirtilsin.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMastermindPrompt(input: PromptInput): string {
  return `Sen bir Mastermind / kod kırma oyunu yazarısın. ${input.questionCount} adet "sıradaki kod elemanı hangisi?" sorusu üret.

KURALLAR
- Her soruda 4 renkten oluşan bir kod dizisi verilir; son eleman eksik bırakılır.
- Renkler: Kırmızı, Mavi, Yeşil, Sarı, Mor, Turuncu.
- Dizi bir kalıp izler (örneğin: "Kırmızı, Mavi, Kırmızı, Mavi, ?" → Kırmızı).
- 4 şık: renklerden biri doğru, diğerleri yanlış.
- Açıklama dizinin mantığını kısaca açıklasın.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildDrawingBattlePrompt(input: PromptInput): string {
  const DRAWING_OBJECTS = [
    // Kolay çizilebilir nesneler (1-3 kelime)
    'elma', 'muz', 'kedi', 'köpek', 'ev', 'ağaç', 'araba', 'uçak', 'güneş', 'ay',
    'yıldız', 'kalp', 'telefon', 'bisiklet', 'top', 'kitap', 'kalem', 'saat', 'ayakkabı', 'şapka',
    'kuş', 'balık', 'tavşan', 'at', 'çiçek', 'bulut', 'gökkuşağı', 'dağ', 'nehir', 'göl',
    'gemi', 'tren', 'otobüs', 'helikopter', 'roket', 'bilgisayar', 'televizyon', 'buzdolabı', 'masa', 'sandalye',
    'pasta', 'dondurma', 'hamburger', 'pizza', 'çikolata', 'karpuz', 'kiraz', 'portakal', 'şeftali', 'üzüm',
    'gitar', 'piyano', 'davul', 'keman', 'flüt', 'trompet', 'bateri', 'mızıka', 'saksafon', 'mızıka',
    'doktor', 'itfaiyeci', 'polis', 'aşçı', 'pilot', 'astronot', 'ressam', 'müzisyen', 'sporcu', 'inşaatçı',
    'futbol topu', 'basketbol topu', 'tenis raketi', 'kayak', 'sörf tahtası', 'dambıl', 'kupa', 'madalya', 'gol', 'bayrak (yarış)',
    'gül', 'lale', 'papatya', 'palmiye', 'çam ağacı', 'kaktüs', 'nilüfer', 'orkide', 'menekşe', 'zambak',
    'yangın', 'deprem', 'göktaşı', 'UFO', 'robot', 'dinozor', 'balon', 'paraşüt', 'çadır', 'kamp ateşi',
    'şemsiye', 'bıçak', 'tabak', 'bardak', 'çatal', 'kaşık', 'tencere', 'lamba', 'ayna', 'resim',
    'gözlük', 'anahtar', 'çanta', 'para', 'bina', 'köprü', 'kule', 'gökdelen', 'kilise', 'cami',
    'okul', 'hastane', 'stadyum', 'havalimanı', 'liman', 'park', 'bahçe', 'çiftlik', 'fabrika', 'market',
    'kelebek', 'karınca', 'arı', 'penguen', 'kaplumbağa', 'yılan', 'kurbağa', 'baykuş', 'papağan', 'yunus',
    'maymun', 'fil', 'aslan', 'zürafa', 'ayı', 'kurt', 'tilki', 'geyik', 'sincap', 'köstebek',
    'kar tanesi', 'dalga', 'volkan', 'ada', 'orman', 'çöl', 'buzul', 'mağara', 'kumsal', 'şelale',
  ];

  return `Sen bir "Çizim Savaşı" oyunu yazarısın. ${input.questionCount} adet çizim tahmini sorusu üret.

KURALLAR
- Her soruda oyuncuların çizmesi gereken bir nesne/kavram verilir.
- Çizim konusu 1-3 kelime arası, Türkçe ve kolayca tanınabilir olsun.
- Kullanılacak nesneler: ${DRAWING_OBJECTS.join(', ')}.
- 4 şık: 1 doğru cevap (çizilmesi gereken nesnenin kendisi), 3 görsel olarak benzer/yakın yanlış alternatif.
- Yanlış şıklar aynı kategoriden olsun (örneğin hayvan ise diğer hayvanlar, yiyecek ise diğer yiyecekler).
- Açıklama: "Doğru cevap [cevap] çünkü bu nesne kolayca çizilebilir ve tanınabilir." şeklinde kısa olsun.
- imageType="", imageQuery="" (görsel yok, oyuncular kendi çizer).
- Tüm içerikler Türkçe.
- Sorular birbirinden farklı olsun, aynı nesne tekrar etmesin.

${OUTPUT_JSON_INSTRUCTION}`;
}
