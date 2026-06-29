import { io, type Socket } from 'socket.io-client';
import { SOCKET_NAMESPACE } from '@quizarena/shared';
import type { ClientToServerEvents, ServerToClientEvents } from '../types';
import { SOCKET_URL, STORAGE_KEYS } from '../lib/constants';

export type QuizSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: QuizSocket | null = null;
type ReconnectHandler = () => void;
const reconnectHandlers: Set<ReconnectHandler> = new Set();

export function onReconnect(handler: ReconnectHandler): () => void {
  reconnectHandlers.add(handler);
  return () => reconnectHandlers.delete(handler);
}

export function getSocket(): QuizSocket {
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.connect();
    return socket;
  }
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
    transports: ['polling', 'websocket'],
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
    const savedParticipant = localStorage.getItem(STORAGE_KEYS.participant);
    if (savedPin && savedParticipant && socket) {
      socket.emit('game:rejoin', { pin: savedPin, participantId: savedParticipant });
    }
    reconnectHandlers.forEach((h) => h());
  });

  return socket;
}

export function connectSocket(): QuizSocket {
  return getSocket();
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectHandlers.clear();
  }
}

export function clearGameSession(): void {
  localStorage.removeItem(STORAGE_KEYS.pin);
  localStorage.removeItem(STORAGE_KEYS.participant);
}
