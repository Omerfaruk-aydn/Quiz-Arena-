import type { QuizServer, QuizSocket } from '../index.js';
import { logger } from '../../utils/logger.js';

export function connectLobbyHandler(_io: QuizServer, socket: QuizSocket): void {
  // Bağlantı kurulduğunda ortak işlemler buraya
  void logger.debug(`Soket bağlandı: ${socket.id}`);

  socket.on('lobby:ready', () => {
    logger.debug(`${socket.id} hazır`);
  });
}
