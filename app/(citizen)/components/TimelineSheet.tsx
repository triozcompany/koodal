'use client';
import type { Issue } from '@/lib/domain/types';
import { ago } from '@/lib/domain/rules';

const EVT_COLS: Record<string, [string, string]> = {
  submit:    ['var(--cp-ink)',          'var(--cp-bg)'],
  citizen:   ['var(--cp-ink)',          'var(--cp-bg)'],
  support:   ['var(--cp-pulse-soft)',   'var(--cp-pulse-deep)'],
  community: ['var(--cp-marigold)',     'var(--cp-on-marigold)'],
  review:    ['var(--cp-peacock-soft)', 'var(--cp-ink)'],
  case:      ['var(--cp-peacock)',      '#fff'],
  progress:  ['var(--cp-pulse)',        '#fff'],
  evidence:  ['var(--cp-surface-2)',    'var(--cp-ink)'],
  fix:       ['var(--cp-leaf-soft)',    'var(--cp-ink)'],
  closed:    ['var(--cp-leaf)',         '#fff'],
  reject:    ['var(--cp-surface-2)',    'var(--cp-ink-3)'],
  comment:   ['var(--cp-surface-2)',    'var(--cp-ink)'],
};

interface Props {
  issue: Issue;
  mob: boolean;
  onVerify?: () => void;
  onClose: () => void;
}

export function TimelineSheet({ issue: d, mob, onVerify, onClose }: Props) {
  const events = d.events ?? [];
  const actVerify = d.stage === 'resolved';

  const eventList = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 12px', display: 'flex', flexDirection: 'column' }}>
      {events.length === 0 && (
        <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', paddingTop: 16, textAlign: 'center', display: 'block' }}>
          No updates yet.
        </span>
      )}
      {events.map((e, k) => {
        const isLast = k === events.length - 1;
        const live   = isLast && !['closed', 'rejected'].includes(d.stage);
        const [bg, fg] = EVT_COLS[e.kind] ?? EVT_COLS.submit;
        return (
          <div key={k} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, paddingBottom: 14, animation: `cp-row .3s ${k * 0.04}s both` }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {!isLast && <div style={{ position: 'absolute', top: 26, bottom: -14, width: 2, background: 'var(--cp-line)' }} />}
              <div style={{ position: 'relative', width: 26, height: 26, borderRadius: 9, background: bg, display: 'grid', placeItems: 'center', zIndex: 1 }}>
                {live && <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: bg, animation: 'cp-ping 1.6s ease-out infinite', zIndex: -1 }} />}
                <i className={`ph-bold ${e.icon}`} style={{ fontSize: 13, color: fg }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{ago(e.ts)}</span>
              <span style={{ font: '600 13px/1.25 Outfit,sans-serif' }}>{e.title}</span>
              {e.sub && <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{e.sub}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const header = (showHandle: boolean) => (
    <>
      {showHandle && <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '10px auto 0', flexShrink: 0 }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 4px', flexShrink: 0 }}>
        <span style={{ flex: 1, font: "400 21px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Timeline</span>
        <span style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{events.length} updates</span>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
          <i className="ph-bold ph-x" />
        </button>
      </div>
      <div style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', padding: '0 20px 8px', flexShrink: 0, borderBottom: '1px solid var(--cp-line)' }}>{d.title}</div>
    </>
  );

  const verifyBtn = actVerify && onVerify ? (
    <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
      <button data-glare="1"
        onClick={() => { onClose(); onVerify(); }}
        style={{ width: '100%', height: 54, borderRadius: 999, border: 'none', background: 'var(--cp-leaf)', color: '#fff', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <i className="ph-bold ph-seal-check" style={{ fontSize: 18 }} />Check the fix
      </button>
    </div>
  ) : null;

  if (!mob) {
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
        <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 420, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden' }}>
          {header(false)}
          {eventList}
          {verifyBtn}
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, minHeight: '70%', maxHeight: '82%', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        {header(true)}
        {eventList}
        {verifyBtn}
      </div>
    </>
  );
}
