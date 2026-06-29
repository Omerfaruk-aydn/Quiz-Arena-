import { motion } from 'framer-motion';
import { Users, Check, X } from 'lucide-react';
import type { QuestionDTO, GameMode } from '../../types';
import { useSound } from '../../hooks/useSound';
import { CountdownTimer } from './CountdownTimer';
import { GameAnswerGrid } from './GameAnswerGrid';
import { ScorePopup } from './ScorePopup';
import { cn } from '../../lib/utils';

interface GameQuestionProps {
  question: QuestionDTO;
  gameMode?: GameMode | string;
  index: number;
  total: number;
  remaining: number;
  timeLimit: number;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  explanation: string;
  answeredCount: number;
  answerStats?: { distribution: number[]; totalAnswered: number; totalParticipants: number } | null;
  myResult: { isCorrect: boolean; pointsEarned: number } | null;
  onPick: (index: number) => void;
  onTimeout?: () => void;
  fiftyFiftyRemoved?: number[];
}

export function GameQuestion({
  question,
  gameMode = 'classic',
  index,
  total,
  remaining,
  timeLimit,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  explanation,
  answeredCount,
  answerStats,
  myResult,
  onPick,
  fiftyFiftyRemoved = [],
}: GameQuestionProps) {
  const { play } = useSound();

  const handlePick = (i: number) => {
    if (hasAnswered) return;
    play('click', 0.3);
    onPick(i);
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-semibold text-primary">
            Soru {index + 1} / {total}
          </span>
          <div className="flex items-center gap-3">
            {answeredCount > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                <Users size={16} /> {answeredCount} cevapladı
              </span>
            )}
            <CountdownTimer remaining={remaining} total={timeLimit} size={88} />
          </div>
        </div>

        <QuestionCard question={question} gameMode={gameMode} />

        {gameMode === 'true_false_storm' || question.answers.length === 2 ? (
          <TrueFalseButtons
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : (
          <GameAnswerGrid
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
            fiftyFiftyRemoved={fiftyFiftyRemoved}
            hideCorrectHighlight={gameMode === 'survey'}
          />
        )}

        {showResult && gameMode === 'survey' && answerStats && (
          <SurveyResults question={question} answerStats={answerStats} />
        )}

        {showResult && explanation && gameMode !== 'survey' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-2 p-4 text-sm text-text-muted"
          >
            <span className="font-semibold text-white">Açıklama: </span>
            {explanation}
          </motion.div>
        )}

        {hasAnswered && !showResult && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-muted"
          >
            Cevabın gönderildi, diğer oyuncular bekleniyor…
          </motion.p>
        )}
      </div>

      <ScorePopup
        show={showResult && !!myResult}
        isCorrect={myResult?.isCorrect ?? false}
        points={myResult?.pointsEarned ?? 0}
      />
    </div>
  );
}

const VISUAL_MODES = new Set(['logo_guess', 'flag_guess', 'film_guess']);

function SurveyResults({
  question,
  answerStats,
}: {
  question: QuestionDTO;
  answerStats: { distribution: number[]; totalAnswered: number; totalParticipants: number };
}) {
  const total = Math.max(1, answerStats.totalAnswered);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-2 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-white">📊 Anket Sonuçları</p>
      <div className="space-y-2">
        {question.answers.map((a, i) => {
          const count = answerStats.distribution[i] ?? 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-text-muted">{pct}%</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate">{a.text}</span>
                  <span className="text-xs text-text-muted">{count} oy</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function QuestionCard({
  question,
  gameMode,
}: {
  question: QuestionDTO;
  gameMode: GameMode | string;
}) {
  const isEmoji = gameMode === 'emoji_riddle';
  const isVisual = VISUAL_MODES.has(gameMode);

  return (
    <motion.div
      key={question._id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass min-h-[140px] p-6 text-center sm:p-8"
    >
      {isEmoji ? (
        <p className="text-5xl font-semibold leading-tight tracking-wide sm:text-7xl">
          {question.text}
        </p>
      ) : (
        <p
          className={cn(
            'font-semibold',
            isVisual ? 'text-lg text-text-muted sm:text-xl' : 'text-xl sm:text-2xl',
          )}
        >
          {question.text}
        </p>
      )}
      {question.image && (
        <div
          className={cn(
            'mx-auto mt-4 inline-block rounded-xl bg-white/90 p-2 dark:bg-slate-100',
            isVisual && 'p-3',
          )}
        >
          <img
            src={question.image}
            alt="soru görseli"
            className={cn(
              'rounded-lg object-contain',
              isVisual ? 'max-h-72 sm:max-h-96' : 'max-h-56',
            )}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              const wrapper = img.parentElement;
              if (wrapper) wrapper.style.display = 'none';
              img.src =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

function TrueFalseButtons({
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: {
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}) {
  const options = [
    { text: 'Doğru', icon: Check, color: '#10B981', index: 0 },
    { text: 'Yanlış', icon: X, color: '#EF4444', index: 1 },
  ];

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {options.map(({ text, icon: Icon, color, index }) => {
        const isCorrect = showResult && correctAnswer === index;
        const isWrongPick = showResult && selectedAnswer === index && correctAnswer !== index;
        const isFaded = showResult && correctAnswer !== index && selectedAnswer !== index;
        return (
          <motion.button
            key={index}
            type="button"
            disabled={hasAnswered || showResult}
            onClick={() => onPick(index)}
            whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.97 } : undefined}
            animate={
              isCorrect ? { scale: [1, 1.08, 1] } : isWrongPick ? { scale: [1, 0.95, 1] } : {}
            }
            className={cn(
              'relative flex min-h-[100px] w-full items-center justify-center gap-3 rounded-2xl px-4 py-6 text-left font-bold text-white transition-all sm:min-h-[120px]',
              'disabled:cursor-not-allowed',
              !hasAnswered && !showResult && 'hover:brightness-110',
              selectedAnswer === index && !showResult && 'ring-4 ring-white/50',
              isFaded && 'opacity-40 grayscale',
              isCorrect && 'ring-4 ring-white/70',
              isWrongPick && 'ring-4 ring-black/40',
            )}
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 24px ${color}55`,
            }}
          >
            <Icon size={32} />
            <span className="text-2xl sm:text-3xl">{text}</span>
            {isCorrect && <span className="text-2xl">✓</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
