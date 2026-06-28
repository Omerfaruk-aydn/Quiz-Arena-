import { api, type Paginated } from './api';
import type { GameStatus } from '../types';

export interface CreateGameInput {
  quizId: string;
  settings?: {
    timeLimit?: number;
    showAnswerAfterEach?: boolean;
    randomizeQuestions?: boolean;
    randomizeAnswers?: boolean;
    maxParticipants?: number;
  };
}

export interface CreateGameResponse {
  pin: string;
  sessionId: string;
  status: GameStatus;
}

export interface GameSessionInfo {
  session: {
    _id: string;
    pin: string;
    status: GameStatus;
    quiz: {
      _id: string;
      title: string;
      description?: string;
      coverImage: { url: string; publicId: string } | null;
      difficulty: string;
      category: string;
    };
    host: string;
    currentQuestionIndex: number;
    startedAt: string | null;
    finishedAt: string | null;
  };
  participantsCount: number;
}

export interface GameReport {
  session: Record<string, unknown> & { pin: string; quiz: { title: string } };
  participants: Array<Record<string, unknown>>;
  answers: Array<Record<string, unknown>>;
}

export interface GameHistoryItem {
  _id: string;
  pin: string;
  status: GameStatus;
  quiz: { _id: string; title: string; category: string; difficulty: string };
  finishedAt: string;
  duration: number;
}

export const gameService = {
  async create(input: CreateGameInput): Promise<CreateGameResponse> {
    const { data } = await api.post<CreateGameResponse>('/games', input);
    return data;
  },

  async getByPin(pin: string): Promise<GameSessionInfo> {
    const { data } = await api.get<GameSessionInfo>(`/games/${pin}`);
    return data;
  },

  async getReport(pin: string): Promise<GameReport> {
    const { data } = await api.get<GameReport>(`/games/${pin}/report`);
    return data;
  },

  async history(
    params: { page?: number; limit?: number } = {},
  ): Promise<Paginated<GameHistoryItem>> {
    const { data } = await api.get<Paginated<GameHistoryItem>>('/games/history', { params });
    return data;
  },
};
