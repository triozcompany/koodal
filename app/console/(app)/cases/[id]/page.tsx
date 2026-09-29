'use client';
import { Suspense, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { useDesk, useMob } from '@/lib/console/useMob';
import { CATS } from '@/lib/domain/constants';
import { PIN, SEVL } from '@/lib/domain/stage-style';
import { ago, slaLeft, stats } from '@/lib/domain/rules';
import type { Issue, ProofPhoto } from '@/lib/domain/types';
import { caseRow, crossedAt, decisionDeadline, deptName, dur, evTs, fdate, fdatetime, fixTs, govStage, isOverdue, sdate, type GovStage } from '@/lib/console/derive';
import { scheduleInspection, startWork } from '@/server/actions/console-cases';
import { useConsole } from '../../../_components/ConsoleProvider';
import { ApproveDrawer, FixDrawer, PostUpdateDrawer, RejectDrawer } from '../../../_components/DecisionDrawers';
import { Drawer, PrimaryButton } from '../../../_components/Drawer';
import { thumb } from '../../../_components/ProofUploader';
import { DemoTag } from '../../../_components/DemoTag';

const LABEL = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' } as const;
const CARD = { display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' } as const;
const KC: Record<string, [string, string]> = {
  gov: ['var(--cp-peacock-soft)', 'var(--cp-peacock)'], fix: ['var(--cp-leaf-soft)', 'var(--cp-leaf)'],
  community: ['var(--cp-marigold-soft)', 'var(--cp-ink)'], citizen: ['var(--cp-surface-2)', 'var(--cp-ink)'], case: ['var(--cp-peacock-soft)', 'var(--cp-peacock)'],
};
const LIFE: [string, string][] = [['Threshold', 'ph-users-three'], ['Review', 'ph-scales'], ['Assigned', 'ph-user-circle-check'], ['Work', 'ph-hard-hat'], ['Fixed', 'ph-check'], ['Closed', 'ph-seal-check']];
const SEG = ['var(--cp-marigold)', 'var(--cp-marigold)', 'var(--cp-peacock)', 'var(--cp-pulse)', 'var(--cp-leaf)', 'var(--cp-leaf)'];
const LI: Record<GovStage, number> = { pending: 1, rejected: 1, assigned: 2, progress: 3, reopened: 3, fixed: 4, closed: 5 };
const ang = (k: number) => `${(135 + k * 27) % 360}deg`;

function Photo({ url, k, cap, style }: { url?: string; k: number; cap?: string; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', background: url ? `center/cover url(${url})` : `repeating-linear-gradient(${ang(k)},var(--cp-ph-a) 0 12px,var(--cp-ph-b) 12px 24px)`, ...style }}>
      {!url && cap && <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '5px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{cap}</span>}
    </div>
  );
}

function Btn({ children, onClick, tone = 'ghost', h = 50 }: { children: ReactNode; onClick: () => void; tone?: 'primary' | 'ghost'; h?: number }) {
  const primary = tone === 'primary';
  return (
    <button data-glare={primary ? '1' : undefined} onClick={onClick}
      style={{ height: h, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', font: `600 ${primary ? 14.5 : 14}px/1 Outfit,sans-serif`,
        background: primary ? 'var(--cp-ink)' : 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: primary ? 'var(--cp-bg)' : 'var(--cp-ink)',
        border: '1px solid var(--cp-line)', boxShadow: primary ? '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)' : '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)' }}>
      {children}
    </button>
  );
}

// Proof is a list of uploaded photos; older records only have text labels.
const splitProof = (list?: (string | ProofPhoto)[]) => ({
  photos: (list ?? []).filter((p): p is ProofPhoto => typeof p !== 'string'),
  labels: (list ?? []).filter((p): p is string => typeof p === 'string'),
});

function ProofGrid({ photos, labels, onOpen }: { photos: ProofPhoto[]; labels: string[]; onOpen: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 6 }}>
          {photos.map((p, k) => (
            <button key={p.url} onClick={onOpen} aria-label={`Open proof photo ${k + 1}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--cp-line)', padding: 0, cursor: 'pointer', background: 'var(--cp-surface-2)' }}>
              <img src={thumb(p.url, 200)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
      {labels.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{labels.map((l) => <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', borderRadius: 9, background: 'var(--cp-surface-2)', font: '600 12px/1 Outfit,sans-serif' }}><i className="ph-bold ph-paperclip" />{l}</span>)}</div>}
    </div>
  );
}

function CaseDetail({ issue }: { issue: Issue }) {
  const router = useRouter();
  const sp = useSearchParams();
  const mob = useMob();
  const desk = useDesk();
  const { toast } = useConsole();
  const [drawer, setDrawer] = useState<'approve' | 'reject' | 'photos' | 'proof' | 'assign' | 'update' | 'fix' | null>(null);
  const [carI, setCarI] = useState(0);

  const g = govStage(issue), li = LI[g], st = stats(issue), ca = crossedAt(issue), r = caseRow(issue), sv = SEVL[issue.sev];
  const cat = CATS[issue.cat];

  // Home's Approve/Reject buttons arrive here with ?act=; open the drawer once, then clean the URL.
  useEffect(() => {
    const act = sp.get('act');
    if (act && g === 'pending' && (act === 'approve' || act === 'reject')) setDrawer(act);
    if (act) router.replace(`/console/cases/${issue.id}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lifeTs = [ca, ca, evTs(issue, /^Assigned to|^Verified by/), evTs(issue, /^Work started/), fixTs(issue), evTs(issue, /closed/i)];
  if (g === 'rejected') lifeTs[1] = evTs(issue, /^(Verified by|Not accepted)/);
  const timeline = [...issue.events].reverse().map((e) => {
    let { title: t, sub: s } = e;
    if (/reported it$/.test(t)) { t = 'First report received'; s = ''; }
    else if (/joined with a photo/.test(t)) { t = 'Duplicate report merged'; s = 'AI matched a nearby report'; }
    else if (t === 'New evidence contributor') { t = 'New evidence added'; s = ''; }
    else if (t === 'Evidence withdrawn' || /edited by author/.test(t)) s = '';
    else if (/says: not fixed$/.test(t)) s = s ? `Reason: ${s}` : '';
    const [bg, fg] = KC[e.kind] ?? KC.citizen;
    return { t, s, icon: e.icon, bg, fg, date: fdatetime(e.ts), by: e.by, photo: e.photo?.startsWith('http') ? e.photo : '' };
  });

  const photos = issue.evidence;
  const photoN = photos.length;
  const signals = [
    { icon: 'ph-check-circle', v: issue.valYes, l: 'validated on site' }, { icon: 'ph-thumbs-down', v: issue.opp || 0, l: 'said not an issue' },
    { icon: 'ph-users', v: st.contributors, l: 'added evidence' }, { icon: 'ph-images', v: photoN, l: 'photos' },
    { icon: 'ph-intersect', v: issue.merged?.length ?? 0, l: 'duplicates merged' }, { icon: 'ph-chat-circle', v: issue.comments?.length ?? 0, l: 'comments' },
  ];
  const info: [string, string][] = [
    ['Case ID', issue.caseId || 'Issued on approval'], ['Signal ID', issue.id], ['Department', issue.caseId ? deptName(issue) : 'Set on approval'],
    ['Team', issue.caseId ? issue.team || issue.assignee || '—' : 'Set on approval'],
    ['Target date', issue.due ? `${fdate(issue.due)} · ${slaLeft(issue)}` : 'Set on approval'],
    ['First reported', fdatetime(issue.created)], ['Threshold crossed', fdatetime(ca)], ['AI severity', sv[2]],
  ];
  const decLeft = (() => { const left = decisionDeadline(issue) - Date.now(); return left < 0 ? `${dur(-left)} ago` : `in ${dur(left)}`; })();
  const crossedAgo = ago(ca);

  async function inspect() {
    try {
      const t = await auth.currentUser?.getIdToken();
      if (!t) throw new Error('Session expired. Sign in again.');
      await scheduleInspection(t, issue.id);
      toast('Field inspection scheduled within 24 h');
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not schedule'); }
  }
  async function start() {
    try {
      const t = await auth.currentUser?.getIdToken();
      if (!t) throw new Error('Session expired. Sign in again.');
      await startWork(t, issue.id);
      toast('Work started · citizens notified');
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not start work'); }
  }
  const copyLink = () => { try { navigator.clipboard.writeText(window.location.href); } catch {} toast('Link copied'); };
  // Back goes wherever you came from (map, cases, home, search); a direct link falls back to Cases.
  const goBack = () => { if (window.history.length > 1) router.back(); else router.push('/console/cases'); };
  const place = `${issue.street}, ${issue.area}, ${issue.city}`;
  const carN = Math.max(1, Math.min(12, photoN));
  const fixP = splitProof(issue.fixProof), rejP = splitProof(issue.rejectProof);
  const proofPhotos = g === 'rejected' ? rejP.photos : fixP.photos;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: mob ? '18px 16px 28px' : '26px 28px 64px', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      {!mob && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} aria-label="Back" style={{ width: 44, height: 44, flex: 'none', borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}><i className="ph-bold ph-arrow-left" /></button>
          <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>Cases <span style={{ margin: '0 4px' }}>/</span> <span style={{ color: 'var(--cp-ink-2)' }}>{r.ref}</span></span>
          <div style={{ flex: 1 }} />
          <button onClick={copyLink} style={{ flex: 'none', height: 44, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 7, alignItems: 'center', whiteSpace: 'nowrap' }}><i className="ph-bold ph-link-simple" />Copy link</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: desk ? 'minmax(0,1.6fr) minmax(320px,1fr)' : 'minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {!mob ? (
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: 380, borderRadius: 24, overflow: 'hidden' }}>
              {[0, 1, 2, 3, 4].map((k) => (
                <button key={k} onClick={() => setDrawer('photos')} style={{ position: 'relative', gridColumn: k === 0 ? '1' : k === 1 || k === 3 ? '2' : '3', gridRow: k === 0 ? '1 / span 2' : k < 3 ? '1' : '2', border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'none' }}>
                  <Photo url={photos[k]?.url} k={k} cap={k < photoN ? `photo ${k + 1}` : ''} style={{ position: 'absolute', inset: 0 }} />
                </button>
              ))}
              <div style={{ position: 'absolute', left: 16, bottom: 16, width: 48, height: 48, borderRadius: 15, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 23, color: 'var(--cp-bg)' }} /></div>
              <button onClick={() => setDrawer('photos')} style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 14px', borderRadius: 10, border: '1px solid var(--cp-ink)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 6px 16px -8px rgb(0 0 0 / .35)' }}><i className="ph-bold ph-dots-nine" style={{ fontSize: 16 }} />Show all {photoN} photos</button>
            </div>
          ) : (
            <div style={{ position: 'relative', margin: '-18px -16px 0' }}>
              <div onScroll={(e) => { const el = e.currentTarget; setCarI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); }} style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', aspectRatio: '4/3' }}>
                {Array.from({ length: carN }, (_, k) => (
                  <button key={k} onClick={() => setDrawer('photos')} style={{ position: 'relative', flex: 'none', width: '100%', height: '100%', scrollSnapAlign: 'center', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}>
                    <Photo url={photos[k]?.url} k={k} cap={`photo ${k + 1}`} style={{ position: 'absolute', inset: 0 }} />
                  </button>
                ))}
              </div>
              <div style={{ position: 'absolute', left: 14, bottom: 14, width: 40, height: 40, borderRadius: 12, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 19, color: 'var(--cp-bg)' }} /></div>
              <span style={{ position: 'absolute', right: 14, bottom: 14, height: 26, padding: '0 10px', borderRadius: 8, background: 'rgb(0 0 0 / .62)', color: '#fff', font: '600 12px/26px Outfit,sans-serif', pointerEvents: 'none' }}>{carI + 1} / {carN}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: r.stageBg, color: r.stageFg, font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}><i className={`ph-bold ${r.stageIcon}`} />{r.stageLabel}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: sv[0], color: sv[1], font: '600 12px/1 Outfit,sans-serif' }}><i className="ph-fill ph-warning" />{sv[2]}</span>
              {isOverdue(issue) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--cp-pulse)', color: '#fff', font: '600 12px/1 Outfit,sans-serif' }}><i className="ph-bold ph-alarm" />{r.sla}</span>}
              {issue.history && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--cp-surface-2)', font: '600 12px/1 Outfit,sans-serif' }}><i className="ph-bold ph-repeat" />Recurring</span>}
              <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{cat.l} · {issue.id}{r.demo && <DemoTag />}</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 28 : 36, lineHeight: 1.06, letterSpacing: '-.03em', textWrap: 'balance' }}>{issue.title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 13.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)' }} />{place}</span>
          </div>

          <div style={CARD}>
            <span style={LABEL}>Case lifecycle</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 4 }}>
              {LIFE.map(([l, icon], k) => {
                const done = k < li, cur = k === li, rej = g === 'rejected' && k === 1;
                const bg = rej ? 'var(--cp-ink-3)' : done ? SEG[k] : cur ? 'var(--cp-ink)' : 'var(--cp-surface-2)';
                const fg = done || cur || rej ? (done && k < 2 ? 'var(--cp-on-marigold)' : '#fff') : 'var(--cp-ink-3)';
                return (
                  <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, minWidth: 0, textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      {k < 5 && <span style={{ position: 'absolute', left: '50%', right: '-50%', top: '50%', height: 3, marginTop: -1.5, background: k < li ? SEG[k + 1] : 'var(--cp-line)' }} />}
                      <span style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: bg, color: fg, display: 'grid', placeItems: 'center', fontSize: 16, boxShadow: cur && !rej ? '0 0 0 4px color-mix(in oklch,var(--cp-ink) 14%,transparent)' : 'none' }}><i className={`ph-bold ${rej ? 'ph-x' : done ? 'ph-check' : icon}`} /></span>
                    </div>
                    <span style={{ font: '600 11.5px/1.1 Outfit,sans-serif', color: k <= li ? 'var(--cp-ink)' : 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{rej ? 'Rejected' : l}</span>
                    <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{k <= li && lifeTs[k] ? sdate(lifeTs[k]!) : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...CARD, gap: 12 }}>
            <span style={{ ...LABEL, display: 'flex', alignItems: 'center', gap: 7 }}><i className="ph-fill ph-sparkle" style={{ color: 'var(--cp-pulse)', fontSize: 14 }} />AI case summary</span>
            <span style={{ font: '400 15px/1.5 Outfit,sans-serif', textWrap: 'pretty' }}>{issue.summary}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>{(issue.tags ?? []).map((t) => <span key={t} style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-peacock)' }}>#{t}</span>)}</div>
            {issue.history && (
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--cp-marigold-soft)' }}>
                <i className="ph-bold ph-repeat" style={{ fontSize: 18, flex: 'none' }} /><span style={{ font: '500 13px/1.4 Outfit,sans-serif' }}><b>Recurring location.</b> {issue.history}</span>
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={LABEL}>Community signals</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: "400 40px/0.9 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{issue.sup}</span><span style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>citizens support this</span></span>
              </div>
              <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Crossed threshold {crossedAgo} ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1, height: 12, borderRadius: 6, background: 'var(--cp-surface-2)' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: r.confW, borderRadius: 6, background: 'var(--cp-peacock)' }} />
                <div style={{ position: 'absolute', left: '80%', top: -5, bottom: -5, width: 3, borderRadius: 2, background: 'var(--cp-ink)' }} />
              </div>
              <span style={{ font: '700 14px/1 Outfit,sans-serif' }}>{issue.conf}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
              {signals.map((s) => (
                <div key={s.l} style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '11px 12px', borderRadius: 12, background: 'var(--cp-surface-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '700 17px/1 Outfit,sans-serif' }}><i className={`ph-bold ${s.icon}`} style={{ fontSize: 15, color: 'var(--cp-ink-3)' }} />{s.v}</span>
                  <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{s.l}</span>
                </div>
              ))}
            </div>
            <span style={{ display: 'flex', alignItems: 'flex-start', gap: 7, font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}><i className="ph-bold ph-lock-simple" style={{ marginTop: 1 }} />Individual citizen reports and identities are not shown to officials. Signals are aggregated and anonymised by Koodal.</span>
          </div>

          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: "400 19px/1 'DM Serif Display',serif" }}>Evidence</span><span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{photoN} photos · geotagged within 50 m</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8 }}>
              {photos.slice(0, 11).map((p, k) => (
                <button key={k} onClick={() => setDrawer('photos')} style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--cp-line)', padding: 0, cursor: 'pointer', background: 'none' }}>
                  <Photo url={p.url} k={k} style={{ position: 'absolute', inset: 0 }} />
                  {!p.url && <span style={{ position: 'absolute', left: 8, top: 8, font: '500 10.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>photo {k + 1}</span>}
                  <span style={{ position: 'absolute', left: 6, bottom: 6, height: 20, padding: '0 6px', borderRadius: 6, background: 'var(--cp-surface)', font: '600 10.5px/20px Outfit,sans-serif' }}>{ago(p.ts)} ago</span>
                </button>
              ))}
              {photoN > 11 && <div style={{ aspectRatio: '1', borderRadius: 14, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', font: '700 15px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>+{photoN - 11}</div>}
            </div>
          </div>

          <div style={{ ...CARD, gap: 4 }}>
            <span style={{ font: "400 19px/1 'DM Serif Display',serif", paddingBottom: 12 }}>Timeline</span>
            {timeline.map((e, k) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 34, height: 34, flex: 'none', borderRadius: 11, background: e.bg, color: e.fg, display: 'grid', placeItems: 'center', fontSize: 16 }}><i className={`ph-bold ${e.icon}`} /></span>
                  {k < timeline.length - 1 && <span style={{ flex: 1, width: 2, minHeight: 14, background: 'var(--cp-line)' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0 16px', minWidth: 0 }}>
                  <span style={{ font: '600 13.5px/1.25 Outfit,sans-serif' }}>{e.t}</span>
                  {e.s && <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{e.s}</span>}
                  <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', letterSpacing: '.04em' }}>{e.date}{e.by ? ` · by ${e.by}` : ''}</span>
                  {e.photo && <button onClick={() => setDrawer('proof')} aria-label="Open proof photo" style={{ width: 64, height: 64, marginTop: 4, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--cp-line)', padding: 0, cursor: 'pointer', background: 'var(--cp-surface-2)' }}><img src={thumb(e.photo, 200)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ position: desk ? 'sticky' : 'static', top: 20, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {g === 'pending' && (
            <div data-cp-theme="dark" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 24, background: '#0d0d0d', color: '#f5f5f5', border: '1px solid #262626', boxShadow: '0 20px 44px -24px rgb(0 0 0 / .6)' }}>
              <span style={{ ...LABEL, display: 'flex', alignItems: 'center', gap: 7 }}><i className="ph-fill ph-hourglass-medium" style={{ color: 'var(--cp-marigold)', fontSize: 14 }} />Your decision</span>
              <span style={{ font: "400 24px/1.05 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Approve or reject this case</span>
              <span style={{ font: '500 13px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Community threshold crossed {crossedAgo} ago · decision due {decLeft}. Citizens see your decision on their case timeline.</span>
              <Btn tone="primary" h={54} onClick={() => setDrawer('approve')}><i className="ph-bold ph-check-circle" />Approve &amp; assign</Btn>
              <Btn onClick={() => setDrawer('reject')}><i className="ph-bold ph-x-circle" />Reject with reason</Btn>
              <button onClick={inspect} style={{ border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, whiteSpace: 'nowrap' }}><i className="ph-bold ph-binoculars" />Schedule field inspection first</button>
            </div>
          )}
          {(g === 'assigned' || g === 'progress' || g === 'reopened') && (
            <div style={{ ...CARD, gap: 12 }}>
              {g === 'reopened' && (
                <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--cp-pulse-soft)' }}>
                  <i className="ph-bold ph-arrow-counter-clockwise" style={{ fontSize: 18, color: 'var(--cp-pulse-deep)', flex: 'none' }} />
                  <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif' }}><b>Reopened by citizens.</b> {issue.disputes ?? 0} said the fix was incomplete. Fix again and attach new proof.</span>
                </div>
              )}
              <span style={LABEL}>{g === 'assigned' ? 'Case management' : 'Work in progress'}</span>
              <span style={{ font: "400 22px/1.1 'DM Serif Display',serif" }}>{g === 'assigned' ? 'Assigned to ' : ''}{issue.team || issue.assignee}</span>
              <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{deptName(issue)} · {issue.due ? `Target ${sdate(issue.due)}` : 'No target'} · {r.sla}</span>
              {g === 'assigned' ? (
                <Btn tone="primary" h={52} onClick={start}><i className="ph-bold ph-hard-hat" />Start work on site</Btn>
              ) : (
                <button data-glare="1" onClick={() => setDrawer('fix')} style={{ height: 52, borderRadius: 999, background: 'var(--cp-leaf)', color: '#fff', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}><i className="ph-bold ph-check-circle" />Mark as fixed</button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Btn h={46} onClick={() => setDrawer('assign')}><i className="ph-bold ph-pencil-simple" />Edit assignment</Btn>
                <Btn h={46} onClick={() => setDrawer('update')}><i className="ph-bold ph-megaphone" />Post update</Btn>
              </div>
            </div>
          )}
          {g === 'fixed' && (
            <div style={{ ...CARD, gap: 12 }}>
              <span style={LABEL}>Citizens are confirming</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: "400 40px/0.9 'DM Serif Display',serif" }}>{issue.confirms}</span><span style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>of {issue.needed} confirmed fixed</span></span>
              <div style={{ height: 10, borderRadius: 5, background: 'var(--cp-surface-2)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(100, (issue.confirms / issue.needed) * 100)}%`, borderRadius: 5, background: 'var(--cp-leaf)' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 12, background: 'var(--cp-leaf-soft)' }}><span style={{ font: '700 16px/1 Outfit,sans-serif' }}>{issue.confirms}</span><span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>say fixed</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 12, background: 'var(--cp-pulse-soft)' }}><span style={{ font: '700 16px/1 Outfit,sans-serif' }}>{issue.disputes ?? 0}</span><span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>say not fixed</span></div>
              </div>
              {(fixP.photos.length > 0 || fixP.labels.length > 0) && <ProofGrid photos={fixP.photos} labels={fixP.labels} onOpen={() => setDrawer('proof')} />}
              {issue.fixNote && <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{issue.fixNote}</span>}
              <span style={{ font: '500 12px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Closes automatically at {issue.needed} confirmations. Reopens if 3 citizens say it isn&apos;t fixed. Officials can&apos;t close cases directly.</span>
            </div>
          )}
          {g === 'closed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 18, borderRadius: 20, background: 'var(--cp-leaf)', color: '#fff' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase' }}><i className="ph-fill ph-seal-check" style={{ fontSize: 15 }} />Closed by citizens</span>
              <span style={{ font: "400 24px/1.05 'DM Serif Display',serif" }}>{issue.confirms} of {issue.needed} confirmed the fix</span>
              <span style={{ font: '500 13px/1.4 Outfit,sans-serif', opacity: 0.92 }}>Resolved in {fixTs(issue) ? dur(fixTs(issue)! - ca) : '—'} · {issue.team || issue.assignee}</span>
              {fixP.photos.length > 0 && <ProofGrid photos={fixP.photos} labels={[]} onOpen={() => setDrawer('proof')} />}
            </div>
          )}
          {g === 'rejected' && (
            <div style={{ ...CARD, gap: 12 }}>
              <span style={{ ...LABEL, display: 'flex', alignItems: 'center', gap: 7 }}><i className="ph-bold ph-x-circle" style={{ fontSize: 14 }} />Rejected</span>
              <span style={{ font: "400 22px/1.1 'DM Serif Display',serif" }}>{issue.reject}</span>
              {issue.rejectNote && <span style={{ font: '500 13px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{issue.rejectNote}</span>}
              {issue.rejectRef && <span style={{ font: '600 12.5px/1 Outfit,sans-serif' }}>Reference · {issue.rejectRef}</span>}
              <ProofGrid photos={rejP.photos} labels={rejP.labels} onOpen={() => setDrawer('proof')} />
              <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Reason and proof are visible to citizens who supported this case.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 18px', borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
            {info.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--cp-line)' }}>
                <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', flex: 'none' }}>{k}</span>
                <span style={{ font: '600 12.5px/1.3 Outfit,sans-serif', textAlign: 'right', minWidth: 0 }}>{v}</span>
              </div>
            ))}
          </div>

          <button onClick={() => router.push(`/console/map?sel=${issue.id}`)} style={{ position: 'relative', height: 170, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--cp-line)', background: 'var(--cp-map)', cursor: 'pointer', padding: 0 }}>
            <div style={{ position: 'absolute', inset: '-30%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '40px 40px' }} />
            <div style={{ position: 'absolute', left: '-10%', top: '48%', width: '120%', height: 12, background: 'var(--cp-map-road)', transform: 'rotate(-9deg)' }} />
            <span style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, margin: '-9px 0 0 -9px', borderRadius: '50%', background: 'var(--cp-pulse)', animation: 'cp-ping 1.8s ease-out infinite' }} />
            <span style={{ position: 'absolute', left: '50%', top: '50%', width: 38, height: 38, margin: '-19px 0 0 -19px', borderRadius: '50%', background: PIN[issue.stage][0], color: PIN[issue.stage][1], border: '3px solid var(--cp-surface)', display: 'grid', placeItems: 'center', fontSize: 16, boxSizing: 'border-box' }}><i className={`ph-bold ${r.icon}`} /></span>
            <span style={{ position: 'absolute', left: 12, bottom: 12, height: 28, padding: '0 10px', borderRadius: 9, background: 'var(--cp-surface)', font: '600 12px/28px Outfit,sans-serif', color: 'var(--cp-ink)' }}>View on map</span>
          </button>
        </aside>
      </div>

      {g === 'pending' && <ApproveDrawer key={`a-${issue.id}`} issue={issue} open={drawer === 'approve'} onClose={() => setDrawer(null)} />}
      {g === 'pending' && <RejectDrawer key={`r-${issue.id}`} issue={issue} open={drawer === 'reject'} onClose={() => setDrawer(null)} />}
      {drawer === 'assign' && <ApproveDrawer key={`e-${issue.id}`} mode="edit" issue={issue} open onClose={() => setDrawer(null)} />}
      {drawer === 'update' && <PostUpdateDrawer key={`u-${issue.id}`} issue={issue} open onClose={() => setDrawer(null)} />}
      {drawer === 'fix' && <FixDrawer key={`f-${issue.id}`} issue={issue} open onClose={() => setDrawer(null)} />}
      <Drawer open={drawer === 'proof'} onClose={() => setDrawer(null)} eyebrow={r.ref} title={g === 'rejected' ? 'Reject proof' : 'Fix proof'}
        footer={<><div style={{ flex: 1 }} /><PrimaryButton onClick={() => setDrawer(null)}>Done</PrimaryButton></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {proofPhotos.map((p) => (
            <div key={p.url} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
              <img src={p.url} alt="Proof photo" style={{ display: 'block', width: '100%', height: 'auto' }} />
              <span style={{ position: 'absolute', left: 10, bottom: 10, height: 24, padding: '0 9px', borderRadius: 8, background: 'rgb(0 0 0 / .55)', color: '#fff', font: '600 11.5px/24px Outfit,sans-serif' }}>{p.by} · {ago(p.ts)} ago</span>
            </div>
          ))}
        </div>
      </Drawer>
      <Drawer open={drawer === 'photos'} onClose={() => setDrawer(null)} eyebrow={r.ref} title={`${photoN} photos`}
        footer={<><div style={{ flex: 1 }} /><PrimaryButton onClick={() => setDrawer(null)}>Done</PrimaryButton></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {photos.map((p, k) => (
            <div key={k} style={{ position: 'relative', gridColumn: k % 3 === 0 ? '1 / -1' : 'auto', aspectRatio: k % 3 === 0 ? '16 / 10' : '1 / 1', borderRadius: 14, overflow: 'hidden' }}>
              <Photo url={p.url} k={k} cap={`photo ${k + 1}`} style={{ position: 'absolute', inset: 0 }} />
              <span style={{ position: 'absolute', left: 10, bottom: 10, height: 24, padding: '0 9px', borderRadius: 8, background: 'rgb(0 0 0 / .55)', color: '#fff', font: '600 11.5px/24px Outfit,sans-serif' }}>{ago(p.ts)} ago</span>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

function CaseGate() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { issues, issuesReady } = useConsole();
  const issue = useMemo(() => issues.find((i) => i.id === id), [issues, id]);
  if (!issuesReady) return null;
  if (!issue) {
    return (
      <div style={{ padding: '64px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <span style={{ font: "400 28px/1.1 'DM Serif Display',serif" }}>Case not found</span>
        <span style={{ font: '500 13.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>It may be outside your departments or no longer exist.</span>
        <PrimaryButton onClick={() => router.push('/console/cases')}>Back to cases</PrimaryButton>
      </div>
    );
  }
  return <CaseDetail issue={issue} />;
}

export default function CasePage() {
  return <Suspense fallback={null}><CaseGate /></Suspense>;
}
