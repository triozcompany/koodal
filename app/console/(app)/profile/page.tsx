'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { currentOrg } from '@/lib/console/org';
import { useDesk, useMob } from '@/lib/console/useMob';
import { crossedAt, decisionSlaH, dur, govStage, isCase } from '@/lib/console/derive';
import { useConsole } from '../../_components/ConsoleProvider';

const CARD = { display: 'flex', flexDirection: 'column', borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' } as const;
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

export default function Profile() {
  const router = useRouter();
  const mob = useMob();
  const desk = useDesk();
  const { staff, issues, allIssues } = useConsole();

  const stats = useMemo(() => {
    const cases = issues.filter(isCase);
    // Decisions are counted from events stamped with this staff member's ID, so the numbers are personal.
    const mine = allIssues.flatMap((i) => i.events.filter((e) => e.byId === staff?.id && /^(Verified by|Not accepted)/.test(e.title)).map((e) => e.ts - crossedAt(i)));
    const avg = mine.length ? mine.reduce((a, b) => a + b, 0) / mine.length : 0;
    const areas: Record<string, number> = {};
    cases.forEach((i) => { areas[i.area] = (areas[i.area] || 0) + 1; });
    return {
      list: [
        { v: String(mine.length), l: 'Decisions made', s: mine.length ? 'Approvals and rejections by you' : 'Counts start with your next decision' },
        { v: avg ? dur(avg) : '—', l: 'Avg. time to decide', s: `Target ${decisionSlaH()}h` },
        { v: String(cases.filter((i) => govStage(i) === 'pending').length), l: 'Waiting on you', s: 'Pending approval' },
        { v: String(cases.filter((i) => i.stage === 'closed').length), l: 'Closed by citizens', s: 'In your jurisdiction' },
      ],
      areas: Object.entries(areas).sort((a, b) => b[1] - a[1]),
    };
  }, [issues, allIssues, staff?.id]);

  if (!staff) return null;
  const scoped = staff.depts.length > 0;
  const info: [string, string][] = [
    ['Role', staff.role === 'admin' ? 'Admin' : 'Staff'], ['Designation', staff.title], ['Departments', scoped ? staff.depts.join(', ') : 'All departments'],
    ['Organization', currentOrg.short], ['Employee ID', staff.id], ['Reports to', staff.reportsTo ?? '—'], ['Office phone', staff.phone ?? '—'],
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: mob ? '18px 16px 28px' : `26px ${desk ? 36 : 24}px 64px`, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Profile</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push('/console/settings')} style={{ height: 44, padding: '0 16px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}><i className="ph-bold ph-gear-six" />Settings</button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', padding: 22, borderRadius: 24, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
        <span style={{ width: 88, height: 88, flex: 'none', borderRadius: '50%', background: 'var(--cp-marigold)', color: '#0f0f0f', font: "400 34px/88px 'DM Serif Display',serif", textAlign: 'center' }}>{initials(staff.name)}</span>
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '700 22px/1.15 Outfit,sans-serif' }}>{staff.name}<i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 20 }} /></span>
          <span style={{ font: '500 14px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{staff.title} · {staff.role === 'admin' ? 'Admin' : 'Staff'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 13px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}><i className="ph-bold ph-bank" />{scoped ? staff.depts.join(', ') : 'All departments'} · {currentOrg.short}</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, background: 'var(--cp-peacock-soft)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className="ph-fill ph-shield-check" style={{ color: 'var(--cp-peacock)' }} />Verified official</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${mob ? 150 : 200}px,1fr))`, gap: 12 }}>
        {stats.list.map((k) => (
          <div key={k.l} style={{ ...CARD, gap: 8, padding: 16 }}>
            <span style={{ font: "400 32px/1 'DM Serif Display',serif" }}>{k.v}</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{k.l}</span>
            <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{k.s}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: desk ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ ...CARD, padding: '6px 18px' }}>
          {info.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--cp-line)' }}>
              <span style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', flex: 'none' }}>{k}</span>
              <span style={{ font: '600 13px/1.3 Outfit,sans-serif', textAlign: 'right', minWidth: 0 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...CARD, gap: 14, padding: 18 }}>
          <span style={{ font: "400 20px/1 'DM Serif Display',serif" }}>Assigned area</span>
          <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{scoped ? `Cases in ${staff.depts.join(' and ')}` : `Every department in ${currentOrg.short}`}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stats.areas.map(([a, n]) => (
              <button key={a} onClick={() => router.push(`/console/cases?area=${encodeURIComponent(a)}`)} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 12px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)' }} />{a}<span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>{n}</span>
              </button>
            ))}
            {stats.areas.length === 0 && <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>No cases in your jurisdiction yet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
