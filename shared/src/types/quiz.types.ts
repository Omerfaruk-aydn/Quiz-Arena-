export type QuestionType = 'multiple_choice' | 'true_false' | 'image_choice';

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
