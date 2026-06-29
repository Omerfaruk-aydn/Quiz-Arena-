export type { User, UserRole, AuthTokens, AuthResponse } from '@quizarena/shared';

export type {
  Quiz,
  Question,
  AnswerOption,
  QuizSettings,
  QuestionType,
  GameMode,
  Difficulty,
  AnswerColor,
} from '@quizarena/shared';

export type {
  GameStatus,
  ParticipantDTO,
  AnswerStats,
  QuestionDTO,
  LeaderboardEntry,
  FinalLeaderboardEntry,
  ReconnectStateDTO,
} from '@quizarena/shared';

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@quizarena/shared';

export {
  ANSWER_COLORS,
  ANSWER_ICONS,
  EMOJI_AVATARS,
  TIME_LIMITS,
  DEFAULT_TIME_LIMIT,
  GAME_PIN_LENGTH,
  GAME_MODES,
  GAME_MODE_LABELS,
  GAME_MODE_ICONS,
} from '@quizarena/shared';
