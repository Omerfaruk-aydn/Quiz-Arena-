import type { QuizSocket } from './socketClient';
import type { ServerToClientEvents } from '../types';

type EventName = keyof ServerToClientEvents;
type Listener<E extends EventName> = ServerToClientEvents[E];

export const gameListeners = {
  on<E extends EventName>(socket: QuizSocket, event: E, fn: Listener<E>): () => void {
    socket.on(event, fn as never);
    return () => socket.off(event, fn as never);
  },

  off<E extends EventName>(socket: QuizSocket, event: E, fn?: Listener<E>): void {
    socket.off(event, fn as never);
  },

  removeAll(socket: QuizSocket, events: EventName[]): void {
    for (const e of events) socket.removeAllListeners(e);
  },
};
