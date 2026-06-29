export type QuestionType = 'multiple_choice' | 'true_false';

export type GameMode =
  | 'classic'
  | 'logo_guess'
  | 'flag_guess'
  | 'film_guess'
  | 'emoji_riddle'
  | 'true_false_storm'
  | 'math_sprint'
  | 'millionaire'
  | 'sort_events'
  | 'matching'
  | 'memory_match'
  | 'simon_says'
  | 'pictionary'
  | 'fibbage'
  | 'survey'
  | 'meme_war'
  | 'mastermind'
  | 'drawing_battle';

export type ImageType =
  | 'flag'
  | 'landmark'
  | 'person'
  | 'logo'
  | 'film'
  | 'map'
  | 'artwork'
  | 'animal'
  | 'instrument'
  | 'food'
  | 'nature'
  | 'architecture';

export interface AiQuizQuestion {
  text: string;
  type: QuestionType;
  answers: Array<{ text: string; isCorrect: boolean }>;
  explanation: string;
  imageUrl?: string;
  imageType?: ImageType | string;
  imageQuery?: string;
}

export interface GenerateInput {
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  includeImages: boolean;
  gameMode?: GameMode;
}

export interface GenerateResult {
  questions: AiQuizQuestion[];
}
