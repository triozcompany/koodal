'use client';
import { useEffect, useState } from 'react';
import { corp } from '@/lib/domain/rules';
import type { Issue } from '@/lib/domain/types';

interface Props {
  issue: Issue;
  mob: boolean;
  onClose: () => void;
}

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 112 + (i % 3) * 14;
  return {
    x: `calc(50% + ${Math.cos(a) * r}px - 5px)`,
    y: `calc(50% + ${Math.sin(a) * r}px - 5px)`,
    s: (i % 3 ? 8 : 12) + 'px',
    r: i % 2 ? '50%' : '3px',
    c: ['#fff', 'oklch(0.82 0.15 75)', 'oklch(0.93 0.045 32)'][i % 3],
    d: ((i % 5) * 0.05 + 0.15) + 's',
  };
});

export function ThresholdScreen({ issue, mob, onClose }: Props) {
  const [num, setNum] = useState(0);
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

  /* ── Mobile layout ── */
  if (mob) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'var(--cp-peacock)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px 40px', gap: 22, animation: 'cp-in .4s cubic-bezier(.2,.9,.3,1.2) both' }}>
        {SPARKS.map((k, i) => (
          <span key={i} style={{ position: 'absolute', left: k.x, top: k.y, width: k.s, height: k.s, borderRadius: k.r, background: k.c, animation: `cp-spark 1.1s ${k.d} ease-out both`, pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', width: 210, height: 210 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(#fff ${deg}, rgba(255,255,255,.2) 0)` }} />
          <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'var(--cp-peacock)', display: 'grid', placeItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ font: "400 55px/0.9 'DM Serif Display',serif", letterSpacing: '-.04em' }}>{num}%</span>
              <span style={{ font: '500 12px/1 Outfit,sans-serif', opacity: 0.85 }}>{issue.sup} neighbours</span>
            </div>
          </div>
        </div>

        <div style={{ font: "400 30px/1 'DM Serif Display',serif", letterSpacing: '-.025em', textAlign: 'center' }}>Community verified</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.14)', font: '600 13px/1.25 Outfit,sans-serif' }}>
          <i className="ph-bold ph-paper-plane-tilt" style={{ fontSize: 20 }} />
          Sent to {corpName} · {issue.dept}
        </div>

        <button onClick={onClose} style={{ marginTop: 10, width: '100%', height: 58, borderRadius: 999, background: '#fff', color: 'oklch(0.22 0.03 270)', border: '2px solid oklch(0.22 0.03 270)', boxShadow: '0 4px 0 oklch(0.22 0.03 270)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Track verification<i className="ph-bold ph-arrow-right" />
        </button>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(380px,1.05fr)', background: 'var(--cp-surface)', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      {/* Left: gauge */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--cp-peacock)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 32 }}>
        {SPARKS.map((k, i) => (
          <span key={i} style={{ position: 'absolute', left: k.x, top: k.y, width: k.s, height: k.s, borderRadius: k.r, background: k.c, animation: `cp-spark 1.1s ${k.d} ease-out both`, pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', width: 250, height: 250 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(#fff ${deg}, rgba(255,255,255,.2) 0)` }} />
          <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'var(--cp-peacock)', display: 'grid', placeItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ font: "400 64px/0.9 'DM Serif Display',serif", letterSpacing: '-.04em' }}>{num}%</span>
              <span style={{ font: '500 12.5px/1 Outfit,sans-serif', opacity: 0.85 }}>community confidence</span>
            </div>
          </div>
        </div>

        <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', opacity: 0.85, whiteSpace: 'nowrap' }}>Threshold reached · 80%</span>
      </div>

      {/* Right: info */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <button onClick={onClose} title="Close" style={{ position: 'absolute', right: 18, top: 18, zIndex: 5, width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 16 }}>
          <i className="ph-bold ph-x"></i>
        </button>

        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 34px 10px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 44 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
              <i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 14 }}></i>Community verified
            </span>
            <span style={{ font: "400 32px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Your neighbours made this official-ready</span>
            <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{issue.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
            {[
              { v: issue.sup, l: 'citizens support' },
              { v: contribN, l: 'added evidence' },
              { v: photoN, l: 'photos' },
            ].map(({ v, l }) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 14, borderRadius: 16, background: 'var(--cp-surface-2)' }}>
                <span style={{ font: '700 22px/1 Outfit,sans-serif' }}>{v}</span>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{l}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: 'ph-check', bg: 'var(--cp-leaf)', fg: '#fff', title: 'Community verified', sub: 'Unique citizens and evidence crossed the threshold', when: 'Done' },
              { icon: 'ph-paper-plane-tilt', bg: 'var(--cp-ink)', fg: 'var(--cp-bg)', title: `Sent to ${corpName}`, sub: `${issue.dept} · verification queue`, when: 'Now' },
              { icon: 'ph-magnifying-glass', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink)', title: 'Government verification', sub: 'An officer reviews the location and evidence', when: 'Next' },
              { icon: 'ph-bank', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink)', title: 'Official case', sub: 'Case ID, department and a public timeline', when: 'Then' },
            ].map(({ icon, bg, fg, title, sub, when }, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px minmax(0,1fr) auto', gap: 14, alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--cp-line)' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: fg, display: 'grid', placeItems: 'center', fontSize: 16 }}>
                  <i className={`ph-bold ${icon}`}></i>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ font: '600 14.5px/1.25 Outfit,sans-serif' }}>{title}</span>
                  <span style={{ font: '400 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{sub}</span>
                </span>
                <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{when}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, padding: '18px 34px 26px', borderTop: '1px solid var(--cp-line)', flex: 'none' }}>
          <button style={{ flex: '3 1 0', minWidth: 0, height: 52, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <i className="ph-bold ph-share-fat"></i>Share
          </button>
          <button onClick={onClose} style={{ flex: '7 1 0', minWidth: 0, height: 52, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Track verification<i className="ph-bold ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
