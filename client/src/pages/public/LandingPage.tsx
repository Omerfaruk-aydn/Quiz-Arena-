import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Trophy, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/constants';
import { pageVariants, itemVariants, containerVariants } from '../../lib/animations';

const features = [
  { icon: Zap, title: 'Gerçek Zamanlı', desc: 'Socket.io ile anlık yarışma' },
  { icon: Users, title: 'Multiplayer', desc: 'Yüzlerce oyuncu aynı anda' },
  { icon: Trophy, title: 'Podyum & Skor', desc: 'Animasyonlu sonuç ekranı' },
  { icon: Sparkles, title: 'Soru Bankası', desc: 'Kendi quizlerini oluştur' },
];

export function LandingPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-screen flex-col"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-glow [background-size:32px_32px] opacity-30" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent-pink" />
          <span className="font-display text-lg font-bold">
            Quiz<span className="gradient-text">Arena</span>
          </span>
        </div>
        <nav className="flex gap-2">
          <Link to={ROUTES.login}>
            <Button variant="ghost" size="sm">
              Giriş
            </Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button size="sm">Kayıt Ol</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="max-w-3xl"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Gamepad2 size={16} /> Kahoot tarzı, modern quiz platformu
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-tight sm:text-6xl"
          >
            Öğrenmeyi yarışmaya,
            <br />
            <span className="gradient-text">yarışmayı sanat haline getir.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-xl text-lg text-text-muted"
          >
            Öğretmenler soru bankası oluşturur, öğrenciler PIN ile katılır ve gerçek zamanlı
            yarışır. Hız, doğruluk ve strateji bir arada.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.register}>
              <Button size="xl">
                Hemen Başla <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to={ROUTES.gameJoin}>
              <Button size="xl" variant="secondary">
                <Gamepad2 size={18} /> Oyuna Katıl
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={itemVariants} className="glass p-5 text-left">
                <Icon className="mb-3 text-primary" size={24} />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 py-6 text-center text-sm text-text-muted">
        QuizArena · {new Date().getFullYear()}
      </footer>
    </motion.div>
  );
}
