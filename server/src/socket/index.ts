import type { Server as HttpServer } from 'http';
import { Server as IoServer, type Namespace, type Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@quizarena/shared';
import { SOCKET_NAMESPACE, RATE_LIMITS } from '@quizarena/shared';
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
    cors: { origin: true, credentials: true },
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
    // Rate limiter: per-socket event counter. Installed inside each connection
    // so every emitted event counts against the limit, not just the connection.
    const counter = { count: 0, resetAt: Date.now() + 60_000 };
    socket.use((packet, next) => {
      const eventName = packet[0];
      // Exclude keepalive and ping/pong from the limit to avoid false positives
      if (eventName === 'ping' || eventName === 'pong') return next();
      const now = Date.now();
      if (now > counter.resetAt) {
        counter.count = 0;
        counter.resetAt = now + 60_000;
      }
      counter.count += 1;
      if (counter.count > RATE_LIMITS.socket.max) {
        return next(new Error('Çok fazla istek'));
      }
      next();
    });

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
