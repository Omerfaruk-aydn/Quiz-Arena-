import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const MODEL = 'xiaomi/mimo-v2.5';

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
