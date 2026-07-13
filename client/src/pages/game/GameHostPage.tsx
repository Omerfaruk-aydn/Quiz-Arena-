import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { gameService } from '../../services/gameService';
import { GameLobby } from '../../components/game/GameLobby';
import { GameQuestion } from '../../components/game/GameQuestion';
import { GameLeaderboard } from '../../components/game/GameLeaderboard';
import { GameResults } from '../../components/game/GameResults';
import { DrawingResults } from '../../components/game/DrawingResults';
import { CountdownStart } from '../../components/game/CountdownTimer';
import { JokerBar } from '../../components/game/JokerBar';
import { ROUTES } from '../../lib/constants';
import { useSound } from '../../hooks/useSound';
import { GAME_MODE_ICONS, GAME_MODE_LABELS } from '../../types';

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
    socket,
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
              gameMode={store.gameMode}
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
        {status === 'active' && store.currentQuestion && store.gameMode === 'drawing_battle' && (
          <motion.div key="active-drawing" className="flex flex-1 flex-col">
            <HostBar
              pin={pin ?? ''}
              answeredCount={store.answeredCount}
              total={store.participants.length}
              distribution={store.answerDistribution}
              onEnd={() => {
                void endGame();
                navigate(ROUTES.dashboard);
              }}
              gameMode={store.gameMode}
            />
            <div className="flex flex-1 flex-col items-center justify-center p-4">
              <div className="glass p-6 text-center">
                <p className="text-sm text-text-muted">Hedef kelime (sadece host görür)</p>
                <p className="text-3xl font-bold text-primary">{store.currentQuestion.text}</p>
              </div>
              <p className="mt-4 text-sm text-text-muted">
                Oyuncular çizimlerini gönderiyor… ({store.answeredCount}/{store.participants.length}
                )
              </p>
            </div>
          </motion.div>
        )}
        {status === 'active' && store.currentQuestion && store.gameMode !== 'drawing_battle' && (
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
              gameMode={store.gameMode}
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
              answerStats={store.answerStats}
              myResult={null}
              onPick={handlePick}
              fiftyFiftyRemoved={store.fiftyFiftyRemoved}
              socket={socket}
              pin={pin}
            />
          </motion.div>
        )}

        {/* Question results */}
        {status === 'question_results' &&
          store.currentQuestion &&
          store.gameMode === 'drawing_battle' && (
            <motion.div key="qresults-drawing" className="flex flex-1 flex-col">
              <HostBar
                pin={pin ?? ''}
                answeredCount={store.answeredCount}
                total={store.participants.length}
                distribution={store.answerDistribution}
                onEnd={() => {
                  void endGame();
                  navigate(ROUTES.dashboard);
                }}
                gameMode={store.gameMode}
              />
              {store.drawingTarget && store.drawingResults.length > 0 ? (
                <DrawingResults target={store.drawingTarget} results={store.drawingResults} />
              ) : (
                <p className="flex flex-1 items-center justify-center text-text-muted">
                  Çizimler analiz ediliyor…
                </p>
              )}
            </motion.div>
          )}
        {status === 'question_results' &&
          store.currentQuestion &&
          store.gameMode !== 'drawing_battle' && (
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
                gameMode={store.gameMode}
              />
              <GameQuestion
                question={store.currentQuestion}
                gameMode={store.gameMode}
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
                answerStats={store.answerStats}
                myResult={store.myResult}
                onPick={() => undefined}
                socket={socket}
                pin={pin}
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
  gameMode,
}: {
  pin: string;
  answeredCount: number;
  total: number;
  distribution: number[];
  onEnd: () => void;
  gameMode?: string;
}) {
  const modeInfo = gameMode
    ? { icon: GAME_MODE_ICONS[gameMode as keyof typeof GAME_MODE_ICONS] ?? '🎯', label: GAME_MODE_LABELS[gameMode as keyof typeof GAME_MODE_LABELS] ?? '' }
    : null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-surface-1/80 to-surface-1/40 px-4 py-3 backdrop-blur-sm sm:px-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
          <span className="font-mono text-xs font-bold tracking-wider text-primary">PIN:</span>
          <span className="font-mono text-sm font-bold text-white">{pin}</span>
        </div>
        {modeInfo && (
          <div className="hidden items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 sm:flex">
            <span className="text-xs">{modeInfo.icon}</span>
            <span className="text-xs text-text-muted">{modeInfo.label}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <span className="text-xs font-bold text-primary">{answeredCount}</span>
          </div>
          <span className="text-xs text-text-muted">
            / <span className="font-semibold text-white">{total}</span> cevapladı
          </span>
        </motion.div>
        <div className="hidden items-center gap-1 sm:flex">
          {distribution.map((c, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex min-w-[22px] items-center justify-center rounded-md px-1.5 py-1 text-xs font-mono font-bold tabular-nums"
              style={{
                backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'][i] + '30',
                color: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'][i],
              }}
            >
              {c}
            </motion.span>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnd}
          className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-text-muted transition-all hover:border-wrong/50 hover:bg-wrong/10 hover:text-wrong"
        >
          Oyunu Bitir
        </motion.button>
      </div>
    </motion.div>
  );
}


