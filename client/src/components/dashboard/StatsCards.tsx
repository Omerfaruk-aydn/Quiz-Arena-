import { motion } from 'framer-motion';
import { Library, Gamepad2, Users, Award } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

interface StatsCardsProps {
  stats: {
    totalQuizzes?: number;
    totalGames?: number;
    totalParticipants?: number;
    highScore?: number;
  };
}

const cards = [
  {
    key: 'totalQuizzes',
    label: 'Toplam Quiz',
    icon: Library,
    color: 'from-primary to-accent-pink',
  },
  { key: 'totalGames', label: 'Oyun Sayısı', icon: Gamepad2, color: 'from-accent-blue to-primary' },
  {
    key: 'totalParticipants',
    label: 'Katılımcı',
    icon: Users,
    color: 'from-accent-emerald to-accent-blue',
  },
  {
    key: 'highScore',
    label: 'En Yüksek Skor',
    icon: Award,
    color: 'from-accent-amber to-accent-pink',
  },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const value = stats[c.key] ?? 0;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass relative overflow-hidden p-5"
          >
            <div
              className={cn(
                'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-xl',
                c.color,
              )}
            />
            <div
              className={cn(
                'mb-3 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-white',
                c.color,
              )}
            >
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold font-display">{formatNumber(value)}</p>
            <p className="text-sm text-text-muted">{c.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
