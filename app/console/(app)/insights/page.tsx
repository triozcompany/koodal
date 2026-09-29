'use client';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useDesk, useMob } from '@/lib/console/useMob';
import { CATS, D } from '@/lib/domain/constants';
import type { Category } from '@/lib/domain/types';
import { caseRow, fdate, GOV_DEPTS, isCase, sdate } from '@/lib/console/derive';
import { buckets, calc, isoD, nice, parseD, RANGES, RES_BINS, resolveRange, sod, toRecs, type Calc, type RangeKey } from '@/lib/console/insights';
import { useConsole } from '../../_components/ConsoleProvider';
import { Combobox } from '../../_components/Combobox';
import { Drawer, FieldLabel, LinkButton, PrimaryButton } from '../../_components/Drawer';

const CARD: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 22, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', minWidth: 0 };
const H2: CSSProperties = { font: "400 20px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' };
const SUB: CSSProperties = { font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' };
const SEG_BG: CSSProperties = { display: 'flex', gap: 3, padding: 4, borderRadius: 999, background: 'var(--cp-surface-2)' };

type MetricKey = 'opened' | 'fixed' | 'closed' | 'res' | 'sla' | 'reopen' | 'reopN';
const SER: Record<MetricKey, [string, string]> = {
  opened: ['Opened', 'var(--cp-marigold)'], fixed: ['Fixed', 'var(--cp-leaf)'], reopN: ['Reopened', 'var(--cp-pulse)'],
  closed: ['Closed by citizens', 'var(--cp-peacock)'], res: ['Avg. resolution', 'var(--cp-ink)'], sla: ['On-time fixes', 'var(--cp-peacock)'], reopen: ['Reopen rate', 'var(--cp-pulse)'],
};
const KP: [MetricKey, string, string, boolean, string][] = [
  ['opened', 'Cases opened', 'var(--cp-marigold)', false, ''], ['fixed', 'Fixed', 'var(--cp-leaf)', false, ''], ['closed', 'Closed by citizens', 'var(--cp-peacock)', false, ''],
  ['res', 'Avg. resolution', 'var(--cp-ink)', true, 'd'], ['sla', 'On-time fixes', 'var(--cp-peacock)', false, '%'], ['reopen', 'Reopen rate', 'var(--cp-pulse)', true, '%'],
];
const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function RangeDrawer({ open, onClose, range, from, to, onApply }: { open: boolean; onClose: () => void; range: RangeKey; from: string; to: string; onApply: (k: RangeKey, f?: string, t?: string) => void }) {
  const [a, setA] = useState<string | null>(from);
  const [b, setB] = useState<string | null>(to);
  const [off, setOff] = useState(0);
  const now = Date.now(), today = sod(now);
  const base = new Date(new Date().getFullYear(), new Date().getMonth() + off, 1);
  const y = base.getFullYear(), mo = base.getMonth(), lead = base.getDay(), nd = new Date(y, mo + 1, 0).getDate();
  const A = a ? parseD(a) : null, B = b ? parseD(b) : null;
  const click = (t: number) => {
    const iso = isoD(t);
    if (!a || b) { setA(iso); setB(null); } else if (t < parseD(a)) setA(iso); else setB(iso);
  };
  const nav: CSSProperties = { width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer' };
  return (
    <Drawer open={open} onClose={onClose} eyebrow="Insights" title="When"
      footer={<><LinkButton onClick={() => { setA(null); setB(null); }}>Clear</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={() => { if (a) onApply('custom', a, b || a); else onClose(); }}>Apply</PrimaryButton></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldLabel>Quick select</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {RANGES.map(([k, l]) => (
            <button key={k} onClick={() => onApply(k)} style={{ height: 46, borderRadius: 14, border: `1.5px solid ${range === k ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: range === k ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldLabel>Custom dates</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {([['From', A], ['To', B]] as const).map(([l, v], k) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', borderRadius: 14, background: 'var(--cp-surface-2)', boxShadow: (k === 0 ? !a || !!b : !!a && !b) ? 'inset 0 0 0 2px var(--cp-ink)' : 'none' }}>
              <span style={{ font: '600 10.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>{l}</span>
              <span style={{ font: '600 13.5px/1 Outfit,sans-serif', color: v ? 'var(--cp-ink)' : 'var(--cp-ink-3)' }}>{v ? fdate(v) : 'Add date'}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 20, border: '1px solid var(--cp-line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setOff(off - 1)} aria-label="Previous month" style={nav}><i className="ph-bold ph-caret-left" /></button>
            <span style={{ flex: 1, textAlign: 'center', font: '600 15px/1 Outfit,sans-serif' }}>{base.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => off < 0 && setOff(off + 1)} aria-label="Next month" style={{ ...nav, opacity: off < 0 ? 1 : 0.35 }}><i className="ph-bold ph-caret-right" /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', rowGap: 2 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, k) => <span key={k} style={{ textAlign: 'center', font: '600 11px/24px Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{w}</span>)}
            {Array.from({ length: lead }, (_, k) => <span key={`l${k}`} />)}
            {Array.from({ length: nd }, (_, k) => {
              const t = new Date(y, mo, k + 1).getTime(), fut = t > today, end = A === t || B === t, inRg = A != null && B != null && t > A && t < B;
              return (
                <button key={k} disabled={fut} onClick={() => click(t)} style={{ height: 40, border: 'none', padding: 0, background: inRg ? 'var(--cp-surface-2)' : 'transparent', cursor: fut ? 'not-allowed' : 'pointer' }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, margin: '0 auto', borderRadius: '50%', background: end ? 'var(--cp-ink)' : 'transparent', color: end ? 'var(--cp-bg)' : fut ? 'var(--cp-ink-3)' : 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', textDecoration: fut ? 'line-through' : 'none', boxShadow: t === today && !end ? 'inset 0 0 0 1.5px var(--cp-ink-3)' : 'none' }}>{k + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
        <span style={{ ...SUB, fontSize: 12.5 }}>{a && !b ? 'Now pick an end date' : A && B ? `${Math.round((B - A) / D) + 1} days selected` : 'Pick a start date'}</span>
      </div>
    </Drawer>
  );
}

function BreakdownCard({ title, sub, rows, activeKeys, onToggle }: { title: string; sub: string; rows: { k: string; l: string; icon: string; n: number; f: number }[]; activeKeys: string[]; onToggle: (k: string) => void }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div style={{ ...CARD, gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={H2}>{title}</span><span style={SUB}>{sub}</span>
        <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
          {[['Fixed', 'var(--cp-leaf)'], ['Still open', 'var(--cp-marigold)']].map(([l, c]) => <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{l}</span>)}
        </div>
      </div>
      {rows.map((r) => {
        const on = activeKeys.includes(r.k);
        return (
          <button key={r.k} onClick={() => onToggle(r.k)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,140px) minmax(0,1fr) 96px', gap: 12, alignItems: 'center', padding: '8px 10px', margin: '0 -10px', border: 'none', borderRadius: 12, background: on ? 'var(--cp-surface-2)' : 'transparent', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, font: '600 13px/1.2 Outfit,sans-serif' }}>
              {on ? <i className="ph-fill ph-check-circle" style={{ fontSize: 15 }} /> : <i className={`ph-bold ${r.icon}`} style={{ fontSize: 15, color: 'var(--cp-ink-2)' }} />}
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.l}</span>
            </span>
            <span style={{ display: 'flex', height: 12, borderRadius: 6, background: 'var(--cp-surface-2)', overflow: 'hidden' }}>
              <span style={{ width: `${(r.f / max) * 100}%`, background: 'var(--cp-leaf)' }} /><span style={{ width: `${((r.n - r.f) / max) * 100}%`, background: 'var(--cp-marigold)' }} />
            </span>
            <span style={{ font: '600 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{r.n} · {Math.round((r.f / r.n) * 100)}% fixed</span>
          </button>
        );
      })}
      {rows.length === 0 && <span style={{ ...SUB, padding: '12px 0' }}>No cases in this period.</span>}
    </div>
  );
}

function FragmentRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span style={{ display: 'flex', alignItems: 'center', font: '600 12.5px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {children}
    </>
  );
}

export default function Insights() {
  const router = useRouter();
  const mob = useMob();
  const desk = useDesk();
  const { issues, issuesReady, toast } = useConsole();
  const [range, setRange] = useState<RangeKey>('90d');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [metric, setMetric] = useState<'overview' | MetricKey>('overview');
  const [hidden, setHidden] = useState<MetricKey[]>([]);
  const [line, setLine] = useState(false);
  const [hB, setHB] = useState<number | null>(null);
  const [dSort, setDSort] = useState<'dn' | 'n' | 'open' | 'res' | 'ot' | 'ro'>('n');
  const [fArea, setFArea] = useState<string[]>([]);
  const [fDept, setFDept] = useState<string[]>([]);
  const [fCat, setFCat] = useState<string[]>([]);
  const [rangeOpen, setRangeOpen] = useState(false);

  const all = useMemo(() => toRecs(issues), [issues]);
  const recs = useMemo(() => all.filter((r) => (!fArea.length || fArea.includes(r.area)) && (!fDept.length || fDept.includes(r.dept)) && (!fCat.length || fCat.includes(r.cat))), [all, fArea, fDept, fCat]);

  const now = Date.now();
  const [r0, r1] = resolveRange(range, from, to, now);
  const len = Math.max(3600e3, r1 - r0);
  const cur = useMemo(() => calc(recs, r0, r1), [recs, r0, r1]);
  const prev = useMemo(() => calc(recs, r0 - len, r0 - 1), [recs, r0, len]);
  const { gran, list: bks } = useMemo(() => buckets(r0, r1), [r0, r1]);
  const bv = useMemo(() => bks.map((k) => calc(recs, k.a, k.b)), [recs, bks]);

  const rangeL = range === 'today' ? 'Today' : range === 'yday' ? 'Yesterday' : range === 'mtd' ? 'This month' : range === 'custom' ? (isoD(r0) === isoD(r1) ? fdate(r0) : `${sdate(r0)} – ${fdate(r1)}`) : RANGES.find((x) => x[0] === range)![1];
  const granL = { hour: 'Hourly', day: 'Daily', week: 'Weekly', month: 'Monthly' }[gran];
  const skeys: MetricKey[] = metric === 'overview' ? ['opened', 'fixed', 'reopN'] : [metric];
  const vis = metric === 'overview' ? skeys.filter((k) => !hidden.includes(k)) : skeys;
  const unit = metric === 'res' ? 'd' : metric === 'sla' || metric === 'reopen' ? '%' : '';
  const fv = (v: number | null, u = unit) => (v == null ? '—' : u === 'd' ? `${v.toFixed(1)}d` : u === '%' ? `${Math.round(v)}%` : String(v));
  const val = (c: Calc, k: MetricKey) => (c[k] as number | null) ?? 0;
  const mx = unit === '%' ? 100 : nice(Math.max(1, ...vis.flatMap((k) => bv.map((b) => val(b, k)))));
  const NB = bks.length;
  const every = Math.ceil(NB / (mob ? 6 : desk ? 14 : 9));
  const bl = (k: { a: number }) => (gran === 'hour' ? `${String(new Date(k.a).getHours()).padStart(2, '0')}:00` : gran === 'month' ? MS[new Date(k.a).getMonth()] : sdate(k.a));
  const blFull = (k: { a: number; b: number }) => gran === 'hour' ? `${sdate(k.a)} · ${bl(k)}` : gran === 'day' ? new Date(k.a).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : gran === 'week' ? `${sdate(k.a)} – ${sdate(Math.min(k.b, r1))}` : new Date(k.a).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const hBi = hB != null && hB < NB ? hB : null;
  const chartH = mob ? 220 : 280;

  const applyRange = (k: RangeKey, f?: string, t?: string) => { setRange(k); setFrom(f ?? null); setTo(t ?? null); setHB(null); setRangeOpen(false); };
  const anyF = fArea.length + fDept.length + fCat.length > 0;

  const tally = (key: (r: (typeof recs)[number]) => string) => {
    const o: Record<string, { n: number; f: number }> = {};
    cur.op.forEach((r) => { const x = (o[key(r)] ??= { n: 0, f: 0 }); x.n++; if (r.fixed) x.f++; });
    return o;
  };
  const catI = tally((r) => r.cat), areaI = tally((r) => r.area);
  const rowsOf = (o: typeof catI, label: (k: string) => string, icon: (k: string) => string, limit: number) =>
    Object.entries(o).sort((a, b) => b[1].n - a[1].n).slice(0, limit).map(([k, x]) => ({ k, l: label(k), icon: icon(k), n: x.n, f: x.f }));
  const toggle = (arr: string[], set: (v: string[]) => void) => (k: string) => set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);

  const dAgg = GOV_DEPTS.map(({ dept }) => {
    const op = cur.op.filter((r) => r.dept === dept), fx = cur.fx.filter((r) => r.dept === dept);
    return {
      dn: dept, n: op.length, open: op.filter((r) => !r.fixed).length,
      res: fx.length ? fx.reduce((a, r) => a + (r.fixed! - r.created), 0) / fx.length / D : null,
      ot: fx.length ? (fx.filter((r) => r.due && r.fixed! <= r.due).length / fx.length) * 100 : null,
      ro: fx.length ? (fx.filter((r) => r.reopened).length / fx.length) * 100 : null,
    };
  }).filter((x) => x.n || x.res != null).sort((a, b) => (dSort === 'dn' ? a.dn.localeCompare(b.dn) : ((b[dSort] as number | null) ?? -1) - ((a[dSort] as number | null) ?? -1)));
  const dMax = (k: 'n' | 'open' | 'res') => Math.max(1, ...dAgg.map((x) => x[k] || 0));

  const resD = cur.fx.map((r) => (r.fixed! - r.created) / D);
  const binN = RES_BINS.map((b) => resD.filter((v) => v >= b[1] && v < b[2]).length), binM = Math.max(1, ...binN);
  const op = cur.op, apN = op.filter((r) => r.approved).length, fxN = op.filter((r) => r.fixed).length, clN = op.filter((r) => r.closed).length;
  const hmAreas = Object.entries(areaI).sort((a, b) => b[1].n - a[1].n).slice(0, 7).map((x) => x[0]);
  const hmCats = (Object.keys(CATS) as Category[]).filter((k) => catI[k]);
  const hmV: Record<string, number> = {};
  cur.op.forEach((r) => { const k = `${r.area}|${r.cat}`; hmV[k] = (hmV[k] || 0) + 1; });
  const hmM = Math.max(1, ...Object.values(hmV));

  const cases = useMemo(() => issues.filter(isCase), [issues]);
  const areaCat: Record<string, number> = {};
  cases.forEach((i) => { const k = `${i.area}|${i.cat}`; areaCat[k] = (areaCat[k] || 0) + 1; });
  const listCards = [
    { icon: 'ph-repeat', t: 'Recurring cases', s: 'Same problem, same place — consider a permanent fix', rows: cases.filter((i) => i.history || areaCat[`${i.area}|${i.cat}`] > 1), empty: 'No recurring locations.' },
    { icon: 'ph-arrow-counter-clockwise', t: 'Reopened by citizens', s: 'Fix was not accepted by the community', rows: cases.filter((i) => i.reopened), empty: 'No reopened cases.' },
  ];

  const exportCsv = () => {
    const rows = [['Case', 'Area', 'Category', 'Department', 'Opened', 'Fixed', 'Closed', 'Reopened']]
      .concat(cur.op.map((r) => [r.id, r.area, CATS[r.cat as Category]?.l ?? r.cat, r.dept, isoD(r.created), r.fixed ? isoD(r.fixed) : '', r.closed ? isoD(r.closed) : '', r.reopened ? 'yes' : 'no']));
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `koodal-insights-${isoD(r0)}-${isoD(r1)}.csv`; a.click();
    URL.revokeObjectURL(a.href);
    toast(`Exported ${cur.opened} cases · ${rangeL}`);
  };

  const kpis = KP.map(([k, l, c, low, u]) => {
    const a = cur[k] as number | null, b = prev[k] as number | null;
    let d = '—', good: boolean | null = null;
    if (a != null && b != null) {
      if (u === '') { if (b > 0) { const p = ((a - b) / b) * 100; d = `${p >= 0 ? '+' : ''}${Math.round(p)}%`; good = p === 0 ? null : p > 0 !== low; } else if (a > 0) { d = 'new'; good = !low; } }
      else { const df = a - b; d = `${df >= 0 ? '+' : ''}${u === 'd' ? `${df.toFixed(1)}d` : `${Math.round(df)}pt`}`; good = Math.abs(df) < 0.05 ? null : df > 0 !== low; }
    }
    const sp = bv.slice(-18).map((x) => val(x, k)), sm = Math.max(1, ...sp);
    return { k, l, c, v: fv(a, u), d, good, on: metric === k, sp: sp.map((v) => ({ h: `${Math.max(8, (v / sm) * 100)}%`, o: v ? 1 : 0.25 })) };
  });

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ p: f * 100, l: unit === 'd' ? `${(mx * f).toFixed(mx < 4 ? 1 : 0)}d` : unit === '%' ? `${Math.round(mx * f)}%` : String(Math.round(mx * f)) }));
  const tip = hBi != null ? { x: `${((hBi + 0.5) / NB) * 100}%`, tx: hBi < NB * 0.2 ? '-12%' : hBi > NB * 0.8 ? '-88%' : '-50%', l: blFull(bks[hBi]), rows: vis.map((k) => ({ l: SER[k][0], c: SER[k][1], v: fv(val(bv[hBi], k)) })) } : null;

  const gc = mob ? 'minmax(0,1fr)' : desk ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)';
  if (!issuesReady) return null;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: mob ? '18px 16px 28px' : `26px ${desk ? 36 : 24}px 64px`, display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Insights</span>
          <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{rangeL} · {cur.opened} cases · compared with the previous period</span>
        </div>
        <button onClick={exportCsv} style={{ height: 44, padding: '0 16px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}><i className="ph-bold ph-download-simple" />Export CSV</button>
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 12, padding: 12, borderRadius: 22, background: 'color-mix(in oklch,var(--cp-surface) 88%,transparent)', backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)', border: '1px solid var(--cp-line)', boxShadow: '0 14px 30px -24px rgb(0 0 0 / .4)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setRangeOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 54, padding: '0 18px 0 10px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 0 var(--cp-edge)' }}>
            <span style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: 'var(--cp-ink)', color: 'var(--cp-bg)', display: 'grid', placeItems: 'center', fontSize: 16 }}><i className="ph-bold ph-calendar-blank" /></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
              <span style={{ font: '600 10.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>When</span>
              <span style={{ font: '600 14px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{rangeL}</span>
            </span>
            <i className="ph-bold ph-caret-down" style={{ fontSize: 12, color: 'var(--cp-ink-3)', marginLeft: 4 }} />
          </button>
          <div style={{ flex: 1 }} />
          {anyF && <button onClick={() => { setFArea([]); setFDept([]); setFCat([]); }} style={{ height: 34, padding: '0 10px', border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>Reset filters</button>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${mob ? 200 : 220}px,1fr))`, gap: 8 }}>
          <Combobox label="Area" icon="ph-map-pin" placeholder="All areas" multi searchPlaceholder="Search areas" options={[...new Set(all.map((r) => r.area))].sort().map((v) => ({ value: v, label: v, count: all.filter((r) => r.area === v).length }))} value={fArea} onChange={setFArea} />
          <Combobox label="Department" icon="ph-buildings" placeholder="All departments" multi searchPlaceholder="Search departments" options={GOV_DEPTS.filter((g) => all.some((r) => r.dept === g.dept)).map((g) => ({ value: g.dept, label: g.dept, icon: g.icon, count: all.filter((r) => r.dept === g.dept).length }))} value={fDept} onChange={setFDept} />
          <Combobox label="Problem type" icon="ph-squares-four" placeholder="All types" multi searchPlaceholder="Search types" options={(Object.keys(CATS) as Category[]).filter((k) => all.some((r) => r.cat === k)).map((k) => ({ value: k, label: CATS[k].l, icon: CATS[k].icon, count: all.filter((r) => r.cat === k).length }))} value={fCat} onChange={setFCat} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${mob ? 150 : 170}px,1fr))`, gap: 12 }}>
        {kpis.map((k) => (
          <button key={k.k} onClick={() => { setMetric(k.on ? 'overview' : k.k); setHB(null); }} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, borderRadius: 20, background: k.on ? 'var(--cp-ink)' : 'var(--cp-surface)', border: `1.5px solid ${k.on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, color: k.on ? 'var(--cp-bg)' : 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', boxShadow: k.on ? '0 16px 30px -18px rgb(0 0 0 / .6)' : 'none', transition: 'transform .25s cubic-bezier(.3,1.6,.5,1),background .2s' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: '600 11px/1.2 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.7, flex: 1 }}>{k.l}</span>{k.on && <i className="ph-fill ph-chart-bar" style={{ fontSize: 14 }} />}</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ font: "400 32px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{k.v}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 20, padding: '0 6px', borderRadius: 10, background: k.good == null ? 'var(--cp-surface-2)' : k.good ? 'var(--cp-leaf-soft)' : 'var(--cp-pulse-soft)', color: k.good == null ? 'var(--cp-ink-2)' : k.good ? 'var(--cp-leaf)' : 'var(--cp-pulse-deep)', font: '700 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                {k.d !== '—' && <i className={`ph-bold ${k.d.startsWith('-') ? 'ph-arrow-down-right' : 'ph-arrow-up-right'}`} style={{ fontSize: 10 }} />}{k.d}
              </span>
            </span>
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 22 }}>{k.sp.map((s, i) => <span key={i} style={{ flex: 1, height: s.h, borderRadius: 2, background: k.on ? 'var(--cp-bg)' : k.c, opacity: s.o }} />)}</span>
          </button>
        ))}
      </div>

      <div onMouseLeave={() => setHB(null)} style={{ ...CARD, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 220px' }}>
            <span style={{ font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>{metric === 'overview' ? 'Opened vs fixed' : `${SER[metric][0]} over time`}</span>
            <span style={SUB}>{granL} · {rangeL}{gran !== 'hour' ? ' · click a bar to zoom in' : ''}</span>
          </div>
          {metric === 'overview' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {skeys.map((k) => {
                const off = hidden.includes(k);
                return <button key={k} onClick={() => setHidden(off ? hidden.filter((x) => x !== k) : [...hidden, k])} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', opacity: off ? 0.4 : 1, whiteSpace: 'nowrap' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: SER[k][1] }} />{SER[k][0]}<span style={{ color: 'var(--cp-ink-3)' }}>{String(cur[k])}</span></button>;
              })}
            </div>
          )}
          <div style={SEG_BG}>
            {([[false, 'Bars', 'ph-chart-bar'], [true, 'Line', 'ph-chart-line']] as const).map(([v, l, icon]) => (
              <button key={l} onClick={() => setLine(v)} title={l} style={{ width: 36, height: 30, borderRadius: 999, border: 'none', background: line === v ? 'var(--cp-surface)' : 'transparent', color: line === v ? 'var(--cp-ink)' : 'var(--cp-ink-2)', cursor: 'pointer', boxShadow: line === v ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none', fontSize: 15 }}><i className={`ph-bold ${icon}`} /></button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: 8, height: chartH }}>
          <div style={{ position: 'relative' }}>{ticks.map((t) => <span key={t.p} style={{ position: 'absolute', right: 0, bottom: `calc(${t.p} * (100% - 22px) / 100 + 22px)`, transform: 'translateY(50%)', font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{t.l}</span>)}</div>
          <div style={{ position: 'relative', minWidth: 0 }}>
            {ticks.map((t) => <div key={t.p} style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(${t.p} * (100% - 22px) / 100 + 22px)`, height: 1, background: 'var(--cp-line)' }} />)}
            {line && NB > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 22 }}>
                <svg viewBox={`0 0 ${NB} 100`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
                  {vis.map((k, si) => {
                    const pts = bv.map((b, i) => `${i + 0.5},${100 - (val(b, k) / mx) * 100}`).join(' ');
                    return <g key={k}>{si === 0 && <polygon points={`0.5,100 ${pts} ${NB - 0.5},100`} style={{ fill: SER[k][1], opacity: 0.1 }} />}<polyline points={pts} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: SER[k][1], strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }} /></g>;
                  })}
                </svg>
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: line ? 0 : NB > 40 ? 2 : 6 }}>
              {bks.map((k, idx) => (
                <div key={idx} onMouseEnter={() => setHB(idx)} onClick={() => { if (gran === 'hour') return; applyRange('custom', isoD(k.a), isoD(Math.min(k.b, now))); }} style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', cursor: gran === 'hour' ? 'default' : 'zoom-in' }}>
                  <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center', borderRadius: 8, background: hBi === idx ? 'var(--cp-surface-2)' : 'transparent', transition: 'background .15s' }}>
                    {!line && vis.map((k2) => <span key={k2} style={{ flex: 1, maxWidth: NB > 40 ? 8 : 20, height: `${(val(bv[idx], k2) / mx) * 100}%`, background: SER[k2][1], borderRadius: '4px 4px 1px 1px', transition: 'height .45s cubic-bezier(.2,.9,.3,1)', opacity: hBi == null || hBi === idx ? 1 : 0.4 }} />)}
                    {line && hBi === idx && vis.map((k2) => <span key={k2} style={{ position: 'absolute', left: '50%', bottom: `calc(${(val(bv[idx], k2) / mx) * 100} * (100% - 22px) / 100 + 22px)`, width: 9, height: 9, margin: '0 0 -4.5px -4.5px', borderRadius: '50%', background: 'var(--cp-surface)', border: `2.5px solid ${SER[k2][1]}`, boxSizing: 'border-box' }} />)}
                  </div>
                  <span style={{ height: 22, font: '500 10.5px/22px Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'visible' }}>{idx % every === 0 ? bl(k) : ''}</span>
                </div>
              ))}
            </div>
            {tip && (
              <div data-cp-theme="dark" style={{ position: 'absolute', left: tip.x, top: 0, transform: `translateX(${tip.tx})`, zIndex: 5, minWidth: 160, padding: '12px 14px', borderRadius: 14, background: '#0d0d0d', color: '#f5f5f5', boxShadow: '0 18px 36px -14px rgb(0 0 0 / .5)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 7, animation: 'cp-pop2 .15s both' }}>
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: '#bdbdbd' }}>{tip.l}</span>
                {tip.rows.map((r) => <span key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 13px/1 Outfit,sans-serif' }}><span style={{ width: 9, height: 9, borderRadius: 3, background: r.c }} /><span style={{ flex: 1, color: '#bdbdbd', fontWeight: 500 }}>{r.l}</span>{r.v}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: gc, gap: 18, alignItems: 'start' }}>
        <BreakdownCard title="Problem types" sub="Cases opened in this period · click to filter" rows={rowsOf(catI, (k) => CATS[k as Category]?.l ?? k, (k) => CATS[k as Category]?.icon ?? 'ph-circle', 10)} activeKeys={fCat} onToggle={toggle(fCat, setFCat)} />
        <BreakdownCard title="Areas" sub="Top areas by cases opened · click to filter" rows={rowsOf(areaI, (k) => k, () => 'ph-map-pin', 8)} activeKeys={fArea} onToggle={toggle(fArea, setFArea)} />
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={H2}>Department performance</span><span style={SUB}>Click a column to sort · click a row to filter</span></div>
        <div style={{ overflowX: 'auto', margin: '0 -18px', padding: '0 18px' }}>
          <div style={{ minWidth: 640 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) repeat(5,minmax(0,1fr))', gap: 10, padding: '0 10px 10px', borderBottom: '1px solid var(--cp-line)' }}>
              {([['dn', 'Department'], ['n', 'Cases'], ['open', 'Open'], ['res', 'Avg fix time'], ['ot', 'On time'], ['ro', 'Reopened']] as const).map(([k, l], ci) => (
                <button key={k} onClick={() => setDSort(k)} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: ci ? 'flex-end' : 'flex-start', border: 'none', background: 'none', padding: 0, cursor: 'pointer', font: '600 10.5px/1.2 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: dSort === k ? 'var(--cp-ink)' : 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{l}<i className={`ph-bold ${dSort === k ? (k === 'dn' ? 'ph-arrow-up' : 'ph-arrow-down') : 'ph-caret-up-down'}`} style={{ fontSize: 10 }} /></button>
              ))}
            </div>
            {dAgg.map((x) => {
              const g = GOV_DEPTS.find((d) => d.dept === x.dn)!;
              const cell = (v: string, w: string, bc: string, warn = false) => (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                  <span style={{ font: '700 13px/1 Outfit,sans-serif', color: warn ? 'var(--cp-pulse-deep)' : 'var(--cp-ink)' }}>{v}</span>
                  <span style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--cp-surface-2)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: w, background: bc }} /></span>
                </span>
              );
              return (
                <button key={x.dn} onClick={() => toggle(fDept, setFDept)(x.dn)} className="cp-hover-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) repeat(5,minmax(0,1fr))', gap: 10, alignItems: 'center', width: '100%', padding: '12px 10px', border: 'none', borderBottom: '1px solid var(--cp-line)', background: fDept.includes(x.dn) ? 'var(--cp-surface-2)' : 'transparent', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, font: '600 13px/1.2 Outfit,sans-serif' }}><i className={`ph-bold ${g.icon}`} style={{ fontSize: 16, color: 'var(--cp-ink-2)' }} />{x.dn}</span>
                  {cell(String(x.n), `${(x.n / dMax('n')) * 100}%`, 'var(--cp-marigold)')}
                  {cell(String(x.open), `${(x.open / dMax('open')) * 100}%`, 'var(--cp-pulse)')}
                  {cell(fv(x.res, 'd'), `${((x.res || 0) / dMax('res')) * 100}%`, 'var(--cp-ink-3)')}
                  {cell(fv(x.ot, '%'), `${x.ot || 0}%`, 'var(--cp-leaf)', x.ot != null && x.ot < 70)}
                  {cell(fv(x.ro, '%'), `${x.ro || 0}%`, 'var(--cp-pulse)', x.ro != null && x.ro > 12)}
                </button>
              );
            })}
            {dAgg.length === 0 && <span style={{ ...SUB, display: 'block', padding: '16px 10px' }}>No cases in this period.</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: gc, gap: 18, alignItems: 'start' }}>
        <div style={{ ...CARD, gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={H2}>Resolution time</span><span style={SUB}>Threshold crossed → marked fixed · {cur.fixed} fixed cases</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 10, alignItems: 'end', height: 170 }}>
            {RES_BINS.map((b, k) => (
              <div key={b[0]} title={`${binN[k]} cases`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ font: '700 12px/1 Outfit,sans-serif' }}>{cur.fixed ? `${Math.round((binN[k] / cur.fixed) * 100)}%` : '—'}</span>
                <span style={{ width: '100%', height: Math.max(4, (binN[k] / binM) * 120), borderRadius: '8px 8px 3px 3px', background: b[3], transition: 'height .45s cubic-bezier(.2,.9,.3,1)' }} />
                <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{b[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...CARD, gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={H2}>Case funnel</span><span style={SUB}>Of cases opened in this period</span></div>
          {([['Crossed threshold', op.length, 'var(--cp-marigold)'], ['Approved', apN, 'var(--cp-peacock)'], ['Fixed', fxN, 'var(--cp-leaf)'], ['Closed by citizens', clN, 'var(--cp-ink)']] as const).map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: '600 13px/1 Outfit,sans-serif', flex: 1 }}>{l}</span><span style={{ font: '700 14px/1 Outfit,sans-serif' }}>{v}</span><span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', width: 42, textAlign: 'right' }}>{op.length ? `${Math.round((v / op.length) * 100)}%` : '—'}</span></span>
              <span style={{ height: 14, borderRadius: 7, background: 'var(--cp-surface-2)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${op.length ? (v / op.length) * 100 : 0}%`, borderRadius: 7, background: c, transition: 'width .45s cubic-bezier(.2,.9,.3,1)' }} /></span>
            </div>
          ))}
        </div>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span style={H2}>Hotspot matrix</span><span style={SUB}>Areas × problem types · click a cell to filter</span></div>
        <div style={{ overflowX: 'auto', margin: '0 -18px', padding: '0 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${hmCats.length},minmax(64px,1fr))`, gap: 4, minWidth: 560 }}>
            <span />
            {hmCats.map((c) => <span key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 6, font: '600 10.5px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}><i className={`ph-bold ${CATS[c].icon}`} style={{ fontSize: 15, color: 'var(--cp-ink-2)' }} />{CATS[c].l}</span>)}
            {hmAreas.map((a) => (
              <FragmentRow key={a} label={a}>
                {hmCats.map((c) => {
                  const v = hmV[`${a}|${c}`] || 0, t = v / hmM;
                  return <button key={c} onClick={() => { setFArea([a]); setFCat([c]); }} title={`${a} · ${CATS[c].l}: ${v}`} style={{ height: 40, borderRadius: 10, border: 'none', background: v ? `color-mix(in oklch,var(--cp-pulse) ${Math.round(12 + 78 * t)}%,var(--cp-surface-2))` : 'var(--cp-surface-2)', color: t > 0.5 ? '#fff' : 'var(--cp-ink)', font: '700 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>{v || ''}</button>;
                })}
              </FragmentRow>
            ))}
          </div>
        </div>
        {hmAreas.length === 0 && <span style={SUB}>No cases in this period.</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: gc, gap: 18, alignItems: 'start' }}>
        {listCards.map((lc) => (
          <div key={lc.t} style={{ ...CARD, padding: '18px 18px 6px', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...H2 }}><i className={`ph-bold ${lc.icon}`} style={{ fontSize: 18 }} />{lc.t}</span><span style={SUB}>{lc.s}</span>
            </div>
            {lc.rows.map((i) => {
              const r = caseRow(i);
              return (
                <button key={i.id} onClick={() => router.push(`/console/cases/${i.id}`)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: '12px 0', border: 'none', borderTop: '1px solid var(--cp-line)', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ font: '600 13px/1.25 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                    <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {i.area} · {r.dept}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{r.stageShort}</span>
                </button>
              );
            })}
            {lc.rows.length === 0 && <span style={{ ...SUB, padding: '12px 0 18px', borderTop: '1px solid var(--cp-line)' }}>{lc.empty}</span>}
          </div>
        ))}
      </div>

      <RangeDrawer key={`${range}-${from}-${to}-${rangeOpen}`} open={rangeOpen} onClose={() => setRangeOpen(false)} range={range} from={isoD(r0)} to={isoD(r1)} onApply={applyRange} />
    </div>
  );
}
