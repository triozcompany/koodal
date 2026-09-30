'use client';
import { useState, useRef, useEffect } from 'react';
import type { Issue } from '@/lib/domain/types';
import { CATS, issueIcon } from '@/lib/domain/constants';
import { PILL, AVB, SEGC, TRACK } from '@/lib/domain/stage-style';
import { ago, step, slaLeft, corp, proofPhotos } from '@/lib/domain/rules';
import { uploadPhoto } from '@/lib/cloudinary/upload';
import { Confetti } from '../components/Confetti';
import { TimelineSheet } from '../components/TimelineSheet';
import { IssueTopBar } from '../components/IssueTopBar';
import { useApp } from '@/lib/app-context';
import styles from './DetailScreen.module.css';

interface Props {
  issue: Issue;
  supported: boolean;
  opposed?: boolean;
  mob: boolean;
  backLabel?: string;
  meInitials?: string;
  meUid?: string;
  confettiFired?: boolean;
  celebrateOnOpen?: boolean;
  onBack: () => void;
  onSupport: () => void;
  onOppose?: () => void;
  onAddEvidence?: (url?: string) => void;
  onEdit?: () => void;
  onComments?: () => void;
  onPhotos?: () => void;
  onVerify?: () => void;
  onViewCase?: () => void;
  onOpenReport?: (id: string) => void;
  onConfettiDone?: (id: string) => void;
}

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

const MAX_FOLLOWUP_EVIDENCE = 3;

const EVT_COLS: Record<string, [string, string]> = {
  submit:    ['var(--cp-ink)',          'var(--cp-bg)'],
  support:   ['var(--cp-pulse-soft)',   'var(--cp-pulse-deep)'],
  community: ['var(--cp-marigold)',     'var(--cp-on-marigold)'],
  review:    ['var(--cp-peacock-soft)', 'var(--cp-ink)'],
  case:      ['var(--cp-peacock)',      '#fff'],
  progress:  ['var(--cp-pulse)',        '#fff'],
  fix:       ['var(--cp-leaf-soft)',    'var(--cp-ink)'],
  closed:    ['var(--cp-leaf)',         '#fff'],
  reject:    ['var(--cp-surface-2)',    'var(--cp-ink-3)'],
  comment:   ['var(--cp-surface-2)',    'var(--cp-ink)'],
  evidence:  ['var(--cp-surface-2)',    'var(--cp-ink)'],
};

const MOSAIC = [
  { gc: '1', gr: '1 / span 2' },
  { gc: '2', gr: '1' },
  { gc: '3', gr: '1' },
  { gc: '2', gr: '2' },
  { gc: '3', gr: '2' },
];

const ANGLES = ['135deg', '45deg', '90deg', '120deg', '60deg'];

// Shared float button style
const floatBtnBase: React.CSSProperties = {
  width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
  background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',
  border: '1px solid var(--cp-line)',
  boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)',
  color: 'var(--cp-ink)', display: 'grid', placeItems: 'center',
  cursor: 'pointer', fontSize: 19,
};

export function DetailScreen({
  issue: d, supported, opposed = false, mob, backLabel = 'Nearby', meInitials = 'ME', meUid,
  confettiFired = false, celebrateOnOpen = false,
  onBack, onSupport, onOppose, onAddEvidence, onEdit, onComments, onPhotos, onVerify, onViewCase, onOpenReport, onConfettiDone,
}: Props) {
  const { publicConfig: th } = useApp();
  const [holdProg, setHoldProg]     = useState(0);
  const holdTimer                   = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSupportRef                = useRef(onSupport);
  onSupportRef.current              = onSupport;
  const [showConfetti, setShowConfetti] = useState(false);

  // Landed here right after joining an existing report — celebrate once, same
  // one-shot guard (`confettiFired`) the hold-to-support gesture already uses.
  useEffect(() => {
    if (celebrateOnOpen && !confettiFired) setShowConfetti(true);
  }, [celebrateOnOpen, confettiFired]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [cDraft, setCDraft]             = useState('');
  const [vw, setVw]                 = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const timelineRef                 = useRef<HTMLDivElement>(null);
  const scrollRef                   = useRef<HTMLDivElement>(null);
  const evidenceInputRef            = useRef<HTMLInputElement>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const handleEvidenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingEvidence(true);
    try {
      const { url } = await uploadPhoto(file);
      onAddEvidence?.(url);
    } catch (err) {
      console.error('uploadPhoto failed:', err);
    } finally {
      setUploadingEvidence(false);
    }
  };

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cat        = CATS[d.cat];
  const dst        = step(d.stage);
  const [pc, pfg, pl] = PILL[d.stage] ?? PILL.reported;
  const abg        = AVB[nameHash(d.by) % AVB.length];
  const ai         = d.anon ? '' : initials(d.by);
  const place      = `${d.street}, ${d.area}, ${d.city}`;
  const photoN     = Math.max(1, d.evidence?.length ?? 1);
  const contribN   = Math.max(1, new Set((d.evidence ?? []).map(e => e.uid || e.by)).size);
  const preCase    = ['reported', 'community', 'review'].includes(d.stage);
  const rejected   = d.stage === 'rejected';
  const confW      = `${d.conf}%`;
  const confC      = d.caseId || d.conf >= th.caseConfidence ? 'var(--cp-peacock)' : 'var(--cp-marigold)';
  const confNote   = d.caseId
    ? `Now with ${corp(d)} for review`
    : `${corp(d)} review begins at ${th.caseSupporters} supporters or ${th.caseConfidence}% confidence`;
  const hasTags    = (d.tags?.length ?? 0) > 0;
  const hasLinked  = (d.merged?.length ?? 0) > 0;
  const canEdit    = d.mine && !d.caseId;
  const caseOrId   = d.caseId || d.id;
  const trackW     = `${dst * 20}%`;
  const twoCol     = !mob && vw >= 1040;
  const galH       = vw >= 1100 ? '420px' : '320px';

  const actVerify  = d.stage === 'resolved';
  const actDone    = d.stage === 'closed';
  const isActive   = !actVerify && !actDone && !rejected;
  const actMine    = d.mine && isActive;
  const actCase    = !d.mine && !!d.caseId && isActive;
  const actSupport = !d.mine && !d.caseId && isActive;
  const myFollowupEvidence = (d.evidence ?? []).filter(e => e.uid === meUid && e.kind === 'followup').length;
  const canAddEvidence = !actDone && !rejected && myFollowupEvidence < MAX_FOLLOWUP_EVIDENCE;

  const holdBg     = supported ? 'var(--cp-surface-2)' : 'var(--cp-ink)';
  const holdFg     = supported ? 'var(--cp-ink)' : 'var(--cp-bg)';
  const holdLabel  = supported
    ? (d.sup > 1 ? `You + ${d.sup - 1} support this` : 'You support this')
    : holdProg > 0 ? 'Keep holding…' : 'Hold to support';
  const holdIcon   = supported ? 'ph-fill ph-check-circle' : 'ph-bold ph-hand-pointing';
  const holdW      = supported ? '0%' : `${holdProg}%`;
  const holdShadow = holdProg > 0 && !supported ? '0 1px 0 var(--cp-edge)' : '0 4px 0 var(--cp-edge)';
  const holdT      = holdProg > 0 && !supported ? 'translateY(3px) scale(.985)' : 'none';

  const oppBg      = opposed ? 'var(--cp-ink)' : 'var(--cp-surface)';
  const oppFg      = opposed ? 'var(--cp-bg)' : 'var(--cp-ink)';
  const oppIcon    = opposed ? 'ph-fill ph-thumbs-down' : 'ph-bold ph-thumbs-down';

  // Supporter avatar stack (up to 5 overlapping)
  const avatars = [
    { bg: abg, i: ai || '?' },
    ...(d.merged?.slice(0, 4).map((m, k) => ({
      bg: AVB[(nameHash(m.by) + k + 1) % AVB.length],
      i: initials(m.by),
    })) ?? []),
  ].slice(0, 5);
  const extraSup = d.sup > avatars.length ? d.sup - avatars.length : 0;

  const comments = d.comments ?? [];
  const cmtN     = comments.length;
  const cmtShow  = comments.slice(-5);
  const noCmts   = cmtN === 0;

  const events = (d.events ?? []).map((e, k, arr) => {
    const isLast = k === arr.length - 1;
    const live   = isLast && !['closed', 'rejected'].includes(d.stage);
    const [bg, fg] = EVT_COLS[e.kind] ?? EVT_COLS.submit;
    return { ...e, line: !isLast, live, bg, fg };
  });

  useEffect(() => {
    if (holdProg >= 100) {
      setHoldProg(0);
      onSupportRef.current();
      if (!confettiFired) setShowConfetti(true);
    }
  }, [holdProg, confettiFired]);

  function holdStart(ev: React.PointerEvent) {
    if (supported) { onSupport(); return; }
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    holdTimer.current = setInterval(() => {
      setHoldProg(p => {
        if (p >= 100) {
          clearInterval(holdTimer.current!);
          holdTimer.current = null;
          return 100;
        }
        return p + 4;
      });
    }, 30);
  }

  function holdEnd() {
    if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; }
    setHoldProg(0);
  }

  function scrollToTimeline() {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Shared sections ──────────────────────────────────────────────────────────

  const reporterRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 13, background: abg, display: 'grid', placeItems: 'center', font: '700 12px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>
        {d.anon ? <i className="ph-bold ph-detective" style={{ fontSize: 20 }} /> : ai}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '600 13px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.anon ? 'Anonymous' : d.by}</span>
          <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500, flexShrink: 0 }}>· {ago(d.created)}</span>
        </span>
        <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.id} · {cat.l}</span>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: pc, color: pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{pl}</span>
    </div>
  );

  const cellSz   = mob ? 34 : 38;
  const trackTop = mob ? 30 : 32;

  const trackSection = (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', padding: '14px 0 12px', borderRadius: 18, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
      <div style={{ position: 'absolute', left: '10%', right: '10%', top: trackTop, height: 3, background: 'var(--cp-line)' }} />
      <div style={{ position: 'absolute', left: '10%', width: trackW, top: trackTop, height: 3, background: 'var(--cp-ink)' }} />
      {TRACK.map(([icon, label], j) => {
        const done = j < dst;
        const cur  = j === dst && !rejected;
        const bg   = done ? 'var(--cp-ink)' : cur ? SEGC[dst] : 'var(--cp-surface)';
        const fg   = done ? 'var(--cp-bg)'  : cur ? (dst === 1 ? 'var(--cp-on-marigold)' : '#fff') : 'var(--cp-ink-3)';
        const bd   = j <= dst ? 'var(--cp-edge)' : 'var(--cp-line)';
        const lc   = j <= dst ? 'var(--cp-ink)' : 'var(--cp-ink-3)';
        return (
          <div key={label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{ position: 'relative', width: cellSz, height: cellSz, borderRadius: 11, background: bg, border: `2px solid ${bd}`, display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
              {cur && <div style={{ position: 'absolute', inset: -2, borderRadius: 11, background: bg, animation: 'cp-ping 1.8s ease-out infinite', zIndex: -1 }} />}
              <i className={`ph-bold ${icon}`} style={{ fontSize: 16, color: fg }} />
            </div>
            <span style={{ font: '600 11px/1 Outfit,sans-serif', color: lc }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  const aiSummary = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 16, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>
        <i className="ph-fill ph-sparkle" style={{ color: 'var(--cp-pulse)', fontSize: 13 }} />AI SUMMARY · {d.dept}
      </span>
      <span style={{ font: '500 13px/1.45 Outfit,sans-serif' }}>{d.summary || 'AI analysis pending.'}</span>
      {(d.merged?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8, borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 12px/1 Outfit,sans-serif', marginBottom: 4 }}>
            <i className="ph-bold ph-intersect" style={{ color: 'var(--cp-peacock)' }} />
            {d.merged.length} similar reports combined
          </span>
          {d.merged.map((m, k) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '6px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ font: '600 12.5px/1 Outfit,sans-serif' }}>{m.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(m.h)}</span></span>
                <span style={{ font: "500 12.5px/1.3 Outfit,'Noto Sans Tamil',sans-serif", color: 'var(--cp-ink-2)' }}>{m.text}</span>
              </div>
              <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)', flexShrink: 0 }}>{m.sim}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const evidenceSection = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ font: "400 17px/1 'DM Serif Display',serif" }}>Evidence</span>
        <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{photoN} photos · {contribN} people</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(auto-fill,minmax(72px,1fr))' : 'repeat(auto-fill,minmax(110px,1fr))', gap: 6 }}>
        {(d.evidence ?? []).map((e, k) => (
          <div key={k} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: e.url ? undefined : `repeating-linear-gradient(${ANGLES[k % ANGLES.length]},var(--cp-ph-a) 0 6px,var(--cp-ph-b) 6px 12px)` }}>
            {e.url && <img src={e.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <span style={{ position: 'absolute', left: 5, bottom: 5, font: '600 9.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{e.by} · {ago(e.ts)}</span>
          </div>
        ))}
        {canAddEvidence && (
          <button onClick={() => evidenceInputRef.current?.click()} disabled={uploadingEvidence} style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed var(--cp-ink-3)', background: 'transparent', color: 'var(--cp-ink-2)', display: 'grid', placeItems: 'center', cursor: uploadingEvidence ? 'default' : 'pointer', fontSize: 22, opacity: uploadingEvidence ? 0.5 : 1 }}>
            <i className={`ph-bold ${uploadingEvidence ? 'ph-spinner' : 'ph-camera-plus'}`} style={uploadingEvidence ? { animation: 'cp-spin .7s linear infinite' } : undefined} />
          </button>
        )}
        <input ref={evidenceInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleEvidenceFile} />
      </div>
    </>
  );

  // Supporter avatar stack (used in statusBlocks)
  const avatarStack = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {avatars.map((a, k) => (
        <span key={k} style={{ width: 34, height: 34, borderRadius: 11, marginLeft: k > 0 ? -10 : 0, border: '2px solid var(--cp-surface)', background: a.bg, font: '700 11px/30px Outfit,sans-serif', textAlign: 'center', boxSizing: 'border-box', display: 'grid', placeItems: 'center', zIndex: 5 - k, position: 'relative' }}>{a.i}</span>
      ))}
      {extraSup > 0 && (
        <span style={{ height: 28, padding: '0 8px', marginLeft: -8, borderRadius: 999, border: '2px solid var(--cp-surface)', background: 'var(--cp-surface-2)', font: '600 11px/24px Outfit,sans-serif', color: 'var(--cp-ink-2)', boxSizing: 'border-box', display: 'grid', placeItems: 'center', position: 'relative', zIndex: 0 }}>
          +{extraSup}
        </span>
      )}
    </div>
  );

  const statusBlocks = (
    <>
      {preCase && (
        <div style={{ border: '1px solid var(--cp-line)', borderRadius: 20, padding: 16, background: 'var(--cp-surface)', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: "400 35px/0.9 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{d.sup}</span>
              <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>citizens support this</span>
            </div>
            {avatarStack}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1, height: 12, borderRadius: 6, background: 'var(--cp-surface-2)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: confW, borderRadius: 6, background: confC, transition: 'width .8s cubic-bezier(.3,1.4,.5,1)' }} />
              <div style={{ position: 'absolute', left: `${th.caseConfidence}%`, top: -5, bottom: -5, width: 3, borderRadius: 2, background: 'var(--cp-ink)' }} />
            </div>
            <span style={{ font: '700 14px/1 Outfit,sans-serif' }}>{d.conf}%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              [String(contribN), 'added evidence'],
              [String(photoN),   'photos'],
              [String(d.opp ?? 0), 'say not an issue'],
            ].map(([val, lbl]) => (
              <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 12, background: 'var(--cp-surface-2)' }}>
                <span style={{ font: '700 16px/1 Outfit,sans-serif' }}>{val}</span>
                <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{lbl}</span>
              </div>
            ))}
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
            <i className="ph-bold ph-buildings" />{confNote}
          </span>
        </div>
      )}
      {d.caseId && !rejected && (
        <button data-glare="1" onClick={onViewCase} className={styles.caseBtn} style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 16px', borderRadius: 18, border: '1px solid var(--cp-line)', background: 'var(--cp-peacock)', color: '#fff', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.08em', opacity: 0.92 }}>
            <i className="ph-fill ph-bank" />OFFICIAL CASE · {corp(d)}
          </span>
          <span style={{ font: '600 19px/1 Outfit,sans-serif' }}>{d.caseId}</span>
          <span style={{ font: '500 12px/1.3 Outfit,sans-serif', opacity: 0.92 }}>{d.dept} · {d.assignee ?? 'Unassigned'} · {slaLeft(d) || 'On track'}</span>
        </button>
      )}
      {rejected && (() => {
        const rejectPhotos = proofPhotos(d.rejectProof);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 16, background: 'var(--cp-surface-2)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <i className="ph-bold ph-x-circle" style={{ fontSize: 20, flexShrink: 0 }} />
              <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif' }}>Not accepted by {corp(d)}{d.reject ? ` · ${d.reject}` : ''}</span>
            </div>
            {d.rejectNote && (
              <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{d.rejectNote}</span>
            )}
            {d.rejectRef && (
              <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>References case {d.rejectRef}</span>
            )}
            {rejectPhotos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(auto-fill,minmax(72px,1fr))' : 'repeat(auto-fill,minmax(110px,1fr))', gap: 6 }}>
                {rejectPhotos.map((p, k) => (
                  <div key={k} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={p.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', left: 5, bottom: 5, font: '600 9.5px/1 Outfit,sans-serif', color: '#fff', background: 'rgba(0,0,0,.45)', padding: '2px 5px', borderRadius: 5 }}>{p.by} · {ago(p.ts)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
      {(d.stage === 'resolved' || d.stage === 'closed') && (d.fixNote || proofPhotos(d.fixProof).length > 0) && (() => {
        const fixPhotos = proofPhotos(d.fixProof);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 16, background: 'var(--cp-leaf-soft,#ecfdf5)', border: '1px solid var(--cp-leaf,#2DA84E)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <i className="ph-bold ph-seal-check" style={{ fontSize: 20, flexShrink: 0, color: 'var(--cp-leaf,#2DA84E)' }} />
              <span style={{ font: '600 12.5px/1.35 Outfit,sans-serif' }}>Marked fixed by {corp(d)}</span>
            </div>
            {d.fixNote && (
              <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{d.fixNote}</span>
            )}
            {fixPhotos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(auto-fill,minmax(72px,1fr))' : 'repeat(auto-fill,minmax(110px,1fr))', gap: 6 }}>
                {fixPhotos.map((p, k) => (
                  <div key={k} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={p.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', left: 5, bottom: 5, font: '600 9.5px/1 Outfit,sans-serif', color: '#fff', background: 'rgba(0,0,0,.45)', padding: '2px 5px', borderRadius: 5 }}>{p.by} · {ago(p.ts)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
      {hasLinked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ font: "400 16px/1 'DM Serif Display',serif" }}>Reports in this case</span>
            <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{d.merged.length + 1}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            <button className={styles.lkBtn} style={{ flex: 'none', width: 200, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 8px 12px', borderRadius: 16, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', cursor: 'default', textAlign: 'left', color: 'var(--cp-ink)' }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}>
                <span style={{ position: 'absolute', left: 6, top: 6, height: 20, padding: '0 7px', borderRadius: 10, background: 'var(--cp-surface)', font: '600 10.5px/20px Outfit,sans-serif', whiteSpace: 'nowrap' }}>Original report</span>
              </div>
              <span style={{ font: '600 12.5px/1.1 Outfit,sans-serif', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.anon ? 'Anonymous' : d.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(d.created)}</span></span>
              <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', padding: '0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{d.text}</span>
            </button>
            {d.merged.map((m, k) => {
              const clickable = !!m.id;
              return (
                <button
                  key={k}
                  onClick={clickable ? () => onOpenReport?.(m.id!) : undefined}
                  className={styles.lkBtn}
                  style={{ flex: 'none', width: 200, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 8px 12px', borderRadius: 16, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', cursor: clickable ? 'pointer' : 'default', textAlign: 'left', color: 'var(--cp-ink)' }}
                >
                  <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}>
                    <span style={{ position: 'absolute', left: 6, top: 6, height: 20, padding: '0 7px', borderRadius: 10, background: 'var(--cp-surface)', font: '600 10.5px/20px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{m.sim}% match</span>
                  </div>
                  <span style={{ font: '600 12.5px/1.1 Outfit,sans-serif', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {m.h}h ago</span></span>
                  <span style={{ font: '500 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', padding: '0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{m.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  const timelineSection = events.length > 0 ? (
    <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 4px', borderRadius: 18, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ font: "400 16px/1 'DM Serif Display',serif" }}>Timeline</span>
        <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{events.length} updates</span>
      </div>
      {events.map((e, k) => (
        <div key={k} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12, paddingBottom: 14 }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {e.line && <div style={{ position: 'absolute', top: 26, bottom: -14, width: 2, background: 'var(--cp-line)' }} />}
            <div style={{ position: 'relative', width: 26, height: 26, borderRadius: 9, background: e.bg, display: 'grid', placeItems: 'center', zIndex: 1 }}>
              {e.live && <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: e.bg, animation: 'cp-ping 1.6s ease-out infinite', zIndex: -1 }} />}
              <i className={`ph-bold ${e.icon}`} style={{ fontSize: 13, color: e.fg }} />
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
      ))}
    </div>
  ) : null;

  // Comments section — last 5 shown, no inline input, "show all" CTA
  const commentsSection = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
      <span style={{ font: "400 17px/1 'DM Serif Display',serif" }}>
        Comments{' '}
        <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{cmtN}</span>
      </span>
      {cmtShow.map((c, k) => (
        <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'cp-row .3s ease-out both' }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, background: AVB[nameHash(c.by) % AVB.length], display: 'grid', placeItems: 'center', font: '700 11px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>
            {initials(c.by)}
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '600 12px/1.1 Outfit,sans-serif' }}>{c.by} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(c.ts)}</span></span>
            <span style={{ font: "400 13px/1.4 Outfit,'Noto Sans Tamil',sans-serif" }}>{c.text}</span>
          </div>
        </div>
      ))}
      {noCmts && <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>No comments yet. Be the first.</span>}
      <button
        onClick={onComments}
        style={{ alignSelf: 'flex-start', height: 38, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
      >
        <i className="ph-bold ph-chat-circle" />
        {cmtN > 0 ? `View all ${cmtN} comments` : 'Add a comment'}
      </button>
    </div>
  );

  // Desktop/tablet action buttons (no comment button — that's in the header)
  const actionButtons = (
    <>
      {actMine && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {canEdit ? (
            <button data-glare="1" onClick={onEdit} className={styles.actBtn} style={{ flex: '7 1 0', minWidth: 0, height: 56, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14.5px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              <i className="ph-bold ph-pencil-simple" style={{ fontSize: 18 }} />Edit report
            </button>
          ) : (
            <div style={{ flex: '7 1 0', minWidth: 0, height: 56, borderRadius: 16, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '600 13px/1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <i className="ph-bold ph-lock-simple" />With government · locked
            </div>
          )}
        </div>
      )}
      {actSupport && (
        <>
          <button onClick={() => onOppose?.()} className={styles.oppBtn} style={{ flex: '3 1 0', minWidth: 52, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: oppBg, color: oppFg, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', transition: 'background .2s,color .2s' }}>
            <i className={oppIcon} style={{ fontSize: 20 }} />
            <span style={{ font: '700 11px/1 Outfit,sans-serif' }}>{d.opp}</span>
          </button>
          <button
            onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd}
            style={{ position: 'relative', flex: '7 1 0', minWidth: 0, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: holdBg, color: holdFg, boxShadow: holdShadow, transform: holdT, overflow: 'hidden', cursor: 'pointer', touchAction: 'none', userSelect: 'none', transition: 'transform .1s,box-shadow .1s,background .2s' }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: holdW, background: 'var(--cp-pulse-deep)' }} />
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, font: "400 15.5px/1 'DM Serif Display',serif", whiteSpace: 'nowrap' }}>
              <i className={holdIcon} style={{ fontSize: 21 }} />{holdLabel}
            </span>
          </button>
        </>
      )}
      {actCase && (
        <button data-glare="1" onClick={onViewCase} className={styles.actBtn} style={{ flex: 1, width: '100%', height: 60, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <i className="ph-bold ph-bank" style={{ fontSize: 20 }} />Track official case
        </button>
      )}
      {actVerify && (
        <button data-glare="1" onClick={() => onVerify?.()} className={styles.actBtn} style={{ flex: 1, width: '100%', height: 60, borderRadius: 999, background: 'var(--cp-leaf)', color: '#fff', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <i className="ph-bold ph-seal-check" style={{ fontSize: 20 }} />Check the fix
        </button>
      )}
      {actDone && (
        <div style={{ flex: 1, height: 60, borderRadius: 17, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: "400 14px/1 'DM Serif Display',serif" }}>
          <i className="ph-bold ph-check-circle" />Fixed &amp; confirmed
        </div>
      )}
    </>
  );

  // Side button in mobile bottom bar: "View Case" if caseId, else Timeline
  const sideBtn = d.caseId ? (
    <button
      onClick={() => onViewCase?.()}
      style={{ width: 56, height: 60, flexShrink: 0, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-peacock)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
    >
      <i className="ph-bold ph-bank" style={{ fontSize: 18 }} />
      <span style={{ font: '600 9px/1 Outfit,sans-serif' }}>Case</span>
    </button>
  ) : (
    <button
      onClick={() => setShowTimeline(true)}
      style={{ width: 56, height: 60, flexShrink: 0, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
    >
      <i className="ph-bold ph-clock-countdown" style={{ fontSize: 20 }} />
    </button>
  );

  // Mobile-specific bottom bar (state-based + always timeline)
  const mobileBottomBar = (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 28px', background: 'var(--cp-bg)', borderTop: '1px solid var(--cp-line)', display: 'flex', gap: 10, alignItems: 'stretch' }}>
      {actSupport && (
        <>
          <button onClick={() => onOppose?.()} className={styles.oppBtn} style={{ flex: '3 1 0', minWidth: 52, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: oppBg, color: oppFg, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', transition: 'background .2s,color .2s' }}>
            <i className={oppIcon} style={{ fontSize: 20 }} />
            <span style={{ font: '700 11px/1 Outfit,sans-serif' }}>{d.opp}</span>
          </button>
          <button
            onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd}
            style={{ position: 'relative', flex: '7 1 0', minWidth: 0, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: holdBg, color: holdFg, boxShadow: holdShadow, transform: holdT, overflow: 'hidden', cursor: 'pointer', touchAction: 'none', userSelect: 'none', transition: 'transform .1s,box-shadow .1s,background .2s' }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: holdW, background: 'var(--cp-pulse-deep)' }} />
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, font: "400 15.5px/1 'DM Serif Display',serif", whiteSpace: 'nowrap' }}>
              <i className={holdIcon} style={{ fontSize: 21 }} />{holdLabel}
            </span>
          </button>
        </>
      )}
      {actMine && (
        canEdit ? (
          <button data-glare="1" onClick={onEdit} className={styles.actBtn} style={{ flex: '1 1 0', minWidth: 0, height: 60, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14.5px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <i className="ph-bold ph-pencil-simple" style={{ fontSize: 18 }} />Edit report
          </button>
        ) : (
          <div style={{ flex: '1 1 0', minWidth: 0, height: 60, borderRadius: 16, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '600 13px/1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <i className="ph-bold ph-lock-simple" />With government · locked
          </div>
        )
      )}
      {actCase && (
        <button data-glare="1" onClick={onViewCase} className={styles.actBtn} style={{ flex: 1, height: 60, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <i className="ph-bold ph-bank" style={{ fontSize: 20 }} />Track official case
        </button>
      )}
      {actVerify && (
        <button data-glare="1" onClick={() => onVerify?.()} className={styles.actBtn} style={{ flex: 1, height: 60, borderRadius: 999, background: 'var(--cp-leaf)', color: '#fff', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <i className="ph-bold ph-seal-check" style={{ fontSize: 20 }} />Check the fix
        </button>
      )}
      {actDone && (
        <div style={{ flex: 1, height: 60, borderRadius: 17, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: "400 14px/1 'DM Serif Display',serif" }}>
          <i className="ph-bold ph-check-circle" />Fixed &amp; confirmed
        </div>
      )}
      {!actSupport && !actMine && !actCase && !actVerify && !actDone && (
        <div style={{ flex: 1, height: 60, borderRadius: 17, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '600 13px/1 Outfit,sans-serif' }}>
          <i className="ph-bold ph-info" />No action available
        </div>
      )}
      {sideBtn}
    </div>
  );

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────────
  if (mob) {
    return (
      <div style={{ position: 'absolute', inset: 0, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>
        <div ref={scrollRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 120 }}>
          {/* Mosaic photos — same grid as desktop but shorter */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 'min(260px, 56vw)', overflow: 'hidden' }}>
            {MOSAIC.map((m, k) => {
              const url = d.evidence?.[k]?.url;
              return (
                <button
                  key={k}
                  onClick={() => onPhotos?.()}
                  className={styles.mosaicBtn}
                  style={{ position: 'relative', gridColumn: m.gc, gridRow: m.gr, border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', background: url ? undefined : `repeating-linear-gradient(${ANGLES[k]},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)` }}
                >
                  {url
                    ? <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '6px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>photo {k + 1}</span>}
                </button>
              );
            })}
            <div style={{ position: 'absolute', left: 16, bottom: -22, width: 48, height: 48, borderRadius: 14, background: 'var(--cp-ink)', border: '3px solid var(--cp-bg)', display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 2 }}>
              <i className={`ph-bold ${issueIcon(d)}`} style={{ fontSize: 23, color: 'var(--cp-bg)' }} />
            </div>
            <button
              onClick={() => onPhotos?.()}
              className={styles.showAllBtn}
              style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--cp-ink)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px -6px rgb(0 0 0 / .3)', zIndex: 2 }}
            >
              <i className="ph-bold ph-dots-nine" style={{ fontSize: 14 }} />
              <span>Show all {photoN} photos</span>
            </button>
          </div>

          <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reporterRow}
            <div style={{ font: "400 24px/1.05 'DM Serif Display',serif", letterSpacing: '-.025em', textWrap: 'balance' } as React.CSSProperties}>{d.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
              <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', flexShrink: 0 }} />{place}
            </div>
            {d.text && <span style={{ font: "400 14px/1.5 Outfit,'Noto Sans Tamil',sans-serif", color: 'var(--cp-ink)' }}>{d.text}</span>}
            {d.voice && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'var(--cp-surface-2)' }}>
                <i className="ph-fill ph-waveform" style={{ fontSize: 19, color: 'var(--cp-pulse)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ font: "500 12.5px/1.35 'Noto Sans Tamil',Outfit,sans-serif" }}>{d.voice.text}</span>
                  <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Voice · {d.voice.lang}</span>
                </div>
              </div>
            )}
            {hasTags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                {d.tags.map(t => <span key={t} style={{ font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)' }}>#{t}</span>)}
              </div>
            )}
            {trackSection}
            {statusBlocks}
            {aiSummary}
            {evidenceSection}
            {!mob && commentsSection}
            {timelineSection}
          </div>
        </div>

        {/* Floating top bar */}
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', gap: 8 }}>
          <button onClick={onBack} className={styles.floatBtn} style={floatBtnBase}>
            <i className="ph-bold ph-arrow-left" />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onComments} className={styles.floatBtn} style={floatBtnBase}>
            <i className="ph-bold ph-chat-circle" />
          </button>
          {canEdit && (
            <button onClick={onEdit} className={styles.floatBtn} style={floatBtnBase}>
              <i className="ph-bold ph-pencil-simple" />
            </button>
          )}
          <button className={styles.floatBtn} style={floatBtnBase}>
            <i className="ph-bold ph-share-fat" />
          </button>
        </div>

        {mobileBottomBar}
        {showTimeline && <TimelineSheet issue={d} mob={mob} onVerify={onVerify} onClose={() => setShowTimeline(false)} />}
        {showConfetti && <Confetti onDone={() => { setShowConfetti(false); onConfettiDone?.(d.id); }} />}
      </div>
    );
  }

  // ── DESKTOP / TABLET LAYOUT ───────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      {/* Sticky header — does not scroll */}
      <IssueTopBar
        backLabel={backLabel}
        caseOrId={caseOrId}
        shares={d.shares ?? 0}
        onBack={onBack}
        onComments={onComments}
        showEdit={canEdit}
        onEdit={onEdit}
      />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 32px 64px', display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box' }}>

        <div style={{ display: 'grid', gridTemplateColumns: twoCol ? 'minmax(0,1fr) 380px' : 'minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {/* 5-cell mosaic */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: galH, borderRadius: 24, overflow: 'hidden' }}>
              {MOSAIC.map((m, k) => {
                const url = d.evidence?.[k]?.url;
                return (
                  <button
                    key={k}
                    onClick={() => onPhotos?.()}
                    className={styles.mosaicBtn}
                    style={{ position: 'relative', gridColumn: m.gc, gridRow: m.gr, border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', background: url ? undefined : `repeating-linear-gradient(${ANGLES[k]},var(--cp-ph-a) 0 12px,var(--cp-ph-b) 12px 24px)` }}
                  >
                    {url
                      ? <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '6px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>photo {k + 1}</span>}
                  </button>
                );
              })}
              <div style={{ position: 'absolute', left: 18, bottom: 18, width: 52, height: 52, borderRadius: 16, background: 'var(--cp-ink)', border: '3px solid var(--cp-surface)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <i className={`ph-bold ${issueIcon(d)}`} style={{ fontSize: 25, color: 'var(--cp-bg)' }} />
              </div>
              <button
                onClick={() => onPhotos?.()}
                className={styles.showAllBtn}
                style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 14px', borderRadius: 10, border: '1px solid var(--cp-ink)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 6px 16px -8px rgb(0 0 0 / .35)' }}
              >
                <i className="ph-bold ph-dots-nine" style={{ fontSize: 16 }} />
                <span>Show all {photoN} photos</span>
              </button>
            </div>

            {reporterRow}
            <div style={{ font: "400 35px/1.02 'DM Serif Display',serif", letterSpacing: '-.03em', textWrap: 'balance' } as React.CSSProperties}>{d.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
              <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', flexShrink: 0 }} />{place}
            </div>
            {d.text && <span style={{ font: "400 14px/1.5 Outfit,'Noto Sans Tamil',sans-serif", color: 'var(--cp-ink)' }}>{d.text}</span>}
            {d.voice && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'var(--cp-surface-2)' }}>
                <i className="ph-fill ph-waveform" style={{ fontSize: 19, color: 'var(--cp-pulse)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ font: "500 12.5px/1.35 'Noto Sans Tamil',Outfit,sans-serif" }}>{d.voice.text}</span>
                  <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Voice · {d.voice.lang}</span>
                </div>
              </div>
            )}
            {hasTags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                {d.tags.map(t => <span key={t} style={{ font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)' }}>#{t}</span>)}
              </div>
            )}
            {trackSection}
            {aiSummary}
            {evidenceSection}
            {/* On single column (tablet), status blocks flow inline */}
            {!twoCol && statusBlocks}
            {commentsSection}
            {!twoCol && timelineSection}
          </div>

          {/* Right sticky aside (desktop only) */}
          {twoCol && (
            <aside style={{ position: 'sticky', top: 20, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 } as React.CSSProperties}>
              {statusBlocks}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {actionButtons}
              </div>
              {actSupport && (
                <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}>
                  Support counts people, not photos. Adding more photos strengthens evidence.
                </span>
              )}
              {timelineSection}
            </aside>
          )}
        </div>
      </div>
      </div>{/* end scrollable content */}
      {showTimeline && <TimelineSheet issue={d} mob={mob} onVerify={onVerify} onClose={() => setShowTimeline(false)} />}
      {showConfetti && <Confetti onDone={() => { setShowConfetti(false); onConfettiDone?.(d.id); }} />}
    </div>
  );
}
