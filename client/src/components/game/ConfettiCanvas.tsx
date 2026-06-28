import { useEffect, useRef } from 'react';
import gsap from 'gsap';

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

export function ConfettiCanvas({
  active,
  duration = 4000,
}: {
  active: boolean;
  duration?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const particles: Particle[] = [];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.5,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 4 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
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

    const cleanup = setTimeout(() => {
      gsap.to(particles, {
        speedY: 0,
        onComplete: () => cancelAnimationFrame(raf),
      });
    }, duration);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cleanup);
      window.removeEventListener('resize', onResize);
    };
  }, [active, duration]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      aria-hidden
    />
  );
}
