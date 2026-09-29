'use client';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface Props { onDone: () => void }

const COLORS = ['#F03E3E', '#FFB300', '#0FA8A8', '#2DA84E', '#7C3AED'];

// A quick, minimal fireworks flourish — this fires on a frequent, low-stakes
// action (supporting an issue), so it's a couple of small bursts, not
// canvas-confetti's own fireworks demo (15s of continuous bursts).
const DURATION = 700;
const BURST_EVERY = 350;

export function Confetti({ onDone }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDoneRef.current();
      return;
    }

    const end = Date.now() + DURATION;
    const fire = () => {
      confetti({ particleCount: 16, startVelocity: 24, spread: 60, ticks: 80, zIndex: 300, colors: COLORS, origin: { x: 0.24, y: 0.7 } });
      confetti({ particleCount: 16, startVelocity: 24, spread: 60, ticks: 80, zIndex: 300, colors: COLORS, origin: { x: 0.76, y: 0.7 } });
    };

    fire();
    const timer = setInterval(() => {
      if (Date.now() >= end) { clearInterval(timer); onDoneRef.current(); return; }
      fire();
    }, BURST_EVERY);
    return () => clearInterval(timer);
  }, []);

  return null;
}
