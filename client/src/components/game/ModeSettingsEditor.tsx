import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Timer, Hash, Grid3X3, Pencil } from 'lucide-react';
import { GAME_MODE_LABELS } from '../../types';

interface ModeSettingsEditorProps {
  gameMode: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

interface SettingDef {
  key: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  default: number | string;
  description?: string;
}

const MODE_SETTINGS: Record<string, SettingDef[]> = {
  drawing_battle: [
    {
      key: 'roundCount',
      label: 'Tur Sayısı',
      type: 'number',
      min: 2,
      max: 20,
      step: 1,
      default: 5,
      description: 'Kaç tur çizim yapılacak',
    },
    {
      key: 'drawTime',
      label: 'Çizim Süresi (sn)',
      type: 'number',
      min: 15,
      max: 180,
      step: 5,
      default: 60,
      description: 'Her tur için çizim süresi',
    },
  ],
  memory_match: [
    {
      key: 'gridCols',
      label: 'Sütun Sayısı',
      type: 'select',
      options: [
        { value: '3', label: '3 (6 kart)' },
        { value: '4', label: '4 (8 kart)' },
        { value: '5', label: '5 (10 kart)' },
        { value: '6', label: '6 (12 kart)' },
      ],
      default: '4',
      description: 'Bulmaca ızgarası genişliği',
    },
  ],
  simon_says: [
    {
      key: 'maxSequence',
      label: 'Maks. Dizi Uzunluğu',
      type: 'number',
      min: 3,
      max: 15,
      step: 1,
      default: 8,
      description: 'Kaç renk/elemana kadar gidilecek',
    },
  ],
  mastermind: [
    {
      key: 'codeLength',
      label: 'Kod Uzunluğu',
      type: 'number',
      min: 3,
      max: 6,
      step: 1,
      default: 4,
      description: 'Kaç elemanlı şifre çözülecek',
    },
  ],
  pictionary: [
    {
      key: 'guessTime',
      label: 'Tahmin Süresi (sn)',
      type: 'number',
      min: 10,
      max: 120,
      step: 5,
      default: 60,
      description: 'Tahmin için süre',
    },
  ],
  true_false_storm: [
    {
      key: 'questionCount',
      label: 'Soru Sayısı',
      type: 'number',
      min: 5,
      max: 50,
      step: 5,
      default: 15,
      description: 'Kaç doğru/yanlış sorusu',
    },
  ],
  math_sprint: [
    {
      key: 'questionCount',
      label: 'Soru Sayısı',
      type: 'number',
      min: 5,
      max: 50,
      step: 5,
      default: 10,
      description: 'Kaç matematik sorusu',
    },
    {
      key: 'maxNumber',
      label: 'Maks. Sayı',
      type: 'number',
      min: 10,
      max: 1000,
      step: 10,
      default: 100,
      description: 'İşlemlerdeki maks. sayı',
    },
  ],
  sort_events: [
    {
      key: 'eventCount',
      label: 'Olay Sayısı',
      type: 'number',
      min: 4,
      max: 10,
      step: 1,
      default: 6,
      description: 'Kaç tarihsel olay sıralanacak',
    },
  ],
  matching: [
    {
      key: 'pairCount',
      label: 'Çift Sayısı',
      type: 'number',
      min: 3,
      max: 10,
      step: 1,
      default: 6,
      description: 'Kaç eşleştirme çifti',
    },
  ],
  survey: [
    {
      key: 'questionCount',
      label: 'Anket Soru Sayısı',
      type: 'number',
      min: 3,
      max: 20,
      step: 1,
      default: 5,
      description: 'Kaç anket sorusu',
    },
  ],
  millionaire: [
    {
      key: 'questionCount',
      label: 'Soru Sayısı',
      type: 'number',
      min: 5,
      max: 15,
      step: 1,
      default: 10,
      description: 'Kim Milyoner Olmak İster soru sayısı',
    },
  ],
  emoji_riddle: [
    {
      key: 'questionCount',
      label: 'Bulmaca Sayısı',
      type: 'number',
      min: 3,
      max: 15,
      step: 1,
      default: 8,
      description: 'Kaç emoji bulmaca',
    },
  ],
};

export function ModeSettingsEditor({ gameMode, value, onChange }: ModeSettingsEditorProps) {
  const [settings, setSettings] = useState<Record<string, unknown>>(value || {});

  useEffect(() => {
    setSettings(value || {});
  }, [value, gameMode]);

  const defs = MODE_SETTINGS[gameMode];
  if (!defs || defs.length === 0) return null;

  const handleChange = (key: string, newVal: unknown) => {
    const next = { ...settings, [key]: newVal };
    setSettings(next);
    onChange(next);
  };

  const iconMap: Record<string, React.ReactNode> = {
    roundCount: <Hash size={14} />,
    drawTime: <Timer size={14} />,
    gridCols: <Grid3X3 size={14} />,
    maxSequence: <Pencil size={14} />,
    codeLength: <Hash size={14} />,
    guessTime: <Timer size={14} />,
    questionCount: <Hash size={14} />,
    maxNumber: <Hash size={14} />,
    eventCount: <Hash size={14} />,
    pairCount: <Hash size={14} />,
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="glass overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Settings2 size={16} className="text-primary" />
        <span className="text-sm font-semibold text-text">
          {GAME_MODE_LABELS[gameMode as keyof typeof GAME_MODE_LABELS] ?? gameMode} Ayarları
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {defs.map((def) => (
          <div key={def.key} className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
              {iconMap[def.key] ?? <Settings2 size={14} />}
              {def.label}
            </label>
            {def.type === 'number' ? (
              <input
                type="number"
                min={def.min}
                max={def.max}
                step={def.step}
                value={Number(settings[def.key]) || def.default}
                onChange={(e) => handleChange(def.key, Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            ) : (
              <select
                value={String(settings[def.key] || def.default)}
                onChange={(e) => handleChange(def.key, e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                {def.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {def.description && <p className="text-[10px] text-text-muted/60">{def.description}</p>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
