import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { gameService } from '../../services/gameService';
import { GameLobby } from '../../components/game/GameLobby';
import { GameQuestion } from '../../components/game/GameQuestion';
import { GameLeaderboard } from '../../components/game/GameLeaderboard';
import { GameResults } from '../../components/game/GameResults';
import { CountdownStart } from '../../components/game/CountdownTimer';
import { JokerBar } from '../../components/game/JokerBar';
import { ROUTES } from '../../lib/constants';
import { useSound } from '../../hooks/useSound';

export function GameHostPage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const {
    store,
    isConnected,
    startGame,
    endGame,
    sendChat,
    leaveLobby,
    submitAnswer,
    useJoker,
    jokers,
  } = useGame(pin ?? null, 'host');
  const [quizTitle, setQuizTitle] = useState<string | undefined>();
  const questionStartRef = useRef<number>(Date.now());
  const { play } = useSound();
  const lastResultRef = useRef(false);

  const handleCountdownDone = useCallback(() => undefined, []);

  useEffect(() => {
    if (!pin) return;
    gameService
      .getByPin(pin)
      .then((info) => setQuizTitle(info.session?.quiz?.title))
      .catch(() => undefined);
  }, [pin]);

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

  const status = store.status;

  const handleStart = () => {
    startGame();
  };

  const handlePick = (index: number) => {
    const responseTime = Date.now() - questionStartRef.current;
    submitAnswer(index, responseTime);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <AnimatePresence mode="wait">
        {/* Lobby */}
        {status === 'lobby' && (
          <motion.div key="lobby" exit={{ opacity: 0 }} className="flex flex-1 flex-col">
            <GameLobby
              pin={pin ?? ''}
              participants={store.participants}
              role="host"
              chat={store.chat}
              onSendChat={sendChat}
              onStart={handleStart}
              onLeave={() => {
                leaveLobby();
                void endGame();
                navigate(ROUTES.dashboard);
              }}
              quizTitle={quizTitle}
            />
          </motion.div>
        )}

        {/* Countdown 3-2-1 */}
        {status === 'starting' && (
          <motion.div key="starting" className="flex flex-1 flex-col">
            <CountdownStart count={store.countdown || 3} onDone={handleCountdownDone} />
          </motion.div>
        )}

        {/* Active question */}
        {status === 'active' && store.currentQuestion && (
          <motion.div key="active" className="flex flex-1 flex-col">
            <HostBar
              pin={pin ?? ''}
              answeredCount={store.answeredCount}
              total={store.participants.length}
              distribution={store.answerDistribution}
              onEnd={() => {
                void endGame();
                navigate(ROUTES.dashboard);
              }}
            />
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
              answeredCount={store.answeredCount}
              myResult={null}
              onPick={handlePick}
              fiftyFiftyRemoved={store.fiftyFiftyRemoved}
            />
          </motion.div>
        )}

        {/* Question results */}
        {status === 'question_results' && store.currentQuestion && (
          <motion.div key="qresults" className="flex flex-1 flex-col">
            <HostBar
              pin={pin ?? ''}
              answeredCount={store.answeredCount}
              total={store.participants.length}
              distribution={store.answerDistribution}
              onEnd={() => {
                void endGame();
                navigate(ROUTES.dashboard);
              }}
            />
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
              answeredCount={store.answeredCount}
              myResult={store.myResult}
              onPick={() => undefined}
            />
            <p className="pb-6 text-center text-sm text-text-muted">Sıralama hazırlanıyor…</p>
          </motion.div>
        )}

        {/* Leaderboard (auto-advances) */}
        {status === 'leaderboard' && (
          <motion.div key="leaderboard" className="flex flex-1 flex-col">
            <GameLeaderboard
              leaderboard={store.leaderboard}
              isFinal={store.questionIndex + 1 >= store.totalQuestions}
            />
            <p className="pb-6 text-center text-sm text-text-muted">
              {store.questionIndex + 1 >= store.totalQuestions
                ? 'Sonuçlar hazırlanıyor…'
                : 'Sonraki soru yükleniyor…'}
            </p>
          </motion.div>
        )}

        {/* Finished */}
        {status === 'finished' && (
          <motion.div key="finished" className="flex flex-1 flex-col">
            <GameResults
              leaderboard={store.finalLeaderboard}
              myParticipantId={store.participantId ?? undefined}
              pin={pin ?? ''}
              onHome={() => navigate(ROUTES.dashboard)}
              onPlayAgain={() => navigate(ROUTES.quizzes)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isConnected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-wrong/40 bg-wrong/10 px-4 py-2 text-xs text-wrong">
          Bağlantı kopmuş — yeniden bağlanıyor…
        </div>
      )}

      {store.participants.length > 0 && status === 'lobby' && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center">
          <span className="pointer-events-auto rounded-full bg-surface/80 px-4 py-1.5 text-xs text-text-muted backdrop-blur">
            Host modu · {store.participants.length} oyuncu
          </span>
        </div>
      )}
    </div>
  );
}

function HostBar({
  pin,
  answeredCount,
  total,
  distribution,
  onEnd,
}: {
  pin: string;
  answeredCount: number;
  total: number;
  distribution: number[];
  onEnd: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-8">
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-text-muted">PIN: {pin}</span>
        <span className="text-sm">
          <span className="font-semibold text-primary">{answeredCount}</span>
          <span className="text-text-muted"> / {total} cevapladı</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1 sm:flex">
          {distribution.map((c, i) => (
            <span
              key={i}
              className="rounded px-1.5 py-0.5 text-xs font-mono"
              style={{
                backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'][i] + '30',
                color: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'][i],
              }}
            >
              {c}
            </span>
          ))}
        </div>
        <button
          onClick={onEnd}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:border-wrong/50 hover:text-wrong"
        >
          Oyunu Bitir
        </button>
      </div>
    </div>
  );
}
