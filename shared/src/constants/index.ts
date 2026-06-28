export const ANSWER_COLORS = {
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  green: '#10B981',
} as const;

export const ANSWER_ICONS = {
  red: '▲',
  blue: '●',
  yellow: '■',
  green: '♦',
} as const;

export const POINTS_BASE = 1000;
export const POINTS_SPEED_BONUS_RATIO = 0.5;
export const POINTS_STREAK_BONUS_STEP = 50;
export const POINTS_STREAK_BONUS_MAX = 200;

export const TIME_LIMITS = [10, 15, 20, 30, 45, 60] as const;
export const DEFAULT_TIME_LIMIT = 30;
export const MIN_TIME_LIMIT = 10;
export const MAX_TIME_LIMIT = 60;

export const DIFFICULTY_TIME_LIMITS: Record<string, number> = {
  easy: 20,
  medium: 30,
  hard: 45,
} as const;

export function getTimeLimitForDifficulty(difficulty: string): number {
  return DIFFICULTY_TIME_LIMITS[difficulty] ?? DEFAULT_TIME_LIMIT;
}

export const MAX_QUESTIONS_PER_QUIZ = 100;
export const MAX_ANSWERS_PER_QUESTION = 4;
export const MIN_ANSWERS_PER_QUESTION = 2;
export const MAX_PARTICIPANTS_DEFAULT = 0;

export const GAME_PIN_LENGTH = 6;

export const MAX_TAGS_PER_QUIZ = 10;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_QUESTION_TEXT_LENGTH = 200;
export const MAX_ANSWER_TEXT_LENGTH = 75;

export const RATE_LIMITS = {
  auth: { windowMs: 60 * 1000, max: 5 },
  api: { windowMs: 60 * 1000, max: 100 },
  socket: { max: 60 },
} as const;

export const EMOJI_AVATARS = [
  '🦊',
  '🐻',
  '🐼',
  '🦁',
  '🐯',
  '🐨',
  '🐸',
  '🦉',
  '🦄',
  '🐙',
  '🦖',
  '🐬',
  '🦅',
  '🐺',
  '🦝',
  '🐹',
] as const;

export const SOCKET_NAMESPACE = '/game';
