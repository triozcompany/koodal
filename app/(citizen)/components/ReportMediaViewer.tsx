'use client';
import { useEffect, useRef, useState } from 'react';
import { useSwipe } from '@/lib/hooks/useSwipe';
import type { Shot } from '@/lib/domain/report-draft';
import { MAX_SHOTS } from '@/lib/domain/report-draft';
import { PhotoLightbox } from './PhotoLightbox';

interface Props {
  shots: Shot[];
  aiHint: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onRetakeAll: () => void;
  street: string;
}

function PhotoPlaceholder({ icon, angle }: { icon: string; angle: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(${angle}deg,#23252b 0 12px,#1b1d22 12px 24px)`, display: 'grid', placeItems: 'center' }}>
      <i className={`ph-bold ${icon}`} style={{ fontSize: 46, color: 'rgba(255,255,255,.3)' }} />
    </div>
  );
}

export function ReportMediaViewer({ shots, aiHint, onAdd, onRemove, onRetakeAll, street }: Props) {
  const [selIdx, setSelIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prevLenRef = useRef(shots.length);

  const idx = Math.min(selIdx, Math.max(0, shots.length - 1));
  const current = shots[idx];

  useEffect(() => {
    if (shots.length > prevLenRef.current) setSelIdx(shots.length - 1);
    prevLenRef.current = shots.length;
  }, [shots.length]);

  const goPrev = () => setSelIdx(i => Math.max(0, i - 1));
  const goNext = () => setSelIdx(i => Math.min(shots.length - 1, i + 1));

  const suppressClickRef = useRef(false);
  const { dragX, dragging, onPointerDown, onPointerMove, onPointerUp } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    disabled: shots.length < 2,
  });

  // useSwipe already zeroes dragX/dragging by the time the click fires, so capture
  // "was this a real drag" before that reset happens, in a ref the click handler can read.
  const handlePointerUp = () => {
    suppressClickRef.current = Math.abs(dragX) >= 5;
    onPointerUp();
  };

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Main viewer */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Report photos"
        style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', touchAction: 'none', cursor: shots.length > 1 ? 'grab' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return; } setLightboxOpen(true); }}
      >
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${dragX}px)`, transition: dragging ? 'none' : 'transform .35s cubic-bezier(.3,1.4,.5,1)' }}>
          {current.url || current.dataUrl
            ? <img src={current.url || current.dataUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <PhotoPlaceholder icon={current.icon} angle={135 + idx * 25} />}
        </div>

        {/* Gradient fades */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: 'linear-gradient(rgba(12,13,16,.55),transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(transparent,rgba(12,13,16,.65))', pointerEvents: 'none' }} />

        {shots.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={e => { e.stopPropagation(); goPrev(); }}
              disabled={idx === 0}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(12,13,16,.55)', color: '#fff', display: 'grid', placeItems: 'center', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.35 : 1, fontSize: 18 }}
            >
              <i className="ph-bold ph-caret-left" />
            </button>
            <button
              aria-label="Next photo"
              onClick={e => { e.stopPropagation(); goNext(); }}
              disabled={idx === shots.length - 1}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(12,13,16,.55)', color: '#fff', display: 'grid', placeItems: 'center', cursor: idx === shots.length - 1 ? 'default' : 'pointer', opacity: idx === shots.length - 1 ? 0.35 : 1, fontSize: 18 }}
            >
              <i className="ph-bold ph-caret-right" />
            </button>
          </>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 16, background: 'rgba(12,13,16,.72)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <i className="ph-fill ph-sparkle" style={{ color: 'oklch(0.8 0.155 75)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{aiHint}</span>
        </div>
        <span style={{ flexShrink: 0, height: 32, padding: '0 10px', borderRadius: 16, background: 'rgba(12,13,16,.72)', display: 'grid', placeItems: 'center', font: '600 12.5px/1 Outfit,sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {idx + 1} / {shots.length}
        </span>
        <button aria-label="Expand photo" onClick={() => setLightboxOpen(true)} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(12,13,16,.72)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14 }}>
          <i className="ph-bold ph-arrows-out-simple" />
        </button>
        <button aria-label="Delete this photo" onClick={() => onRemove(current.id)} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(12,13,16,.72)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14 }}>
          <i className="ph-bold ph-trash" />
        </button>
      </div>

      {/* Filmstrip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 12px', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {shots.map((s, k) => {
            const isSel = k === idx;
            return (
              <button
                key={s.id}
                aria-label={`View photo ${k + 1}`}
                onClick={() => setSelIdx(k)}
                style={{
                  position: 'relative', flexShrink: 0, width: 56, height: 56, borderRadius: 12, overflow: 'hidden',
                  background: (s.url || s.dataUrl) ? undefined : `repeating-linear-gradient(${135 + k * 25}deg,#2a2c33 0 6px,#1f2126 6px 12px)`,
                  border: isSel ? '2px solid #fff' : '2px solid transparent',
                  opacity: isSel ? 1 : 0.55,
                  transform: isSel ? 'scale(1)' : 'scale(0.92)',
                  transition: 'transform .3s cubic-bezier(.3,1.6,.5,1), opacity .25s, border-color .25s',
                  display: 'grid', placeItems: 'center', color: '#c9cbd2', fontSize: 18, cursor: 'pointer',
                }}
              >
                {s.url || s.dataUrl ? <img src={s.url || s.dataUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className={`ph-bold ${s.icon}`} />}
              </button>
            );
          })}
          {shots.length < MAX_SHOTS && (
            <button
              aria-label="Add another photo"
              onClick={onAdd}
              style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, border: '2px dashed rgba(255,255,255,.35)', background: 'transparent', color: 'rgba(255,255,255,.55)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 20 }}
            >
              <i className="ph-bold ph-plus" />
            </button>
          )}
        </div>
        <button
          onClick={onRetakeAll}
          style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap', minHeight: 44 }}
        >
          <i className="ph-bold ph-arrow-counter-clockwise" />Retake all
        </button>
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          shots={shots}
          initialIndex={idx}
          street={street}
          onClose={() => setLightboxOpen(false)}
          onDelete={onRemove}
        />
      )}
    </div>
  );
}
