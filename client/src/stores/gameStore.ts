import { create } from 'zustand';
import type {
  GameStatus,
  ParticipantDTO,
  QuestionDTO,
  AnswerStats,
  LeaderboardEntry,
  FinalLeaderboardEntry,
  ReconnectStateDTO,
} from '../types';

interface ChatMessage {
  nickname: string;
  message: string;
  timestamp: string;
}

interface GameState {
  pin: string | null;
  role: 'host' | 'player' | null;
  participantId: string | null;
  status: GameStatus;
  participants: ParticipantDTO[];
  currentQuestion: QuestionDTO | null;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
  remainingTime: number;
  answeredCount: number;
  answerDistribution: number[];
  correctAnswer: number | null;
  explanation: string;
  answerStats: AnswerStats | null;
  leaderboard: LeaderboardEntry[];
  finalLeaderboard: FinalLeaderboardEntry[];
  myResult: {
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    rank: number;
  } | null;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  chat: ChatMessage[];
  error: { code: string; message: string } | null;
  countdown: number;
  fiftyFiftyRemoved: number[];

  setPin: (pin: string | null) => void;
  setRole: (role: 'host' | 'player' | null) => void;
  setParticipantId: (id: string | null) => void;
  setStatus: (status: GameStatus) => void;
  setParticipants: (p: ParticipantDTO[]) => void;
  addParticipant: (p: ParticipantDTO) => void;
  removeParticipant: (participantId: string) => void;
  setQuestion: (q: QuestionDTO | null, index: number, total: number, timeLimit: number) => void;
  setRemaining: (remaining: number) => void;
  setAnsweredCount: (count: number) => void;
  setDistribution: (d: number[]) => void;
  setQuestionEnd: (correctAnswer: number, explanation: string, answerStats: AnswerStats) => void;
  setLeaderboard: (l: LeaderboardEntry[]) => void;
  setFinalLeaderboard: (l: FinalLeaderboardEntry[]) => void;
  setMyResult: (r: GameState['myResult']) => void;
  selectAnswer: (idx: number) => void;
  setChat: (m: ChatMessage[]) => void;
  addChat: (m: ChatMessage) => void;
  setError: (e: GameState['error']) => void;
  setCountdown: (c: number) => void;
  setFiftyFiftyRemoved: (indices: number[]) => void;
  syncState: (state: ReconnectStateDTO) => void;
  reset: () => void;
}

const initial = {
  pin: null as string | null,
  role: null as 'host' | 'player' | null,
  participantId: null as string | null,
  status: 'lobby' as GameStatus,
  participants: [] as ParticipantDTO[],
  currentQuestion: null as QuestionDTO | null,
  questionIndex: 0,
  totalQuestions: 0,
  timeLimit: 30,
  remainingTime: 30,
  answeredCount: 0,
  answerDistribution: [0, 0, 0, 0],
  correctAnswer: null as number | null,
  explanation: '',
  answerStats: null as AnswerStats | null,
  leaderboard: [] as LeaderboardEntry[],
  finalLeaderboard: [] as FinalLeaderboardEntry[],
  myResult: null as GameState['myResult'],
  selectedAnswer: null as number | null,
  hasAnswered: false,
  chat: [] as ChatMessage[],
  error: null as GameState['error'],
  countdown: 0,
  fiftyFiftyRemoved: [] as number[],
};

export const useGameStore = create<GameState>((set) => ({
  ...initial,
  setPin: (pin) => set({ pin }),
  setRole: (role) => set({ role }),
  setParticipantId: (participantId) => set({ participantId }),
  setStatus: (status) => set({ status }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (p) =>
    set((s) => ({
      participants: s.participants.some((x) => x._id === p._id)
        ? s.participants.map((x) => (x._id === p._id ? p : x))
        : [...s.participants, p],
    })),
  removeParticipant: (participantId) =>
    set((s) => ({ participants: s.participants.filter((p) => p._id !== participantId) })),
  setQuestion: (currentQuestion, questionIndex, totalQuestions, timeLimit) =>
    set({
      currentQuestion,
      questionIndex,
      totalQuestions,
      timeLimit,
      remainingTime: timeLimit,
      answeredCount: 0,
      answerDistribution: [0, 0, 0, 0],
      correctAnswer: null,
      explanation: '',
      answerStats: null,
      hasAnswered: false,
      selectedAnswer: null,
      myResult: null,
      fiftyFiftyRemoved: [],
    }),
  setRemaining: (remainingTime) => set({ remainingTime }),
  setAnsweredCount: (answeredCount) => set({ answeredCount }),
  setDistribution: (answerDistribution) => set({ answerDistribution }),
  setQuestionEnd: (correctAnswer, explanation, answerStats) =>
    set({ correctAnswer, explanation, answerStats, status: 'question_results' }),
  setLeaderboard: (leaderboard) => set({ leaderboard, status: 'leaderboard' }),
  setFinalLeaderboard: (finalLeaderboard) => set({ finalLeaderboard, status: 'finished' }),
  setMyResult: (myResult) => set({ myResult }),
  selectAnswer: (idx) => set({ selectedAnswer: idx, hasAnswered: true }),
  setChat: (chat) => set({ chat }),
  addChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-50) })),
  setError: (error) => set({ error }),
  setCountdown: (countdown) => set({ countdown }),
  setFiftyFiftyRemoved: (fiftyFiftyRemoved) => set({ fiftyFiftyRemoved }),
  syncState: (state) =>
    set({
      status: state.status,
      questionIndex: state.currentQuestionIndex,
      totalQuestions: state.totalQuestions,
      remainingTime: state.remainingTime,
      timeLimit: state.remainingTime,
      hasAnswered: state.answered,
      selectedAnswer: state.selectedAnswer,
      myResult:
        state.totalScore > 0
          ? {
              isCorrect: false,
              pointsEarned: 0,
              totalScore: state.totalScore,
              rank: state.rank,
            }
          : null,
    }),
  reset: () => set({ ...initial }),
}));
