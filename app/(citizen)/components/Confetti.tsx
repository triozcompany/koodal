'use client';
import { useEffect, useRef } from 'react';

interface Props { onDone: () => void }

const COLORS = ['#F03E3E', '#FFB300', '#0FA8A8', '#2DA84E', '#7C3AED'];

export function Confetti({ onDone }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, (_, idx) => {
      const angle = (idx / 80) * Math.PI * 2 + (Math.sin(idx * 7.3) * 0.8);
      const speed = 4 + Math.sin(idx * 3.1) * 3;
      return {
        x: canvas.width / 2,
        y: canvas.height * 0.62,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 9,
        color: COLORS[idx % COLORS.length],
        size: 5 + (idx % 4),
        rot: idx * 0.3,
        rotV: (idx % 2 === 0 ? 0.18 : -0.22),
        alpha: 1,
      };
    });

    let frame: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rot += p.rotV;
        p.alpha -= 0.013;
        if (p.alpha <= 0) continue;
        alive++;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}
    />
  );
}
