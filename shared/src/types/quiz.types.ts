export type QuestionType = 'multiple_choice' | 'true_false' | 'image_choice';

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
  | 'mastermind';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AnswerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
  color: AnswerColor;
}

export interface QuizSettings {
  defaultTimeLimit: number;
  showAnswerAfterEach: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  maxParticipants: number;
}

export interface Question {
  _id: string;
  quiz: string;
  type: QuestionType;
  text: string;
  image: { url: string; publicId: string } | null;
  answers: AnswerOption[];
  timeLimit: number;
  points: number;
  explanation: string;
  order: number;
  createdAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  coverImage: { url: string; publicId: string } | null;
  creator: string;
  category: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  modeSettings: Record<string, unknown>;
  tags: string[];
  isPublic: boolean;
  questions: string[];
  settings: QuizSettings;
  stats: {
    timesPlayed: number;
    averageScore: number;
    totalParticipants: number;
  };
  createdAt: string;
  updatedAt: string;
}
