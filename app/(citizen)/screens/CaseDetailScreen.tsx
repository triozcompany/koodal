'use client';
import { useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { ago, corp, slaLeft, slaRisk } from '@/lib/domain/rules';

const PILL_STAGE: Record<string, string> = {
  verified: 'Verified', assigned: 'Assigned', progress: 'In progress',
  resolved: 'Fixed', closed: 'Confirmed', rejected: 'Rejected',
};

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

const SLA_COLOR: Record<0 | 1 | 2, string> = {
  0: 'var(--cp-ink)', 1: 'var(--cp-marigold)', 2: 'var(--cp-pulse)',
};

interface Props {
  issue: Issue;
  mob: boolean;
  onBack: () => void;
}

/** Case-info drawer — the ticket-style metadata/timeline view, reachable by
 * clicking the "OFFICIAL CASE" banner on DetailScreen (from either /issues/[id]
 * or /cases/[caseId], which both render DetailScreen as their main content). */
export function CaseDetailScreen({ issue: d, mob, onBack }: Props) {
  const [whatsapp, setWhatsapp] = useState(false);

  const events    = d.events ?? [];
  const lastEvent = events[events.length - 1] ?? null;
  const sla       = slaLeft(d);
  const stageLbl  = PILL_STAGE[d.stage] ?? 'Active';
  const corpName  = corp(d).toUpperCase();
  const [nowBg, nowFg] = lastEvent ? (EVT_COLS[lastEvent.kind] ?? EVT_COLS.submit) : EVT_COLS.submit;

  const content = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>
      {/* Case banner (ticket-style) */}
      <div style={{ border: '1px solid var(--cp-line)', borderRadius: 22, boxShadow: '0 1px 2px rgb(0 0 0 / .05)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ position: 'relative', background: 'var(--cp-peacock)', color: '#fff', padding: '18px 18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.1em', opacity: 0.9, textTransform: 'uppercase' }}>
            <i className="ph-fill ph-bank" style={{ fontSize: 15 }} />{corpName}
            <div style={{ flex: 1 }} />
            <span style={{ height: 22, padding: '0 8px', borderRadius: 999, background: 'rgba(255,255,255,.18)', font: '700 10.5px/22px Outfit,sans-serif', textTransform: 'none', letterSpacing: 0 }}>{stageLbl}</span>
          </div>
          <div style={{ font: '600 22px/1 Outfit,sans-serif', letterSpacing: '-.01em' }}>{d.caseId}</div>
          <div style={{ font: '600 15px/1.25 Outfit,sans-serif', maxWidth: 320 }}>{d.title}</div>
        </div>

        {/* Dashed ticket-stub divider */}
        <div style={{ position: 'relative', height: 0, borderTop: '2px dashed var(--cp-line)' }}>
          <span style={{ position: 'absolute', left: -13, top: -12, width: 22, height: 22, borderRadius: '50%', background: 'var(--cp-bg)', border: '1px solid var(--cp-line)' }} />
          <span style={{ position: 'absolute', right: -13, top: -12, width: 22, height: 22, borderRadius: '50%', background: 'var(--cp-bg)', border: '1px solid var(--cp-line)' }} />
        </div>

        {/* Metadata grid */}
        <div style={{ background: 'var(--cp-surface)', padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.06em' }}>DEPARTMENT</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{d.dept}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.06em' }}>OFFICER</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{d.assignee ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.06em' }}>AREA</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{d.area}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.06em' }}>PRIORITY</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--cp-pulse)' }} />{d.prio ?? '—'}
            </span>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 4 }}>
            <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.06em' }}>SLA</span>
            <span style={{ font: "400 19px/1 'DM Serif Display',serif", letterSpacing: '-.02em', color: SLA_COLOR[slaRisk(d)] }}>{sla || 'On track'}</span>
          </div>
        </div>
      </div>

      {/* Last event */}
      {lastEvent && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, background: nowBg, marginBottom: 12 }}>
          <div style={{ position: 'relative', width: 42, height: 42, borderRadius: 13, background: nowFg === '#fff' ? nowBg : 'var(--cp-ink)', color: nowFg, display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
            <i className={`ph-bold ${lastEvent.icon}`} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <span style={{ font: '700 14px/1.2 Outfit,sans-serif' }}>{lastEvent.title}</span>
            <span style={{ font: '500 12.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{ago(lastEvent.ts)}</span>
          </div>
        </div>
      )}

      {/* WhatsApp toggle */}
      <button
        onClick={() => setWhatsapp(w => !w)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', borderRadius: 16, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', cursor: 'pointer', color: 'var(--cp-ink)', marginBottom: 14, boxSizing: 'border-box' }}
      >
        <i className="ph-bold ph-whatsapp-logo" style={{ fontSize: 22, color: 'var(--cp-leaf)' }} />
        <span style={{ flex: 1, textAlign: 'left', font: '600 13px/1 Outfit,sans-serif' }}>Updates on WhatsApp</span>
        <span style={{ position: 'relative', width: 50, height: 30, borderRadius: 15, background: whatsapp ? 'var(--cp-leaf)' : 'var(--cp-surface-2)', border: '1px solid var(--cp-line)', transition: 'background .2s', boxSizing: 'border-box' }}>
          <span style={{ position: 'absolute', top: 2, left: whatsapp ? 22 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '1px solid var(--cp-line)', boxSizing: 'border-box', transition: 'left .3s cubic-bezier(.3,1.6,.5,1)' }} />
        </span>
      </button>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 4px', borderRadius: 18, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ font: "400 16px/1 'DM Serif Display',serif" }}>Timeline</span>
          <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{events.length} updates</span>
        </div>
        {events.map((e, k) => {
          const isLast = k === events.length - 1;
          const live   = isLast && !['closed', 'rejected'].includes(d.stage);
          const [bg, fg] = EVT_COLS[e.kind] ?? EVT_COLS.submit;
          return (
            <div key={k} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, paddingBottom: 14 }}>
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
                {e.photo && (
                  <img src={e.photo} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', marginTop: 2 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
      <button onClick={onBack} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
        <i className="ph-bold ph-x" />
      </button>
      <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.id}</span>
    </div>
  );

  if (mob) {
    return (
      <>
        <div onClick={onBack} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, maxHeight: 'calc(92% - 10px)', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--cp-line)', margin: '12px auto 0', flexShrink: 0 }} />
          {header}
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onBack} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
      <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 440, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        {header}
        {content}
      </div>
    </>
  );
}
