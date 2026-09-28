'use client';
import { useState, useRef } from 'react';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { PILL, AVB, SEGC, TRACK } from '@/lib/domain/stage-style';
import { ago, step, slaLeft, corp } from '@/lib/domain/rules';
import styles from './DetailScreen.module.css';

interface Props {
  issue: Issue;
  supported: boolean;
  onBack: () => void;
  onSupport: () => void;
}

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

export function DetailScreen({ issue: d, supported, onBack, onSupport }: Props) {
  const [holdProg, setHoldProg] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cat       = CATS[d.cat];
  const dst       = step(d.stage);
  const [pc, pfg, pl] = PILL[d.stage] ?? PILL.reported;
  const abg       = AVB[nameHash(d.by) % AVB.length];
  const ai        = d.anon ? '' : initials(d.by);
  const place     = `${d.street}, ${d.area}, ${d.city}`;
  const photoN    = Math.max(1, d.evidence?.length ?? 1);
  const contribN  = Math.max(1, (d.merged?.length ?? 0) + 1);
  const preCase   = ['reported', 'community', 'review'].includes(d.stage);
  const rejected  = d.stage === 'rejected';
  const confW     = `${d.conf}%`;
  const confC     = d.conf >= 80 ? 'var(--cp-peacock)' : 'var(--cp-marigold)';
  const confNote  = d.conf >= 80
    ? `Now with ${corp(d)} for review`
    : `${corp(d)} review begins when confidence hits 80%`;
  const hasTags   = (d.tags?.length ?? 0) > 0;
  const hasLinked = (d.merged?.length ?? 0) > 0;
  const canEdit   = d.mine && !d.caseId;
  const lockedMine= d.mine && !!d.caseId;

  const actVerify = d.stage === 'resolved';
  const actDone   = d.stage === 'closed';
  const isActive  = !actVerify && !actDone && !rejected;
  const actMine   = d.mine && isActive;
  const actCase   = !d.mine && !!d.caseId && isActive;
  const actSupport= !d.mine && !d.caseId && isActive;

  const holdBg    = supported ? 'var(--cp-pulse)' : 'var(--cp-ink)';
  const holdFg    = supported ? '#fff' : 'var(--cp-bg)';
  const holdLabel = supported ? 'You support this' : 'Hold to support';
  const holdIcon  = supported ? 'ph-fill ph-arrow-fat-up' : 'ph-bold ph-arrow-fat-up';

  function holdStart(e: React.PointerEvent) {
    if (supported) { onSupport(); return; }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    holdTimer.current = setInterval(() => {
      setHoldProg(p => {
        if (p >= 100) {
          clearInterval(holdTimer.current!);
          holdTimer.current = null;
          onSupport();
          return 0;
        }
        return p + 4;
      });
    }, 30);
  }

  function holdEnd() {
    if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; }
    setHoldProg(0);
  }

  // Generate avatar row from merged + self
  const avatars = [
    { bg: abg, i: ai || '?' },
    ...(d.merged?.slice(0, 4).map((m, k) => ({ bg: AVB[(nameHash(m.by) + k + 1) % AVB.length], i: initials(m.by) })) ?? []),
  ].slice(0, 5);

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 120 }}>

        {/* Hero photo area */}
        <div style={{ position: 'relative', height: 280 }}>
          <div style={{ display: 'flex', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            <button
              style={{ position: 'relative', flex: 'none', width: '100%', height: '100%', scrollSnapAlign: 'center', border: 'none', padding: 0, cursor: 'pointer', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}
            >
              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '6px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>photo 1</span>
            </button>
          </div>
          <span style={{ position: 'absolute', right: 16, bottom: 16, height: 26, padding: '0 10px', borderRadius: 8, background: 'rgb(0 0 0 / .62)', color: '#fff', font: '600 12px/26px Outfit,sans-serif', pointerEvents: 'none' }}>1 / {photoN}</span>
          <div style={{ position: 'absolute', left: 20, bottom: -22, width: 52, height: 52, borderRadius: 15, background: 'var(--cp-ink)', border: '3px solid var(--cp-bg)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <i className={`ph-bold ${cat.icon}`} style={{ fontSize: 25, color: 'var(--cp-bg)' }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Reporter row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 13, background: abg, display: 'grid', placeItems: 'center', font: '700 12px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>
              {d.anon ? <i className="ph-bold ph-detective" style={{ fontSize: 20 }} /> : ai}
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '600 13px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.anon ? 'Anonymous' : d.by}</span>
                <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500, flexShrink: 0 }}>· {ago(d.created)}</span>
              </span>
              <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.id} · {cat.l}</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: pc, color: pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{pl}</span>
          </div>

          {/* Title */}
          <div style={{ font: "400 24px/1.05 'DM Serif Display',serif", letterSpacing: '-.025em', textWrap: 'balance' } as React.CSSProperties}>{d.title}</div>

          {/* Place */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', flexShrink: 0 }} />
            {place}
          </div>

          {/* Text */}
          {d.text && <span style={{ font: "400 14px/1.5 Outfit,'Noto Sans Tamil',sans-serif", color: 'var(--cp-ink)' }}>{d.text}</span>}

          {/* Voice */}
          {d.voice && (
            <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'var(--cp-surface-2)' }}>
              <i className="ph-fill ph-waveform" style={{ fontSize: 19, color: 'var(--cp-pulse)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ font: "500 12.5px/1.35 'Noto Sans Tamil',Outfit,sans-serif" }}>{d.voice.text}</span>
                <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Voice · {d.voice.lang}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {hasTags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
              {d.tags.map(t => <span key={t} style={{ font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)' }}>#{t}</span>)}
            </div>
          )}

          {/* 5-step track */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', padding: '14px 0 12px', borderRadius: 18, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
            <div style={{ position: 'absolute', left: '10%', right: '10%', top: 30, height: 3, background: 'var(--cp-line)' }} />
            <div style={{ position: 'absolute', left: '10%', width: `${dst * 20}%`, top: 30, height: 3, background: 'var(--cp-ink)' }} />
            {TRACK.map(([icon, label], j) => {
              const done = j < dst;
              const cur  = j === dst && !rejected;
              const bg   = done ? 'var(--cp-ink)' : cur ? SEGC[dst] : 'var(--cp-surface)';
              const fg   = done ? 'var(--cp-bg)'  : cur ? (dst === 1 ? 'var(--cp-on-marigold)' : '#fff') : 'var(--cp-ink-3)';
              const bd   = j <= dst ? 'var(--cp-edge)' : 'var(--cp-line)';
              const lc   = j <= dst ? 'var(--cp-ink)' : 'var(--cp-ink-3)';
              return (
                <div key={label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{ position: 'relative', width: 34, height: 34, borderRadius: 11, background: bg, border: `2px solid ${bd}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
                    {cur && <div style={{ position: 'absolute', inset: -2, borderRadius: 11, background: bg, animation: 'cp-ping 1.8s ease-out infinite', zIndex: -1 }} />}
                    <i className={`ph-bold ${icon}`} style={{ fontSize: 16, color: fg }} />
                  </div>
                  <span style={{ font: '600 11px/1 Outfit,sans-serif', color: lc }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Pre-case community support section */}
          {preCase && (
            <div style={{ border: '1px solid var(--cp-line)', borderRadius: 20, padding: 16, background: 'var(--cp-surface)', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ font: "400 35px/0.9 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{d.sup}</span>
                  <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>citizens support this</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {avatars.map((a, k) => (
                    <span key={k} style={{ width: 28, height: 28, borderRadius: '50%', marginLeft: k > 0 ? -8 : 0, border: '2px solid var(--cp-surface)', background: a.bg, font: '700 10px/24px Outfit,sans-serif', textAlign: 'center', boxSizing: 'border-box' }}>{a.i}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1, height: 12, borderRadius: 6, background: 'var(--cp-surface-2)' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: confW, borderRadius: 6, background: confC, transition: 'width .8s cubic-bezier(.3,1.4,.5,1)' }} />
                  <div style={{ position: 'absolute', left: '80%', top: -5, bottom: -5, width: 3, borderRadius: 2, background: 'var(--cp-ink)' }} />
                </div>
                <span style={{ font: '700 14px/1 Outfit,sans-serif' }}>{d.conf}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  [String(contribN), 'added evidence'],
                  [String(photoN),   'photos'],
                  [String(d.opp ?? 0), 'say not an issue'],
                ].map(([val, lbl]) => (
                  <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 12, background: 'var(--cp-surface-2)' }}>
                    <span style={{ font: '700 16px/1 Outfit,sans-serif' }}>{val}</span>
                    <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{lbl}</span>
                  </div>
                ))}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
                <i className="ph-bold ph-buildings" />
                {confNote}
              </span>
            </div>
          )}

          {/* Official case button */}
          {d.caseId && !rejected && (
            <button
              className={styles.caseBtn}
              style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 16px', borderRadius: 18, border: '1px solid var(--cp-line)', background: 'var(--cp-peacock)', color: '#fff', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.08em', opacity: 0.92 }}>
                <i className="ph-fill ph-bank" />OFFICIAL CASE · {corp(d)}
              </span>
              <span style={{ font: '600 19px/1 Outfit,sans-serif' }}>{d.caseId}</span>
              <span style={{ font: '500 12px/1.3 Outfit,sans-serif', opacity: 0.92 }}>{d.dept} · {d.assignee ?? 'Unassigned'} · {slaLeft(d) || 'On track'}</span>
            </button>
          )}

          {/* Rejected note */}
          {rejected && (
            <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 16, background: 'var(--cp-surface-2)' }}>
              <i className="ph-bold ph-x-circle" style={{ fontSize: 20, flexShrink: 0 }} />
              <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif' }}>Not accepted by {corp(d)}{d.reject ? ` · ${d.reject}` : ''}</span>
            </div>
          )}

          {/* Linked / merged reports */}
          {hasLinked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ font: "400 16px/1 'DM Serif Display',serif" }}>Reports in this case</span>
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.merged.length}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {d.merged.map((m, k) => (
                  <button
                    key={k}
                    className={styles.lkBtn}
                    style={{ flex: 'none', width: 200, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 8px 12px', borderRadius: 16, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}>
                      <span style={{ position: 'absolute', left: 6, top: 6, height: 20, padding: '0 7px', borderRadius: 10, background: 'var(--cp-surface)', font: '600 10.5px/20px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{m.sim}% match</span>
                    </div>
                    <span style={{ font: '600 12.5px/1.1 Outfit,sans-serif', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(m.h)}</span></span>
                    <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', padding: '0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{m.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 16, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
              <i className="ph-fill ph-sparkle" style={{ color: 'var(--cp-pulse)', fontSize: 13 }} />AI SUMMARY · {d.dept}
            </span>
            <span style={{ font: '500 13px/1.45 Outfit,sans-serif' }}>{d.summary || 'AI analysis pending.'}</span>
            {(d.merged?.length ?? 0) > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8, borderTop: '1px solid var(--cp-line)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 12px/1 Outfit,sans-serif', marginBottom: 4 }}>
                  <i className="ph-bold ph-intersect" style={{ color: 'var(--cp-peacock)' }} />
                  {d.merged.length} similar reports combined
                </span>
                {d.merged.map((m, k) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '6px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ font: '600 12.5px/1 Outfit,sans-serif' }}>{m.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(m.h)}</span></span>
                      <span style={{ font: "500 12.5px/1.3 Outfit,'Noto Sans Tamil',sans-serif", color: 'var(--cp-ink-2)' }}>{m.text}</span>
                    </div>
                    <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)', flexShrink: 0 }}>{m.sim}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence section */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ font: "400 17px/1 'DM Serif Display',serif" }}>Evidence</span>
            <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{photoN} photos · {contribN} people</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 6 }}>
            {(d.evidence ?? []).map((e, k) => (
              <div key={k} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 6px,var(--cp-ph-b) 6px 12px)' }}>
                <span style={{ position: 'absolute', left: 5, bottom: 5, font: '600 9.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{e.by} · {ago(e.ts)}</span>
              </div>
            ))}
            {canEdit && (
              <button style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed var(--cp-ink-3)', background: 'transparent', color: 'var(--cp-ink-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 22 }}>
                <i className="ph-bold ph-camera-plus" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Floating top buttons */}
      <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <button
          onClick={onBack}
          title="Back"
          className={styles.floatBtn}
          style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}
        >
          <i className="ph-bold ph-arrow-left" />
        </button>
        <div style={{ flex: 1 }} />
        {canEdit && (
          <button
            title="Edit"
            className={styles.floatBtn}
            style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}
          >
            <i className="ph-bold ph-pencil-simple" />
          </button>
        )}
        <button
          title="Share"
          className={styles.floatBtn}
          style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}
        >
          <i className="ph-bold ph-share-fat" />
        </button>
      </div>

      {/* Bottom action bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 28px', background: 'var(--cp-bg)', borderTop: '1px solid var(--cp-line)', display: 'flex', gap: 10 }}>

        {/* actMine */}
        {actMine && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {canEdit ? (
              <button
                className={styles.actBtn}
                style={{ flex: '7 1 0', minWidth: 0, height: 56, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14.5px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}
              >
                <i className="ph-bold ph-pencil-simple" style={{ fontSize: 18 }} />Edit report
              </button>
            ) : (
              <div style={{ flex: '7 1 0', minWidth: 0, height: 56, borderRadius: 16, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '600 13px/1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <i className="ph-bold ph-lock-simple" />With government · locked
              </div>
            )}
            <button
              className={styles.cmtBtn}
              style={{ flex: '3 1 0', minWidth: 52, height: 56, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              <i className="ph-bold ph-chat-circle" style={{ fontSize: 20 }} />
              <span style={{ font: '700 11px/1 Outfit,sans-serif' }}>{d.comments?.length ?? 0}</span>
            </button>
            <button
              className={styles.floatBtn}
              style={{ flex: '3 1 0', minWidth: 52, height: 56, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 20, display: 'grid', placeItems: 'center' }}
            >
              <i className="ph-bold ph-share-fat" />
            </button>
          </div>
        )}

        {/* actSupport */}
        {actSupport && (
          <>
            <button
              className={styles.oppBtn}
              style={{ flex: '3 1 0', minWidth: 52, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
            >
              <i className="ph-bold ph-thumbs-down" style={{ fontSize: 20 }} />
              <span style={{ font: '700 11px/1 Outfit,sans-serif' }}>{d.opp}</span>
            </button>
            <button
              onPointerDown={holdStart}
              onPointerUp={holdEnd}
              onPointerLeave={holdEnd}
              style={{ position: 'relative', flex: '7 1 0', minWidth: 0, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: holdBg, color: holdFg, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', overflow: 'hidden', cursor: 'pointer', touchAction: 'none', userSelect: 'none', transition: 'background .2s' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${holdProg}%`, background: 'var(--cp-pulse)', transition: holdProg === 0 ? 'none' : 'width .03s linear' }} />
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, font: "400 15.5px/1 'DM Serif Display',serif", whiteSpace: 'nowrap' }}>
                <i className={holdIcon} style={{ fontSize: 21 }} />
                {holdLabel}
              </span>
            </button>
            <button
              className={styles.cmtBtn}
              style={{ flex: '3 1 0', minWidth: 52, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
            >
              <i className="ph-bold ph-chat-circle" style={{ fontSize: 21 }} />
              <span style={{ font: '700 11px/1 Outfit,sans-serif' }}>{d.comments?.length ?? 0}</span>
            </button>
          </>
        )}

        {/* actCase */}
        {actCase && (
          <button
            className={styles.actBtn}
            style={{ flex: 1, width: '100%', height: 60, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
          >
            <i className="ph-bold ph-bank" style={{ fontSize: 20 }} />Track official case
          </button>
        )}

        {/* actVerify */}
        {actVerify && (
          <button
            className={styles.actBtn}
            style={{ flex: 1, width: '100%', height: 60, borderRadius: 999, background: 'var(--cp-leaf)', color: '#fff', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
          >
            <i className="ph-bold ph-seal-check" style={{ fontSize: 20 }} />Check the fix
          </button>
        )}

        {/* actDone */}
        {actDone && (
          <div style={{ flex: 1, height: 60, borderRadius: 17, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: "400 14px/1 'DM Serif Display',serif" }}>
            <i className="ph-bold ph-check-circle" />Fixed &amp; confirmed
          </div>
        )}

      </div>
    </div>
  );
}
