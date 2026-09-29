'use client';
import type { Issue, Category } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { deptName, SORTS, STATUS_OPTS, statusMatches } from '@/lib/console/derive';
import { Drawer, FieldLabel, LinkButton, PrimaryButton } from './Drawer';
import { Combobox } from './Combobox';

interface Props {
  open: boolean;
  onClose: () => void;
  cases: Issue[];
  status: string[]; areas: string[]; depts: string[]; cats: string[]; sort: string;
  shown: number;
  set: (patch: Record<string, string[] | string | null>) => void;
  reset: () => void;
  cta?: string;
}

const DOT: Record<string, string> = { overdue: 'var(--cp-pulse)', pending: 'var(--cp-marigold)', assigned: 'var(--cp-peacock)', progress: 'var(--cp-pulse)', reopened: 'var(--cp-pulse-deep)', rejected: 'var(--cp-ink-3)' };

// Shared by Cases and Search: both keep their filters in the URL, so this only reports patches.
export function CaseFilterDrawer({ open, onClose, cases, status, areas, depts, cats, sort, shown, set, reset, cta }: Props) {
  const count = (m: (i: Issue) => string) => {
    const c: Record<string, number> = {};
    cases.forEach((i) => { const k = m(i); c[k] = (c[k] || 0) + 1; });
    return c;
  };
  const ranked = (c: Record<string, number>) => Object.entries(c).sort((a, b) => b[1] - a[1]).map(([v, n]) => ({ value: v, label: v, count: n }));
  const catCount = count((i) => i.cat);
  const catOpts = (Object.keys(CATS) as Category[]).filter((k) => catCount[k]).map((k) => ({ value: k, label: CATS[k].l, icon: CATS[k].icon, count: catCount[k] }));

  return (
    <Drawer open={open} onClose={onClose} eyebrow="Cases" title="Filters"
      footer={<><LinkButton onClick={reset}>Clear all</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={onClose}>{cta ?? `Show ${shown} cases`}</PrimaryButton></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><FieldLabel>Status</FieldLabel><span style={{ font: '500 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>Select any</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {STATUS_OPTS.map(([k, l]) => {
            const on = status.includes(k);
            return (
              <button key={k} onClick={() => set({ status: on ? status.filter((x) => x !== k) : [...status, k] })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '8px 12px', borderRadius: 14, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', transition: 'all .15s' }}>
                <span style={{ width: 10, height: 10, flex: 'none', borderRadius: '50%', background: DOT[k] ?? 'var(--cp-leaf)' }} />
                <span style={{ flex: 1, minWidth: 0, font: '600 12.5px/1.2 Outfit,sans-serif' }}>{l}</span>
                <span style={{ font: '700 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{cases.filter((i) => statusMatches(i, k)).length}</span>
                {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 17, flex: 'none' }} />}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Combobox label="Area" icon="ph-map-pin" placeholder="All areas" options={ranked(count((i) => i.area))} value={areas} onChange={(v) => set({ area: v })} multi searchPlaceholder="Search areas" />
        <Combobox label="Department" icon="ph-buildings" placeholder="All departments" options={ranked(count(deptName))} value={depts} onChange={(v) => set({ dept: v })} multi searchPlaceholder="Search departments" />
        <Combobox label="Problem type" icon="ph-squares-four" placeholder="All types" options={catOpts} value={cats} onChange={(v) => set({ cat: v })} multi searchPlaceholder="Search types" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldLabel>Sort by</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 16, border: '1px solid var(--cp-line)', overflow: 'hidden' }}>
          {SORTS.map(([k, l, icon]) => (
            <button key={k} onClick={() => set({ sort: k === 'score' ? null : k })} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 48, padding: '0 14px', border: 'none', borderBottom: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left' }}>
              <i className={`ph-bold ${icon}`} style={{ fontSize: 16, color: 'var(--cp-ink-3)' }} />
              <span style={{ flex: 1 }}>{l}</span>
              <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sort === k ? 'var(--cp-ink)' : 'var(--cp-edge)'}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: sort === k ? 'var(--cp-ink)' : 'transparent' }} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
