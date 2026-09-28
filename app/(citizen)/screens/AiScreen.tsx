'use client';
import { useEffect, useState } from 'react';
import type { Analysis } from '@/lib/domain/analyze';

const SEVL: Record<string, [string, string]> = {
  critical: ['Critical', 'var(--cp-pulse-soft)'],
  high: ['High risk', 'var(--cp-pulse-soft)'],
  medium: ['Medium', 'var(--cp-marigold-soft)'],
  low: ['Low', 'var(--cp-surface-2)'],
};

interface Props {
  an: Analysis;
  onNext: () => void;
  onClose: () => void;
  mob: boolean;
  forceComplete?: boolean;
}

export function AiScreen({ an, onNext, onClose, mob, forceComplete }: Props) {
  const [aiStep, setAiStep] = useState(forceComplete ? 6 : 0);

  useEffect(() => {
    if (forceComplete) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    [1, 2, 3, 4, 5, 6].forEach((n, i) => {
      timers.push(setTimeout(() => setAiStep(n), 600 + i * 650));
    });
    return () => timers.forEach(clearTimeout);
  }, [forceComplete]);

  const matchTxt = an.strong
    ? `1 strong match · ${an.strong.dist} m away`
    : an.matches.length
    ? `Similar issue ${an.matches[0].dist} m away · maybe different`
    : 'No similar issue nearby';

  const aiAll = [
    { icon: an.icon, bg: 'var(--cp-pulse-soft)', k: 'Classified', v: `${an.label} · ${an.catLabel}`, sub: '' },
    { icon: 'ph-waveform', bg: 'var(--cp-surface-2)', k: `Heard · ${an.voice.lang}`, v: an.voice.text, sub: an.voice.en },
    { icon: 'ph-warning', bg: 'var(--cp-marigold-soft)', k: 'Severity', v: `${SEVL[an.sev]?.[0] ?? an.sev} · ${an.size}`, sub: an.risk },
    { icon: 'ph-buildings', bg: 'var(--cp-peacock-soft)', k: 'Goes to', v: `${an.dept} · ${an.corp}`, sub: '' },
    { icon: 'ph-intersect', bg: 'var(--cp-surface-2)', k: 'Similar issues', v: aiStep >= 6 ? matchTxt : `Checking reports nearby`, sub: '' },
  ];

  const aiRows = aiAll.slice(0, Math.min(5, aiStep));
  const aiDone = aiStep >= 6;
  const aiThinking = aiStep < 6;
  const aiTitle = aiDone ? 'Got it.' : 'Understanding…';
  const aiScanning = aiStep < 2;
  const aiBox = aiStep >= 1;

  const aiBtnLabel = an.strong
    ? '1 match nearby · See it'
    : an.matches.length
    ? 'Similar nearby · Compare'
    : 'Post as new issue';
  const aiBtnIcon = an.matches.length ? 'ph-intersect' : 'ph-paper-plane-tilt';
  const aiBtnBg = an.matches.length ? 'var(--cp-marigold)' : 'var(--cp-pulse)';
  const aiBtnFg = an.matches.length ? 'var(--cp-on-marigold)' : '#fff';

  if (!mob) {
    // Desktop layout
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(360px,1fr)', background: 'var(--cp-surface)', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
        {/* Left: photo */}
        <div style={{ position: 'relative', background: '#0c0d10', display: 'flex', flexDirection: 'column', gap: 14, padding: 28, minHeight: 0 }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 18, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#1b1d22 0 12px,#16181c 12px 24px)' }}>
            <span style={{ position: 'absolute', left: 14, top: 14, height: 28, padding: '0 11px', borderRadius: 999, background: 'rgb(0 0 0 / .55)', color: '#fff', font: '600 11.5px/28px Outfit,sans-serif', whiteSpace: 'nowrap' }}>your photo</span>
            {aiScanning && <div style={{ position: 'absolute', inset: '18% 22%', border: '2px dashed rgb(255 255 255 / .55)', borderRadius: 16, animation: 'cp-ping 1.6s ease-out infinite' }} />}
            {aiBox && (
              <div style={{ position: 'absolute', inset: '22% 26%', border: '2.5px solid oklch(0.8 0.155 75)', borderRadius: 14, boxShadow: '0 0 0 999px rgb(0 0 0 / .28)', animation: 'cp-pop .4s cubic-bezier(.3,1.6,.5,1) both' }}>
                <span style={{ position: 'absolute', left: -2, top: -34, height: 26, padding: '0 10px', borderRadius: 999, background: 'oklch(0.8 0.155 75)', color: '#0f0f0f', font: '700 12px/26px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{an.label} · {an.p}%</span>
              </div>
            )}
          </div>
        </div>
        {/* Right: analysis */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <button onClick={onClose} title="Close" style={{ position: 'absolute', right: 18, top: 18, zIndex: 5, width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 16 }}>
            <i className="ph-bold ph-x"></i>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '32px 32px 18px', flex: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
              <i className="ph-fill ph-sparkle" style={{ color: 'var(--cp-pulse)', fontSize: 13 }}></i>AI analysis
            </span>
            <span style={{ font: '400 30px/1.1 "DM Serif Display",serif', letterSpacing: '-.02em', paddingRight: 48 }}>{aiTitle}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px', display: 'flex', flexDirection: 'column' }}>
            {aiRows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: 14, padding: '16px 0', borderTop: '1px solid var(--cp-line)', animation: 'cp-row .35s ease-out both' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: row.bg, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                  <i className={`ph-bold ${row.icon}`}></i>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>{row.k}</span>
                  <span style={{ font: '600 15px/1.3 Outfit,"Noto Sans Tamil",sans-serif' }}>{row.v}</span>
                  {row.sub && <span style={{ font: '400 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{row.sub}</span>}
                </div>
              </div>
            ))}
            {aiThinking && (
              <div style={{ display: 'flex', gap: 6, padding: '18px 0 18px 54px', borderTop: '1px solid var(--cp-line)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-ping 1.2s ease-out infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-ping 1.2s .2s ease-out infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-ping 1.2s .4s ease-out infinite' }} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '18px 32px 26px', borderTop: '1px solid var(--cp-line)', flex: 'none' }}>
            <button onClick={onClose} style={{ flex: '3 1 0', minWidth: 0, height: 52, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}>Cancel</button>
            {aiDone ? (
              <button onClick={onNext} style={{ flex: '7 1 0', minWidth: 0, height: 52, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, animation: 'cp-pop .35s cubic-bezier(.3,1.6,.5,1) both' }}>
                <i className={`ph-bold ${aiBtnIcon}`}></i>{aiBtnLabel}
              </button>
            ) : (
              <div style={{ flex: '7 1 0', height: 52, borderRadius: 999, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-3)', font: '600 14px/52px Outfit,sans-serif', textAlign: 'center' }}>Understanding…</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--cp-ink)', color: 'var(--cp-bg)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
          <i className="ph-fill ph-sparkle"></i>
        </div>
        <div style={{ font: '400 19px/1 "DM Serif Display",serif', letterSpacing: '-.02em' }}>{aiTitle}</div>
      </div>

      {/* Photo */}
      <div style={{ position: 'relative', height: 210, borderRadius: 20, border: '1px solid var(--cp-line)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)', flex: 'none' }}>
        <div style={{ position: 'absolute', right: 10, top: 10, font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '5px 7px', borderRadius: 6 }}>your photo</div>
        {aiScanning && (
          <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'var(--cp-pulse)', boxShadow: '0 0 18px 4px color-mix(in oklch,var(--cp-pulse) 50%,transparent)', animation: 'cp-scan 1.1s ease-in-out infinite alternate' }} />
        )}
        {aiBox && (
          <div style={{ position: 'absolute', left: '22%', top: '32%', width: '54%', height: '44%', border: '3px solid var(--cp-pulse)', borderRadius: 12, animation: 'cp-pop .4s cubic-bezier(.3,1.5,.5,1) both' }}>
            <span style={{ position: 'absolute', left: -3, top: -30, height: 24, padding: '0 8px', borderRadius: 7, background: 'var(--cp-pulse)', color: '#fff', font: '700 12px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{an.label} · {an.p}%</span>
          </div>
        )}
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {aiRows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--cp-line)', animation: 'cp-row .4s cubic-bezier(.2,.9,.3,1.2) both' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: row.bg, display: 'grid', placeItems: 'center', fontSize: 19, color: 'var(--cp-ink)' }}>
              <i className={`ph-bold ${row.icon}`}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ font: '500 10.5px/1 Outfit,sans-serif', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>{row.k}</span>
              <span style={{ font: '600 13px/1.3 Outfit,"Noto Sans Tamil",sans-serif', color: 'var(--cp-ink)' }}>{row.v}</span>
              {row.sub && <span style={{ font: '500 12.5px/1.25 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{row.sub}</span>}
            </div>
          </div>
        ))}
        {aiThinking && (
          <div style={{ display: 'flex', gap: 5, padding: '16px 0 0 52px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-dots 1s infinite' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-dots 1s .15s infinite' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cp-ink-3)', animation: 'cp-dots 1s .3s infinite' }} />
          </div>
        )}
      </div>

      {/* CTA */}
      {aiDone && (
        <button
          onClick={onNext}
          style={{ position: 'absolute', left: 16, right: 16, bottom: 34, height: 60, borderRadius: 999, background: aiBtnBg, color: aiBtnFg, border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: 'pointer', animation: 'cp-pop .45s cubic-bezier(.3,1.5,.5,1) both' }}
        >
          <i className={`ph-bold ${aiBtnIcon}`} style={{ fontSize: 21 }}></i>
          {aiBtnLabel}
        </button>
      )}
    </div>
  );
}
