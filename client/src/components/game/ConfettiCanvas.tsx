import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
}

const COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#3B82F6', '#10B981', '#22C55E'];

interface ConfettiProps {
  active: boolean;
  intensity?: 'normal' | 'high';
}

export function ConfettiCanvas({ active, intensity = 'normal' }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const particleCount = intensityRef.current === 'high' ? 250 : 180;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 4 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      aria-hidden
    />
  );
}
