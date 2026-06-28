import type {
  GameStatus,
  ParticipantDTO,
  QuestionDTO,
  AnswerStats,
  LeaderboardEntry,
  FinalLeaderboardEntry,
  ReconnectStateDTO,
  JokerType,
  JokerResult,
} from './game.types.js';

export interface ServerToClientEvents {
  'lobby:player_joined': (payload: { participant: ParticipantDTO; totalCount: number }) => void;
  'lobby:player_left': (payload: { participantId: string; totalCount: number }) => void;
  'lobby:player_list': (payload: { participants: ParticipantDTO[] }) => void;
  'lobby:player_kicked': (payload: { participantId: string }) => void;
  'lobby:chat_message': (payload: { nickname: string; message: string; timestamp: string }) => void;
  'game:starting': (payload: { countdown: number }) => void;
  'game:question_start': (payload: {
    question: QuestionDTO;
    index: number;
    total: number;
    timeLimit: number;
  }) => void;
  'game:timer_tick': (payload: { remaining: number }) => void;
  'game:answer_received': (payload: { count: number }) => void;
  'game:question_end': (payload: {
    correctAnswer: number;
    explanation: string;
    answerStats: AnswerStats;
  }) => void;
  'game:leaderboard': (payload: {
    leaderboard: LeaderboardEntry[];
    myRank?: number;
    myScore?: number;
  }) => void;
  'game:player_result': (payload: {
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    rank: number;
  }) => void;
  'game:finished': (payload: { finalLeaderboard: FinalLeaderboardEntry[] }) => void;
  'game:error': (payload: { code: string; message: string }) => void;
  'game:reconnected': (payload: { gameState: ReconnectStateDTO }) => void;
  'host:answer_distribution': (payload: { distribution: number[] }) => void;
  'game:started': (payload: { pin: string; status: GameStatus }) => void;
  'game:joker_result': (payload: { result: JokerResult }) => void;
  'game:phone_a_friend_hint': (payload: { hint: string }) => void;
}

export interface ClientToServerEvents {
  'lobby:join': (
    payload: { pin: string; nickname: string; emoji: string },
    ack?: (res: { ok: boolean; participant?: { _id: string }; error?: string }) => void,
  ) => void;
  'lobby:leave': (payload: { pin: string }) => void;
  'lobby:ready': () => void;
  'host:create_game': (
    payload: { quizId: string; settings?: Partial<unknown> },
    ack?: (res: { ok: boolean; pin?: string; error?: string }) => void,
  ) => void;
  'host:start_game': (payload: { pin: string }) => void;
  'host:next_question': (payload: { pin: string }) => void;
  'host:skip_question': (payload: { pin: string }) => void;
  'host:end_game': (payload: { pin: string }) => void;
  'host:kick_player': (payload: { pin: string; participantId: string }) => void;
  'game:submit_answer': (payload: {
    pin: string;
    answerIndex: number;
    responseTime: number;
  }) => void;
  'game:rejoin': (
    payload: { pin: string; participantId: string },
    ack?: (res: { ok: boolean; error?: string }) => void,
  ) => void;
  'chat:message': (payload: { pin: string; message: string }) => void;
  'game:use_joker': (
    payload: { pin: string; type: JokerType },
    ack?: (res: { ok: boolean; error?: string }) => void,
  ) => void;
}

export interface InterServerEvents {
  ping: () => number;
}

export interface SocketData {
  userId?: string;
  role: 'host' | 'player';
  pin?: string;
  participantId?: string;
  nickname?: string;
}
