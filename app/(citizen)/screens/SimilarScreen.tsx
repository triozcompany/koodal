'use client';
import { useState } from 'react';
import type { Analysis, AnalysisMatch } from '@/lib/domain/analyze';
import type { Issue } from '@/lib/domain/types';

interface Props {
  an: Analysis;
  anon: boolean;
  issues: Issue[];
  mob: boolean;
  onJoin: (id: string) => void;
  onPostNew: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function SimilarScreen({ an, anon, issues, mob, onJoin, onPostNew, onBack, onClose }: Props) {
  const [joining, setJoining] = useState(false);

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

  const simPLabel = an.strong
    ? (joining ? `Joined · ${m.sup + 1} neighbours` : `Join ${m.sup} neighbours`)
    : 'Post as new issue';
  const simPIcon = an.strong ? 'ph-arrow-fat-up' : 'ph-paper-plane-tilt';
  const simSLabel = an.strong ? (mob ? 'Mine is different' : 'Different') : (mob ? 'Join this one instead' : 'Same issue');

  const doJoin = (id: string) => {
    if (joining) return;
    setJoining(true);
    setTimeout(() => onJoin(id), 1400);
  };

  const simPrimary = an.strong ? () => doJoin(m.id) : onPostNew;
  const simSecondary = an.strong ? onPostNew : () => doJoin(m.id);

  /* ── Mobile layout ── */
  if (mob) {
    return (
      <div style={{ position: 'absolute', inset: 0, padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 44 }}>
          <button
            onClick={onBack}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}
          >
            <i className="ph-bold ph-arrow-left"></i>
          </button>
        </div>

        <div style={{ font: '400 28px/1.02 "DM Serif Display",serif', letterSpacing: '-.03em' }}>{simTitle}</div>

        <div style={{ position: 'relative', height: 270, margin: '2px 0' }}>
          <div style={{ position: 'absolute', left: 18, top: 24, width: 170, height: 220, borderRadius: 18, border: '1px solid var(--cp-line)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 8px,var(--cp-ph-b) 8px 16px)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)', transform: mineT, opacity: mineO, transition: 'transform .7s cubic-bezier(.5,0,.2,1),opacity .5s .35s', zIndex: 2 }}>
            <span style={{ position: 'absolute', left: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 7, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '700 11.5px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{mineTag}</span>
          </div>
          <div style={{ position: 'absolute', right: 18, top: 12, width: 170, height: 220, borderRadius: 18, border: '1px solid var(--cp-line)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 8px,var(--cp-ph-b) 8px 16px)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)', transform: theirsT, transition: 'transform .5s cubic-bezier(.3,1.5,.5,1) .6s' }}>
            <span style={{ position: 'absolute', left: 10, top: 10, height: 24, padding: '0 9px', borderRadius: 7, background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', font: '700 11.5px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{m.by} · {m.h}h</span>
            {joining && <span style={{ position: 'absolute', right: 10, bottom: 10, height: 28, padding: '0 10px', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 12px/28px Outfit,sans-serif', animation: 'cp-pop .4s .9s cubic-bezier(.3,1.6,.5,1) both', whiteSpace: 'nowrap' }}>+1 photo</span>}
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 96, marginLeft: -40, width: 80, height: 80, borderRadius: '50%', background: badgeBg, color: 'var(--cp-on-marigold)', border: '3px solid var(--cp-edge)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, animation: 'cp-pop .5s .2s cubic-bezier(.3,1.6,.5,1) both', opacity: badgeO, transition: 'opacity .3s' }}>
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

        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 30, display: 'flex', flexDirection: 'row-reverse', gap: 10 }}>
          <button onClick={simPrimary} disabled={joining} style={{ flex: 7, minWidth: 0, whiteSpace: 'nowrap', height: 56, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: joining ? 'default' : 'pointer' }}>
            <i className={`ph-bold ${simPIcon}`} style={{ fontSize: 21 }}></i>{simPLabel}
          </button>
          <button onClick={simSecondary} disabled={joining} style={{ flex: 3, minWidth: 0, height: 56, border: '1px solid var(--cp-line)', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: joining ? 'default' : 'pointer' }}>
            {simSLabel}
          </button>
        </div>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cp-surface)', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <button onClick={onClose} title="Close" style={{ position: 'absolute', right: 18, top: 18, zIndex: 5, width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 16 }}>
        <i className="ph-bold ph-x"></i>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '32px 36px 20px', flex: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
          <i className="ph-bold ph-intersect" style={{ color: 'var(--cp-peacock)', fontSize: 13 }}></i>Similar issue found
        </span>
        <span style={{ font: '400 32px/1.1 "DM Serif Display",serif', letterSpacing: '-.02em', maxWidth: 640 }}>{simTitle}</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 36px 20px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 96px minmax(0,1fr)', gap: 0, alignItems: 'center' }}>
        {/* Mine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 18, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#1b1d22 0 12px,#16181c 12px 24px)' }}>
            <span style={{ position: 'absolute', left: 12, top: 12, height: 28, padding: '0 11px', borderRadius: 999, background: 'rgb(0 0 0 / .55)', color: '#fff', font: '600 11.5px/28px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{mineTag}</span>
          </div>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>Your report · just now</span>
        </div>

        {/* Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--cp-ink)', color: 'var(--cp-bg)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 8px var(--cp-surface),0 0 0 9px var(--cp-line)', animation: 'cp-pop .45s cubic-bezier(.3,1.6,.5,1) both' }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ font: '700 20px/1 Outfit,sans-serif' }}>{m.score}%</span>
              <span style={{ font: '500 10px/1 Outfit,sans-serif', opacity: 0.7 }}>match</span>
            </span>
          </div>
        </div>

        {/* Theirs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 18, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 12px,var(--cp-ph-b) 12px 24px)', border: '1px solid var(--cp-line)' }}>
            <span style={{ position: 'absolute', left: 12, top: 12, height: 28, padding: '0 11px', borderRadius: 999, background: 'var(--cp-surface)', font: '600 11.5px/28px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{m.by} · {m.h}h ago</span>
            {joining && <span style={{ position: 'absolute', right: 12, bottom: 12, height: 28, padding: '0 11px', borderRadius: 999, background: 'var(--cp-leaf)', color: '#fff', font: '700 11.5px/28px Outfit,sans-serif', animation: 'cp-pop .35s cubic-bezier(.3,1.6,.5,1) both' }}>+ your photos</span>}
          </div>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>Existing issue</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 36px', borderTop: '1px solid var(--cp-line)', flex: 'none' }}>
        <span style={{ font: '600 18px/1.3 Outfit,sans-serif' }}>{m.title}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--cp-surface-2)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
            <i className="ph-bold ph-map-pin"></i>{m.dist} m apart
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--cp-surface-2)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
            <i className="ph-bold ph-users"></i>{m.sup} citizens support
          </span>
          {simOthers > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--cp-peacock-soft)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
              <i className="ph-bold ph-intersect"></i>{simOthers} reports merged
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '18px 36px 26px', borderTop: '1px solid var(--cp-line)', flex: 'none' }}>
        <button onClick={simSecondary} style={{ flex: '3 1 0', minWidth: 0, height: 52, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}>{simSLabel}</button>
        <button onClick={simPrimary} disabled={joining} style={{ flex: '7 1 0', minWidth: 0, height: 52, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15px/1 Outfit,sans-serif', cursor: joining ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', padding: '0 18px', overflow: 'hidden' }}>
          <i className={`ph-bold ${simPIcon}`} style={{ flexShrink: 0 }}></i>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{simPLabel}</span>
        </button>
      </div>
    </div>
  );
}
