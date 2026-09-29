'use client';
import { useEffect, useRef, useState } from 'react';

const ANGLES = ['135deg', '45deg', '90deg', '120deg', '60deg', '150deg', '30deg'];

interface Props {
  count: number;
  /** Real photo URL per slide, same length/order as the slides `count` implies.
   * A slide with no url (or none passed at all) falls back to the placeholder. */
  urls?: (string | undefined)[];
  intervalMs?: number;
  /** Overlay content (badges, labels) rendered on top of the sliding track, fixed in place. */
  children?: React.ReactNode;
}

export function ImageCarousel({ count, urls, intervalMs = 3500, children }: Props) {
  const n = Math.max(1, count);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (n <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % n), intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n, intervalMs]);

  function go(next: number, e: React.MouseEvent) {
    e.stopPropagation();
    setIdx(((next % n) + n) % n);
    if (timerRef.current) clearInterval(timerRef.current);
    if (n > 1) timerRef.current = setInterval(() => setIdx(i => (i + 1) % n), intervalMs);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: `${n * 100}%`, height: '100%', transform: `translateX(-${idx * (100 / n)}%)`, transition: 'transform .45s cubic-bezier(.2,.9,.3,1.1)' }}>
        {Array.from({ length: n }).map((_, k) => {
          const url = urls?.[k];
          return url ? (
            <img key={k} src={url} alt="" style={{ width: `${100 / n}%`, height: '100%', flexShrink: 0, objectFit: 'cover' }} />
          ) : (
            <div key={k} style={{ width: `${100 / n}%`, height: '100%', flexShrink: 0, background: `repeating-linear-gradient(${ANGLES[k % ANGLES.length]},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)` }} />
          );
        })}
      </div>
      {children}
      {n > 1 && (
        <>
          <button
            onClick={e => go(idx - 1, e)}
            title="Previous photo"
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgb(0 0 0 / .45)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14 }}
          >
            <i className="ph-bold ph-caret-left" />
          </button>
          <button
            onClick={e => go(idx + 1, e)}
            title="Next photo"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgb(0 0 0 / .45)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14 }}
          >
            <i className="ph-bold ph-caret-right" />
          </button>
          <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {Array.from({ length: n }).map((_, k) => (
              <span key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: k === idx ? '#fff' : 'rgb(255 255 255 / .45)', transition: 'background .2s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
