import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Save,
  Eye,
  ArrowLeft,
  GripVertical,
  Cloud,
  CloudOff,
  Check,
  Bot,
  ImagePlus,
  X,
  Loader2,
} from 'lucide-react';
import type { Quiz, Question, AnswerOption as AnswerOptionType, GameMode } from '../../types';
import { GAME_MODES, GAME_MODE_LABELS, GAME_MODE_ICONS } from '../../types';
import type { AiQuizQuestion } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Input, Textarea, Field } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { QuestionEditor } from './QuestionEditor';
import { QuizPreview } from './QuizPreview';
import { AiQuizGenerator } from './AiQuizGenerator';
import { ModeSettingsEditor } from '../game/ModeSettingsEditor';
import { quizSchema } from '../../lib/validations';
import { zodErrors } from '../../lib/validations';
import { CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { quizService } from '../../services/quizService';

interface QuizFormProps {
  initial?: Partial<Quiz> & { questions?: Question[] };
  submitting?: boolean;
  onSubmit: (data: QuizFormInput) => void;
  title?: string;
  submitLabel?: string;
  onBack?: () => void;
  onAutosave?: (data: QuizFormInput) => Promise<void>;
  quizId?: string;
}

type QuizFormInput = {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: string;
  modeSettings: Record<string, unknown>;
  tags: string[];
  isPublic: boolean;
  settings: Quiz['settings'];
  questions: Array<Partial<Question> & { answers: AnswerOptionType[] }>;
};

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const blankQuestion = (): Partial<Question> & { answers: AnswerOptionType[] } => ({
  type: 'multiple_choice',
  text: '',
  answers: [
    { text: '', isCorrect: true, color: 'red' },
    { text: '', isCorrect: false, color: 'blue' },
  ],
  timeLimit: 30,
  points: 1000,
  explanation: '',
});

function SortableQuestion({
  question,
  index,
  onChange,
  onRemove,
  id,
  quizId,
  questionId,
}: {
  question: Partial<Question> & { answers: AnswerOptionType[] };
  index: number;
  onChange: (q: Partial<Question> & { answers: AnswerOptionType[] }) => void;
  onRemove: () => void;
  id: string;
  quizId?: string;
  questionId?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-6 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-white active:cursor-grabbing"
          title="Sürükleyerek sırala"
        >
          <GripVertical size={18} />
        </button>
        <QuestionEditor
          question={question}
          index={index}
          onChange={onChange}
          onRemove={onRemove}
          quizId={quizId}
          questionId={questionId}
        />
      </div>
    </div>
  );
}

export function QuizForm({
  initial,
  submitting,
  onSubmit,
  title = 'Yeni Quiz',
  submitLabel = 'Kaydet',
  onBack,
  onAutosave,
  quizId,
}: QuizFormProps) {
  const [values, setValues] = useState<QuizFormInput>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'Genel Kültür',
    difficulty: initial?.difficulty ?? 'medium',
    gameMode: initial?.gameMode ?? 'classic',
    modeSettings: (initial?.modeSettings as Record<string, unknown>) ?? {},
    tags: initial?.tags ?? [],
    isPublic: initial?.isPublic ?? false,
    settings: initial?.settings ?? {
      defaultTimeLimit: 30,
      showAnswerAfterEach: true,
      randomizeQuestions: false,
      randomizeAnswers: false,
      maxParticipants: 0,
    },
    questions: initial?.questions ?? [blankQuestion()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string } | null>(
    initial?.coverImage ?? null,
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const questionIds = values.questions.map((_, i) => `q-${i}`);

  const set = useCallback(<K extends keyof QuizFormInput>(key: K, val: QuizFormInput[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
  }, []);

  const addQuestion = () => set('questions', [...values.questions, blankQuestion()]);

  const addAiQuestions = (aiQuestions: AiQuizQuestion[]) => {
    const modeTimeLimit =
      values.gameMode === 'true_false_storm'
        ? 10
        : values.gameMode === 'math_sprint'
          ? 20
          : values.gameMode === 'millionaire'
            ? 45
            : 30;
    const newQuestions = aiQuestions.map((aq) => ({
      type: aq.type as Question['type'],
      text: aq.text,
      image: aq.imageUrl ? { url: aq.imageUrl, publicId: '' } : undefined,
      answers: aq.answers.map((a, i) => ({
        text: a.text,
        isCorrect: a.isCorrect,
        color: (['red', 'blue', 'yellow', 'green'] as const)[i % 4] as AnswerOptionType['color'],
      })),
      timeLimit: modeTimeLimit,
      points: values.gameMode === 'millionaire' ? 1000 : 1000,
      explanation: aq.explanation,
    }));
    set('questions', [...values.questions, ...newQuestions]);
  };

  const updateQuestion = (i: number, q: Partial<Question> & { answers: AnswerOptionType[] }) =>
    set(
      'questions',
      values.questions.map((qq, idx) => (idx === i ? q : qq)),
    );
  const removeQuestion = (i: number) =>
    set(
      'questions',
      values.questions.filter((_, idx) => idx !== i),
    );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).replace('q-', ''));
    const newIndex = Number(String(over.id).replace('q-', ''));
    set('questions', arrayMove(values.questions, oldIndex, newIndex));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || values.tags.includes(t) || values.tags.length >= 10) return;
    set('tags', [...values.tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) =>
    set(
      'tags',
      values.tags.filter((x) => x !== t),
    );

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'ı aşamaz");
      return;
    }
    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setCoverImage({ url: previewUrl, publicId: '' });
    // Upload if quizId exists
    if (quizId) {
      setCoverUploading(true);
      try {
        const result = await quizService.uploadCover(quizId, file);
        setCoverImage(result);
      } catch {
        alert('Kapak görseli yüklenemedi');
        setCoverImage(null);
      } finally {
        setCoverUploading(false);
      }
    }
    e.target.value = '';
  };

  const removeCover = () => setCoverImage(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = quizSchema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrors(result.error));
      const first = document.querySelector('[data-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    onSubmit(result.data as QuizFormInput);
  };

  // Autosave: debounce 2sn
  useEffect(() => {
    if (!onAutosave || !quizId) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(async () => {
      const current = valuesRef.current;
      const result = quizSchema.safeParse(current);
      if (!result.success) return;
      setAutosaveStatus('saving');
      try {
        await onAutosave(result.data as QuizFormInput);
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      } catch {
        setAutosaveStatus('error');
      }
    }, 2000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [values, onAutosave, quizId]);

  const autosaveIndicator = () => {
    if (!onAutosave || !quizId) return null;
    const config = {
      idle: { icon: null, text: '', className: '' },
      saving: { icon: Cloud, text: 'Otomatik kaydediliyor…', className: 'text-text-muted' },
      saved: { icon: Check, text: 'Kaydedildi', className: 'text-correct' },
      error: { icon: CloudOff, text: 'Kaydetme hatası', className: 'text-wrong' },
    }[autosaveStatus];
    if (!config.icon) return null;
    const Icon = config.icon;
    return (
      <span className={cn('flex items-center gap-1.5 text-xs', config.className)}>
        <Icon size={14} /> {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button size="icon" variant="ghost" onClick={onBack}>
              <ArrowLeft size={18} />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
          {autosaveIndicator()}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPreview(true)}>
            <Eye size={16} /> Önizle
          </Button>
          <Button onClick={submit} loading={submitting} form="quiz-form">
            <Save size={16} /> {submitLabel}
          </Button>
        </div>
      </div>

      <form id="quiz-form" onSubmit={submit} className="space-y-6" noValidate>
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">Genel Bilgiler</h2>

          <Field label="Kapak Görseli (opsiyonel)">
            {coverImage?.url ? (
              <div className="relative">
                <img
                  src={coverImage.url}
                  alt="Kapak görseli"
                  className="h-40 w-full rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-wrong text-white shadow-lg"
                >
                  <X size={16} />
                </button>
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-8 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-white"
              >
                <ImagePlus size={20} />
                Kapak görseli ekle
              </button>
            )}
            <input
              ref={coverFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </Field>

          <Field label="Başlık" error={errors.title}>
            <Input
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Quiz başlığı"
              maxLength={100}
              data-error={!!errors.title}
            />
          </Field>
          <Field label="Açıklama" error={errors.description}>
            <Textarea
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Bu quiz ne hakkında?"
              maxLength={500}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <select
                value={values.category}
                onChange={(e) => set('category', e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-white btn-focus focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Zorluk">
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('difficulty', d)}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all',
                      values.difficulty === d
                        ? 'border-primary bg-primary/15 text-white'
                        : 'border-border bg-surface-2 text-text-muted hover:border-primary/50',
                    )}
                  >
                    {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Oyun Modu">
            <div className="grid gap-2 sm:grid-cols-2">
              {GAME_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('gameMode', m)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all',
                    values.gameMode === m
                      ? 'border-primary bg-primary/15 text-white'
                      : 'border-border bg-surface-2 text-text-muted hover:border-primary/50',
                  )}
                >
                  <span className="text-xl">{GAME_MODE_ICONS[m]}</span>
                  <span>{GAME_MODE_LABELS[m]}</span>
                </button>
              ))}
            </div>
          </Field>

          <AnimatePresence>
            {values.gameMode !== 'classic' && (
              <ModeSettingsEditor
                gameMode={values.gameMode}
                value={values.modeSettings}
                onChange={(v) => set('modeSettings', v)}
              />
            )}
          </AnimatePresence>

          <Field label="Etiketler" hint="En fazla 10 etiket">
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface-2 p-2">
              {values.tags.map((t) => (
                <Badge
                  key={t}
                  variant="primary"
                  className="cursor-pointer"
                  onClick={() => removeTag(t)}
                >
                  {t} ×
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                onBlur={addTag}
                placeholder="Etiket ekle…"
                className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-white outline-none"
              />
            </div>
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
            <input
              type="checkbox"
              checked={values.isPublic}
              onChange={(e) => set('isPublic', e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            <div>
              <p className="text-sm font-medium">Herkese açık</p>
              <p className="text-xs text-text-muted">
                Diğer öğretmenler bu quizi kütüphanede görebilir
              </p>
            </div>
          </label>
        </div>

        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">Oyun Ayarları</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Varsayılan süre (sn)">
              <Input
                type="number"
                min={10}
                max={120}
                value={values.settings.defaultTimeLimit}
                onChange={(e) =>
                  set('settings', { ...values.settings, defaultTimeLimit: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Maks. katılımcı (0 = sınırsız)">
              <Input
                type="number"
                min={0}
                max={500}
                value={values.settings.maxParticipants}
                onChange={(e) =>
                  set('settings', { ...values.settings, maxParticipants: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <div className="space-y-2">
            {[
              { k: 'showAnswerAfterEach' as const, label: 'Her sorudan sonra cevabı göster' },
              { k: 'randomizeQuestions' as const, label: 'Soru sırasını karıştır' },
              { k: 'randomizeAnswers' as const, label: 'Şık sırasını karıştır' },
            ].map((opt) => (
              <label
                key={opt.k}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
              >
                <input
                  type="checkbox"
                  checked={values.settings[opt.k]}
                  onChange={(e) =>
                    set('settings', { ...values.settings, [opt.k]: e.target.checked })
                  }
                  className="h-5 w-5 accent-primary"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Sorular <span className="text-text-muted">({values.questions.length})</span>
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowAiGenerator(true)}
                type="button"
              >
                <Bot size={16} /> AI ile Oluştur
              </Button>
              <Button size="sm" variant="secondary" onClick={addQuestion} type="button">
                <Plus size={16} /> Soru Ekle
              </Button>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {values.questions.map((q, i) => (
                  <motion.div
                    key={`q-${i}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SortableQuestion
                      id={`q-${i}`}
                      question={q}
                      index={i}
                      onChange={(nq) => updateQuestion(i, nq)}
                      onRemove={() => removeQuestion(i)}
                      quizId={quizId}
                      questionId={q._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
          {values.questions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-text-muted">Henüz soru yok. İlk soruyu ekleyin.</p>
              <Button className="mt-3" onClick={addQuestion} type="button">
                <Plus size={16} /> Soru Ekle
              </Button>
            </div>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showPreview && <QuizPreview values={values} onClose={() => setShowPreview(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAiGenerator && (
          <AiQuizGenerator
            gameMode={values.gameMode as GameMode}
            onAddQuestions={addAiQuestions}
            onClose={() => setShowAiGenerator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
