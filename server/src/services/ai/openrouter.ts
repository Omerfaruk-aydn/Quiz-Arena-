import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Text generation model (quiz questions, hints, emoji riddles)
// DeepSeek v4 Flash: 128K context, 32K max output, dirt cheap ($0.20/$0.40 per M)
export const TEXT_MODEL = 'deepseek/deepseek-v4-flash';

// Vision model (drawing analysis, meme evaluation, visual recognition)
// Gemini 2.0 Flash Lite: fast & cheap multimodal
export const VISION_MODEL = 'google/gemini-2.0-flash-lite-001';

// Vision fallback models — birincisi çalışmazsa bunlar denenir
export const VISION_FALLBACK_MODELS = [
  'google/gemini-2.0-flash-lite',
  'google/gemini-flash-1.5',
  'google/gemini-pro-vision',
];

// Token limits — generous since models are cheap
export const MAX_TOKENS = 32768;        // text output max (DeepSeek limit)
export const MAX_VISION_TOKENS = 8192;  // vision output max
export const MAX_PROMPT_TOKENS = 32000; // safe input limit (leaves room for output)
export const TIMEOUT_MS = 300_000;
export const VISION_TIMEOUT_MS = 120_000;

// Backward compat
export const MODEL = TEXT_MODEL;

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.openrouter.apiKey}`,
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'QuizArena',
  };
}

export async function callOpenRouter(
  prompt: string,
  maxTokens = MAX_TOKENS,
  timeoutMs = TIMEOUT_MS,
): Promise<string> {
  if (!config.openrouter.apiKey) {
    throw ApiError.internal('OpenRouter API anahtari tanimli degil');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        include_reasoning: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter API hatasi', { status: response.status, error: errText });
      throw ApiError.internal('AI servisiyle iletisim kurulamadi');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw ApiError.internal('AI bos yanit dondurdu');
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw ApiError.internal('AI servisi zaman asimina ugradi');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Gorsel iceren AI cagrilari icin ozel fonksiyon.
 * Gemini 3.1 Flash Lite kullanir (hizli ve ucuz multimodal).
 * Kullanim alanlari:
 * - Cizim analizi (drawing_battle)
 * - Meme degerlendirmesi (meme_war)
 * - Pictionary dogrulama
 */
export async function callVisionModel(
  textPrompt: string,
  imageBase64: string,
  maxTokens = MAX_VISION_TOKENS,
  timeoutMs = VISION_TIMEOUT_MS,
): Promise<string> {
  if (!config.openrouter.apiKey) {
    throw ApiError.internal('OpenRouter API anahtari tanimli degil');
  }

  if (!imageBase64.startsWith('data:image/')) {
    throw ApiError.badRequest('Gecersiz gorsel formati', 'INVALID_IMAGE');
  }

  // Ana model + fallback modelleri dene
  const modelsToTry = [VISION_MODEL, ...VISION_FALLBACK_MODELS];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: textPrompt },
                { type: 'image_url', image_url: { url: imageBase64 } },
              ],
            },
          ],
          temperature: 0.5,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        logger.warn('Vision API model hatasi, fallback deneniyor', { model, status: response.status, error: errText });
        lastError = new Error(`Vision model ${model} failed: ${response.status}`);
        continue; // Sonraki modeli dene
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        logger.warn('Vision model bos yanit dondurdu, fallback deneniyor', { model });
        lastError = new Error(`Vision model ${model} returned empty`);
        continue;
      }

      return content;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.warn('Vision model zaman asimi, fallback deneniyor', { model });
        lastError = new Error(`Vision model ${model} timed out`);
        continue;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Tüm modeller başarısız oldu
  throw lastError || ApiError.internal('Tum vision modelleri basarisiz oldu');
}

/**
 * Cizim analizi - Gemini 2.5 Flash ile
 * Drawing Battle modunda kullanilir
 */
export async function analyzeDrawing(
  targetWord: string,
  imageBase64: string,
): Promise<{ score: number; feedback: string }> {
  try {
    const content = await callVisionModel(
      'Bu cizimin hedef kavrami "' + targetWord + '". Cizimi hedef kavramla karsilastir ve degerlendir. Sadece su JSON formatinda yanit ver: {"score": 0-100 arasi benzerlik puani, "feedback": "1-2 cumlelik yapici yorum"}. Turkce yaz.',
      imageBase64,
    );

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch
      ? (JSON.parse(jsonMatch[0]) as { score?: number; feedback?: string })
      : {};
    return {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      feedback: String(parsed.feedback || 'Degerlendirme tamamlandi.').substring(0, 200),
    };
  } catch (err) {
    logger.warn('Cizim analizi basarisiz, varsayilan puan kullaniliyor', { targetWord });
    return {
      score: 50,
      feedback: 'Cizimin degerlendirildi! AI su anda yogun, varsayilan puan verildi.',
    };
  }
}
