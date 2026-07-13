import { useState } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, X } from 'lucide-react';
import type { QuestionDTO, GameMode } from '../../types';
import { useSound } from '../../hooks/useSound';
import { CountdownTimer } from './CountdownTimer';
import { GameAnswerGrid } from './GameAnswerGrid';
import { ScorePopup } from './ScorePopup';
import { cn } from '../../lib/utils';
import { MemoryMatchBoard } from './MemoryMatchBoard';
import { SimonSaysBoard } from './SimonSaysBoard';
import { MatchingBoard } from './MatchingBoard';
import { MastermindBoard } from './MastermindBoard';
import { FibbageBoard } from './FibbageBoard';
import { MemeWarCard } from './MemeWarCard';
import { MathSprintBoard } from './MathSprintBoard';
import { MillionaireBoard } from './MillionaireBoard';
import { SortEventsBoard } from './SortEventsBoard';
import { PictionaryBoard } from './PictionaryBoard';
import type { QuizSocket } from '../../socket/socketClient';

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
  socket?: QuizSocket | null;
  pin?: string | null;
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
  socket,
  pin,
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

        {gameMode === 'memory_match' ? (
          <MemoryMatchBoard
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'simon_says' ? (
          <SimonSaysBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'matching' ? (
          <MatchingBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'mastermind' ? (
          <MastermindBoard
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'fibbage' ? (
          <FibbageBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
            socket={socket ?? null}
            pin={pin ?? null}
          />
        ) : gameMode === 'meme_war' ? (
          <MemeWarCard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
            fiftyFiftyRemoved={fiftyFiftyRemoved}
          />
        ) : gameMode === 'math_sprint' ? (
          <MathSprintBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'millionaire' ? (
          <MillionaireBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
            fiftyFiftyRemoved={fiftyFiftyRemoved}
          />
        ) : gameMode === 'sort_events' ? (
          <SortEventsBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'pictionary' ? (
          <PictionaryBoard
            questionText={question.text}
            answers={question.answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            hasAnswered={hasAnswered}
            showResult={showResult}
            onPick={handlePick}
          />
        ) : gameMode === 'true_false_storm' || question.answers.length === 2 ? (
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
  const isPictionary = gameMode === 'pictionary';
  const isMathSprint = gameMode === 'math_sprint';
  const isMillionaire = gameMode === 'millionaire';
  const isSortEvents = gameMode === 'sort_events';

  const getModeBadge = () => {
    const badges: Record<string, { icon: string; label: string; color: string }> = {
      classic: { icon: '🎯', label: 'Klasik', color: 'from-blue-500/20 to-blue-600/10' },
      logo_guess: { icon: '🏷️', label: 'Logo', color: 'from-purple-500/20 to-purple-600/10' },
      flag_guess: { icon: '🇧🇩', label: 'Bayrak', color: 'from-green-500/20 to-green-600/10' },
      film_guess: { icon: '🎬', label: 'Film', color: 'from-red-500/20 to-red-600/10' },
      emoji_riddle: { icon: '🤔', label: 'Emoji', color: 'from-yellow-500/20 to-yellow-600/10' },
      survey: { icon: '📊', label: 'Anket', color: 'from-pink-500/20 to-pink-600/10' },
    };
    return badges[gameMode] ?? { icon: '❓', label: gameMode, color: 'from-slate-500/20 to-slate-600/10' };
  };

  const badge = getModeBadge();

  if (isMathSprint || isMillionaire || isSortEvents || isPictionary) return null;

  return (
    <motion.div
      key={question._id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${badge.color} p-6 text-center shadow-lg sm:p-8`}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />

      {/* Mode badge */}
      {!isVisual && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-text-muted backdrop-blur-sm">
          <span>{badge.icon}</span>
          <span>{badge.label.toUpperCase()}</span>
        </div>
      )}

      {/* Question text */}
      {isEmoji ? (
        <p className="relative text-5xl font-semibold leading-tight tracking-wide sm:text-7xl">
          {question.text}
        </p>
      ) : (
        <p
          className={cn(
            'relative font-bold leading-relaxed',
            isVisual ? 'text-lg text-text-muted sm:text-xl' : 'text-xl text-white sm:text-2xl',
          )}
        >
          {question.text}
        </p>
      )}

      {/* Image */}
      {question.image && (
        <div
          className={cn(
            'mx-auto mt-5 inline-block rounded-xl bg-white/10 p-2 backdrop-blur-sm',
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
    { text: 'Doğru', icon: Check, color: '#10B981', index: 0, glow: '#10B981' },
    { text: 'Yanlış', icon: X, color: '#EF4444', index: 1, glow: '#EF4444' },
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {options.map(({ text, icon: Icon, color, index, glow }) => {
        const isCorrect = showResult && correctAnswer === index;
        const isWrongPick = showResult && selectedAnswer === index && correctAnswer !== index;
        const isFaded = showResult && correctAnswer !== index && selectedAnswer !== index;
        const isHovered = hoveredIdx === index;

        return (
          <motion.button
            key={index}
            type="button"
            disabled={hasAnswered || showResult}
            onClick={() => onPick(index)}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.97 } : undefined}
            animate={
              isCorrect
                ? {
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      `0 8px 24px ${glow}55`,
                      `0 8px 40px ${glow}aa, 0 0 60px ${glow}44`,
                      `0 8px 24px ${glow}55`,
                    ],
                  }
                : isWrongPick
                  ? { scale: [1, 0.95, 1], x: [0, -5, 5, -3, 3, 0] }
                  : isFaded
                    ? { opacity: 0.4, scale: 0.95 }
                    : {
                        scale: isHovered && !hasAnswered ? 1.03 : 1,
                        boxShadow: isHovered && !hasAnswered
                          ? `0 8px 32px ${glow}77`
                          : `0 8px 24px ${glow}44`,
                      }
            }
            transition={
              isCorrect
                ? { duration: 0.8, ease: 'easeOut' }
                : isWrongPick
                  ? { duration: 0.5 }
                  : { type: 'spring', stiffness: 300 }
            }
            className={cn(
              'relative flex min-h-[110px] w-full items-center justify-center gap-3 rounded-2xl px-4 py-6 text-left font-bold text-white transition-all sm:min-h-[130px]',
              'disabled:cursor-not-allowed',
              !hasAnswered && !showResult && 'hover:brightness-110',
              selectedAnswer === index && !showResult && 'ring-4 ring-white/50',
              isCorrect && 'ring-4 ring-white/70 shadow-glow',
              isWrongPick && 'ring-4 ring-black/40',
            )}
            style={{
              backgroundColor: color,
              backgroundImage: isHovered && !hasAnswered
                ? `radial-gradient(circle at 50% 50%, ${glow}44 0%, transparent 60%)`
                : 'none',
              boxShadow:
                isCorrect && showResult
                  ? `0 8px 40px ${glow}aa, 0 0 60px ${glow}44`
                  : `0 8px 24px ${glow}55`,
            }}
          >
            {/* Lightning overlay for "storm" mode */}
            {isCorrect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${glow}44, transparent)` }}
              />
            )}

            <Icon size={36} className="relative z-10" />
            <span className="relative z-10 text-2xl drop-shadow-lg sm:text-3xl">{text}</span>
            {isCorrect && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative z-10 text-2xl"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
