import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const MODEL = 'xiaomi/mimo-v2.5';
export const VISION_MODEL = 'google/gemini-2.0-flash-001';

export async function callOpenRouter(
  prompt: string,
  maxTokens = 16384,
  timeoutMs = 240_000,
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
        temperature: 0.7,
        max_tokens: maxTokens,
        include_reasoning: false,
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

export async function analyzeDrawing(
  targetWord: string,
  imageBase64: string,
): Promise<{ score: number; feedback: string }> {
  if (!config.openrouter.apiKey) {
    throw ApiError.internal('OpenRouter API anahtarı tanımlı değil');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

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
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bu çizimin hedef kavramı "${targetWord}". Çizimi hedef kavramla karşılaştır. Sadece şu JSON formatında yanıt ver: {"score": 0-100 arası benzerlik puanı, "feedback": "1 cümlelik kısa yorum"}. Türkçe yaz.`,
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 256,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter vision API hatası', { status: response.status, error: errText });
      throw ApiError.internal('AI görsel analizi yapılamadı');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content ?? '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch
      ? (JSON.parse(jsonMatch[0]) as { score?: number; feedback?: string })
      : {};
    return {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      feedback: String(parsed.feedback || 'Değerlendirme tamamlandı.').substring(0, 200),
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw ApiError.internal('AI görsel analizi zaman aşımına uğradı');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
