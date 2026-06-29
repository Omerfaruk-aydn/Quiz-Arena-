import type { Server as HttpServer } from 'http';
import { Server as IoServer, type Namespace, type Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@quizarena/shared';
import { SOCKET_NAMESPACE, RATE_LIMITS } from '@quizarena/shared';
import { config } from '../config/index.js';
import type { GameRoom } from './gameEngine/GameRoom.js';
import { logger } from '../utils/logger.js';
import { verifyTokenForSocket } from './socketAuth.js';
import { connectLobbyHandler } from './handlers/connection.handler.js';
import { connectLobbyHandler as lobbyHandler } from './handlers/lobby.handler.js';
import { connectGameHandler } from './handlers/game.handler.js';

export type QuizSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type QuizServer = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const rooms = new Map<string, GameRoom>();

export function setupSocketServer(httpServer: HttpServer): QuizServer {
  const io = new IoServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: { origin: config.clientUrl, credentials: true },
    maxHttpBufferSize: 1e6,
    pingInterval: 15000,
    pingTimeout: 20000,
  });

  const gameNs: Namespace<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > = io.of(SOCKET_NAMESPACE);

  // Rate limiter: her soket için event sayacı
  gameNs.use((socket, next) => {
    const counters = new Map<string, { count: number; resetAt: number }>();
    const key = socket.id;
    const now = Date.now();
    let entry = counters.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + 60_000 };
      counters.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > RATE_LIMITS.socket.max) {
      return next(new Error('Çok fazla istek'));
    }
    next();
  });

  gameNs.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth as { token?: string };
      if (auth?.token) {
        const payload = await verifyTokenForSocket(auth.token);
        if (payload) {
          socket.data.userId = payload.sub;
        }
      }
      next();
    } catch {
      // Oyuncular için token opsiyonel
      next();
    }
  });

  gameNs.on('connection', (socket) => {
    logger.info(`Yeni soket bağlandı: ${socket.id}`);
    connectLobbyHandler(gameNs, socket);
    lobbyHandler(gameNs, socket);
    connectGameHandler(gameNs, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Soket ayrıldı: ${socket.id} (${reason})`);
      void handleDisconnect(socket);
    });
  });

  // Application-level keepalive: send to all active rooms every 15s
  // to prevent Render proxy from dropping idle WebSocket connections
  setInterval(() => {
    for (const [pin] of rooms) {
      gameNs.to(`game:${pin}`).emit('game:keepalive', { ts: Date.now() });
    }
  }, 15000);

  return gameNs;
}

async function handleDisconnect(socket: QuizSocket): Promise<void> {
  for (const [pin, room] of rooms.entries()) {
    if (room.hasSocket(socket.id)) {
      await room.handleDisconnect(socket.id);
      if (room.isEmpty()) {
        rooms.delete(pin);
      }
      break;
    }
  }
}
