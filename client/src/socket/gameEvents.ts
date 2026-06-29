import type { QuizSocket } from './socketClient';
import type { JokerType } from '@quizarena/shared';
import type { ParticipantDTO } from '../types';

export const gameEvents = {
  joinLobby: (
    socket: QuizSocket,
    pin: string,
    nickname: string,
    emoji: string,
    ack?: (res: { ok: boolean; participant?: { _id: string }; error?: string }) => void,
  ) => socket.emit('lobby:join', { pin, nickname, emoji }, ack),

  leaveLobby: (socket: QuizSocket, pin: string) => socket.emit('lobby:leave', { pin }),

  createGame: (socket: QuizSocket, quizId: string, settings?: Record<string, unknown>) =>
    socket.emit('host:create_game', { quizId, settings }),

  hostJoin: (
    socket: QuizSocket,
    pin: string,
    ack?: (res: { ok: boolean; participants?: ParticipantDTO[]; error?: string }) => void,
  ) => socket.emit('host:join', { pin }, ack),

  startGame: (socket: QuizSocket, pin: string) => socket.emit('host:start_game', { pin }),

  nextQuestion: (socket: QuizSocket, pin: string) => socket.emit('host:next_question', { pin }),

  skipQuestion: (socket: QuizSocket, pin: string) => socket.emit('host:skip_question', { pin }),

  endGame: (socket: QuizSocket, pin: string) => socket.emit('host:end_game', { pin }),

  kickPlayer: (socket: QuizSocket, pin: string, participantId: string) =>
    socket.emit('host:kick_player', { pin, participantId }),

  submitAnswer: (socket: QuizSocket, pin: string, answerIndex: number, responseTime: number) =>
    socket.emit('game:submit_answer', { pin, answerIndex, responseTime }),

  rejoin: (socket: QuizSocket, pin: string, participantId: string) =>
    socket.emit('game:rejoin', { pin, participantId }),

  sendChat: (socket: QuizSocket, pin: string, message: string) =>
    socket.emit('chat:message', { pin, message }),

  useJoker: (
    socket: QuizSocket,
    pin: string,
    type: JokerType,
    ack?: (res: { ok: boolean; error?: string }) => void,
  ) => socket.emit('game:use_joker', { pin, type }, ack),
};
