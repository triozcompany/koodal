'use client';
import { useEffect, useState } from 'react';
import type { Analysis, AnalysisMatch } from '@/lib/domain/analyze';
import type { Issue } from '@/lib/domain/types';
import { GoalGradientBar } from '../components/GoalGradientBar';
import { Tooltip } from '../components/Tooltip';

interface Props {
  an: Analysis;
  anon: boolean;
  issues: Issue[];
  mob: boolean;
  photoCount?: number;
  onJoin: (id: string) => void;
  onPostNew: () => void;
  onBack: () => void;
  onClose: () => void;
  submitPhase?: 'idle' | 'uploading' | 'saving';
  submitError?: string | null;
}

export function SimilarScreen({ an, anon, issues, mob, photoCount = 1, onJoin, onPostNew, onBack, onClose, submitPhase = 'idle', submitError }: Props) {
  // `flipping` is purely the card-swap animation's own timing; `submitting`
  // is the real upload+save work AppShell's doJoin/doPostNew is doing — the
  // buttons stay busy/disabled through both, back to back.
  const [flipping, setFlipping] = useState(false);
  const submitting = submitPhase !== 'idle';
  const joining = flipping || submitting;

  const m: AnalysisMatch | undefined = an.matches[0];
  if (!m) return null;

  const mIssue = issues.find(i => i.id === m.id);
  const simOthers = mIssue?.merged?.length ?? 0;

  const simTitle = an.strong ? 'Already on the map.' : 'Same issue?';
  const mineTag = anon ? 'Anonymous · now' : 'You · now';
  const badgeBg = an.strong ? 'var(--cp-marigold)' : 'var(--cp-surface-2)';
  const mineT = joining ? 'translate(150px,-8px) rotate(4deg) scale(.5)' : 'rotate(-6deg)';
  const mineO = joining ? 0 : 1;
  const theirsT = joining ? 'rotate(0deg) scale(1.05)' : 'rotate(5deg)';
  const badgeO = joining ? 0 : 1;

  const simPLabel = submitting
    ? (submitPhase === 'uploading' ? 'Uploading photos…' : 'Saving…')
    : an.strong
    ? (flipping ? `Joined · ${m.sup + 1} neighbours` : `Join ${m.sup} neighbours`)
    : 'Post as new issue';
  const simPIcon = an.strong ? 'ph-arrow-fat-up' : 'ph-paper-plane-tilt';
  const simSLabel = an.strong ? (mob ? 'Mine is different' : 'Different') : (mob ? 'Join this one instead' : 'Same issue');

  // If the real submit fails, AppShell resets submitPhase to 'idle' but this
  // component's own flip already played — reset it too so the buttons (and
  // the swapped-card visual) go back to a retryable state instead of looking
  // permanently "joined."
  useEffect(() => {
    if (submitPhase === 'idle' && submitError) setFlipping(false);
  }, [submitPhase, submitError]);

  const doJoin = (id: string) => {
    if (joining) return;
    setFlipping(true);
    setTimeout(() => onJoin(id), 1400);
  };

  const simPrimary = an.strong ? () => doJoin(m.id) : onPostNew;
  const simSecondary = an.strong ? onPostNew : () => doJoin(m.id);

  /* ── Single layout for mobile and desktop ── */
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both', background: 'var(--cp-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44 }}>
        <Tooltip label={mob ? 'Back' : 'Close'}>
          <button
            aria-label={mob ? 'Back' : 'Close'}
            onClick={mob ? onBack : onClose}
            disabled={submitting}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.5 : 1, fontSize: 19 }}
          >
            <i className={mob ? 'ph-bold ph-arrow-left' : 'ph-bold ph-x'}></i>
          </button>
        </Tooltip>
      </div>

      <GoalGradientBar
        segments={[1, 1, 1, joining ? 1 : 0.6]}
        color="var(--cp-leaf)"
        hintIcon={joining ? 'ph-arrow-fat-up' : 'ph-intersect'}
        hintText={joining ? 'Joining this report…' : 'Match found · confirm or post new'}
        pct={Math.round(((3 + (joining ? 1 : 0.6)) / 4) * 100)}
      />

      <div style={{ font: '400 28px/1.02 "DM Serif Display",serif', letterSpacing: '-.03em' }}>{simTitle}</div>

      <div style={{ position: 'relative', height: 270, margin: '2px 0', flexShrink: 0 }}>
        <div style={{ position: 'absolute', left: 18, top: 24, width: 170, height: 220, borderRadius: 18, border: '1px solid var(--cp-line)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 8px,var(--cp-ph-b) 8px 16px)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)', transform: mineT, opacity: mineO, transition: 'transform .7s cubic-bezier(.5,0,.2,1),opacity .5s .35s', zIndex: 2 }}>
          <span style={{ position: 'absolute', left: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 7, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '700 11.5px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{mineTag}</span>
        </div>
        <div style={{ position: 'absolute', right: 18, top: 12, width: 170, height: 220, borderRadius: 18, border: '1px solid var(--cp-line)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 8px,var(--cp-ph-b) 8px 16px)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)', transform: theirsT, transition: 'transform .5s cubic-bezier(.3,1.5,.5,1) .6s' }}>
          <span style={{ position: 'absolute', left: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 7, background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', font: '700 11.5px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{m.by} · {m.h}h</span>
          {joining && <span style={{ position: 'absolute', right: 10, bottom: 10, height: 28, padding: '0 10px', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 12px/28px Outfit,sans-serif', animation: 'cp-pop .4s .9s cubic-bezier(.3,1.6,.5,1) both', whiteSpace: 'nowrap' }}>+{photoCount} photo{photoCount === 1 ? '' : 's'}</span>}
        </div>
        <div style={{ position: 'absolute', left: '50%', top: 96, marginLeft: -40, width: 80, height: 80, borderRadius: '50%', background: badgeBg, color: 'var(--cp-on-marigold)', border: '3px solid var(--cp-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, animation: 'cp-pop .5s .2s cubic-bezier(.3,1.6,.5,1) both', opacity: badgeO, transition: 'opacity .3s' }}>
          <span style={{ font: '400 23px/1 "DM Serif Display",serif', letterSpacing: '-.03em' }}>{m.score}%</span>
          <span style={{ font: '600 10px/1 Outfit,sans-serif' }}>match</span>
        </div>
      </div>

      <div style={{ font: '600 14px/1.25 Outfit,sans-serif' }}>{m.title}</div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 10px', borderRadius: 9, background: 'var(--cp-surface-2)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <i className="ph-bold ph-map-pin"></i>{m.dist} m apart
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 10px', borderRadius: 9, background: 'var(--cp-surface-2)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <i className="ph-bold ph-users"></i>{m.sup} supporters
        </span>
        {simOthers > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 10px', borderRadius: 9, background: 'var(--cp-peacock-soft)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
            <i className="ph-bold ph-intersect"></i>{simOthers} similar reports merged
          </span>
        )}
      </div>

      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {submitError && (
          <span style={{ font: '600 12px/1.4 Outfit,sans-serif', color: 'var(--cp-pulse)', textAlign: 'center' }}>{submitError}</span>
        )}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10 }}>
          <button data-glare="1" onClick={simPrimary} disabled={joining} style={{ flex: 7, minWidth: 0, whiteSpace: 'nowrap', height: 56, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 15px/1 Outfit,sans-serif', letterSpacing: '.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: joining ? 'default' : 'pointer', opacity: joining ? 0.85 : 1 }}>
            {submitting
              ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'cp-spin .7s linear infinite', flexShrink: 0 }} />
              : <i className={`ph-bold ${simPIcon}`} style={{ fontSize: 19 }}></i>}
            {simPLabel}
          </button>
          <button onClick={simSecondary} disabled={joining} style={{ flex: 3, minWidth: 0, height: 56, border: '1px solid var(--cp-line)', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: joining ? 'default' : 'pointer', opacity: joining ? 0.6 : 1 }}>
            {simSLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
