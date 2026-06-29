import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { useGameStore } from '../../stores/gameStore';
import { getSocket } from '../../socket/socketClient';
import { gameEvents } from '../../socket/gameEvents';
import { gameService } from '../../services/gameService';
import { EMOJI_AVATARS, GAME_PIN_LENGTH } from '../../types';
import { ROUTES, STORAGE_KEYS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { pageVariants } from '../../lib/animations';
import { extractApiError } from '../../services/api';
import toast from 'react-hot-toast';

export function GameJoinPage() {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [emoji, setEmoji] = useState<string>(EMOJI_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const navigate = useNavigate();
  const setStorePin = useGameStore((s) => s.setPin);

  const verifyPin = async (value: string) => {
    if (value.length !== GAME_PIN_LENGTH) {
      setQuizTitle(null);
      return;
    }
    try {
      const info = await gameService.getByPin(value);
      setQuizTitle(info.session?.quiz?.title ?? null);
    } catch {
      setQuizTitle(null);
    }
  };

  const join = async () => {
    if (pin.length !== GAME_PIN_LENGTH) {
      toast.error('PIN 6 haneli olmalı');
      return;
    }
    if (nickname.trim().length < 2) {
      toast.error('Takma ad en az 2 karakter');
      return;
    }
    setLoading(true);
    try {
      const socket = getSocket();
      const result = await new Promise<{
        ok: boolean;
        participant?: { _id: string };
        error?: string;
      }>((resolve) => {
        gameEvents.joinLobby(socket, pin, nickname.trim(), emoji, (res) => resolve(res));
        setTimeout(() => resolve({ ok: false, error: 'Zaman aşımı' }), 15000);
      });
      if (!result.ok) {
        toast.error(result.error ?? 'Katılım başarısız');
        setLoading(false);
        return;
      }
      if (result.participant) {
        localStorage.setItem(STORAGE_KEYS.participant, result.participant._id);
      }
      localStorage.setItem(STORAGE_KEYS.pin, pin);
      setStorePin(pin);
      navigate(ROUTES.gamePlayer.replace(':pin', pin));
    } catch (err) {
      toast.error(extractApiError(err).message);
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-screen items-center justify-center px-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-glow [background-size:32px_32px] opacity-25" />
      <div className="relative z-10 w-full max-w-md glass p-8">
        <Link
          to={ROUTES.landing}
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-white"
        >
          <ArrowLeft size={16} /> Ana sayfa
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-3 text-primary">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Oyuna Katıl</h1>
            <p className="text-sm text-text-muted">Ekrandaki PIN'i gir</p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Oyun PIN'i" hint="6 haneli rakam">
            <Input
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, GAME_PIN_LENGTH);
                setPin(v);
                void verifyPin(v);
              }}
              placeholder="000000"
              inputMode="numeric"
              className="font-mono text-center text-2xl tracking-[0.4em]"
              maxLength={GAME_PIN_LENGTH}
            />
          </Field>

          {quizTitle && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-correct/40 bg-correct/10 px-4 py-2.5 text-sm text-correct"
            >
              Bulundu: {quizTitle}
            </motion.div>
          )}

          <Field label="Takma ad">
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Örn. QuizUstası"
              maxLength={20}
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-text-muted">Avatar seç</p>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {EMOJI_AVATARS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-lg text-xl transition-all',
                    emoji === e
                      ? 'bg-primary/25 ring-2 ring-primary'
                      : 'bg-surface-2 hover:bg-border',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" loading={loading} onClick={() => void join()}>
            Katıl
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
