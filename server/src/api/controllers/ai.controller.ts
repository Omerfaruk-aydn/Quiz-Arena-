import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { generateQuiz } from '../../services/aiService.js';

export const generate = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, questionCount, includeImages, gameMode } = req.body;
  const count = Math.min(20, Math.max(3, Number(questionCount) || 5));

  const result = await generateQuiz({
    difficulty: difficulty || 'medium',
    questionCount: count,
    includeImages: !!includeImages,
    gameMode: gameMode || 'classic',
  });

  res.json({ questions: result.questions });
});
