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
      "imageType": "",
      "imageQuery": ""
    }
  ]
}`;

const IMAGE_INSTRUCTIONS = `
GÖRSEL:
- Yaklaşık yarısı görsel olsun (sayi/2 yuvarla).
- imageType/imageQuery kullan; imageUrl ASLA kullanma.
- imageType: flag, landmark, person, logo, film, map, artwork, animal, instrument, food, nature, architecture.
- imageQuery: doğru cevabın TAM metni; küçük harf, noktalama yok. Örnek: doğru cevap "Leonardo da Vinci" ise imageQuery "leonardo da vinci".
- Görsel yoksa imageType="", imageQuery="".
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
  drawing_battle: undefined,
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
- imageType: "logo", imageQuery: doğru cevabın küçük harf, noktalamasız hali.
- Örnek: doğru cevap "Nike" ise imageQuery: "nike".
- Tüm metinler Türkçe; marka isimleri özgün kalabilir.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFlagGuessPrompt(input: PromptInput): string {
  return `Sen bir bayrak/başkent tahmini oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Her soru ya "Bu hangi ülkenin bayrağıdır?" şeklinde bayrak sorusu, ya da "[Başkent] hangi ülkenin başkentidir?" şeklinde başkent sorusu olsun.
- Bayrak sorularında imageType: "flag", imageQuery: ülke adının küçük harf hali (örn: "türkiye", "japonya").
- Başkent sorularında imageType: "flag", imageQuery: doğru cevap ülke adının küçük harf hali.
- 4 şık: 1 doğru, 3 yanlış ülke.
- Şıklar ülke adı olsun.
- Açıklama kısa ve bilgilendirici olsun.
- Tüm metinler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFilmGuessPrompt(input: PromptInput): string {
  return `Sen bir film/sahne tahmini oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Soru metinleri şu şekilde olsun: "Bu sahne hangi filme aittir?" veya "Bu poster hangi filmin?"
- 4 şık: 1 doğru film, 3 yanlış ama bilinen film.
- Şıklar film adı olsun (maks. 60 karakter).
- Açıklama film hakkında 1 kısa cümle.
- imageType: "film", imageQuery: doğru cevabın küçük harf, noktalamasız hali.
- Örnek: doğru cevap "Yüzüklerin Efendisi" ise imageQuery: "yuzuklerin efendisi".
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
- Örnek: "🍎👩‍🏫" → "Öğretmen" (elma + öğretmen figürü), "🧀🐭" → "Ratatouille".

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildTrueFalseStormPrompt(input: PromptInput): string {
  return `Sen hızlı doğru/yanlış soruları yazarısın. ${input.questionCount} adet doğru/yanlış ifadesi üret.

KURALLAR
- Her soru type: "true_false" olacak.
- Her soruda SADECE 2 şık olacak: { "text": "Doğru", "isCorrect": true/false }, { "text": "Yanlış", "isCorrect": false/true }.
- İfadeler kısa ve net olsun (maks. 120 karakter).
- Yarısı doğru, yarısı yanlış olsun (mümkünse dengeli).
- Açıklama: doğruysa neden doğru, yanlışsa doğrusu nedir (1 cümle).
- imageType="", imageQuery="".
- Konular: genel kültür, bilim, tarih, coğrafya, spor, sanat, teknoloji.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMathSprintPrompt(input: PromptInput): string {
  return `Sen bir matematik sprint oyunu yazarısın. ${input.questionCount} adet matematik sorusu üret.

KURALLAR
- Sorular zihinden çözülebilecek basit-orta düzeyde olsun.
- Zorluk: ${input.difficultyLabel}.
  - Kolay: toplama, çıkarma, basit çarpma.
  - Orta: çarpma, bölme, kare, karekök, yüzde.
  - Zor: üs, köklü sayılar, daha karmaşık işlemler.
- 4 şık: 1 doğru cevap (sayı), 3 yanlış ama yaygın hata sonucu olabilecek sayı.
- Şıklar sadece sayısal değer olsun.
- Açıklama çözümün kısa özeti olsun.
- imageType="", imageQuery="".

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMillionairePrompt(input: PromptInput): string {
  const count = Math.max(5, input.questionCount);
  return `Sen "Kim Milyoner Olmak İster?" formatında soru yazarısın. ${count} adet soru üret.

KURALLAR
- Sorular zorluk sırasına göre artsın: ilk sorular çok kolay, son sorular çok zor.
- Toplam ${count} soru; zorluk dağılımı: ilk %40 kolay, orta %40 orta, son %20 zor.
- Her soruda 4 şık: 1 doğru, 3 yanlış.
- Yanlış şıklar inandırıcı olsun (bu formatın özelliği).
- Açıklama kısa ve net.
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
- Açıklamada doğru cevabın yılı ve diğerlerinin yaklaşık yılları kısça belirtilsin.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMatchingPrompt(input: PromptInput): string {
  return `Sen bir eşleştirme yarışması yazarısın. ${input.questionCount} adet "hangisi eşleşir?" sorusu üret.

KURALLAR
- Her soruda bir anahtar kavram verilir ve 4 eşleme seçeneği sunulur.
- Eşleme türleri: ülke-başkent, icat-mucit, yazar-eser, sporcu-spor dalı, film-yönetmen, sanatçı-eser, şarkı-sanatçı.
- Soru metni: "[Anahtar] ile aşağıdakilerden hangisi eşleşir?"
- 4 şık: 1 doğru, 3 yanlış ama aynı kategoriden.
- Açıklama kısa.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildMemoryMatchPrompt(input: PromptInput): string {
  return `Sen bir hafıza kartları oyunu yazarısın. ${input.questionCount} adet "eşleşen kart hangisi?" sorusu üret.

KURALLAR
- Her soruda bir açık kart ve 4 kapalı kart seçeneği verilir.
- Açık kart bir emoji, kelime, renk veya kavram olsun.
- 4 şıktan biri açık kartın eşleniği olsun (örn: 🍎 → elma, 🔴 → kırmızı, 🐕 → köpek).
- Açıklama: "Doğru eşleşme [cevap] çünkü..."
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildSimonSaysPrompt(input: PromptInput): string {
  return `Sen bir Simon Says / renk dizisi oyunu yazarısın. ${input.questionCount} adet "sıradaki renk hangisi?" sorusu üret.

KURALLAR
- Her soruda bir renk dizisi verilir; son renk eksik bırakılır.
- Renkler: Kırmızı, Mavi, Yeşil, Sarı (Türkçe).
- 4 şık: 4 renkten biri doğru, diğerleri yanlış.
- Açıklama dizinin kuralını kısaca açıklasın.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildPictionaryPrompt(input: PromptInput): string {
  return `Sen bir çiz-tahmin (Pictionary) oyunu yazarısın. ${input.questionCount} adet görsel temsil sorusu üret.

KURALLAR
- Her soru: "Bu çizim/sembol neyi temsil ediyor?" şeklinde olabilir.
- 4 şık: 1 doğru nesne/kavram, 3 yanlış ama görsel olarak benzer olabilecek.
- Açıklama kısa.
- Görsel yoksa metin tabanlı sembolik açıklama kullan; imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}

function buildFibbagePrompt(input: PromptInput): string {
  return `Sen bir "Yalan Makinesi" (Fibbage) oyunu yazarısın. ${input.questionCount} adet soru üret.

KURALLAR
- Her soru ilginç, az bilinen bir gerçek üzerine kurulu olsun.
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
- 4 şık: renklerden biri doğru, diğerleri yanlış.
- Açıklama dizinin mantığını kısaca açıklasın.
- imageType="", imageQuery="".
- Tüm içerikler Türkçe.

${OUTPUT_JSON_INSTRUCTION}`;
}
