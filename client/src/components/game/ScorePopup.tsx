import { AnimatePresence, motion } from 'framer-motion';
import { scorePopupVariants } from '../../lib/animations';

interface ScorePopupProps {
  show: boolean;
  isCorrect: boolean;
  points: number;
}

export function ScorePopup({ show, isCorrect, points }: ScorePopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={scorePopupVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`pointer-events-none fixed left-1/2 top-1/3 z-50 -translate-x-1/2 text-center ${
            isCorrect ? 'text-correct' : 'text-wrong'
          }`}
        >
          <div className="text-5xl drop-shadow-lg">{isCorrect ? '✅' : '❌'}</div>
          <div className="mt-2 font-display text-4xl font-bold neon-text">
            {isCorrect ? `+${points}` : '+0'}
          </div>
          <div className="mt-1 text-lg font-semibold">{isCorrect ? 'Doğru!' : 'Yanlış'}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
