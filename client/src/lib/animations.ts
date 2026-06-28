import type { Variants } from 'framer-motion';

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } },
};

export const containerVariants: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const itemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

export const answerVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { type: 'spring', stiffness: 400 } },
  tap: { scale: 0.97 },
  correct: { scale: [1, 1.1, 1] },
  wrong: { scale: [1, 0.95, 1] },
};

export const scorePopupVariants: Variants = {
  initial: { opacity: 0, scale: 0.5, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: -30,
    transition: { type: 'spring', damping: 10 },
  },
  exit: { opacity: 0, y: -60, transition: { duration: 0.4 } },
};

export const leaderboardItemVariants = (rank: number): Variants => ({
  initial: { opacity: 0, x: rank % 2 === 0 ? 50 : -50 },
  animate: { opacity: 1, x: 0, transition: { delay: rank * 0.1, duration: 0.4 } },
});

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
};
