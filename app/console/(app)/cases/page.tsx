'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { currentOrg } from '@/lib/console/org';
import { useMob } from '@/lib/console/useMob';
import { CATS } from '@/lib/domain/constants';
import type { Category } from '@/lib/domain/types';
import { caseMatches, caseRow, deptName, govStage, isCase, isDemo, isSignal, searchTokens, SORT_FN, SORTS, STATUS_OPTS, statusMatches, type CaseRow, type GovStage } from '@/lib/console/derive';
import { startWork } from '@/server/actions/console-cases';
import { useConsole } from '../../_components/ConsoleProvider';
import { CaseFilterDrawer } from '../../_components/CaseFilterDrawer';
import { CasesBoard } from '../../_components/CasesBoard';
import { DemoTag, RealOnlyEmpty } from '../../_components/DemoTag';
import { SignalsList } from '../../_components/SignalsList';
import { ApproveDrawer, FixDrawer, RejectDrawer } from '../../_components/DecisionDrawers';

const HEAD = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' } as const;
const TABLE_COLS = 'minmax(0,2.6fr) 160px 150px minmax(0,1.3fr) 140px 24px';
const csv = (v: string | null) => (v ? v.split('|').filter(Boolean) : []);

function Thumb({ r, w, h, radius }: { r: CaseRow; w: number; h: number; radius: number }) {
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', border: '1px solid var(--cp-line)', flex: 'none', background: r.photoUrl ? `center/cover url(${r.photoUrl})` : `repeating-linear-gradient(${r.ang},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)` }}>
      <span style={{ position: 'absolute', left: 5, top: 5, width: 22, height: 22, borderRadius: 7, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 12, color: 'var(--cp-bg)' }} /></span>
      <span style={{ position: 'absolute', right: 4, bottom: 4, height: 18, padding: '0 5px', borderRadius: 5, background: 'var(--cp-surface)', font: '700 10px/18px Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 3, color: 'var(--cp-ink)' }}><i className="ph-bold ph-images" />{r.photoN}</span>
    </div>
  );
}

function CasesInner() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const mob = useMob();
  const { issues, issuesReady, toast, showDemo } = useConsole();
  const scope: 'cases' | 'signals' = sp.get('scope') === 'signals' ? 'signals' : 'cases';
  const [open, setOpen] = useState(false);
  const [view, setViewState] = useState<'list' | 'board'>('list');
  const [act, setAct] = useState<{ kind: 'approve' | 'reject' | 'fix' | 'takeup'; id: string } | null>(null);
  useEffect(() => { try { if (localStorage.getItem('cp-console-cases-view') === 'board') setViewState('board'); } catch {} }, []);
  const setView = (v: 'list' | 'board') => { setViewState(v); try { localStorage.setItem('cp-console-cases-view', v); } catch {} };

  const status = csv(sp.get('status')), areas = csv(sp.get('area')), depts = csv(sp.get('dept')), cats = csv(sp.get('cat'));
  const sort = sp.get('sort') && SORT_FN[sp.get('sort')!] ? sp.get('sort')! : 'score';
  const urlQ = sp.get('q') ?? '';
  const [q, setQ] = useState(urlQ);
  useEffect(() => setQ(urlQ), [urlQ]);

  // Filters live in the URL so the Home KPI/hotspot links and browser back/forward all work.
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
    const t = setTimeout(() => set({ q: q.trim() || null }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const cases = useMemo(() => issues.filter(isCase), [issues]);
  const list = useMemo(() => {
    const tokens = searchTokens(urlQ);
    return cases
      .filter((i) => (!status.length || status.some((k) => statusMatches(i, k)))
        && (!areas.length || areas.includes(i.area)) && (!depts.length || depts.includes(deptName(i))) && (!cats.length || cats.includes(i.cat))
        && caseMatches(i, tokens))
      .sort(SORT_FN[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, sp]);
  const rows = useMemo(() => list.map(caseRow), [list]);
  // New signals: reports that have not become cases yet. Status filters do not apply to them.
  const signals = useMemo(() => {
    const tokens = searchTokens(urlQ);
    return issues.filter(isSignal)
      .filter((i) => (!areas.length || areas.includes(i.area)) && (!depts.length || depts.includes(deptName(i))) && (!cats.length || cats.includes(i.cat)) && caseMatches(i, tokens))
      .sort((a, b) => b.created - a.created);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, sp]);
  const signalTotal = useMemo(() => issues.filter(isSignal).length, [issues]);

  const activeChips = [
    ...status.map((v) => ({ k: 'Status', l: STATUS_OPTS.find((s) => s[0] === v)?.[1] ?? v, clear: () => set({ status: status.filter((x) => x !== v) }) })),
    ...areas.map((v) => ({ k: 'Area', l: v, clear: () => set({ area: areas.filter((x) => x !== v) }) })),
    ...depts.map((v) => ({ k: 'Dept', l: v, clear: () => set({ dept: depts.filter((x) => x !== v) }) })),
    ...cats.map((v) => ({ k: 'Type', l: CATS[v as Category]?.l ?? v, clear: () => set({ cat: cats.filter((x) => x !== v) }) })),
  ];
  const filterN = activeChips.length;
  const sortL = SORTS.find((s) => s[0] === sort)![1].toLowerCase();
  const resetAll = () => set({ status: null, area: null, dept: null, cat: null, sort: null });
  // Board drops run the same actions as the buttons on the case page; other moves explain why not.
  const moveCase = async (issue: (typeof list)[number], to: GovStage) => {
    const from = govStage(issue), key = `${from}>${to}`;
    if (from === to) return;
    if (key === 'pending>assigned') return setAct({ kind: 'approve', id: issue.id });
    if (key === 'pending>rejected') return setAct({ kind: 'reject', id: issue.id });
    if (key === 'progress>fixed' || key === 'reopened>fixed') return setAct({ kind: 'fix', id: issue.id });
    if (key === 'assigned>progress') {
      try {
        const t = await auth.currentUser?.getIdToken();
        if (!t) throw new Error('Session expired. Sign in again.');
        await startWork(t, issue.id);
        toast('Work started · citizens notified');
      } catch (e) { toast(e instanceof Error ? e.message : 'Could not start work'); }
      return;
    }
    toast(to === 'closed' ? 'Only citizens can close a case — they confirm after you mark it fixed'
      : to === 'reopened' ? 'Cases reopen automatically when 3 citizens say it isn’t fixed'
      : `Can’t move a case from ${STATUS_OPTS.find((s) => s[0] === from)?.[1] ?? from} to ${STATUS_OPTS.find((s) => s[0] === to)?.[1] ?? to}`);
  };
  const actIssue = act ? issues.find((i) => i.id === act.id) : undefined;
  const openCase = (id: string) => router.push(`/console/cases/${id}`);

  const slaPill = (r: CaseRow, h: number, fs: string) => (
    <span style={{ justifySelf: 'start', height: h, padding: '0 9px', borderRadius: h / 2, background: r.slaBg, color: r.slaFg, font: `600 ${fs}/${h}px Outfit,sans-serif`, whiteSpace: 'nowrap' }}>{r.sla}</span>
  );

  return (
    <div style={{ maxWidth: view === 'board' ? '100%' : 1320, margin: '0 auto', padding: mob ? '18px 16px 28px' : '26px 28px 64px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Cases</span>
          <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)', textWrap: 'pretty' }}>Opened automatically when community support crosses the 80% threshold · {cases.length} {cases.length === 1 ? 'case' : 'cases'} in {currentOrg.short}</span>
        </div>
        {scope === 'cases' && <div role="tablist" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--cp-surface-2)', flex: 'none' }}>
          {([['list', 'List', 'ph-rows'], ['board', 'Board', 'ph-kanban']] as const).map(([k, l, icon]) => {
            const on = view === k;
            return <button key={k} role="tab" aria-selected={on} onClick={() => setView(k)} title={l} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: mob ? '0 11px' : '0 14px', borderRadius: 999, border: 'none', background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none', transition: 'all .2s', whiteSpace: 'nowrap' }}><i className={`ph-bold ${icon}`} style={{ fontSize: 16 }} />{!mob && l}</button>;
          })}
        </div>}
      </div>

      <div role="tablist" aria-label="Cases or new signals" style={{ display: 'flex', gap: 8 }}>
        {([['cases', 'Cases', cases.length], ['signals', 'New signals', signalTotal]] as const).map(([k, l, n]) => {
          const on = scope === k;
          return (
            <button key={k} role="tab" aria-selected={on} onClick={() => set({ scope: k === 'cases' ? null : k })} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-ink)' : 'var(--cp-surface)', color: on ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {l}<span style={{ minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 10, background: on ? 'var(--cp-bg)' : 'var(--cp-surface-2)', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center' }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 16px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)' }}>
          <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--cp-ink-3)', fontSize: 17 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Case ID, title, street, team…" style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--cp-ink)', font: '500 13.5px/1 Outfit,sans-serif' }} />
          {q && <button onClick={() => { setQ(''); set({ q: null }); }} aria-label="Clear search" style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer' }}><i className="ph-bold ph-x" /></button>}
        </div>
        <button onClick={() => setOpen(true)} title="Filters" style={{ flex: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, minWidth: 48, padding: '0 16px', borderRadius: 999, border: `1.5px solid ${filterN ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: filterN ? 'var(--cp-ink)' : 'var(--cp-surface)', color: filterN ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
          <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 17 }} />{!mob && 'Filters'}
          {filterN > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-pulse)', color: '#fff', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center' }}>{filterN}</span>}
        </button>
      </div>

      {filterN > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {activeChips.map((a) => (
            <button key={a.k + a.l} onClick={a.clear} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px 0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--cp-ink-3)' }}>{a.k}</span>{a.l}<i className="ph-bold ph-x" style={{ fontSize: 11 }} />
            </button>
          ))}
          <button onClick={resetAll} style={{ height: 32, padding: '0 8px', border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Clear all</button>
        </div>
      )}

      <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{issuesReady ? (scope === 'signals' ? signals.length : list.length) : '–'} shown{scope === 'cases' ? ` · sorted by ${sortL}` : ' · newest first'}</span>

      {scope === 'signals' ? (
        <SignalsList issues={signals} mob={mob} showDemoTag={isDemo} onTakeUp={(i) => setAct({ kind: 'takeup', id: i.id })} />
      ) : view === 'board' ? (
        <CasesBoard issues={list} statusFilter={status.filter((k): k is GovStage => k !== 'overdue') as GovStage[]} mob={mob} onOpen={openCase} onMove={moveCase} />
      ) : !mob ? (
        <div style={{ borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, gap: 16, padding: '12px 18px', background: 'var(--cp-bg)', borderBottom: '1px solid var(--cp-line)' }}>
            {['Case', 'Status', 'Community', 'Department · Team', 'Target'].map((h) => <span key={h} style={HEAD}>{h}</span>)}<span />
          </div>
          {rows.map((r) => (
            <div key={r.id} onClick={() => openCase(r.id)} className="cp-hover-row" style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, gap: 16, alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', boxShadow: `inset 3px 0 0 ${r.bar}` }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                <Thumb r={r} w={84} h={62} radius={12} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                  <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ color: 'var(--cp-ink-2)' }}>{r.ref}</span> · {r.meta}{r.demo && <DemoTag />}</span>
                  <span style={{ font: '600 14px/1.25 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                  <span style={{ display: 'flex', gap: 3 }}>{r.segs.map((sg, k) => <span key={k} style={{ width: 14, height: 4, borderRadius: 2, background: sg.c }} />)}</span>
                </div>
              </div>
              <span style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${r.stageIcon}`} />{r.stageLabel}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ font: '600 12.5px/1 Outfit,sans-serif' }}>{r.sup} citizens <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {r.conf}%</span></span>
                <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'var(--cp-surface-2)' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: r.confW, borderRadius: 3, background: 'var(--cp-peacock)' }} />
                  <div style={{ position: 'absolute', left: '80%', top: -2, bottom: -2, width: 2, background: 'var(--cp-ink)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ font: '600 12.5px/1.2 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.dept}</span>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.assignee}</span>
              </div>
              {slaPill(r, 24, '11.5px')}
              <i className="ph-bold ph-caret-right" style={{ color: 'var(--cp-ink-3)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
          {rows.map((r) => (
            <div key={r.id} onClick={() => openCase(r.id)} style={{ display: 'grid', gridTemplateColumns: '88px minmax(0,1fr)', gap: 12, alignItems: 'center', padding: 12, borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', boxShadow: `inset 3px 0 0 ${r.bar}` }}>
              <Thumb r={r} w={88} h={74} radius={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <span style={{ font: '500 11.5px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {r.meta}{r.demo && <DemoTag />}</span>
                <span style={{ font: '600 14px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${r.stageIcon}`} />{r.stageShort}</span>
                  {slaPill(r, 22, '11px')}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><i className="ph-bold ph-users-three" />{r.sup}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {scope === 'cases' && issuesReady && cases.length === 0 && !showDemo && <RealOnlyEmpty />}
      {scope === 'cases' && view === 'list' && issuesReady && cases.length > 0 && rows.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif', borderRadius: 20, border: '1.5px dashed var(--cp-line)' }}>No cases match these filters.</div>
      )}

      {act?.kind === 'takeup' && actIssue && <ApproveDrawer key={`t-${act.id}`} mode="takeup" issue={actIssue} open onClose={() => setAct(null)} />}
      {act?.kind === 'approve' && actIssue && <ApproveDrawer key={`a-${act.id}`} issue={actIssue} open onClose={() => setAct(null)} />}
      {act?.kind === 'reject' && actIssue && <RejectDrawer key={`r-${act.id}`} issue={actIssue} open onClose={() => setAct(null)} />}
      {act?.kind === 'fix' && actIssue && <FixDrawer key={`f-${act.id}`} issue={actIssue} open onClose={() => setAct(null)} />}
      <CaseFilterDrawer open={open} onClose={() => setOpen(false)} cases={cases} status={status} areas={areas} depts={depts} cats={cats} sort={sort} shown={list.length} set={set} reset={resetAll} />
    </div>
  );
}

export default function Cases() {
  return <Suspense fallback={null}><CasesInner /></Suspense>;
}
