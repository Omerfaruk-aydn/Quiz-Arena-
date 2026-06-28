import {
  POINTS_BASE,
  POINTS_SPEED_BONUS_RATIO,
  POINTS_STREAK_BONUS_MAX,
  POINTS_STREAK_BONUS_STEP,
} from '@quizarena/shared';

export interface ScoreInput {
  isCorrect: boolean;
  responseTime: number;
  timeLimit: number;
  basePoints?: number;
  streak: number;
}

export function calculatePoints(input: ScoreInput): number {
  const { isCorrect, responseTime, timeLimit, basePoints = POINTS_BASE, streak } = input;
  if (!isCorrect) return 0;

  const effectiveTimeLimit = Math.max(1, timeLimit);
  const ratio = Math.max(0, 1 - responseTime / (effectiveTimeLimit * 1000));
  const speedBonus = Math.round(basePoints * ratio * POINTS_SPEED_BONUS_RATIO);
  const streakBonus = Math.min(streak * POINTS_STREAK_BONUS_STEP, POINTS_STREAK_BONUS_MAX);

  return basePoints + speedBonus + streakBonus;
}
