import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface SimonSaysBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

const SIMON_COLORS = [
  { name: 'Kırmızı', hex: '#EF4444', glow: '#EF4444' },
  { name: 'Mavi', hex: '#3B82F6', glow: '#3B82F6' },
  { name: 'Yeşil', hex: '#10B981', glow: '#10B981' },
  { name: 'Sarı', hex: '#F59E0B', glow: '#F59E0B' },
];

export function SimonSaysBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: SimonSaysBoardProps) {
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [showSeq, setShowSeq] = useState(true);

  const sequenceRef = useRef<number[]>([]);

  // Parse color sequence from question text
  useEffect(() => {
    const parsedSequence: number[] = [];
    const colors = ['kırmızı', 'mavi', 'yeşil', 'sarı'];
    const lowerText = questionText.toLowerCase();

    for (let ci = 0; ci < colors.length; ci++) {
      const col = colors[ci];
      if (lowerText.includes(col)) {
        if (!parsedSequence.includes(ci)) {
          parsedSequence.push(ci);
        }
      }
    }

    // Generate a sequence based on question if found
    if (parsedSequence.length >= 2) {
      sequenceRef.current = parsedSequence.slice(0, 6);
    } else {
      sequenceRef.current = [0, 1, 2, 3].slice(0, answers.length);
    }
    setShowSeq(true);

    // Auto-play the sequence
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sequenceRef.current.length) {
        setActiveColor(sequenceRef.current[idx]);
        setTimeout(() => setActiveColor(null), 300);
        idx++;
      } else {
        clearInterval(interval);
        setShowSeq(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [questionText, answers]);

  const handleButtonClick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult || showSeq) return;
      onPick(idx);
    },
    [hasAnswered, showResult, showSeq, onPick],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {showSeq && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-amber-400"
        >
          Diziyi izle ve hatırla… <span className="animate-pulse">👀</span>
        </motion.p>
      )}

      {!showSeq && !hasAnswered && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-green-400"
        >
          Şimdi sıradaki rengi seç! ⏱️
        </motion.p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {answers.slice(0, 4).map((answer, idx) => {
          const color = SIMON_COLORS[idx] ?? {
            name: 'Gri',
            hex: '#6B7280',
            glow: '#6B7280',
          };
          const isActive = activeColor === idx;
          const isCorrectPick = showResult && correctAnswer === idx;
          const isWrongPick =
            showResult && selectedAnswer === idx && correctAnswer !== idx;

          return (
            <motion.button
              key={idx}
              type="button"
              disabled={hasAnswered || showResult || showSeq}
              onClick={() => handleButtonClick(idx)}
              whileHover={!hasAnswered ? { scale: 1.08 } : undefined}
              whileTap={!hasAnswered ? { scale: 0.92 } : undefined}
              className="relative h-28 w-28 rounded-2xl sm:h-36 sm:w-36"
              animate={{
                scale: isActive ? 1.15 : 1,
                opacity: isWrongPick ? 0.5 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              style={{
                backgroundColor: isCorrectPick ? '#10B981' : color.hex,
                boxShadow: isActive
                  ? `0 0 40px ${color.glow}, 0 0 80px ${color.glow}44`
                  : isCorrectPick
                    ? '0 0 30px #10B981'
                    : `0 0 20px ${color.glow}33`,
                border:
                  isCorrectPick || isWrongPick
                    ? `3px solid ${isCorrectPick ? '#34D399' : '#F87171'}`
                    : '3px solid rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-lg font-bold text-white drop-shadow-md">
                {answer.text}
              </span>
              {isCorrectPick && (
                <span className="absolute -right-1 -top-1 text-lg">✅</span>
              )}
              {isWrongPick && (
                <span className="absolute -right-1 -top-1 text-lg">❌</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
