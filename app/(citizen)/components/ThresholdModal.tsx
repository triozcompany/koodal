'use client';
import { useEffect, useState } from 'react';
import { corp } from '@/lib/domain/rules';
import type { Issue } from '@/lib/domain/types';
import { Confetti } from './Confetti';

interface Props {
  issue: Issue;
  onClose: () => void;
  onTrack: () => void;
}

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = 66 + (i % 3) * 10;
  return {
    x: `calc(50% + ${Math.cos(a) * r}px - 4px)`,
    y: `calc(50% + ${Math.sin(a) * r}px - 4px)`,
    s: (i % 3 ? 6 : 9) + 'px',
    r: i % 2 ? '50%' : '3px',
    c: ['#fff', 'oklch(0.82 0.15 75)', 'oklch(0.93 0.045 32)'][i % 3],
    d: ((i % 5) * 0.05 + 0.15) + 's',
  };
});

/** Compact celebration modal — replaces the old full-page ThresholdScreen.
 * Confetti bursts once behind it (Confetti is already viewport-fixed, so it
 * plays correctly regardless of the modal's own smaller size). */
export function ThresholdModal({ issue, onClose, onTrack }: Props) {
  const [num, setNum] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const conf = issue.conf;

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setNum(Math.round(ease * conf));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [conf]);

  const deg = `${(num / 100) * 360}deg`;
  const corpName = corp(issue);
  const contribN = issue.evidence?.length ?? 0;
  const photoN = contribN + 1;

  return (
    <>
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }}
      />
      {/* Outer wrapper only positions/centers — the animation below drives its
          own `transform` (scale bounce) via keyframes, which would otherwise
          clobber a static translate(-50%,-50%) set on the same element. */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 81, width: 'min(440px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 40px)' }}>
      <div
        style={{
          background: 'var(--cp-surface)', borderRadius: 24, border: '1px solid var(--cp-line)',
          boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxHeight: 'calc(100vh - 40px)', animation: 'cp-pop .35s cubic-bezier(.2,.9,.3,1.1) both',
        }}
      >
        <button onClick={onClose} title="Close" style={{ position: 'absolute', right: 14, top: 14, zIndex: 5, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 15 }}>
          <i className="ph-bold ph-x"></i>
        </button>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px 8px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
            {SPARKS.map((k, i) => (
              <span key={i} style={{ position: 'absolute', left: k.x, top: k.y, width: k.s, height: k.s, borderRadius: k.r, background: k.c, animation: `cp-spark 1.1s ${k.d} ease-out both`, pointerEvents: 'none' }} />
            ))}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(var(--cp-peacock) ${deg}, var(--cp-surface-2) 0)` }} />
            <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', background: 'var(--cp-surface)', display: 'grid', placeItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ font: "400 40px/0.9 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{num}%</span>
                <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}>community confidence</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
              <i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 14 }}></i>Community verified
            </span>
            <span style={{ font: "400 24px/1.15 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Your neighbours made this official-ready</span>
            <span style={{ font: '400 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{issue.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, width: '100%' }}>
            {[
              { v: issue.sup, l: 'citizens support' },
              { v: contribN, l: 'added evidence' },
              { v: photoN, l: 'photos' },
            ].map(({ v, l }) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 8px', borderRadius: 14, background: 'var(--cp-surface-2)' }}>
                <span style={{ font: '700 18px/1 Outfit,sans-serif' }}>{v}</span>
                <span style={{ font: '500 10.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{l}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {[
              { icon: 'ph-check', bg: 'var(--cp-leaf)', fg: '#fff', title: 'Community verified', sub: 'Unique citizens and evidence crossed the threshold', when: 'Done' },
              { icon: 'ph-paper-plane-tilt', bg: 'var(--cp-ink)', fg: 'var(--cp-bg)', title: `Sent to ${corpName}`, sub: `${issue.dept} · verification queue`, when: 'Now' },
              { icon: 'ph-magnifying-glass', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink)', title: 'Government verification', sub: 'An officer reviews the location and evidence', when: 'Next' },
              { icon: 'ph-bank', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink)', title: 'Official case', sub: 'Case ID, department and a public timeline', when: 'Then' },
            ].map(({ icon, bg, fg, title, sub, when }, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '11px 0', borderTop: '1px solid var(--cp-line)' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color: fg, display: 'grid', placeItems: 'center', fontSize: 14 }}>
                  <i className={`ph-bold ${icon}`}></i>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ font: '600 13px/1.25 Outfit,sans-serif' }}>{title}</span>
                  <span style={{ font: '400 11.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{sub}</span>
                </span>
                <span style={{ font: '600 10px/1 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{when}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px 20px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <button style={{ flex: '3 1 0', minWidth: 0, height: 48, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <i className="ph-bold ph-share-fat"></i>Share
          </button>
          <button data-glare="1" onClick={onTrack} style={{ flex: '7 1 0', minWidth: 0, height: 48, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Track verification<i className="ph-bold ph-arrow-right"></i>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
