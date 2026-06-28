import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { QuestionDTO } from '../../types';
import { useSound } from '../../hooks/useSound';
import { CountdownTimer } from './CountdownTimer';
import { GameAnswerGrid } from './GameAnswerGrid';
import { ScorePopup } from './ScorePopup';

interface GameQuestionProps {
  question: QuestionDTO;
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
  myResult: { isCorrect: boolean; pointsEarned: number } | null;
  onPick: (index: number) => void;
  onTimeout?: () => void;
  fiftyFiftyRemoved?: number[];
}

export function GameQuestion({
  question,
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

        <motion.div
          key={question._id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass min-h-[140px] p-6 text-center sm:p-8"
        >
          <p className="text-xl font-semibold sm:text-2xl">{question.text}</p>
          {question.image && (
            <img
              src={question.image}
              alt="soru görseli"
              className="mx-auto mt-4 max-h-56 rounded-xl object-contain"
              loading="lazy"
            />
          )}
        </motion.div>

        <GameAnswerGrid
          answers={question.answers}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          hasAnswered={hasAnswered}
          showResult={showResult}
          onPick={handlePick}
          fiftyFiftyRemoved={fiftyFiftyRemoved}
        />

        {showResult && explanation && (
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
