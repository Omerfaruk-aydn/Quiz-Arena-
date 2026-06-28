import { api, type Paginated } from './api';
import type { Quiz, Question } from '../types';

export interface QuizListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isPublic?: boolean;
  settings?: Partial<Quiz['settings']>;
  questions?: Array<Partial<Question>>;
}

export interface QuestionInput {
  type?: Question['type'];
  text: string;
  image?: { url?: string; publicId?: string } | null;
  answers: Question['answers'];
  timeLimit?: number;
  points?: number;
  explanation?: string;
}

export const quizService = {
  async list(params: QuizListParams = {}): Promise<Paginated<Quiz>> {
    const { data } = await api.get<Paginated<Quiz>>('/quizzes', { params });
    return data;
  },

  async listPublic(params: QuizListParams = {}): Promise<Paginated<Quiz>> {
    const { data } = await api.get<Paginated<Quiz>>('/quizzes/public', { params });
    return data;
  },

  async get(id: string): Promise<{ quiz: Quiz & { questions: Question[] } }> {
    const { data } = await api.get<{ quiz: Quiz & { questions: Question[] } }>(`/quizzes/${id}`);
    return data;
  },

  async create(input: CreateQuizInput): Promise<{ quiz: Quiz }> {
    const { data } = await api.post<{ quiz: Quiz }>('/quizzes', input);
    return data;
  },

  async update(id: string, input: Partial<CreateQuizInput>): Promise<{ quiz: Quiz }> {
    const { data } = await api.put<{ quiz: Quiz }>(`/quizzes/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/quizzes/${id}`);
  },

  async duplicate(id: string): Promise<{ quiz: Quiz }> {
    const { data } = await api.post<{ quiz: Quiz }>(`/quizzes/${id}/duplicate`);
    return data;
  },

  async addQuestion(quizId: string, input: QuestionInput): Promise<{ question: Question }> {
    const { data } = await api.post<{ question: Question }>(`/quizzes/${quizId}/questions`, input);
    return data;
  },

  async updateQuestion(
    quizId: string,
    qId: string,
    input: Partial<QuestionInput>,
  ): Promise<{ question: Question }> {
    const { data } = await api.put<{ question: Question }>(
      `/quizzes/${quizId}/questions/${qId}`,
      input,
    );
    return data;
  },

  async deleteQuestion(quizId: string, qId: string): Promise<void> {
    await api.delete(`/quizzes/${quizId}/questions/${qId}`);
  },

  async reorder(quizId: string, orderedIds: string[]): Promise<void> {
    await api.patch(`/quizzes/${quizId}/questions/reorder`, { orderedIds });
  },

  async uploadCover(quizId: string, file: File): Promise<{ url: string; publicId: string }> {
    const form = new FormData();
    form.append('cover', file);
    const { data } = await api.post<{ url: string; publicId: string }>(
      `/quizzes/${quizId}/cover`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async uploadQuestionImage(
    quizId: string,
    qId: string,
    file: File,
  ): Promise<{ url: string; publicId: string }> {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post<{ url: string; publicId: string }>(
      `/quizzes/${quizId}/questions/${qId}/image`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
