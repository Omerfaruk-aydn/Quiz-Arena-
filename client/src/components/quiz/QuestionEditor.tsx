import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Plus, X, ImagePlus, Loader2 } from 'lucide-react';
import type { Question, AnswerOption as AnswerOptionType, AnswerColor } from '../../types';
import { Button } from '../ui/Button';
import { Input, Label, Field } from '../ui/Input';
import { RichTextEditor } from '../ui/RichTextEditor';
import { TIME_LIMITS, ANSWER_COLORS } from '../../types';
import { cn } from '../../lib/utils';
import { quizService } from '../../services/quizService';

interface QuestionEditorProps {
  question: Partial<Question> & { answers: AnswerOptionType[] };
  index: number;
  onChange: (q: Partial<Question> & { answers: AnswerOptionType[] }) => void;
  onRemove: () => void;
  quizId?: string;
  questionId?: string;
}

const SHAPES: Record<AnswerColor, string> = {
  red: '▲',
  blue: '●',
  yellow: '■',
  green: '♦',
};

const COLORS: AnswerColor[] = ['red', 'blue', 'yellow', 'green'];

export function QuestionEditor({
  question,
  index,
  onChange,
  onRemove,
  quizId,
  questionId,
}: QuestionEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const update = (patch: Partial<Question>) => onChange({ ...question, ...patch });

  const updateAnswer = (i: number, patch: Partial<AnswerOptionType>) => {
    const answers = (question.answers ?? []).map((a, idx) => (idx === i ? { ...a, ...patch } : a));
    onChange({ ...question, answers });
  };

  const setCorrect = (i: number) => {
    const answers = (question.answers ?? []).map((a, idx) => ({ ...a, isCorrect: idx === i }));
    onChange({ ...question, answers });
  };

  const addAnswer = () => {
    if ((question.answers ?? []).length >= 4) return;
    const used = new Set((question.answers ?? []).map((a) => a.color));
    const color = COLORS.find((c) => !used.has(c)) ?? 'green';
    onChange({
      ...question,
      answers: [...question.answers, { text: '', isCorrect: false, color }],
    });
  };

  const removeAnswer = (i: number) => {
    if ((question.answers ?? []).length <= 2) return;
    onChange({ ...question, answers: (question.answers ?? []).filter((_, idx) => idx !== i) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'ı aşamaz");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Sadece JPEG, PNG, WebP desteklenir');
      return;
    }

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    update({ image: { url: previewUrl, publicId: '' } });

    // Upload to server if quizId + questionId exist
    if (quizId && questionId) {
      setUploading(true);
      try {
        const result = await quizService.uploadQuestionImage(quizId, questionId, file);
        update({ image: { url: result.url, publicId: result.publicId } });
      } catch {
        alert('Görsel yüklenemedi');
        update({ image: undefined });
      } finally {
        setUploading(false);
      }
    }
    e.target.value = '';
  };

  const removeImage = () => {
    update({ image: undefined });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-2 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical size={18} className="cursor-grab text-text-muted" />
          <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-semibold text-primary">
            Soru {index + 1}
          </span>
        </div>
        <Button size="icon" variant="ghost" onClick={onRemove} className="hover:text-wrong">
          <Trash2 size={16} />
        </Button>
      </div>

      <Field label="Soru metni">
        <RichTextEditor
          value={question.text ?? ''}
          onChange={(html) => update({ text: html })}
          placeholder="Sorunuzu yazın… Bold, italic, link ve matematik formülü ekleyebilirsiniz"
          minHeight={80}
        />
      </Field>

      <div className="mt-4">
        <Label>Cevap seçenekleri</Label>
        <div className="space-y-2">
          {(question.answers ?? []).map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg font-bold transition-all',
                  a.isCorrect
                    ? 'bg-correct text-white shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                    : 'bg-surface-2 text-text-muted hover:text-white',
                )}
                style={{ color: !a.isCorrect ? ANSWER_COLORS[a.color] : undefined }}
                title={a.isCorrect ? 'Doğru cevap' : 'Doğru olarak işaretle'}
              >
                {SHAPES[a.color]}
              </button>
              <Input
                value={a.text}
                onChange={(e) => updateAnswer(i, { text: e.target.value })}
                placeholder={`${SHAPES[a.color]} şık metni`}
                maxLength={75}
                className="flex-1"
              />
              {(question.answers ?? []).length > 2 && (
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  onClick={() => removeAnswer(i)}
                  className="hover:text-wrong"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
        {(question.answers ?? []).length < 4 && (
          <Button size="sm" variant="ghost" className="mt-2" onClick={addAnswer} type="button">
            <Plus size={14} /> Şık ekle
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Süre (sn)">
          <select
            value={question.timeLimit ?? 30}
            onChange={(e) => update({ timeLimit: Number(e.target.value) })}
            className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-white btn-focus focus:border-primary"
          >
            {TIME_LIMITS.map((t) => (
              <option key={t} value={t}>
                {t} saniye
              </option>
            ))}
          </select>
        </Field>
        <Field label="Puan">
          <Input
            type="number"
            min={0}
            max={5000}
            step={100}
            value={question.points ?? 1000}
            onChange={(e) => update({ points: Number(e.target.value) })}
          />
        </Field>
        <Field label="Açıklama (opsiyonel)">
          <Input
            value={question.explanation ?? ''}
            onChange={(e) => update({ explanation: e.target.value })}
            placeholder="Cevap açıklaması"
            maxLength={500}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Label>Görsel (opsiyonel)</Label>
        {question.image?.url ? (
          <div className="relative inline-block">
            <img
              src={question.image.url}
              alt="Soru görseli"
              className="max-h-40 rounded-xl border border-border object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-wrong text-white shadow-lg"
            >
              <X size={14} />
            </button>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-white"
          >
            <ImagePlus size={18} />
            Görsel ekle
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
    </motion.div>
  );
}
