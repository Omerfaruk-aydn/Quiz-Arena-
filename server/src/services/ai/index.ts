import { buildPrompt } from './prompts.js';
import { callOpenRouter } from './openrouter.js';
import { fallbackResolveImage, resolveImageUrl } from './imageResolver.js';
import type { AiQuizQuestion, GenerateInput, GenerateResult } from './types.js';

export { MODEL } from './openrouter.js';
export type { AiQuizQuestion, GenerateInput, GenerateResult, ImageType } from './types.js';

const MAX_TEXT_LEN = 180;
const MAX_ANSWER_LEN = 70;
const MAX_EXPLANATION_LEN = 400;

function isValidImageType(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const allowed = new Set([
    'flag',
    'landmark',
    'person',
    'logo',
    'map',
    'artwork',
    'animal',
    'instrument',
    'food',
    'nature',
    'architecture',
  ]);
  return allowed.has(value.toLowerCase().trim());
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
    throw new Error('AI yanıtı geçersiz format');
  }

  return parsed.questions.map((q) => {
    const answers = (q.answers || []).slice(0, 4).map((a) => ({
      text: String(a.text ?? '').substring(0, MAX_ANSWER_LEN),
      isCorrect: !!a.isCorrect,
    }));

    // Ensure exactly 4 answers, fill blanks if needed
    while (answers.length < 4) {
      answers.push({ text: 'Seçenek', isCorrect: false });
    }

    // Ensure at least one correct answer
    if (!answers.some((a) => a.isCorrect)) {
      answers[0].isCorrect = true;
    }

    // Ensure only one correct answer for clean UX
    let correctFound = false;
    for (const a of answers) {
      if (a.isCorrect) {
        if (correctFound) a.isCorrect = false;
        correctFound = true;
      }
    }

    const imageType = isValidImageType(q.imageType)
      ? (q.imageType as AiQuizQuestion['imageType'])
      : undefined;
    const imageQuery = q.imageQuery ? String(q.imageQuery).substring(0, 80) : undefined;

    return {
      text: String(q.text ?? 'Soru').substring(0, MAX_TEXT_LEN),
      type: q.type === 'true_false' ? 'true_false' : 'multiple_choice',
      answers,
      explanation: String(q.explanation ?? '').substring(0, MAX_EXPLANATION_LEN),
      imageType,
      imageQuery,
    };
  });
}

function resolveImages(questions: AiQuizQuestion[]): AiQuizQuestion[] {
  return questions.map((q) => {
    let resolved: string | undefined;
    let resolvedType = q.imageType;

    if (q.imageType && q.imageQuery) {
      resolved = resolveImageUrl(q.imageType, q.imageQuery);
    }

    // Fallback: infer image from question text and correct answer
    if (!resolved) {
      const correctAnswer = q.answers.find((a) => a.isCorrect)?.text ?? '';
      const fallback = fallbackResolveImage(q.text, correctAnswer);
      if (fallback) {
        resolved = fallback.url;
        resolvedType = fallback.type;
      }
    }

    return {
      ...q,
      imageUrl: resolved,
      imageType: resolved ? resolvedType : undefined,
      imageQuery: resolved ? q.imageQuery || q.answers.find((a) => a.isCorrect)?.text : undefined,
    };
  });
}

export async function generateQuiz(input: GenerateInput): Promise<GenerateResult> {
  const prompt = buildPrompt(input);
  const raw = await callOpenRouter(prompt, 16384);
  const questions = parseAiResponse(raw);
  const withImages = input.includeImages ? resolveImages(questions) : questions;

  // Strip internal fields from response
  const clientQuestions = withImages.map((q) => ({
    text: q.text,
    type: q.type,
    answers: q.answers,
    explanation: q.explanation,
    imageUrl: q.imageUrl,
  }));

  return { questions: clientQuestions };
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
