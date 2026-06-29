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

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin').toLowerCase(),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'En az 2 karakter').max(60),
    email: z.string().trim().email('Geçerli bir e-posta girin').toLowerCase(),
    password: z.string().min(8, 'Şifre en az 8 karakter').max(128),
    confirmPassword: z.string().min(8),
    role: z.enum(['teacher', 'student']).default('teacher'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin').toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Şifre en az 8 karakter').max(128),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'En az 2 karakter').max(60),
  email: z.string().trim().email('Geçerli bir e-posta girin').toLowerCase(),
});

const answerSchema = z.object({
  text: z.string().trim().min(1, 'Şık metni gerekli').max(MAX_ANSWER_TEXT_LENGTH),
  isCorrect: z.boolean(),
  color: z.enum(['red', 'blue', 'yellow', 'green']),
});

const questionSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['multiple_choice', 'true_false', 'image_choice']).default('multiple_choice'),
  text: z.string().trim().min(1, 'Soru metni gerekli').max(MAX_QUESTION_TEXT_LENGTH),
  image: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .nullable()
    .optional(),
  answers: z
    .array(answerSchema)
    .min(MIN_ANSWERS_PER_QUESTION, 'En az 2 şık gerekli')
    .max(MAX_ANSWERS_PER_QUESTION, 'En fazla 4 şık')
    .refine(
      (arr) => arr.filter((a) => a.isCorrect).length === 1,
      'Tam olarak bir doğru cevap olmalı',
    ),
  timeLimit: z.number().int().min(MIN_TIME_LIMIT).max(MAX_TIME_LIMIT),
  points: z.number().int().min(0).max(5000).default(1000),
  explanation: z.string().max(500).optional().default(''),
  order: z.number().int().min(0).optional(),
});

export const quizSchema = z.object({
  title: z.string().trim().min(1, 'Başlık gerekli').max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional().default(''),
  category: z.string().trim().default('Genel Kültür'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  gameMode: z
    .enum([
      'classic',
      'logo_guess',
      'flag_guess',
      'film_guess',
      'emoji_riddle',
      'true_false_storm',
      'math_sprint',
      'millionaire',
      'sort_events',
      'matching',
      'memory_match',
      'simon_says',
      'pictionary',
      'fibbage',
      'survey',
      'meme_war',
      'mastermind',
      'drawing_battle',
    ])
    .default('classic'),
  modeSettings: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string().trim().max(30)).max(MAX_TAGS_PER_QUIZ).default([]),
  isPublic: z.boolean().default(false),
  settings: z
    .object({
      defaultTimeLimit: z.number().int().min(MIN_TIME_LIMIT).max(MAX_TIME_LIMIT).default(30),
      showAnswerAfterEach: z.boolean().default(true),
      randomizeQuestions: z.boolean().default(false),
      randomizeAnswers: z.boolean().default(false),
      maxParticipants: z.number().int().min(0).max(500).default(0),
    })
    .default({}),
  questions: z.array(questionSchema).default([]),
});

export const joinGameSchema = z.object({
  pin: z
    .string()
    .trim()
    .min(6, 'PIN 6 haneli olmalı')
    .max(6, 'PIN 6 haneli olmalı')
    .regex(/^\d{6}$/, 'PIN yalnızca rakamlardan oluşur'),
  nickname: z
    .string()
    .trim()
    .min(2, 'Takma ad en az 2 karakter')
    .max(20, 'Takma ad en fazla 20 karakter'),
  emoji: z.string().min(1, 'Avatar seç'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QuizFormInput = z.infer<typeof quizSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;

export function zodErrors(error: unknown): Record<string, string> {
  if (error instanceof z.ZodError) {
    const out: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.');
      if (!out[key]) out[key] = issue.message;
    }
    return out;
  }
  return {};
}
