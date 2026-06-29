import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Undo, Send, Paintbrush } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawingCanvasProps {
  targetWord: string;
  timeLimit: number;
  remaining: number;
  disabled?: boolean;
  onSubmit: (imageBase64: string) => void;
}

const COLORS = [
  { name: 'Siyah', value: '#000000' },
  { name: 'Kırmızı', value: '#EF4444' },
  { name: 'Mavi', value: '#3B82F6' },
  { name: 'Yeşil', value: '#10B981' },
  { name: 'Sarı', value: '#F59E0B' },
  { name: 'Mor', value: '#8B5CF6' },
  { name: 'Turuncu', value: '#F97316' },
  { name: 'Beyaz', value: '#FFFFFF' },
];

export function DrawingCanvas({
  targetWord,
  timeLimit: _timeLimit,
  remaining,
  disabled,
  onSubmit,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || submitted) return;
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || submitted) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-19), data]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([data]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const prev = history[history.length - 2];
    if (prev) {
      ctx.putImageData(prev, 0, 0);
      setHistory((h) => h.slice(0, -1));
    }
  };

  const submit = () => {
    const canvas = canvasRef.current;
    if (!canvas || disabled || submitted) return;
    const image = canvas.toDataURL('image/png');
    setSubmitted(true);
    onSubmit(image);
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4">
        <div className="glass p-4 text-center">
          <p className="text-sm text-text-muted">Çizmen gereken</p>
          <motion.h2
            key={targetWord}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-primary"
          >
            {targetWord.toUpperCase()}
          </motion.h2>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-border bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className={cn(
              'h-full w-full touch-none',
              (disabled || submitted) && 'cursor-not-allowed',
            )}
          />
          {submitted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <p className="text-xl font-bold">Çizim gönderildi ✓</p>
            </div>
          )}
        </div>

        <div className="glass flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-transform',
                  color === c.value ? 'scale-110 border-white' : 'border-transparent',
                )}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Paintbrush size={16} className="text-text-muted" />
            <input
              type="range"
              min={2}
              max={20}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <button
              type="button"
              onClick={undo}
              disabled={history.length <= 1 || disabled || submitted}
              className="rounded-lg bg-surface-2 p-2 text-text-muted hover:text-white disabled:opacity-50"
            >
              <Undo size={18} />
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              disabled={disabled || submitted}
              className="rounded-lg bg-surface-2 p-2 text-text-muted hover:text-wrong disabled:opacity-50"
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-text-muted">
            Kalan süre: <span className="font-mono text-white">{remaining}s</span>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={disabled || submitted}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-glow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            <Send size={18} /> Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
