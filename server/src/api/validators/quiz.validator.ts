import { z } from 'zod';
import {
  MAX_ANSWER_TEXT_LENGTH,
  MAX_ANSWERS_PER_QUESTION,
  MAX_DESCRIPTION_LENGTH,
  MAX_QUESTION_TEXT_LENGTH,
  MAX_TAGS_PER_QUIZ,
  MAX_TIME_LIMIT,
  MAX_TITLE_LENGTH,
  MIN_ANSWERS_PER_QUESTION,
  MIN_TIME_LIMIT,
} from '@quizarena/shared';

const answerSchema = z.object({
  text: z.string().trim().min(1).max(MAX_ANSWER_TEXT_LENGTH),
  isCorrect: z.boolean(),
  color: z.enum(['red', 'blue', 'yellow', 'green']),
});

const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'image_choice']).optional(),
  text: z.string().trim().min(1).max(MAX_QUESTION_TEXT_LENGTH),
  image: z
    .object({ url: z.string().url().optional(), publicId: z.string().optional() })
    .nullable()
    .optional(),
  answers: z
    .array(answerSchema)
    .min(MIN_ANSWERS_PER_QUESTION)
    .max(MAX_ANSWERS_PER_QUESTION)
    .refine(
      (arr) => arr.filter((a) => a.isCorrect).length === 1,
      'Tam olarak bir doğru cevap olmalı',
    ),
  timeLimit: z.number().int().min(MIN_TIME_LIMIT).max(MAX_TIME_LIMIT).optional(),
  points: z.number().int().min(0).max(5000).optional(),
  explanation: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
});

export const createQuizSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  category: z.string().trim().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().trim().max(30)).max(MAX_TAGS_PER_QUIZ).optional(),
  isPublic: z.boolean().optional(),
  settings: z
    .object({
      defaultTimeLimit: z.number().int().min(MIN_TIME_LIMIT).max(MAX_TIME_LIMIT).optional(),
      showAnswerAfterEach: z.boolean().optional(),
      randomizeQuestions: z.boolean().optional(),
      randomizeAnswers: z.boolean().optional(),
      maxParticipants: z.number().int().min(0).max(500).optional(),
    })
    .optional(),
  questions: z.array(questionSchema).optional(),
});

export const updateQuizSchema = createQuizSchema.partial();

export const addQuestionSchema = questionSchema.omit({ order: true });

export const updateQuestionSchema = questionSchema.partial();

export const reorderQuestionsSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = z.infer<typeof addQuestionSchema>;
