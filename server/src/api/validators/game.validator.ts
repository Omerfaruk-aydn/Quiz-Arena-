import { z } from 'zod';

export const createGameSchema = z.object({
  quizId: z.string().min(1),
  settings: z
    .object({
      timeLimit: z.number().int().min(5).max(120).optional(),
      showAnswerAfterEach: z.boolean().optional(),
      randomizeQuestions: z.boolean().optional(),
      randomizeAnswers: z.boolean().optional(),
      maxParticipants: z.number().int().min(0).max(500).optional(),
    })
    .optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
