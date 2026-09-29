'use client';
import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMob } from '@/lib/console/useMob';
import { CATS } from '@/lib/domain/constants';
import type { Category, Issue } from '@/lib/domain/types';
import { byScore, caseMatches, caseRow, deptName, govStage, isCase, isOverdue, isSignal, PIN_COLOR, searchTokens, STATUS_OPTS, type CaseRow } from '@/lib/console/derive';
import type { MapCamera } from '@/lib/console/mapState';
import { useConsole } from '../../_components/ConsoleProvider';
import { ConsoleMap, issueLngLat, type AreaBubble } from '../../_components/ConsoleMap';
import { Combobox } from '../../_components/Combobox';
import { DemoTag, RealOnlyEmpty } from '../../_components/DemoTag';
import { Drawer, FieldLabel, LinkButton, PrimaryButton } from '../../_components/Drawer';

const mapStatus = (i: Issue, k: string) => (k === 'overdue' ? isOverdue(i) : k === 'fixed' ? ['fixed', 'closed'].includes(govStage(i)) : govStage(i) === k);

type Pt = { lngLat: [number, number] };
const centroid = (list: Pt[]): [number, number] => [list.reduce((a, x) => a + x.lngLat[0], 0) / list.length, list.reduce((a, x) => a + x.lngLat[1], 0) / list.length];

function Toggle({ on }: { on: boolean }) {
  return (
    <span style={{ width: 46, height: 28, flex: 'none', borderRadius: 14, background: on ? 'var(--cp-ink)' : 'var(--cp-edge)', position: 'relative', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgb(0 0 0 / .25)', transition: 'left .25s cubic-bezier(.3,1.6,.5,1)' }} />
    </span>
  );
}

function SearchBox({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 44, padding: '0 14px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)' }}>
      <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--cp-ink-3)', fontSize: 16 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} placeholder="Search cases on the map" style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--cp-ink)', font: '500 13.5px/1 Outfit,sans-serif' }} />
      {value && <button onClick={() => onChange('')} aria-label="Clear search" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><i className="ph-bold ph-x" style={{ fontSize: 11 }} /></button>}
    </div>
  );
}

function ListRow({ r, selected, onPick, onHover, hot }: { r: CaseRow; selected: boolean; onPick: () => void; onHover: (on: boolean) => void; hot: boolean }) {
  return (
    <div onClick={onPick} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} className="cp-hover-row"
      style={{ display: 'grid', gridTemplateColumns: '46px minmax(0,1fr) auto', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', alignItems: 'start', background: selected ? 'var(--cp-bg)' : undefined, boxShadow: `inset 3px 0 0 ${r.bar}` }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {r.meta}{r.demo && <DemoTag />}</span>
        <span style={{ font: '600 14px/1.25 Outfit,sans-serif', textWrap: 'pretty' }}>{r.title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${r.stageIcon}`} />{r.stageShort}</span>
          <span style={{ display: 'flex', gap: 3 }}>{r.segs.map((sg, k) => <span key={k} style={{ width: 10, height: 4, borderRadius: 2, background: sg.c }} />)}</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px', borderRadius: 999, border: '1px solid var(--cp-line)', font: '700 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className="ph-bold ph-users-three" />{r.sup}</span>
        {hot && <span style={{ height: 20, padding: '0 7px', borderRadius: 10, background: r.slaBg, color: r.slaFg, font: '600 10.5px/20px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{r.sla}</span>}
      </div>
    </div>
  );
}

function MapInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const mob = useMob();
  const { issues, issuesReady, mapState, showDemo } = useConsole();
  // Come back to exactly what the user left (see lib/console/mapState.ts). An explicit ?sel= from
  // a case's "View on map" wins over the saved selection and camera.
  const saved = mapState.current;
  const explicitSel = sp.get('sel');
  const initialCamera = useRef<MapCamera | null>(explicitSel ? null : saved.camera).current;
  const [sel, setSel] = useState<string | null>(explicitSel ?? saved.sel);
  const [hover, setHover] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(saved.listOpen);
  const [full, setFull] = useState(saved.full);
  const [drawer, setDrawer] = useState<'filters' | 'region' | 'list' | null>(null);
  const [layers, setLayers] = useState(saved.layers);
  const [mSt, setMSt] = useState<string[]>(saved.mSt);
  const [mArea, setMArea] = useState<string[]>(saved.mArea);
  const [mDept, setMDept] = useState<string[]>(saved.mDept);
  const [mCat, setMCat] = useState<string[]>(saved.mCat);
  const [q, setQ] = useState(saved.q);
  const [qd, setQd] = useState(saved.q);
  useEffect(() => { const t = setTimeout(() => setQd(q), 250); return () => clearTimeout(t); }, [q]);
  const [regQ, setRegQ] = useState('');

  const cases = useMemo(() => issues.filter(isCase), [issues]);
  const tokens = useMemo(() => searchTokens(qd), [qd]);
  const shown = useMemo(
    () => cases
      .filter((i) => (!mArea.length || mArea.includes(i.area)) && (!mDept.length || mDept.includes(deptName(i))) && (!mCat.length || mCat.includes(i.cat)) && (!mSt.length || mSt.some((k) => mapStatus(i, k))) && caseMatches(i, tokens))
      .sort(byScore),
    [cases, mArea, mDept, mCat, mSt, tokens],
  );
  const rows = useMemo(() => shown.map(caseRow), [shown]);
  const rowById = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r])), [rows]);

  const hotspots = useMemo<AreaBubble[]>(() => {
    const by: Record<string, Pt[]> = {};
    const open: Record<string, number> = {};
    shown.forEach((i) => {
      (by[i.area] ??= []).push({ lngLat: issueLngLat(i) });
      if (!['closed', 'rejected'].includes(i.stage)) open[i.area] = (open[i.area] || 0) + 1;
    });
    return Object.keys(by).filter((a) => open[a]).map((a) => ({ area: a, lngLat: centroid(by[a]), n: open[a] }));
  }, [shown]);
  const emerging = useMemo<AreaBubble[]>(() => {
    const by: Record<string, Pt[]> = {};
    issues.filter((i) => isSignal(i) && (!mArea.length || mArea.includes(i.area))).forEach((i) => (by[i.area] ??= []).push({ lngLat: issueLngLat(i) }));
    return Object.entries(by).map(([area, l]) => ({ area, lngLat: centroid(l), n: l.length }));
  }, [issues, mArea]);

  const tally = (key: (i: Issue) => string) => {
    const c: Record<string, number> = {};
    cases.forEach((i) => { const k = key(i); c[k] = (c[k] || 0) + 1; });
    return c;
  };
  const areaCount = useMemo(() => tally((i) => i.area), [cases]); // eslint-disable-line react-hooks/exhaustive-deps
  const deptCount = useMemo(() => tally(deptName), [cases]); // eslint-disable-line react-hooks/exhaustive-deps
  const catCount = useMemo(() => tally((i) => i.cat), [cases]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = (c: Record<string, number>) => Object.entries(c).sort((a, b) => b[1] - a[1]);

  const filterN = mSt.length + mArea.length + mDept.length + mCat.length;
  const searching = tokens.length > 0;
  const region = mArea.length === 1 ? mArea[0] : null;
  const openN = shown.filter((i) => !['closed', 'rejected'].includes(i.stage)).length;
  const odN = shown.filter(isOverdue).length;
  const pendN = shown.filter((i) => govStage(i) === 'pending').length;
  const selIssue = sel ? shown.find((i) => i.id === sel) : undefined;
  const selRow = selIssue ? rowById[selIssue.id] : undefined;
  const selPhoto = selIssue?.evidence.find((e) => e.url)?.url;
  const fitKey = `${mSt}|${mArea}|${mDept}|${mCat}|${qd}`;
  const reset = () => { setMSt([]); setMArea([]); setMDept([]); setMCat([]); };
  const pick = (id: string) => { setSel(id); if (mob) setDrawer(null); };

  // Copy state back for the next visit when this screen unmounts (mirrors the citizen HomeScreen).
  const listRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ sel, listOpen, full, layers, mSt, mArea, mDept, mCat, q });
  latest.current = { sel, listOpen, full, layers, mSt, mArea, mDept, mCat, q };
  useEffect(() => () => {
    Object.assign(mapState.current, latest.current, { listScroll: listRef.current?.scrollTop ?? mapState.current.listScroll });
  }, [mapState]);
  const scrollRestored = useRef(false);
  useEffect(() => {
    if (scrollRestored.current || rows.length === 0 || !listRef.current) return;
    scrollRestored.current = true;
    listRef.current.scrollTop = saved.listScroll;
  }, [rows.length, saved.listScroll]);

  const regionTitle = region ?? 'Chennai';
  const pill: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, height: 42, borderRadius: 999, background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '700 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 6px 18px -8px rgb(0 0 0 / .3)' };
  const listBody = (
    <>
      {rows.map((r) => <ListRow key={r.id} r={r} selected={sel === r.id} hot={r.bar !== 'transparent'} onPick={() => pick(r.id)} onHover={(on) => setHover(on ? r.id : null)} />)}
      {issuesReady && cases.length === 0 && !showDemo && <div style={{ padding: 16 }}><RealOnlyEmpty compact /></div>}
      {issuesReady && rows.length === 0 && (cases.length > 0 || showDemo) && <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>{searching ? 'No cases match your search.' : 'No cases match these filters.'}</div>}
    </>
  );
  const regionRows: [string, string, number][] = [['', 'All of Chennai', cases.length], ...sorted(areaCount).filter(([a]) => a.toLowerCase().includes(regQ.trim().toLowerCase())).map(([a, n]): [string, string, number] => [a, a, n])];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: !mob && listOpen && !full ? '380px minmax(0,1fr)' : 'minmax(0,1fr)', height: mob ? 'calc(100dvh - 136px)' : '100dvh', transition: 'grid-template-columns .35s cubic-bezier(.2,.9,.3,1)', animation: 'cp-row .3s ease-out both' }}>
      {!mob && listOpen && !full && (
        <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden', background: 'var(--cp-surface)', borderRight: '1px solid var(--cp-line)' }}>
          <div style={{ padding: '22px 20px 14px', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--cp-line)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ font: "400 28px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{regionTitle}</span>
              <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{rows.length} cases</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setListOpen(false)} title="Hide case list" style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', fontSize: 15, alignSelf: 'center' }}><i className="ph-bold ph-caret-double-left" /></button>
            </div>
            <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{openN} open · {odN} overdue · {pendN} awaiting decision</span>
            <SearchBox value={q} onChange={setQ} />
          </div>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto' }}>{listBody}</div>
        </section>
      )}

      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--cp-map)', minWidth: 0 }}>
        <ConsoleMap cases={shown} hotspots={hotspots} emerging={emerging} showCases={layers.cases} showHotspots={layers.hotspots} showEmerging={layers.emerging}
          selectedId={sel} hoverId={hover} fitKey={fitKey} onPick={pick} initialCamera={initialCamera} onCameraChange={(c) => { mapState.current.camera = c; }} fullscreen={full} onToggleFullscreen={() => setFull((f) => !f)} />

        <div style={{ position: 'absolute', left: 14, right: 72, top: 14, display: 'flex', gap: 8, flexWrap: 'wrap', zIndex: 6 }}>
          {!mob && !listOpen && !full && (
            <button data-glare="1" onClick={() => setListOpen(true)} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 15px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 8px 20px -10px rgb(0 0 0 / .45)' }}><i className="ph-bold ph-list-bullets" />Show list · {rows.length}</button>
          )}
          <button onClick={() => setDrawer('region')} style={{ ...pill, flex: '0 1 auto', minWidth: 0, padding: '0 14px 0 12px', border: '1px solid var(--cp-line)' }}>
            <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', fontSize: 16, flex: 'none' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{regionTitle}</span>
            <i className="ph-bold ph-caret-down" style={{ fontSize: 11, color: 'var(--cp-ink-3)', flex: 'none' }} />
          </button>
          <button onClick={() => setDrawer('filters')} title="Map filters" style={{ ...pill, position: 'relative', flex: 'none', justifyContent: 'center', minWidth: 42, padding: '0 14px', border: `1.5px solid ${filterN ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: filterN ? 'var(--cp-ink)' : 'var(--cp-surface)', color: filterN ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', boxSizing: 'border-box' }}>
            <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />{!mob && 'Filters'}
            {filterN > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-pulse)', color: '#fff', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center' }}>{filterN}</span>}
          </button>
        </div>

        {mob && (
          <button data-glare="1" onClick={() => setDrawer('list')} style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', zIndex: 6, display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 18px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 10px 24px -10px rgb(0 0 0 / .45)' }}><i className="ph-bold ph-list-bullets" />Show list · {rows.length}</button>
        )}

        {selIssue && selRow && (
          <div data-cp-theme="dark" onClick={() => router.push(`/console/cases/${selIssue.id}`)}
            style={{ position: 'absolute', right: 14, bottom: mob ? 76 : 14, width: mob ? 'calc(100% - 28px)' : 380, boxSizing: 'border-box', borderRadius: 22, background: '#0d0d0d', color: '#f5f5f5', border: '1px solid #262626', boxShadow: '0 24px 50px -18px rgb(0 0 0 / .55)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'cp-row .3s cubic-bezier(.2,.9,.3,1.2) both', zIndex: 9, cursor: 'pointer' }}>
            <div style={{ position: 'relative', height: mob ? 96 : 130, flex: 'none', background: selPhoto ? `center/cover url(${selPhoto})` : 'repeating-linear-gradient(135deg,#1a1a1a 0 12px,#222 12px 24px)' }}>
              <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: selRow.stageBg, color: selRow.stageFg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${selRow.stageIcon}`} />{selRow.stageShort}</span>
              <button onClick={(e) => { e.stopPropagation(); setSel(null); }} title="Close" style={{ position: 'absolute', right: 10, top: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgb(0 0 0 / .55)', color: '#fff', cursor: 'pointer', fontSize: 13 }}><i className="ph-bold ph-x" /></button>
              <span style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 5, height: 26, padding: '0 9px', borderRadius: 9, background: '#141414', font: '600 11.5px/1 Outfit,sans-serif' }}><i className="ph-bold ph-images" />{selIssue.evidence.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selRow.ref} · {selRow.meta}</span>
                <span style={{ font: '600 16px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selRow.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '600 12.5px/1 Outfit,sans-serif', color: '#bdbdbd' }}><i className="ph-fill ph-users-three" />{selRow.sup}</span>
                <span style={{ font: '600 12.5px/1 Outfit,sans-serif', color: selRow.slaBg === 'var(--cp-pulse)' ? '#fb923c' : '#bdbdbd', whiteSpace: 'nowrap' }}>{selRow.sla}</span>
                <div style={{ flex: 1 }} />
                <button data-glare="1" onClick={(e) => { e.stopPropagation(); router.push(`/console/cases/${selIssue.id}`); }} style={{ height: 40, padding: '0 16px', borderRadius: 999, background: '#fff', color: '#0f0f0f', border: 'none', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>Open case<i className="ph-bold ph-arrow-right" /></button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Drawer open={drawer === 'filters'} onClose={() => setDrawer(null)} eyebrow="Map" title="Filters"
        footer={<><LinkButton onClick={reset}>Clear all</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={() => setDrawer(null)}>Show {rows.length} cases</PrimaryButton></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FieldLabel>Show on map</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 18, border: '1px solid var(--cp-line)', overflow: 'hidden' }}>
            {([['cases', 'ph-map-pin', 'Cases', 'Pins and clusters', 'var(--cp-peacock-soft)', 'var(--cp-peacock)'], ['hotspots', 'ph-fire', 'Hotspots', 'Areas with the most open cases', 'var(--cp-pulse-soft)', 'var(--cp-pulse-deep)'], ['emerging', 'ph-trend-up', 'Emerging', 'Reports still gathering support', 'var(--cp-marigold-soft)', 'var(--cp-ink)']] as const).map(([k, icon, l, s, ibg, ifg]) => (
              <button key={k} onClick={() => setLayers({ ...layers, [k]: !layers[k] })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: 'none', borderBottom: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 12, background: ibg, color: ifg, display: 'grid', placeItems: 'center', fontSize: 18 }}><i className={`ph-bold ${icon}`} /></span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}><span style={{ font: '600 13.5px/1.1 Outfit,sans-serif' }}>{l}</span><span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{s}</span></span>
                <Toggle on={layers[k]} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><FieldLabel>Status</FieldLabel><span style={{ font: '500 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>Select any</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
            {STATUS_OPTS.map(([k, l]) => {
              const on = mSt.includes(k);
              return (
                <button key={k} onClick={() => setMSt(on ? mSt.filter((x) => x !== k) : [...mSt, k])} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '8px 12px', borderRadius: 14, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}>
                  <span style={{ width: 10, height: 10, flex: 'none', borderRadius: '50%', background: k === 'overdue' ? 'var(--cp-pulse)' : PIN_COLOR[k as keyof typeof PIN_COLOR] }} />
                  <span style={{ flex: 1, minWidth: 0, font: '600 12.5px/1.2 Outfit,sans-serif' }}>{l}</span>
                  <span style={{ font: '700 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{cases.filter((i) => mapStatus(i, k)).length}</span>
                  {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 17, flex: 'none' }} />}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Combobox label="Area" icon="ph-map-pin" placeholder="All areas" multi searchPlaceholder="Search areas" options={sorted(areaCount).map(([v, n]) => ({ value: v, label: v, count: n }))} value={mArea} onChange={setMArea} />
          <Combobox label="Department" icon="ph-buildings" placeholder="All departments" multi searchPlaceholder="Search departments" options={sorted(deptCount).map(([v, n]) => ({ value: v, label: v, count: n }))} value={mDept} onChange={setMDept} />
          <Combobox label="Problem type" icon="ph-squares-four" placeholder="All types" multi searchPlaceholder="Search types" options={(Object.keys(CATS) as Category[]).filter((k) => catCount[k]).map((k) => ({ value: k, label: CATS[k].l, icon: CATS[k].icon, count: catCount[k] }))} value={mCat} onChange={setMCat} />
        </div>
      </Drawer>

      <Drawer open={drawer === 'region'} onClose={() => setDrawer(null)} eyebrow="Map" title="Choose region"
        footer={<><div style={{ flex: 1 }} /><PrimaryButton onClick={() => setDrawer(null)}>Done</PrimaryButton></>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-bg)', flex: 'none' }}>
          <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--cp-ink-3)', fontSize: 18 }} />
          <input value={regQ} onChange={(e) => setRegQ(e.target.value)} placeholder="Search areas" style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {regionRows.map(([v, l, n]) => {
            const on = v === '' ? mArea.length === 0 : region === v;
            return (
              <button key={l} onClick={() => { setMArea(v ? [v] : []); setDrawer(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 12, background: v ? 'var(--cp-surface-2)' : 'var(--cp-ink)', color: v ? 'var(--cp-ink)' : 'var(--cp-bg)', display: 'grid', placeItems: 'center', fontSize: 17 }}><i className={`ph-bold ${v ? 'ph-map-pin' : 'ph-city'}`} /></span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}><span style={{ font: '600 13.5px/1.1 Outfit,sans-serif' }}>{l}</span><span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{n} cases</span></span>
                {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 18 }} />}
              </button>
            );
          })}
        </div>
      </Drawer>

      <Drawer open={drawer === 'list'} onClose={() => setDrawer(null)} eyebrow={regionTitle} title={`${rows.length} cases`}
        footer={<><div style={{ flex: 1 }} /><PrimaryButton onClick={() => setDrawer(null)}>Back to map</PrimaryButton></>}>
        <SearchBox value={q} onChange={setQ} />
        <div style={{ margin: '0 -22px -22px', display: 'flex', flexDirection: 'column' }}>{listBody}</div>
      </Drawer>
    </div>
  );
}

export default function MapPage() {
  return <Suspense fallback={null}><MapInner /></Suspense>;
}
