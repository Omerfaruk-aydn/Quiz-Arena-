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

export const GAME_MODES = [
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
] as const;

export const GAME_MODE_LABELS: Record<(typeof GAME_MODES)[number], string> = {
  classic: 'Klasik Quiz',
  logo_guess: 'Logo Tahmin',
  flag_guess: 'Bayrak & Başkent',
  film_guess: 'Film & Sahne',
  emoji_riddle: 'Emoji Bulmaca',
  true_false_storm: 'Doğru/Yanlış Fırtınası',
  math_sprint: 'Matematik Sprint',
  millionaire: 'Kim Milyoner Olmak İster',
  sort_events: 'Tarihi Sırala',
  matching: 'Eşleştirme Yarışması',
  memory_match: 'Hafıza Kartları',
  simon_says: 'Simon Says',
  pictionary: 'Çiz ve Tahmin Et',
  fibbage: 'Yalan Makinesi',
  survey: 'Anket ve Tahmin',
  meme_war: 'Meme Savaşı',
  mastermind: 'Mastermind',
  drawing_battle: 'Çizim Savaşı (AI)',
};

export const GAME_MODE_ICONS: Record<(typeof GAME_MODES)[number], string> = {
  classic: '🎯',
  logo_guess: '🏷️',
  flag_guess: '🚩',
  film_guess: '🎬',
  emoji_riddle: '😀',
  true_false_storm: '⚡',
  math_sprint: '🔢',
  millionaire: '💰',
  sort_events: '📜',
  matching: '🔗',
  memory_match: '🃏',
  simon_says: '🎹',
  pictionary: '🎨',
  fibbage: '🤥',
  survey: '📊',
  meme_war: '😂',
  mastermind: '🧠',
  drawing_battle: '✏️',
};

export const SOCKET_NAMESPACE = '/game';
