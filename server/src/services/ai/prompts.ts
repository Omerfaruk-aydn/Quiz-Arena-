import type { GenerateInput } from './types.js';

function getDifficultyLabel(d: string): string {
  return d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor';
}

const TOPICS = [
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
  'Edebiyat',
  'Otomotiv',
  'Nobel Ödülleri',
];

const IMAGE_TYPE_INSTRUCTIONS = `
GÖRSEL (sadece includeImages=true ise):
- Yaklaşık yarısı görsel olsun (sayi/2 yuvarla).
- imageType/imageQuery kullan; imageUrl ASLA kullanma.
- imageType: flag, landmark, person, logo, map, artwork, animal, instrument, food, nature, architecture.
- imageQuery: doğru cevabın TAM metni; küçük harf, noktalama yok. Örnek: doğru cevap "Leonardo da Vinci" ise imageQuery "leonardo da vinci".
- Görsel yoksa imageType="", imageQuery="".
`;

export function buildPrompt(input: GenerateInput): string {
  const diffLabel = getDifficultyLabel(input.difficulty);

  return `Sen deneyimli bir quiz yazarısın. Aşağıdaki kurallara göre ${input.questionCount} adet ${diffLabel} seviyede Türkçe çoktan seçmeli soru üret.

KONULAR
Bu listeden rastgele ve dengeli seç:
${TOPICS.join(', ')}

ZORLUK: ${diffLabel}
${getDifficultyRules(input.difficulty)}

KURALLAR
- Her soruda 4 şık olsun: 1 doğru, 3 yanlış.
- Şıklar kısa (maks. 70 karakter), net ve birbirinden farklı olsun.
- Sorular anlaşılır ve teknik olarak doğru olsun (maks. 180 karakter).
- Doğru cevabı mutlaka işaretle; sonradan değiştirme.
- Açıklama sadece doğru cevabı destekleyen 1-2 cümle olsun; yanlış şıklardan veya düzeltmelerden bahsetme.
- Doğru cevabın yeri rastgele olsun.
- "Hiçbiri / Hepsi" gibi şıklar kullanma.
- Tüm içerikler Türkçe olsun; özel isimler dışında yabancı kelime kullanma.

${input.includeImages ? IMAGE_TYPE_INSTRUCTIONS : 'Görsel yok. imageType="", imageQuery="".'}

ÇIKTI
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
}

function getDifficultyRules(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return `Genel kültür ve temel bilgiler. Yanlış şıklar doğrudan bariz şekilde farklı olsun.`;
    case 'medium':
      return `Daha spesifik bilgi (tarih yılları, terimler, detaylar). Yanlış şıklar aynı konudan inandırıcı olsun.`;
    case 'hard':
      return `Nadir ve teknik bilgi. Yanlış şıklar doğruya çok yakın olsun, ince ayrıntıyla ayırt edilsin.`;
    default:
      return '';
  }
}
