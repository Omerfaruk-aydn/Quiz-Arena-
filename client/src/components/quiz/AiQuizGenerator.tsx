import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Loader2, Plus, ImageIcon, X, Shuffle } from 'lucide-react';
import { aiService, type AiQuizQuestion } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Input, Field } from '../ui/Input';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface AiQuizGeneratorProps {
  onAddQuestions: (questions: AiQuizQuestion[]) => void;
  onClose: () => void;
}

const COLORS = ['red', 'blue', 'yellow', 'green'] as const;

export function AiQuizGenerator({ onAddQuestions, onClose }: AiQuizGeneratorProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState('5');
  const [includeImages, setIncludeImages] = useState(false);
  const [preview, setPreview] = useState<AiQuizQuestion[] | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      aiService.generate({
        difficulty,
        questionCount: Math.min(20, Math.max(3, Number(questionCount) || 5)),
        includeImages,
      }),
    onSuccess: (data) => {
      setPreview(data.questions);
      toast.success(`${data.questions.length} soru üretildi!`);
    },
    onError: () => toast.error('AI soru üretimi başarısız'),
  });

  const handleAdd = () => {
    if (!preview) return;
    onAddQuestions(preview);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-pink">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI ile Soru Üret</h2>
              <p className="text-xs text-text-muted">Karışık konularda rastgele sorular</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Info banner */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <Shuffle size={16} className="shrink-0 text-primary" />
          <p className="text-xs text-text-muted">
            Sorular genel kültür, bilim, tarih, coğrafya ve daha birçok konudan rastgele
            oluşturulacaktır.
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <Field label="Zorluk">
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                    difficulty === d
                      ? 'border-primary bg-primary/15 text-white'
                      : 'border-border bg-surface-2 text-text-muted',
                  )}
                >
                  {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Soru Sayısı">
            <Input
              type="number"
              min={3}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <ImageIcon size={14} /> Görselli Sorular
              </p>
              <p className="text-xs text-text-muted">AI görsel ekler</p>
            </div>
          </label>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <Button
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sorular Üretiliyor...
              </>
            ) : (
              <>
                <Bot size={16} />
                Sorular Üret
              </>
            )}
          </Button>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Üretilen Sorular ({preview.length})</h3>
                <Button size="sm" onClick={handleAdd}>
                  <Plus size={14} /> Quiz'e Ekle
                </Button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {preview.map((q, i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface-2 p-3">
                    <div className="flex items-start gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.text}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {q.answers.map((a, j) => (
                            <span
                              key={j}
                              className={cn(
                                'inline-flex items-center rounded-lg px-2 py-0.5 text-xs',
                                a.isCorrect
                                  ? 'bg-correct/20 text-correct'
                                  : 'bg-surface text-text-muted',
                              )}
                            >
                              {COLORS[j] === 'red'
                                ? '▲'
                                : COLORS[j] === 'blue'
                                  ? '●'
                                  : COLORS[j] === 'yellow'
                                    ? '■'
                                    : '♦'}{' '}
                              {a.text}
                            </span>
                          ))}
                        </div>
                        {q.imageUrl && (
                          <p className="mt-1 text-xs text-primary flex items-center gap-1">
                            <ImageIcon size={12} /> Görsel mevcut
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-text-muted">
                        {q.type === 'true_false' ? 'Doğru/Yanlış' : 'Çoktan Seçmeli'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
