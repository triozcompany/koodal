'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMob } from '@/lib/console/useMob';
import { CATS } from '@/lib/domain/constants';
import type { Category } from '@/lib/domain/types';
import { caseMatches, caseRow, deptName, isCase, searchTokens, SORT_FN, STATUS_OPTS, statusMatches } from '@/lib/console/derive';
import { useConsole } from '../../_components/ConsoleProvider';
import { CaseFilterDrawer } from '../../_components/CaseFilterDrawer';

const RECENT_KEY = 'cp-console-recent';
const LABEL = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' } as const;
const csv = (v: string | null) => (v ? v.split('|').filter(Boolean) : []);

function SearchInner() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const mob = useMob();
  const { issues, issuesReady } = useConsole();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drawer, setDrawer] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const status = csv(sp.get('status')), areas = csv(sp.get('area')), depts = csv(sp.get('dept')), cats = csv(sp.get('cat'));
  const sort = sp.get('sort') && SORT_FN[sp.get('sort')!] ? sp.get('sort')! : 'score';
  const urlQ = sp.get('q') ?? '';
  const [q, setQ] = useState(urlQ);

  useEffect(() => {
    inputRef.current?.focus();
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')); } catch {}
  }, []);
  useEffect(() => setQ(urlQ), [urlQ]);

  // Same URL-backed filter model as Cases, so both screens share one filter drawer.
  const set = (patch: Record<string, string[] | string | null>) => {
    const n = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join('|') : v;
      if (val) n.set(k, val); else n.delete(k);
    });
    router.replace(`${path}${n.toString() ? `?${n}` : ''}`, { scroll: false });
  };
  useEffect(() => {
    if (q === urlQ) return;
    const t = setTimeout(() => set({ q: q.trim() || null }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const remember = (v: string) => {
    const t = v.trim();
    if (!t) return;
    const next = [t, ...recent.filter((x) => x !== t)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };
  const useQuery = (v: string) => { setQ(v); set({ q: v }); remember(v); inputRef.current?.focus(); };

  const cases = useMemo(() => issues.filter(isCase), [issues]);
  const toks = searchTokens(urlQ);
  const filtered = status.length + areas.length + depts.length + cats.length > 0;
  const results = useMemo(
    () => (toks.length || filtered
      ? cases.filter((i) => (!status.length || status.some((k) => statusMatches(i, k))) && (!areas.length || areas.includes(i.area)) && (!depts.length || depts.includes(deptName(i))) && (!cats.length || cats.includes(i.cat)) && caseMatches(i, toks)).sort(SORT_FN[sort])
      : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, sp],
  );
  const rows = useMemo(() => results.map(caseRow), [results]);

  const uniq = (f: (i: (typeof cases)[number]) => string) => [...new Set(cases.map(f))];
  const sq = urlQ.trim().toLowerCase();
  const matchedAreas = sq ? [
    ...uniq((i) => i.area).filter((a) => a.toLowerCase().includes(sq)).map((a) => ({ l: a, icon: 'ph-map-pin', n: cases.filter((i) => i.area === a).length, href: `/console/cases?area=${encodeURIComponent(a)}` })),
    ...uniq(deptName).filter((a) => a.toLowerCase().includes(sq)).map((a) => ({ l: a, icon: 'ph-buildings', n: cases.filter((i) => deptName(i) === a).length, href: `/console/cases?dept=${encodeURIComponent(a)}` })),
  ] : [];

  const topOf = (f: (i: (typeof cases)[number]) => string) => {
    const c: Record<string, number> = {};
    cases.forEach((i) => { const k = f(i); c[k] = (c[k] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const tries = [
    { l: 'overdue', icon: 'ph-alarm' }, { l: 'pending', icon: 'ph-hourglass-medium' },
    ...(topOf((i) => i.area) ? [{ l: topOf((i) => i.area)!, icon: 'ph-map-pin' }] : []),
    ...(topOf(deptName) ? [{ l: topOf(deptName)!, icon: 'ph-buildings' }] : []),
  ];

  const chips = [
    ...status.map((v) => ({ k: 'Status', l: STATUS_OPTS.find((s) => s[0] === v)?.[1] ?? v, clear: () => set({ status: status.filter((x) => x !== v) }) })),
    ...areas.map((v) => ({ k: 'Area', l: v, clear: () => set({ area: areas.filter((x) => x !== v) }) })),
    ...depts.map((v) => ({ k: 'Dept', l: v, clear: () => set({ dept: depts.filter((x) => x !== v) }) })),
    ...cats.map((v) => ({ k: 'Type', l: CATS[v as Category]?.l ?? v, clear: () => set({ cat: cats.filter((x) => x !== v) }) })),
  ];
  const resetAll = () => set({ status: null, area: null, dept: null, cat: null, sort: null });
  const has = toks.length > 0 || filtered;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: mob ? '18px 16px 28px' : '26px 28px 64px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Search</span>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, height: 48, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
          <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 18 }} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') remember(q); if (e.key === 'Escape') (e.target as HTMLInputElement).blur(); }}
            placeholder="Case ID, street, area, problem, team…" style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }} />
          {q && <button onClick={() => { setQ(''); set({ q: null }); inputRef.current?.focus(); }} aria-label="Clear search" style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><i className="ph-bold ph-x" style={{ fontSize: 11 }} /></button>}
        </div>
        <button onClick={() => setDrawer(true)} title="Filters" style={{ flex: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 48, minWidth: 48, padding: '0 16px', borderRadius: 999, border: `1px solid ${chips.length ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: chips.length ? 'var(--cp-ink)' : 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: chips.length ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxSizing: 'border-box', boxShadow: '0 2px 0 var(--cp-edge)' }}>
          <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />{!mob && 'Filters'}
          {chips.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-pulse)', color: '#fff', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center' }}>{chips.length}</span>}
        </button>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {chips.map((a) => (
            <button key={a.k + a.l} onClick={a.clear} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px 0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--cp-ink-3)' }}>{a.k}</span>{a.l}<i className="ph-bold ph-x" style={{ fontSize: 11 }} />
            </button>
          ))}
          <button onClick={resetAll} style={{ height: 32, padding: '0 8px', border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Clear all</button>
        </div>
      )}

      {!has && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {recent.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={LABEL}>Recent</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recent.map((r) => <button key={r} onClick={() => useQuery(r)} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}><i className="ph-bold ph-clock-counter-clockwise" style={{ color: 'var(--cp-ink-3)' }} />{r}</button>)}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={LABEL}>Try</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tries.map((r) => <button key={r.l} onClick={() => useQuery(r.l)} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 999, border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}><i className={`ph-bold ${r.icon}`} />{r.l}</button>)}
            </div>
          </div>
        </div>
      )}

      {has && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{issuesReady ? `${rows.length} case${rows.length === 1 ? '' : 's'}${matchedAreas.length ? ` · ${matchedAreas.length} area${matchedAreas.length === 1 ? '' : 's'} & departments` : ''}` : 'Searching…'}</span>
          {matchedAreas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: "400 18px/1 'DM Serif Display',serif" }}>Areas &amp; departments</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {matchedAreas.map((a) => (
                  <button key={a.l} onClick={() => { remember(q); router.push(a.href); }} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}>
                    <i className={`ph-bold ${a.icon}`} style={{ color: 'var(--cp-ink-3)' }} />{a.l}<span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{a.n} cases</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {rows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
              {rows.map((r) => (
                <div key={r.id} onClick={() => { remember(q); router.push(`/console/cases/${r.id}`); }} className="cp-hover-row" style={{ display: 'grid', gridTemplateColumns: '42px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 20, color: 'var(--cp-bg)' }} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                    <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ color: 'var(--cp-ink-2)' }}>{r.ref}</span> · {results.find((i) => i.id === r.id)?.street} · {r.dept}</span>
                    <span style={{ font: '600 14px/1.25 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${r.stageIcon}`} />{r.stageShort}</span>
                </div>
              ))}
            </div>
          )}
          {issuesReady && rows.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.5 Outfit,sans-serif' }}>
              No cases match {urlQ ? <>“{urlQ}”</> : 'these filters'}.<br />Only community-created cases are searchable here.
            </div>
          )}
        </div>
      )}

      <CaseFilterDrawer open={drawer} onClose={() => setDrawer(false)} cases={cases} status={status} areas={areas} depts={depts} cats={cats} sort={sort} shown={rows.length} cta="Show results" set={set} reset={resetAll} />
    </div>
  );
}

export default function Search() {
  return <Suspense fallback={null}><SearchInner /></Suspense>;
}
