'use client';
import { useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { currentOrg } from '@/lib/console/org';
import { useDesk, useMob } from '@/lib/console/useMob';
import { caseRow, dur, homeData, byScore, isCase, type CaseRow } from '@/lib/console/derive';
import { ago } from '@/lib/domain/rules';
import { useConsole } from '../_components/ConsoleProvider';
import { DemoTag, RealOnlyEmpty } from '../_components/DemoTag';

const LABEL = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' } as const;
const CARD = { display: 'flex', flexDirection: 'column', padding: '18px 18px 6px', borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' } as const;
const SERIF22 = { font: "400 22px/1 'DM Serif Display',serif", letterSpacing: '-.02em' } as const;
const KIND_COLORS: Record<string, [string, string]> = {
  gov: ['var(--cp-peacock-soft)', 'var(--cp-peacock)'], fix: ['var(--cp-leaf-soft)', 'var(--cp-leaf)'],
  community: ['var(--cp-marigold-soft)', 'var(--cp-ink)'], citizen: ['var(--cp-surface-2)', 'var(--cp-ink)'],
};
const GHOST = { height: 40, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' } as const;

function Pill({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) {
  return <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: bg, color: fg, font: '600 11.5px/22px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{children}</span>;
}

export default function Home() {
  const router = useRouter();
  const mob = useMob();
  const wide = useDesk();
  const { staff, issues, issuesReady, showDemo } = useConsole();
  const d = useMemo(() => homeData(issues), [issues]);
  if (!staff) return null;

  const go = (href: string) => router.push(href);
  const open = (id: string, act?: string) => go(`/console/cases/${id}${act ? `?act=${act}` : ''}`);
  const first = staff.name.split(' ')[0];
  const alertN = d.od.length + d.reop.length;
  const wMax = Math.max(...d.weeks.map((w) => Math.max(w.n, w.c)), 1);
  const hMax = Math.max(...d.hot.map((h) => h.score), 1);
  const pendRows = [...d.pend].sort(byScore).slice(0, 5);

  const kpis = [
    { icon: 'ph-fill ph-hourglass-medium', bg: 'var(--cp-marigold)', fg: 'var(--cp-on-marigold)', v: d.pend.length, l: 'Pending approval', s: 'Crossed community threshold', href: '/console/cases?status=pending' },
    { icon: 'ph-bold ph-hard-hat', bg: 'var(--cp-peacock-soft)', fg: 'var(--cp-peacock)', v: d.active.length, l: 'Active cases', s: 'Assigned or in progress', href: '/console/cases' },
    { icon: 'ph-bold ph-alarm', bg: 'var(--cp-pulse)', fg: '#fff', v: d.od.length, l: 'Overdue', s: 'Past SLA deadline', href: '/console/cases?status=overdue' },
    { icon: 'ph-bold ph-arrow-counter-clockwise', bg: 'var(--cp-pulse-soft)', fg: 'var(--cp-pulse-deep)', v: d.reop.length, l: 'Reopened', s: 'Citizens rejected the fix', href: '/console/cases?status=reopened' },
    { icon: 'ph-bold ph-check', bg: 'var(--cp-leaf-soft)', fg: 'var(--cp-leaf)', v: d.fixed.length, l: 'Awaiting confirmation', s: 'Fixed · citizens verifying', href: '/console/cases?status=fixed' },
    { icon: 'ph-bold ph-timer', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink)', v: d.avgRes ? dur(d.avgRes) : '—', l: 'Avg. resolution', s: 'Threshold → fixed', href: '/console/insights' },
  ];

  const pendRow = (r: CaseRow) => (
    <div key={r.id} onClick={() => open(r.id)} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--cp-line)', cursor: 'pointer', animation: 'cp-row .3s ease-out both' }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', flex: 'none' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }} /></div>
      <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {r.meta}{r.demo && <DemoTag />}</span>
        <span style={{ font: '600 14.5px/1.25 Outfit,sans-serif', textWrap: 'pretty' }}>{r.title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: r.sevBg, color: r.sevFg, font: '600 11.5px/1 Outfit,sans-serif' }}>{r.sevL}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><i className="ph-bold ph-users-three" />{r.sup} · {r.conf}%</span>
          <Pill bg={r.slaBg} fg={r.slaFg}>{r.sla}</Pill>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flex: 'none', marginLeft: 'auto' }}>
        <button onClick={(e) => { e.stopPropagation(); open(r.id, 'reject'); }} style={GHOST}>Reject</button>
        <button data-glare="1" onClick={(e) => { e.stopPropagation(); open(r.id, 'approve'); }} style={{ height: 40, padding: '0 16px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><i className="ph-bold ph-check" />Approve</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: mob ? '18px 16px 28px' : `26px ${wide ? 36 : 24}px 64px`, display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <span style={LABEL}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Vanakkam, {first}</span>
          <span style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{staff.title} · {currentOrg.short}</span>
          {staff.depts.length > 0 && (
            <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, background: 'var(--cp-peacock-soft)', font: '600 12px/1 Outfit,sans-serif', marginTop: 4 }}>
              <i className="ph-bold ph-users-three" style={{ color: 'var(--cp-peacock)', fontSize: 14 }} />Showing cases for {staff.depts.join(' and ')}
            </span>
          )}
        </div>
        {!mob && (
          <button onClick={() => go('/console/search')} style={{ ...GHOST, height: 44, padding: '0 16px', color: 'var(--cp-ink-2)', display: 'flex', gap: 10, alignItems: 'center', minWidth: 260, font: '600 13px/1 Outfit,sans-serif' }}>
            <i className="ph-bold ph-magnifying-glass" />
            <span style={{ flex: 1, textAlign: 'left' }}>Case ID, place, department…</span>
            <span style={{ height: 22, padding: '0 7px', borderRadius: 6, background: 'var(--cp-surface-2)', border: '1px solid var(--cp-line)', font: '600 11px/20px Outfit,sans-serif', boxSizing: 'border-box' }}>/</span>
          </button>
        )}
      </div>

      {issuesReady && !showDemo && !issues.some(isCase) && <RealOnlyEmpty compact />}

      {alertN > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 16px', borderRadius: 18, background: 'var(--cp-pulse-soft)', border: '1px solid color-mix(in oklch,var(--cp-pulse) 25%,transparent)' }}>
          <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 12, background: 'var(--cp-pulse)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 19 }}><i className="ph-fill ph-warning" /></span>
          <span style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '700 14px/1.2 Outfit,sans-serif' }}>{d.od.length} overdue · {d.reop.length} reopened</span>
            <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Citizens can see SLA breaches on the public case timeline.</span>
          </span>
          <button onClick={() => go(`/console/cases?status=${d.od.length ? 'overdue' : 'reopened'}`)} style={{ height: 40, padding: '0 16px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>Review now<i className="ph-bold ph-arrow-right" /></button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${mob ? 140 : 170}px,1fr))`, gap: 12 }}>
        {kpis.map((k) => (
          <button key={k.l} onClick={() => go(k.href)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: 16, borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', animation: 'cp-row .3s ease-out both' }}>
            <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: k.bg, color: k.fg, display: 'grid', placeItems: 'center', fontSize: 17 }}><i className={k.icon} /></span>
              <span style={{ flex: 1 }} /><i className="ph-bold ph-caret-right" style={{ color: 'var(--cp-ink-3)', fontSize: 14 }} />
            </span>
            <span style={{ font: "400 36px/1 'DM Serif Display',serif", letterSpacing: '-.03em', marginTop: 4 }}>{issuesReady ? k.v : '–'}</span>
            <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{k.l}</span>
            <span style={{ font: '500 12px/1.25 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{k.s}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0,1.55fr) minmax(320px,1fr)' : 'minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div data-cp-theme="dark" style={{ ...CARD, background: '#0d0d0d', color: '#f5f5f5', border: '1px solid #262626', borderRadius: 24, boxShadow: '0 20px 44px -24px rgb(0 0 0 / .6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
              <span style={SERIF22}>Needs your decision</span>
              <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', font: '700 11.5px/22px Outfit,sans-serif' }}>{d.pend.length}</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => go('/console/cases?status=pending')} style={{ border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>All pending<i className="ph-bold ph-caret-right" /></button>
            </div>
            {pendRows.map((i) => pendRow(caseRow(i)))}
            {issuesReady && d.pend.length === 0 && (
              <div style={{ padding: '24px 0 20px', borderTop: '1px solid var(--cp-line)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--cp-ink-2)', font: '600 13px/1.3 Outfit,sans-serif' }}>
                <i className="ph-fill ph-check-circle" style={{ color: 'var(--cp-leaf)', fontSize: 20 }} />All caught up — no cases waiting for a decision.
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
              <span style={SERIF22}>Overdue &amp; reopened</span>
              <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: 'var(--cp-pulse)', color: '#fff', font: '700 11.5px/22px Outfit,sans-serif' }}>{d.risk.length}</span>
            </div>
            {d.risk.slice(0, 5).map((i) => {
              const r = caseRow(i);
              return (
                <div key={i.id} onClick={() => open(i.id)} style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--cp-line)', cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: r.stageBg, color: r.stageFg, display: 'grid', placeItems: 'center', fontSize: 18 }}><i className={`ph-bold ${r.stageIcon}`} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                    <span style={{ font: '600 13.5px/1.25 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                    <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {r.assignee} · {r.dept}</span>
                  </div>
                  <span style={{ height: 24, padding: '0 9px', borderRadius: 12, background: r.slaBg, color: r.slaFg, font: '600 11.5px/24px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{r.riskL}</span>
                </div>
              );
            })}
            {issuesReady && d.risk.length === 0 && <div style={{ padding: '20px 0', borderTop: '1px solid var(--cp-line)', color: 'var(--cp-ink-3)', font: '600 13px/1.3 Outfit,sans-serif' }}>Nothing overdue or reopened.</div>}
          </div>

          <div style={{ ...CARD, gap: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={SERIF22}>12-week trend</span><div style={{ flex: 1 }} />
              {[['var(--cp-marigold)', 'Cases opened'], ['var(--cp-leaf)', 'Fixed']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', gap: 6, alignItems: 'end', height: 140 }}>
              {d.weeks.map((w, k) => (
                <div key={w.l} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', minWidth: 0, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center', flex: 1 }}>
                    <span title={`${w.n} opened`} style={{ flex: 1, maxWidth: 14, height: Math.max(3, (w.n / wMax) * 110), borderRadius: '4px 4px 2px 2px', background: 'var(--cp-marigold)' }} />
                    <span title={`${w.c} fixed`} style={{ flex: 1, maxWidth: 14, height: Math.max(3, (w.c / wMax) * 110), borderRadius: '4px 4px 2px 2px', background: 'var(--cp-leaf)' }} />
                  </div>
                  <span style={{ font: '500 10px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', visibility: mob && k % 2 ? 'hidden' : 'visible' }}>{w.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div style={{ ...CARD, gap: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={SERIF22}>Hotspots</span><div style={{ flex: 1 }} />
              <button onClick={() => go('/console/map')} style={{ border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>Open map<i className="ph-bold ph-caret-right" /></button>
            </div>
            <button onClick={() => go('/console/map')} aria-label="Open map" style={{ position: 'relative', height: 150, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--cp-line)', background: 'var(--cp-map)', cursor: 'pointer', padding: 0 }}>
              <div style={{ position: 'absolute', inset: '-30%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '34px 34px' }} />
              <div style={{ position: 'absolute', right: '-8%', top: '56%', width: '34%', height: '40%', borderRadius: '50%', background: 'var(--cp-map-water)' }} />
              <div style={{ position: 'absolute', left: '-10%', top: '50%', width: '120%', height: 10, background: 'var(--cp-map-road)', transform: 'rotate(-9deg)' }} />
              {d.hot.map((h) => (
                <span key={h.area} style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, width: 30 + h.open * 18, height: 30 + h.open * 18, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'color-mix(in oklch,var(--cp-pulse) 22%,transparent)', border: '1.5px solid color-mix(in oklch,var(--cp-pulse) 50%,transparent)' }} />
              ))}
            </button>
            {d.hot.slice(0, 5).map((h, k) => (
              <button key={h.area} onClick={() => go(`/console/cases?area=${encodeURIComponent(h.area)}`)} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr) auto', gap: 10, alignItems: 'center', border: 'none', background: 'none', padding: 0, color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ font: "400 18px/1 'DM Serif Display',serif", color: 'var(--cp-ink-3)' }}>{k + 1}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ font: '600 13.5px/1.1 Outfit,sans-serif' }}>{h.area}</span>
                    <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.top}</span>
                  </span>
                  <span style={{ height: 6, borderRadius: 3, background: 'var(--cp-surface-2)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${(h.score / hMax) * 100}%`, borderRadius: 3, background: 'var(--cp-pulse)' }} /></span>
                </span>
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', whiteSpace: 'nowrap' }}>{h.open} open</span>
              </button>
            ))}
          </div>

          <div style={{ ...CARD, gap: 14, padding: 18 }}>
            <span style={SERIF22}>Recent activity</span>
            {d.activity.map(({ e, i }) => {
              const [bg, fg] = KIND_COLORS[e.kind] ?? KIND_COLORS.citizen;
              return (
                <button key={`${i.id}-${e.ts}-${e.title}`} onClick={() => open(i.id)} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) auto', gap: 10, alignItems: 'start', border: 'none', background: 'none', padding: 0, color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 11, background: bg, color: fg, display: 'grid', placeItems: 'center', fontSize: 16 }}><i className={`ph-bold ${e.icon}`} /></span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ font: '600 13px/1.25 Outfit,sans-serif' }}>{e.title}</span>
                    <span style={{ font: '500 12px/1.25 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.caseId || i.id} · {i.title}</span>
                  </span>
                  <span style={{ font: '500 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{ago(e.ts)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
