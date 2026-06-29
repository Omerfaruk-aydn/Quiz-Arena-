import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'xiaomi/mimo-v2.5';

interface AiQuizQuestion {
  text: string;
  type: 'multiple_choice' | 'true_false';
  answers: Array<{ text: string; isCorrect: boolean }>;
  explanation: string;
  imageUrl?: string;
}

interface GenerateInput {
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  includeImages: boolean;
}

function getDifficultyLabel(d: string): string {
  return d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor';
}

function buildPrompt(input: GenerateInput): string {
  const diffLabel = getDifficultyLabel(input.difficulty);
  const imageInstruction = input.includeImages
    ? `Soruların yaklaşık yarısına görsel ekle. Görseller için unsplash veya pexels gibi genel görsel sitelerinden uygun URL'ler kullan. imageUrl alanını doldur.`
    : `imageUrl alanı boş string olsun (görsel ekleme).`;

  return `Sen bir quiz soruları oluşturma uzmanısın. Aşağıdaki konularda ${input.questionCount} adet ${diffLabel} seviyede quiz sorusu üret.

Konular: Karışık ve çeşitli konulardan sorular üret. Aşağıdaki kategorilerden en az birer soru olacak şekilde çeşitlilik sağla:
- Genel Kültür
- Bilim ve Teknoloji
- Tarih
- Coğrafya
- Spor
- Sanat ve Müzik
- Doğa ve Çevre
- Matematik
- Edebiyat
- Müzik
- Sinema ve TV
- Oyunlar
- Yemek Kültürü
- Dünya Dilleri
- Uzay ve Astronomi
- İnsan Vücudu
- Hayvanlar
- Bitkiler
- Ekonomi

Kurallar:
- Her soru 4 şıktan oluşsun (1 doğru, 3 yanlış)
- Şıklar kısa ve net olsun (en fazla 75 karakter)
- Sorular kısa ve anlaşılır olsun (en fazla 200 karakter)
- Her soruya kısa bir açıklama ekle
- Doğru cevap çeşitliliği olsun (hepsi aynı şıkta olmasın)
- true_false tipinde sorular da ekle (yaklaşık %20-30'u)
- ${imageInstruction}

JSON formatında döndür. Sadece JSON döndür, başka bir şey yazma:
{
  "questions": [
    {
      "text": "Soru metni",
      "type": "multiple_choice",
      "answers": [
        { "text": "Şık A", "isCorrect": true },
        { "text": "Şık B", "isCorrect": false },
        { "text": "Şık C", "isCorrect": false },
        { "text": "Şık D", "isCorrect": false }
      ],
      "explanation": "Açıklama",
      "imageUrl": ""
    }
  ]
}`;
}

async function callOpenRouter(
  prompt: string,
  maxTokens = 16384,
  timeoutMs = 180_000,
): Promise<string> {
  if (!config.openrouter.apiKey) {
    throw ApiError.internal('OpenRouter API anahtarı tanımlı değil');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openrouter.apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'QuizArena',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter API hatası', { status: response.status, error: errText });
      throw ApiError.internal('AI servisiyle iletişim kurulamadı');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw ApiError.internal('AI boş yanıt döndürdü');
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw ApiError.internal('AI servisi zaman aşımına uğradı');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function parseAiResponse(raw: string): AiQuizQuestion[] {
  let cleaned = raw.trim();

  // Extract JSON from markdown code blocks
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  // Try to find JSON object in the text
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  const parsed = JSON.parse(cleaned) as { questions?: AiQuizQuestion[] };
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('AI yanıtı geçeriz format');
  }

  return parsed.questions.map((q) => ({
    text: q.text?.substring(0, 200) || 'Soru',
    type: q.type === 'true_false' ? 'true_false' : 'multiple_choice',
    answers: (q.answers || []).slice(0, 4).map((a) => ({
      text: a.text?.substring(0, 75) || '',
      isCorrect: !!a.isCorrect,
    })),
    explanation: q.explanation?.substring(0, 500) || '',
    imageUrl: q.imageUrl || '',
  }));
}

export async function generateQuiz(input: GenerateInput) {
  const prompt = buildPrompt(input);
  const raw = await callOpenRouter(prompt);
  const questions = parseAiResponse(raw);
  return { questions };
}

export async function getPhoneAFriendHint(
  questionText: string,
  answers: Array<{ text: string; isCorrect: boolean }>,
): Promise<{ hint: string; isCorrectAnswer: boolean }> {
  const isCorrectAnswer = Math.random() < 0.5;

  const prompt = `Sen bir yarışma jokerisin. "Arkımı Ara" jokeri için bir ipucu ver.

Soru: ${questionText}
Şıklar: ${answers.map((a, i) => `${i + 1}. ${a.text}`).join(', ')}

Kurallar:
- %50 ihtimalle doğru cevabı ima eden bir ipucu ver
- %50 ihtimalle yanlış bir ipucu ver (ama inandırıcı olsun)
- İpucu 1-2 cümle kısa ve doğal olsun
- Sadece ipucu metnini döndür, başka bir şey yazma

Örnek: "Bu cevap hakkında emin değilim ama bence ilk seçenek en mantıklısı."`;

  const raw = await callOpenRouter(prompt, 200, 10_000);

  return {
    hint: raw.substring(0, 300).trim(),
    isCorrectAnswer,
  };
}
