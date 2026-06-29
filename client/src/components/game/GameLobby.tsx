import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Users, Play } from 'lucide-react';
import type { ParticipantDTO, GameMode } from '../../types';
import { GAME_MODE_LABELS, GAME_MODE_ICONS } from '../../types';

export interface ChatMessage {
  nickname: string;
  message: string;
  timestamp: string;
}

interface GameLobbyProps {
  pin: string;
  participants: ParticipantDTO[];
  role: 'host' | 'player';
  chat: ChatMessage[];
  onSendChat: (msg: string) => void;
  onStart?: () => void;
  onLeave: () => void;
  quizTitle?: string;
  gameMode?: GameMode | string;
}

export function GameLobby({
  pin,
  participants,
  role,
  chat,
  onSendChat,
  onStart,
  onLeave,
  quizTitle,
  gameMode = 'classic',
}: GameLobbyProps) {
  const [msg, setMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const send = () => {
    const m = msg.trim();
    if (!m) return;
    onSendChat(m);
    setMsg('');
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6">
        <div className="text-center">
          <p className="text-sm text-text-muted">Oyun PIN'i</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="pin-display my-2"
          >
            {pin}
          </motion.p>
          {quizTitle && <p className="text-lg font-semibold">{quizTitle}</p>}
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            <span>{GAME_MODE_ICONS[gameMode as GameMode] ?? '🎯'}</span>
            <span>{GAME_MODE_LABELS[gameMode as GameMode] ?? 'Klasik Quiz'}</span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-text-muted">
            <Users size={16} /> {participants.length} oyuncu bekliyor
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Oyuncular</h3>
              <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs text-text-muted">
                {participants.length}
              </span>
            </div>
            <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              <AnimatePresence>
                {participants.map((p) => (
                  <motion.div
                    key={p._id}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center gap-2 rounded-xl bg-surface-2 p-2.5"
                  >
                    <span className="text-2xl">{p.avatar.emoji}</span>
                    <span className="truncate text-sm font-medium">{p.nickname}</span>
                    {!p.isConnected && <span className="text-xs text-wrong">kopuk</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {participants.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
                  Henüz oyuncu yok. PIN'i paylaşın!
                </div>
              )}
            </div>
          </div>

          <div className="glass flex flex-col p-5">
            <h3 className="mb-3 font-semibold">Lobi Sohbeti</h3>
            <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: '30vh' }}>
              {chat.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-primary">{m.nickname}:</span>{' '}
                  <span className="text-text-muted">{m.message}</span>
                </div>
              ))}
              {chat.length === 0 && (
                <p className="text-sm text-text-muted">Mesajlaşmak için bekleyin…</p>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                maxLength={200}
                placeholder="Mesaj…"
                className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-white outline-none focus:border-primary"
              />
              <button
                onClick={send}
                className="rounded-lg bg-primary p-2 text-white btn-focus"
                aria-label="Gönder"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted hover:text-wrong"
          >
            <LogOut size={16} /> Çık
          </button>
          {role === 'host' && (
            <button
              onClick={onStart}
              disabled={participants.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-glow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 btn-focus"
            >
              <Play size={18} /> Oyunu Başlat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
