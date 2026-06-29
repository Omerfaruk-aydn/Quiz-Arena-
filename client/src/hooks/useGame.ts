import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from './useSocket';
import { gameEvents } from '../socket/gameEvents';
import { gameListeners } from '../socket/gameListeners';
import { clearGameSession } from '../socket/socketClient';
import { STORAGE_KEYS } from '../lib/constants';
import toast from 'react-hot-toast';
import type { JokerType, JokerState } from '@quizarena/shared';

export function useGame(pin: string | null, role: 'host' | 'player') {
  const { socket, isConnected } = useSocket();
  const store = useGameStore();
  const toastShown = useRef(false);
  const prevPinRef = useRef<string | null>(null);
  const [jokers, setJokers] = useState<JokerState>({
    fiftyFifty: true,
    phoneAFriend: true,
    skipQuestion: true,
  });
  const [phoneAFriendHint, setPhoneAFriendHint] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !pin) return;

    if (prevPinRef.current !== pin) {
      store.reset();
      prevPinRef.current = pin;
      setJokers({ fiftyFifty: true, phoneAFriend: true, skipQuestion: true });
      setPhoneAFriendHint(null);
    }

    store.setPin(pin);
    store.setRole(role);

    const cleanups: Array<() => void> = [];

    // Host joins the game room via socket
    if (role === 'host') {
      gameEvents.hostJoin(socket, pin, (res) => {
        if (res.ok && res.participants) {
          store.setParticipants(res.participants);
        }
        if (res.ok && res.participantId) {
          store.setParticipantId(res.participantId);
          localStorage.setItem(STORAGE_KEYS.participant, res.participantId);
        }
      });
    } else {
      const savedParticipant = localStorage.getItem(STORAGE_KEYS.participant);
      if (savedParticipant) store.setParticipantId(savedParticipant);
    }

    cleanups.push(
      gameListeners.on(socket, 'lobby:player_joined', ({ participant, totalCount }) => {
        store.addParticipant(participant);
        if (role === 'host') toast.success(`${participant.nickname} katıldı (${totalCount})`);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'lobby:player_left', ({ participantId, totalCount }) => {
        store.removeParticipant(participantId);
        void totalCount;
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'lobby:player_list', ({ participants }) => {
        store.setParticipants(participants);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'lobby:player_kicked', ({ participantId }) => {
        if (participantId === store.participants.find((p) => p._id === participantId)?._id) {
          toast.error('Oyundan atıldınız');
        }
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'lobby:chat_message', (msg) => {
        store.addChat(msg);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:starting', ({ countdown }) => {
        store.setCountdown(countdown);
        store.setStatus('starting');
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:started', () => {
        store.setStatus('active');
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:question_start', ({ question, index, total, timeLimit }) => {
        store.setQuestion(question, index, total, timeLimit);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:timer_tick', ({ remaining }) => {
        store.setRemaining(remaining);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:answer_received', ({ count }) => {
        store.setAnsweredCount(count);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'host:answer_distribution', ({ distribution }) => {
        store.setDistribution(distribution);
      }),
    );
    cleanups.push(
      gameListeners.on(
        socket,
        'game:question_end',
        ({ correctAnswer, explanation, answerStats }) => {
          store.setQuestionEnd(correctAnswer, explanation, answerStats);
        },
      ),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:player_result', (result) => {
        store.setMyResult(result);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:leaderboard', ({ leaderboard }) => {
        store.setLeaderboard(leaderboard);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:finished', ({ finalLeaderboard }) => {
        store.setFinalLeaderboard(finalLeaderboard);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:reconnected', ({ gameState }) => {
        store.syncState(gameState);
      }),
    );
    cleanups.push(
      gameListeners.on(socket, 'game:error', ({ code, message }) => {
        if (!toastShown.current) {
          toastShown.current = true;
          toast.error(message);
          setTimeout(() => (toastShown.current = false), 2000);
        }
        store.setError({ code, message });
      }),
    );

    cleanups.push(
      gameListeners.on(socket, 'game:joker_result', ({ result }) => {
        if (result.type === 'fifty_fifty' && result.removedAnswers) {
          store.setFiftyFiftyRemoved(result.removedAnswers);
        }
        if (result.type === 'skip_question') {
          toast('Soru atlandı!', { icon: '⏭️' });
        }
      }),
    );

    cleanups.push(
      gameListeners.on(socket, 'game:phone_a_friend_hint', ({ hint }) => {
        setPhoneAFriendHint(hint);
        toast(hint, { icon: '📞', duration: 8000 });
      }),
    );

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [socket, pin, role]);

  const submitAnswer = useCallback(
    (answerIndex: number, responseTime: number) => {
      if (!socket || !pin) return;
      store.selectAnswer(answerIndex);
      gameEvents.submitAnswer(socket, pin, answerIndex, responseTime);
    },
    [socket, pin, store],
  );

  const startGame = useCallback(() => {
    if (socket && pin) gameEvents.startGame(socket, pin);
  }, [socket, pin]);

  const nextQuestion = useCallback(() => {
    if (socket && pin) gameEvents.nextQuestion(socket, pin);
  }, [socket, pin]);

  const skipQuestion = useCallback(() => {
    if (socket && pin) gameEvents.skipQuestion(socket, pin);
  }, [socket, pin]);

  const endGame = useCallback(() => {
    if (socket && pin) gameEvents.endGame(socket, pin);
  }, [socket, pin]);

  const kickPlayer = useCallback(
    (participantId: string) => {
      if (socket && pin) gameEvents.kickPlayer(socket, pin, participantId);
    },
    [socket, pin],
  );

  const sendChat = useCallback(
    (message: string) => {
      if (socket && pin) gameEvents.sendChat(socket, pin, message);
    },
    [socket, pin],
  );

  const leaveLobby = useCallback(() => {
    if (socket && pin) {
      gameEvents.leaveLobby(socket, pin);
      clearGameSession();
    }
  }, [socket, pin]);

  const useJoker = useCallback(
    (type: JokerType) => {
      if (!socket || !pin) return;
      gameEvents.useJoker(socket, pin, type, (res) => {
        if (res.ok) {
          setJokers((prev) => ({
            ...prev,
            [type === 'fifty_fifty'
              ? 'fiftyFifty'
              : type === 'phone_a_friend'
                ? 'phoneAFriend'
                : 'skipQuestion']: false,
          }));
        } else {
          toast.error(res.error ?? 'Joker kullanılamadı');
        }
      });
    },
    [socket, pin],
  );

  return {
    socket,
    isConnected,
    store,
    submitAnswer,
    startGame,
    nextQuestion,
    skipQuestion,
    endGame,
    kickPlayer,
    sendChat,
    leaveLobby,
    useJoker,
    jokers,
    phoneAFriendHint,
  };
}
