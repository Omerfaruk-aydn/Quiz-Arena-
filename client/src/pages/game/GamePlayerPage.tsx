import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { GameLobby } from '../../components/game/GameLobby';
import { GameQuestion } from '../../components/game/GameQuestion';
import { GameLeaderboard } from '../../components/game/GameLeaderboard';
import { GameResults } from '../../components/game/GameResults';
import { CountdownStart } from '../../components/game/CountdownTimer';
import { JokerBar } from '../../components/game/JokerBar';
import { ROUTES, STORAGE_KEYS } from '../../lib/constants';
import { useSound } from '../../hooks/useSound';

export function GamePlayerPage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const { store, submitAnswer, sendChat, leaveLobby, useJoker, jokers } = useGame(
    pin ?? null,
    'player',
  );
  const questionStartRef = useRef<number>(Date.now());
  const joinedRef = useRef(false);
  const { play } = useSound();
  const lastResultRef = useRef(false);

  useEffect(() => {
    if (store.status === 'active' && store.currentQuestion) {
      questionStartRef.current = Date.now();
    }
  }, [store.currentQuestion, store.status]);

  useEffect(() => {
    if (store.status === 'question_results' && store.myResult) {
      if (store.myResult.isCorrect !== lastResultRef.current) {
        lastResultRef.current = store.myResult.isCorrect;
        play(store.myResult.isCorrect ? 'correct' : 'wrong', 0.5);
      }
    }
    if (store.status === 'active') {
      lastResultRef.current = false;
    }
  }, [store.status, store.myResult, play]);

  useEffect(() => {
    if (store.status === 'finished') {
      play('win', 0.6);
    }
  }, [store.status, play]);

  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
    if (!savedPin && pin) navigate(ROUTES.gameJoin);
  }, [pin, navigate]);

  const handlePick = (index: number) => {
    const responseTime = Date.now() - questionStartRef.current;
    submitAnswer(index, responseTime);
  };

  const status = store.status;

  return (
    <div className="relative flex min-h-screen flex-col">
      <AnimatePresence mode="wait">
        {status === 'lobby' && (
          <motion.div key="lobby" exit={{ opacity: 0 }} className="flex flex-1 flex-col">
            <GameLobby
              pin={pin ?? ''}
              participants={store.participants}
              role="player"
              chat={store.chat}
              onSendChat={sendChat}
              onLeave={() => {
                leaveLobby();
                navigate(ROUTES.gameJoin);
              }}
            />
          </motion.div>
        )}

        {status === 'starting' && (
          <motion.div key="starting" className="flex flex-1 flex-col">
            <CountdownStart count={store.countdown || 3} onDone={() => undefined} />
          </motion.div>
        )}

        {status === 'active' && store.currentQuestion && (
          <motion.div key="active" className="flex flex-1 flex-col">
            <div className="p-4">
              <JokerBar jokers={jokers} onUseJoker={useJoker} disabled={store.hasAnswered} />
            </div>
            <GameQuestion
              question={store.currentQuestion}
              index={store.questionIndex}
              total={store.totalQuestions}
              remaining={store.remainingTime}
              timeLimit={store.timeLimit}
              selectedAnswer={store.selectedAnswer}
              correctAnswer={null}
              hasAnswered={store.hasAnswered}
              showResult={false}
              explanation=""
              answeredCount={0}
              myResult={null}
              onPick={handlePick}
              fiftyFiftyRemoved={store.fiftyFiftyRemoved}
            />
          </motion.div>
        )}

        {status === 'question_results' && store.currentQuestion && (
          <motion.div key="qresults" className="flex flex-1 flex-col">
            <GameQuestion
              question={store.currentQuestion}
              index={store.questionIndex}
              total={store.totalQuestions}
              remaining={0}
              timeLimit={store.timeLimit}
              selectedAnswer={store.selectedAnswer}
              correctAnswer={store.correctAnswer}
              hasAnswered={true}
              showResult={true}
              explanation={store.explanation}
              answeredCount={0}
              myResult={store.myResult}
              onPick={() => undefined}
            />
          </motion.div>
        )}

        {status === 'leaderboard' && (
          <motion.div key="leaderboard" className="flex flex-1 flex-col">
            <GameLeaderboard
              leaderboard={store.leaderboard}
              isFinal={store.questionIndex + 1 >= store.totalQuestions}
            />
            <p className="pb-6 text-center text-sm text-text-muted">
              Host sonraki soruyu başlatıyor…
            </p>
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div key="finished" className="flex flex-1 flex-col">
            <GameResults
              leaderboard={store.finalLeaderboard}
              myParticipantId={store.participantId ?? undefined}
              pin={pin ?? ''}
              onHome={() => navigate(ROUTES.landing)}
              onPlayAgain={() => navigate(ROUTES.gameJoin)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
