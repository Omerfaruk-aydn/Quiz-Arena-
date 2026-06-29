import { buildPrompt } from './prompts.js';
import { callOpenRouter } from './openrouter.js';
import { fallbackResolveImage, isValidImageUrl, resolveImageUrl } from './imageResolver.js';
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
    'film',
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
    const isTrueFalse = q.type === 'true_false';
    const maxAnswers = isTrueFalse ? 2 : 4;
    const answers = (q.answers || []).slice(0, maxAnswers).map((a) => ({
      text: String(a.text ?? '').substring(0, MAX_ANSWER_LEN),
      isCorrect: !!a.isCorrect,
    }));

    if (isTrueFalse) {
      // True/false must have exactly Doğru and Yanlış
      const hasTrue = answers.some((a) => /doğru/i.test(a.text));
      const hasFalse = answers.some((a) => /yanlış/i.test(a.text));
      if (!hasTrue) answers.push({ text: 'Doğru', isCorrect: !answers.some((a) => a.isCorrect) });
      if (!hasFalse) answers.push({ text: 'Yanlış', isCorrect: !answers.some((a) => a.isCorrect) });
      // Ensure exactly one correct
      let found = false;
      for (const a of answers) {
        if (a.isCorrect) {
          if (found) a.isCorrect = false;
          found = true;
        }
      }
      if (!found && answers.length > 0) answers[0].isCorrect = true;
    } else {
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
    }

    const imageType = isValidImageType(q.imageType)
      ? (q.imageType as AiQuizQuestion['imageType'])
      : undefined;
    const imageQuery = q.imageQuery ? String(q.imageQuery).substring(0, 80) : undefined;

    return {
      text: String(q.text ?? 'Soru').substring(0, MAX_TEXT_LEN),
      type: isTrueFalse ? 'true_false' : 'multiple_choice',
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
    if (!isValidImageUrl(resolved)) {
      const correctAnswer = q.answers.find((a) => a.isCorrect)?.text ?? '';
      const fallback = fallbackResolveImage(q.text, correctAnswer);
      if (fallback) {
        resolved = fallback.url;
        resolvedType = fallback.type;
      }
    }

    const finalUrl = isValidImageUrl(resolved) ? resolved : undefined;

    return {
      ...q,
      imageUrl: finalUrl,
      imageType: finalUrl ? resolvedType : undefined,
      imageQuery: finalUrl ? q.imageQuery || q.answers.find((a) => a.isCorrect)?.text : undefined,
    };
  });
}

export async function generateQuiz(input: GenerateInput): Promise<GenerateResult> {
  const effectiveInput =
    input.gameMode === 'millionaire'
      ? { ...input, questionCount: Math.max(5, input.questionCount) }
      : input;
  const prompt = buildPrompt(effectiveInput);
  const raw = await callOpenRouter(prompt, 16384);
  const questions = parseAiResponse(raw);
  const withImages = input.includeImages ? resolveImages(questions) : questions;

  // Strip internal fields from response and discard broken/empty image URLs
  const clientQuestions = withImages.map((q) => ({
    text: q.text,
    type: q.type,
    answers: q.answers,
    explanation: q.explanation,
    imageUrl: isValidImageUrl(q.imageUrl) ? q.imageUrl : undefined,
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
