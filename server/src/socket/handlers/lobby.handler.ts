import type { QuizServer, QuizSocket } from '../index.js';
import { rooms } from '../index.js';
import { GameRoom } from '../gameEngine/GameRoom.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export function connectLobbyHandler(io: QuizServer, socket: QuizSocket): void {
  socket.on('lobby:join', async ({ pin, nickname, emoji }, ack) => {
    try {
      const session = await prisma.gameSession.findFirst({ where: { pin, status: 'lobby' } });
      if (!session) throw ApiError.notFound('Lobi bulunamadı', 'LOBBY_NOT_FOUND');

      let room = rooms.get(pin);
      if (!room) {
        room = new GameRoom(io, pin, session.id, {
          timeLimit: session.settingsTimeLimit,
          showAnswerAfterEach: session.settingsShowAnswerAfterEach,
        });
        await room.loadQuiz(session.quizId);
        rooms.set(pin, room);
      }
      if (
        session.settingsMaxParticipants > 0 &&
        room.participantCount() >= session.settingsMaxParticipants
      ) {
        throw ApiError.conflict('Lobi dolu', 'LOBBY_FULL');
      }
      const participant = await room.joinPlayer(socket, nickname, emoji);
      const totalCount = room.participantCount();
      io.to(`game:${pin}`).emit('lobby:player_joined', { participant, totalCount });
      ack?.({ ok: true, participant });
    } catch (err) {
      const e: { statusCode?: number; code?: string; message?: string } = err as {
        statusCode?: number;
        code?: string;
        message?: string;
      };
      socket.emit('game:error', {
        code: e.code ?? 'JOIN_ERROR',
        message: e.message ?? 'Katılma hatası',
      });
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on('host:create_game', async ({ quizId, settings }, ack) => {
    try {
      const { createGameSession } = await import('../../services/gameSessionService.js');
      const session = await createGameSession({
        quizId,
        hostId: socket.data.userId ?? '',
        settings,
      });
      const room = new GameRoom(io, session.pin, session.id, {
        timeLimit: session.settingsTimeLimit,
        showAnswerAfterEach: session.settingsShowAnswerAfterEach,
      });
      await room.loadQuiz(session.quizId);
      rooms.set(session.pin, room);
      room.joinHost(socket);
      ack?.({ ok: true, pin: session.pin });
    } catch (err) {
      const e: { code?: string; message?: string } = err as { code?: string; message?: string };
      socket.emit('game:error', {
        code: e.code ?? 'CREATE_ERROR',
        message: e.message ?? 'Oyun oluşturma hatası',
      });
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on('host:join', async ({ pin }, ack) => {
    try {
      const session = await prisma.gameSession.findFirst({ where: { pin, status: 'lobby' } });
      if (!session) throw ApiError.notFound('Lobi bulunamadı', 'LOBBY_NOT_FOUND');

      let room = rooms.get(pin);
      if (!room) {
        room = new GameRoom(io, pin, session.id, {
          timeLimit: session.settingsTimeLimit,
          showAnswerAfterEach: session.settingsShowAnswerAfterEach,
        });
        await room.loadQuiz(session.quizId);
        rooms.set(pin, room);
      }
      room.joinHost(socket);

      const participants = room.getParticipantsDTO();
      ack?.({ ok: true, participants });
    } catch (err) {
      const e: { statusCode?: number; code?: string; message?: string } = err as {
        statusCode?: number;
        code?: string;
        message?: string;
      };
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on('lobby:leave', ({ pin }: { pin: string }) => {
    const room = rooms.get(pin);
    if (!room) return;
    socket.leave(`game:${pin}`);
    socket.leave(`game:${pin}:players`);
  });

  socket.on('chat:message', ({ pin, message }: { pin: string; message: string }) => {
    if (message.length > 200) return;
    const room = rooms.get(pin);
    if (!room) return;
    const nickname = socket.data.nickname ?? 'Misafir';
    io.to(`game:${pin}`).emit('lobby:chat_message', {
      nickname,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('game:rejoin', async ({ pin, participantId }, ack) => {
    const room = rooms.get(pin);
    if (!room) {
      socket.emit('game:error', { code: 'GAME_NOT_FOUND', message: 'Oyun bulunamadı' });
      return;
    }
    try {
      await room.rejoin(socket, participantId);
      ack?.({ ok: true });
    } catch (err) {
      const e: { message?: string } = err as { message?: string };
      ack?.({ ok: false, error: e.message });
    }
  });
}
