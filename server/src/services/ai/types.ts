export type QuestionType = 'multiple_choice' | 'true_false';

export type ImageType =
  | 'flag'
  | 'landmark'
  | 'person'
  | 'logo'
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
}

export interface GenerateResult {
  questions: AiQuizQuestion[];
}
