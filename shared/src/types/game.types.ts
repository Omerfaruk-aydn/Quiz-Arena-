export type GameStatus =
  'lobby' | 'starting' | 'active' | 'question_results' | 'leaderboard' | 'finished';

export interface ParticipantDTO {
  _id: string;
  nickname: string;
  avatar: { emoji: string; color: string };
  totalScore: number;
  streak: number;
  isConnected: boolean;
  rank?: number;
}

export interface AnswerStats {
  distribution: number[];
  totalAnswered: number;
  totalParticipants: number;
}

export interface QuestionDTO {
  _id: string;
  text: string;
  image: string | null;
  answers: {
    text: string;
    color: string;
  }[];
  timeLimit: number;
  explanation: string;
}

export interface LeaderboardEntry {
  participantId: string;
  nickname: string;
  emoji: string;
  totalScore: number;
  streak: number;
  isCorrect: boolean;
  pointsEarned: number;
  rank: number;
}

export interface FinalLeaderboardEntry {
  participantId: string;
  nickname: string;
  emoji: string;
  totalScore: number;
  correctAnswers: number;
  rank: number;
}

export interface ReconnectStateDTO {
  status: GameStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  remainingTime: number;
  answered: boolean;
  selectedAnswer: number | null;
  totalScore: number;
  rank: number;
}

export type JokerType = 'fifty_fifty' | 'phone_a_friend' | 'skip_question';

export interface JokerState {
  fiftyFifty: boolean;
  phoneAFriend: boolean;
  skipQuestion: boolean;
}

export interface JokerResult {
  type: JokerType;
  removedAnswers?: number[];
  hint?: string;
  skipped?: boolean;
}
