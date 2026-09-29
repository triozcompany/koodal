'use client';
import { useState, useRef } from 'react';
import type { Issue } from '@/lib/domain/types';
import { ago, corp } from '@/lib/domain/rules';
import { AVB } from '@/lib/domain/stage-style';

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

const ANGLES = ['135deg', '45deg', '90deg'];
const WRONG_OPTIONS = [
  { icon: 'ph-circle-half',  label: 'Half done' },
  { icon: 'ph-warning',      label: 'Poor quality' },
  { icon: 'ph-prohibit',     label: 'Not touched' },
];

interface Props {
  issue: Issue;
  mob: boolean;
  onBack: () => void;
  onValidate?: (yes: boolean) => Promise<void>;
}

/** Verify-fix drawer — the before/after compare UI, reachable from
 * DetailScreen's "Check the fix" action or the Cases list's "Confirm fix"
 * button. Renders as a right-side panel on desktop, a bottom sheet on mobile —
 * same chrome convention as CaseDetailScreen/FilterPanel. */
export function VerifyScreen({ issue: d, mob, onBack, onValidate }: Props) {
  const [sliderX, setSliderX]         = useState(50);
  const [beforeIdx, setBeforeIdx]     = useState(0);
  const [afterIdx, setAfterIdx]       = useState(0);
  const [notYetOpen, setNotYetOpen]   = useState(false);
  const [wrongReason, setWrongReason] = useState<string | null>(null);
  const [done, setDone]               = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const dragging  = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const photos    = d.evidence ?? [];
  const confirmed = d.valYes ?? 0;
  const needed    = d.needed ?? 25;
  const abg       = AVB[nameHash(d.by) % AVB.length];
  const ai        = d.anon ? '' : initials(d.by);
  const officerAI = initials(d.assignee ?? 'JE Officer');
  const afterCount = (d.fixProof?.length ?? 0) || 1;

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderX(x);
  }

  async function handleFixed() {
    setSubmitting(true);
    await onValidate?.(true);
    setSubmitting(false);
    setDone(true);
  }

  async function handleFeedback() {
    if (!wrongReason) return;
    setSubmitting(true);
    await onValidate?.(false);
    setSubmitting(false);
    setFeedbackSent(true);
    setNotYetOpen(false);
    setTimeout(() => setFeedbackSent(false), 3000);
  }

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
      <button onClick={onBack} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
        <i className="ph-bold ph-x" />
      </button>
      <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.caseId || d.id}</span>
    </div>
  );

  const doneContent = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 20px', animation: 'cp-in .35s both' }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--cp-leaf)', display: 'grid', placeItems: 'center' }}>
        <i className="ph-bold ph-seal-check" style={{ fontSize: 36, color: '#fff' }} />
      </div>
      <span style={{ font: "400 24px/1.05 'DM Serif Display',serif" }}>Thanks for confirming!</span>
      <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center', maxWidth: 280 }}>
        Your confirmation helps close cases and hold {corp(d)} accountable.
      </span>
      <button
        onClick={onBack}
        style={{ marginTop: 8, height: 52, padding: '0 28px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: 'none', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}
      >
        Back to report
      </button>
    </div>
  );

  const mainContent = (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>
        <div style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.025em', marginBottom: 4 }}>Is it fixed?</div>
        <div style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', marginBottom: 20 }}>{d.title}</div>

        {/* Drag-to-compare slider */}
        <div
          ref={containerRef}
          style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden', cursor: 'col-resize', touchAction: 'none', marginBottom: 10, userSelect: 'none' }}
          onPointerDown={e => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={onPointerMove}
          onPointerUp={() => { dragging.current = false; }}
          onPointerLeave={() => { dragging.current = false; }}
        >
          {/* BEFORE layer */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(${ANGLES[beforeIdx % 3]},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)`, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 10, left: 10, height: 22, padding: '0 9px', borderRadius: 11, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '700 10.5px/22px Outfit,sans-serif' }}>BEFORE</div>
            <span style={{ position: 'absolute', left: 10, bottom: 10, font: '600 11px/1 Outfit,sans-serif', color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 8px', borderRadius: 6 }}>
              before · {beforeIdx + 1}/{Math.max(photos.length, 1)}
            </span>
          </div>

          {/* AFTER layer — clipped from right */}
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - sliderX}% 0 0)`, background: `repeating-linear-gradient(${ANGLES[(afterIdx + 1) % 3]},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)`, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, height: 22, padding: '0 9px', borderRadius: 11, background: 'var(--cp-leaf)', color: '#fff', font: '700 10.5px/22px Outfit,sans-serif' }}>AFTER · PROOF</div>
            <span style={{ position: 'absolute', right: 10, bottom: 10, font: '600 11px/1 Outfit,sans-serif', color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 8px', borderRadius: 6 }}>
              proof · {afterIdx + 1}/{afterCount}
            </span>
          </div>

          {/* Divider line + handle */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderX}%`, width: 2, background: '#fff', transform: 'translateX(-50%)', pointerEvents: 'none', boxShadow: '0 0 8px rgba(0,0,0,.35)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,.3)', display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-arrows-left-right" style={{ fontSize: 16, color: 'var(--cp-ink)' }} />
            </div>
          </div>
        </div>

        {/* Photo nav arrows */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
              before · {beforeIdx + 1}/{Math.max(photos.length, 1)}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <NavBtn disabled={beforeIdx <= 0} onClick={() => setBeforeIdx(i => i - 1)} icon="ph-arrow-left" />
              <NavBtn disabled={beforeIdx >= Math.max(photos.length - 1, 0)} onClick={() => setBeforeIdx(i => i + 1)} icon="ph-arrow-right" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
              proof · {afterIdx + 1}/{afterCount}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <NavBtn disabled={afterIdx <= 0} onClick={() => setAfterIdx(i => i - 1)} icon="ph-arrow-left" />
              <NavBtn disabled={afterIdx >= afterCount - 1} onClick={() => setAfterIdx(i => i + 1)} icon="ph-arrow-right" />
            </div>
          </div>
        </div>

        {/* Reporter / Officer cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 14, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
            <span style={{ font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>BEFORE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: abg, display: 'grid', placeItems: 'center', font: '700 10px/1 Outfit,sans-serif', color: 'var(--cp-ink)', flexShrink: 0 }}>
                {d.anon ? <i className="ph-bold ph-detective" style={{ fontSize: 14 }} /> : ai}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '600 12px/1.1 Outfit,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.anon ? 'Anonymous' : d.by}</div>
                <div style={{ font: '500 11px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{ago(d.created)}</div>
              </div>
            </div>
            <span style={{ font: '500 11px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{Math.max(photos.length, 1)} citizen photos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 14, background: 'var(--cp-leaf-soft,#ecfdf5)', border: '1px solid var(--cp-leaf,#2DA84E)' }}>
            <span style={{ font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--cp-leaf,#2DA84E)' }}>AFTER · PROOF</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--cp-leaf,#2DA84E)', display: 'grid', placeItems: 'center', font: '700 10px/1 Outfit,sans-serif', color: '#fff', flexShrink: 0 }}>
                {officerAI.slice(0, 2)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '600 12px/1.1 Outfit,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.assignee ?? 'JE Priya Natarajan'}</div>
                <div style={{ font: '500 11px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>geo-tagged same spot</div>
              </div>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
          <i className="ph-bold ph-map-pin" style={{ color: 'var(--cp-pulse)', fontSize: 14 }} />
          <span>Shot 6m from report</span>
          <span style={{ margin: '0 2px' }}>·</span>
          <span>{d.assignee ?? 'JE Priya Natarajan'}</span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: needed }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < confirmed ? 'var(--cp-leaf)' : 'var(--cp-surface-2)', transition: 'background .3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
            <span>{confirmed} of {needed} neighbours</span>
            <span>closes at {needed}</span>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 20px 20px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
        <button
          onClick={() => setNotYetOpen(true)}
          style={{ flex: 3, height: 56, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <i className="ph-bold ph-thumbs-down" />Not yet
        </button>
        <button
          onClick={handleFixed}
          disabled={submitting}
          style={{ flex: 7, height: 56, borderRadius: 999, border: 'none', background: 'var(--cp-leaf)', color: '#fff', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}
        >
          <i className="ph-bold ph-seal-check" style={{ fontSize: 18 }} />{submitting ? 'Saving…' : 'Fixed'}
        </button>
      </div>

      {/* "What's still wrong?" sheet */}
      {notYetOpen && (
        <>
          <div onClick={() => setNotYetOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
          <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', padding: '16px 16px 24px', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ flex: 1, font: "400 20px/1 'DM Serif Display',serif" }}>What&apos;s still wrong?</span>
              <button onClick={() => setNotYetOpen(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-x" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {WRONG_OPTIONS.map(w => (
                <button
                  key={w.label}
                  onClick={() => setWrongReason(w.label)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: 72, borderRadius: 16, border: '1px solid var(--cp-line)', background: wrongReason === w.label ? 'var(--cp-ink)' : 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: wrongReason === w.label ? 'var(--cp-bg)' : 'var(--cp-ink)', cursor: 'pointer', transition: 'background .15s,color .15s' }}
                >
                  <i className={`ph-bold ${w.icon}`} style={{ fontSize: 22 }} />
                  <span style={{ font: '600 11.5px/1 Outfit,sans-serif' }}>{w.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleFeedback}
              disabled={!wrongReason || submitting}
              style={{ width: '100%', height: 54, borderRadius: 999, border: 'none', background: wrongReason ? 'var(--cp-ink)' : 'var(--cp-surface-2)', color: wrongReason ? 'var(--cp-bg)' : 'var(--cp-ink-3)', font: '600 14.5px/1 Outfit,sans-serif', cursor: wrongReason ? 'pointer' : 'default', transition: 'background .2s,color .2s', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Saving…' : 'Tell the department'}
            </button>
          </div>
        </>
      )}

      {feedbackSent && (
        <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', height: 44, padding: '0 20px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/44px Outfit,sans-serif', whiteSpace: 'nowrap', boxShadow: '0 8px 24px -8px rgb(0 0 0 / .4)', animation: 'cp-toast .4s cubic-bezier(.2,.9,.3,1.3) both', zIndex: 100 }}>
          Feedback sent to {corp(d)}
        </div>
      )}
    </>
  );

  const body = done ? doneContent : mainContent;

  if (mob) {
    return (
      <>
        <div onClick={onBack} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, maxHeight: 'calc(92% - 10px)', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--cp-line)', margin: '12px auto 0', flexShrink: 0 }} />
          {header}
          {body}
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onBack} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
      <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 'min(600px, calc(100vw - 32px))', zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        {header}
        {body}
      </div>
    </>
  );
}

function NavBtn({ disabled, onClick, icon }: { disabled: boolean; onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: disabled ? 'var(--cp-ink-3)' : 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: disabled ? 'default' : 'pointer', fontSize: 15, opacity: disabled ? 0.35 : 1 }}
    >
      <i className={`ph-bold ${icon}`} />
    </button>
  );
}
