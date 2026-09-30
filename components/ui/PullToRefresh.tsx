'use client';
import { useRef, useState, type ReactNode, type Ref } from 'react';
import { haptic } from '@/lib/haptics';

interface Props {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  scrollRef?: Ref<HTMLDivElement>;
  style?: React.CSSProperties;
  disabled?: boolean;
  threshold?: number;
  maxPull?: number;
  holdDistance?: number;
}

type Phase = 'idle' | 'pulling' | 'ready' | 'refreshing';

// Touch-only pull-to-refresh; engages only when the scroller is at the top.
export function PullToRefresh({ onRefresh, children, scrollRef, style, disabled, threshold = 76, maxPull = 132, holdDistance = 68 }: Props) {
  const el = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const dragging = phase === 'pulling' || phase === 'ready';

  const setRefs = (node: HTMLDivElement | null) => {
    el.current = node;
    if (typeof scrollRef === 'function') scrollRef(node);
    else if (scrollRef) (scrollRef as { current: HTMLDivElement | null }).current = node;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled || phase === 'refreshing' || (el.current?.scrollTop ?? 1) > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { if (pull) { setPull(0); setPhase('idle'); } return; }
    const d = Math.min(maxPull, dy * 0.5);
    setPull(d);
    const next: Phase = d >= threshold ? 'ready' : 'pulling';
    if (next === 'ready' && phase !== 'ready') haptic();
    setPhase(next);
  };

  const onTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (phase !== 'ready') { setPull(0); setPhase('idle'); return; }
    setPhase('refreshing');
    setPull(holdDistance);
    try { await onRefresh(); } catch {}
    setPull(0);
    setPhase('idle');
  };

  const progress = Math.min(1, pull / threshold);

  return (
    <div
      ref={setRefs}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{ ...style, position: 'relative', overscrollBehaviorY: 'contain' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: pull, display: 'grid', placeItems: 'center', overflow: 'hidden', pointerEvents: 'none', transition: dragging ? 'none' : 'height .25s ease', zIndex: 1 }}>
        <i
          className={`ph-bold ${phase === 'refreshing' ? 'ph-spinner' : 'ph-arrow-down'}`}
          style={{ fontSize: 20, color: 'var(--cp-ink-3)', opacity: progress, transform: phase === 'refreshing' ? undefined : `rotate(${phase === 'ready' ? 180 : progress * 120}deg)`, transition: 'transform .2s ease', animation: phase === 'refreshing' ? 'cp-ptr-spin .8s linear infinite' : undefined }}
        />
      </div>
      <div style={{ transform: `translateY(${pull}px)`, transition: dragging ? 'none' : 'transform .25s ease' }}>{children}</div>
      <style>{'@keyframes cp-ptr-spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
