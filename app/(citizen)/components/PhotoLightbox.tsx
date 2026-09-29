'use client';
import { useEffect, useState } from 'react';
import { useSwipe } from '@/lib/hooks/useSwipe';
import type { Shot } from '@/lib/domain/report-draft';

interface Props {
  shots: Shot[];
  initialIndex: number;
  street: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function PhotoLightbox({ shots, initialIndex, street, onClose, onDelete }: Props) {
  const [selIdx, setSelIdx] = useState(initialIndex);
  const idx = Math.min(selIdx, Math.max(0, shots.length - 1));
  const current = shots[idx];

  useEffect(() => {
    if (shots.length === 0) onClose();
  }, [shots.length, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setSelIdx(i => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setSelIdx(i => Math.min(shots.length - 1, i + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, shots.length]);

  const goPrev = () => setSelIdx(i => Math.max(0, i - 1));
  const goNext = () => setSelIdx(i => Math.min(shots.length - 1, i + 1));

  const { dragX, dragging, onPointerDown, onPointerMove, onPointerUp } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    onSwipeDown: onClose,
    disabled: shots.length < 2,
  });

  if (!current) return null;
  const stamp = `IMG_${current.ts.toString(36).toUpperCase()}.jpg`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#08090b', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px', color: '#fff' }}>
        <button aria-label="Close" onClick={onClose} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
          <i className="ph-bold ph-x" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', font: '600 13px/1 Outfit,sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {idx + 1} / {shots.length}
        </span>
        <button aria-label="Delete this photo" onClick={() => onDelete(current.id)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
          <i className="ph-bold ph-trash" />
        </button>
      </div>

      {/* Main photo */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Photo, full screen"
        style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', touchAction: 'none', margin: '0 14px', borderRadius: 20 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${dragX}px)`, transition: dragging ? 'none' : 'transform .35s cubic-bezier(.3,1.4,.5,1)', borderRadius: 20, overflow: 'hidden', background: `repeating-linear-gradient(${135 + idx * 25}deg,#23252b 0 12px,#1b1d22 12px 24px)`, display: 'grid', placeItems: 'center' }}>
          <i className={`ph-bold ${current.icon}`} style={{ fontSize: 64, color: 'rgba(255,255,255,.3)' }} />
        </div>

        {shots.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={goPrev}
              disabled={idx === 0}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.4)', color: '#fff', display: 'grid', placeItems: 'center', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.35 : 1, fontSize: 18 }}
            >
              <i className="ph-bold ph-caret-left" />
            </button>
            <button
              aria-label="Next photo"
              onClick={goNext}
              disabled={idx === shots.length - 1}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.4)', color: '#fff', display: 'grid', placeItems: 'center', cursor: idx === shots.length - 1 ? 'default' : 'pointer', opacity: idx === shots.length - 1 ? 0.35 : 1, fontSize: 18 }}
            >
              <i className="ph-bold ph-caret-right" />
            </button>
          </>
        )}

        <div style={{ position: 'absolute', left: 12, bottom: 10, font: '400 11px/1 "JetBrains Mono",monospace', color: 'rgba(255,255,255,.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
          {stamp} · {street}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: '12px 14px 18px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {shots.map((s, k) => {
          const isSel = k === idx;
          return (
            <button
              key={s.id}
              aria-label={`View photo ${k + 1}`}
              onClick={() => setSelIdx(k)}
              style={{
                flexShrink: 0, width: 48, height: 48, borderRadius: 10,
                background: `repeating-linear-gradient(${135 + k * 25}deg,#2a2c33 0 6px,#1f2126 6px 12px)`,
                border: isSel ? '2px solid #fff' : '2px solid transparent',
                opacity: isSel ? 1 : 0.5,
                display: 'grid', placeItems: 'center', color: '#c9cbd2', fontSize: 16, cursor: 'pointer',
                transition: 'opacity .25s, border-color .25s',
              }}
            >
              <i className={`ph-bold ${s.icon}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
