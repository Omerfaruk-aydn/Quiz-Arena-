import type { QuizServer, QuizSocket } from '../index.js';
import { rooms } from '../index.js';

export function connectGameHandler(_io: QuizServer, socket: QuizSocket): void {
  socket.on('host:start_game', ({ pin }: { pin: string }) => {
    const room = rooms.get(pin);
    if (!room) return;
    if (socket.data.role !== 'host') return;
    void room.startGame();
  });

  socket.on('host:next_question', ({ pin }: { pin: string }) => {
    const room = rooms.get(pin);
    if (!room) return;
    if (socket.data.role !== 'host') return;
    room.nextQuestion();
  });

  socket.on('host:skip_question', ({ pin }: { pin: string }) => {
    const room = rooms.get(pin);
    if (!room) return;
    if (socket.data.role !== 'host') return;
    room.skipQuestion();
  });

  socket.on('host:end_game', ({ pin }: { pin: string }) => {
    const room = rooms.get(pin);
    if (!room) return;
    if (socket.data.role !== 'host') return;
    void room.endGame();
  });

  socket.on(
    'host:kick_player',
    ({ pin, participantId }: { pin: string; participantId: string }) => {
      const room = rooms.get(pin);
      if (!room) return;
      if (socket.data.role !== 'host') return;
      void room.kickPlayer(participantId);
    },
  );

  socket.on(
    'game:submit_answer',
    ({
      pin,
      answerIndex,
      responseTime,
    }: {
      pin: string;
      answerIndex: number;
      responseTime: number;
    }) => {
      const room = rooms.get(pin);
      if (!room) return;
      void room.submitAnswer(socket.id, answerIndex, responseTime);
    },
  );

  socket.on(
    'game:use_joker',
    (
      { pin, type }: { pin: string; type: 'fifty_fifty' | 'phone_a_friend' | 'skip_question' },
      ack,
    ) => {
      const room = rooms.get(pin);
      if (!room) {
        ack?.({ ok: false, error: 'Oyun bulunamadı' });
        return;
      }
      void room.useJoker(socket.id, type);
      ack?.({ ok: true });
    },
  );
}
