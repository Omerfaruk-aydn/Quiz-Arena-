import { api } from './api';

export interface AiQuizQuestion {
  text: string;
  type: 'multiple_choice' | 'true_false';
  answers: Array<{ text: string; isCorrect: boolean }>;
  explanation: string;
  imageUrl?: string;
}

export interface GenerateInput {
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  includeImages?: boolean;
}

export const aiService = {
  async generate(input: GenerateInput): Promise<{ questions: AiQuizQuestion[] }> {
    const { data } = await api.post<{ questions: AiQuizQuestion[] }>(
      '/ai/generate',
      {
        difficulty: input.difficulty ?? 'medium',
        questionCount: input.questionCount ?? 5,
        includeImages: input.includeImages ?? false,
      },
      { timeout: 120000 },
    );
    return data;
  },
};
