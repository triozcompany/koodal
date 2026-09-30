'use client';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { ago } from '@/lib/domain/rules';
import { getConfig } from '@/lib/console/config';
import { DemoTag } from './DemoTag';

interface Props { issues: Issue[]; mob: boolean; onTakeUp: (i: Issue) => void; showDemoTag: (i: Issue) => boolean }

// New signals are reports that have not reached the community threshold. Individual reporters are
// never shown to officials, so a row carries the problem, place and support progress only.
export function SignalsList({ issues, mob, onTakeUp, showDemoTag }: Props) {
  // Support needed before the citizen app opens an official case (see applySupport).
  const { caseSupporters: NEED_SUP, caseConfidence: NEED_CONF } = getConfig();
  if (issues.length === 0) {
    return <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif', borderRadius: 20, border: '1.5px dashed var(--cp-line)' }}>No new signals right now.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
      {issues.map((i) => {
        const pct = Math.min(1, Math.max(i.sup / NEED_SUP, i.conf / NEED_CONF));
        const photo = i.evidence.find((e) => e.url)?.url;
        return (
          <div key={i.id} style={{ display: 'grid', gridTemplateColumns: mob ? '48px minmax(0,1fr)' : '48px minmax(0,1fr) 220px auto', gap: 14, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--cp-line)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: photo ? `center/cover url(${photo})` : 'var(--cp-ink)', display: 'grid', placeItems: 'center', overflow: 'hidden', position: 'relative' }}>
              {!photo && <i className={`ph-bold ${CATS[i.cat].icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
              <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.area} · {CATS[i.cat].l} · {ago(i.created)} ago{showDemoTag(i) && <DemoTag />}</span>
              <span style={{ font: '600 14px/1.25 Outfit,sans-serif', textWrap: 'pretty' }}>{i.title}</span>
              {mob && <Progress i={i} pct={pct} />}
            </div>
            {!mob && <Progress i={i} pct={pct} />}
            <button onClick={() => onTakeUp(i)} style={{ gridColumn: mob ? '1 / -1' : 'auto', height: 40, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}><i className="ph-bold ph-lightning" />Take up as case</button>
          </div>
        );
      })}
    </div>
  );
}

function Progress({ i, pct }: { i: Issue; pct: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', whiteSpace: 'nowrap' }}>
        <i className="ph-bold ph-users-three" />{i.sup} of {getConfig().caseSupporters} supporters<span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {i.conf}%</span>
        {i.evidence.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--cp-ink-3)', fontWeight: 500 }}><i className="ph-bold ph-images" />{i.evidence.length}</span>}
      </span>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--cp-surface-2)', overflow: 'hidden' }}><div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, background: 'var(--cp-marigold)' }} /></div>
    </div>
  );
}
