'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase/client';
import type { Issue } from '@/lib/domain/types';
import { D } from '@/lib/domain/constants';
import { approveCase, editAssignment, markFixed, postUpdate, rejectCase } from '@/server/actions/console-cases';
import { deptName, fdate, govDepts, rejectReasons } from '@/lib/console/derive';
import { getConfig } from '@/lib/console/config';
import { Drawer, FieldLabel, LinkButton, PrimaryButton } from './Drawer';
import { Combobox } from './Combobox';
import { ProofUploader, type UploadedProof } from './ProofUploader';
import { deleteCloudinaryImages } from '@/server/actions/cloudinary';
import { useConsole } from './ConsoleProvider';

const TEXTAREA = { padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: "500 13.5px/1.45 Outfit,'Noto Sans Tamil',sans-serif", outline: 'none', resize: 'vertical' } as const;
const Note = ({ children }: { children: string }) => (
  <span style={{ display: 'flex', gap: 8, font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}><i className="ph-bold ph-eye" style={{ marginTop: 1, flex: 'none' }} />{children}</span>
);

async function token() {
  const t = await auth.currentUser?.getIdToken();
  if (!t) throw new Error('Session expired. Sign in again.');
  return t;
}

function at18(ts: number) { const d = new Date(ts); d.setHours(18, 0, 0, 0); return d.getTime(); }
const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

function Calendar({ due, onPick }: { due: number; onPick: (t: number) => void }) {
  const [off, setOff] = useState(0);
  const now = new Date(), tod = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dd = new Date(due);
  const base = new Date(dd.getFullYear(), dd.getMonth() + off, 1);
  const y = base.getFullYear(), mo = base.getMonth(), lead = (base.getDay() + 6) % 7, nd = new Date(y, mo + 1, 0).getDate();
  const canPrev = base.getTime() > new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const left = Math.round((new Date(dd.getFullYear(), dd.getMonth(), dd.getDate()).getTime() - tod) / D);
  const nav = { width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', display: 'grid', placeItems: 'center' } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 2px 0 var(--cp-edge),0 14px 28px -20px rgb(0 0 0 / .3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => canPrev && setOff(off - 1)} aria-label="Previous month" style={{ ...nav, opacity: canPrev ? 1 : 0.35 }}><i className="ph-bold ph-caret-left" style={{ fontSize: 13 }} /></button>
        <span style={{ flex: 1, textAlign: 'center', font: '600 15px/1 Outfit,sans-serif' }}>{base.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setOff(off + 1)} aria-label="Next month" style={nav}><i className="ph-bold ph-caret-right" style={{ fontSize: 13 }} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 2 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, k) => <span key={k} style={{ textAlign: 'center', font: '600 11px/28px Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{w}</span>)}
        {Array.from({ length: lead }, (_, k) => <span key={`l${k}`} />)}
        {Array.from({ length: nd }, (_, k) => {
          const n = k + 1, t = new Date(y, mo, n).getTime(), on = sameDay(t, due), past = t < tod, today = t === tod;
          return (
            <button key={n} disabled={past} onClick={() => onPick(new Date(y, mo, n, 18).getTime())}
              style={{ aspectRatio: '1', maxHeight: 44, width: '100%', borderRadius: '50%', border: `1.5px solid ${today && !on ? 'var(--cp-ink-3)' : 'transparent'}`, background: on ? 'var(--cp-ink)' : 'transparent', color: on ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: past ? 'default' : 'pointer', opacity: past ? 0.3 : 1, textDecoration: past ? 'line-through' : 'none', padding: 0 }}>{n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: '1px solid var(--cp-line)', font: '600 12.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
        <i className="ph-bold ph-calendar-check" />
        <span style={{ flex: 1 }}>{dd.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span style={{ color: 'var(--cp-ink-3)' }}>{left === 0 ? 'Today' : left === 1 ? 'Tomorrow' : `in ${left} days`}</span>
      </div>
    </div>
  );
}

export function ApproveDrawer({ issue, open, onClose, mode = 'approve' }: { issue: Issue; open: boolean; onClose: () => void; mode?: 'approve' | 'edit' | 'takeup' }) {
  const edit = mode === 'edit';
  const takeup = mode === 'takeup';
  const { toast } = useConsole();
  const depts = govDepts();
  const days = getConfig().targetDaysBySeverity[issue.sev] ?? 7;
  const t0 = at18(Date.now());
  const own = depts.find((g) => g.dept === deptName(issue));
  const [dept, setDept] = useState(own?.dept ?? '');
  const [team, setTeam] = useState((edit && issue.team) || own?.team || '');
  const [due, setDue] = useState((edit && issue.due) || t0 + days * D);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = !!(dept && team && due);
  const quick: [string, number][] = getConfig().quickTargetDays.map((n) => [n % 7 === 0 ? `In ${n / 7} ${n === 7 ? 'week' : 'weeks'}` : `In ${n} days`, n]);

  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    try {
      if (edit) {
        await editAssignment(await token(), issue.id, { dept, team, due });
        toast(`Assignment updated · ${team} · ${fdate(due)}`);
      } else {
        const r = await approveCase(await token(), issue.id, { dept, team, due, note }, { early: takeup });
        toast(`${takeup ? 'Taken up' : 'Approved'} · ${r.caseId} → ${team} · ${fdate(due)}`);
      }
      onClose();
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not approve'); }
    setBusy(false);
  }

  return (
    <Drawer open={open} onClose={onClose} eyebrow={issue.caseId || issue.id} title={edit ? 'Edit assignment' : takeup ? 'Take up as case' : 'Approve & assign'}
      footer={<><LinkButton onClick={onClose}>Cancel</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={submit} disabled={!ok || busy}><i className={`ph-bold ${edit ? 'ph-floppy-disk' : 'ph-check-circle'}`} style={{ marginRight: 8 }} />{edit ? 'Save assignment' : takeup ? 'Take up & assign' : 'Approve & assign'}</PrimaryButton></>}>
      <span style={{ font: '500 13px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', marginTop: -10 }}>{issue.title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Combobox label="Department" icon="ph-buildings" placeholder="Choose a department"
          options={depts.map((g) => ({ value: g.dept, label: g.dept, sub: g.team, icon: g.icon }))} value={dept ? [dept] : []}
          onChange={(v) => { const g = depts.find((x) => x.dept === v[0]); setDept(g?.dept ?? ''); setTeam(g?.team ?? ''); }} searchPlaceholder="Search departments" />
        <Combobox label="Team" icon="ph-users-three" placeholder="Choose a team"
          options={depts.flatMap((g) => g.teams.map((t) => ({ value: t, label: t, sub: g.dept, icon: 'ph-users-three' })))} value={team ? [team] : []}
          onChange={(v) => setTeam(v[0] ?? '')} searchPlaceholder="Search teams" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Target date</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quick.map(([l, n]) => {
            const on = sameDay(due, t0 + n * D);
            return <button key={l} onClick={() => setDue(t0 + n * D)} style={{ height: 36, padding: '0 12px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-ink)' : 'var(--cp-surface)', color: on ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>{l}</button>;
          })}
        </div>
        <Calendar due={due} onPick={setDue} />
      </div>
      {ok && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 14, background: 'var(--cp-surface-2)', font: '600 13px/1.3 Outfit,sans-serif' }}>
          <i className="ph-bold ph-buildings" />{dept}<i className="ph-bold ph-arrow-right" style={{ color: 'var(--cp-ink-3)', fontSize: 12 }} />{team}<i className="ph-bold ph-arrow-right" style={{ color: 'var(--cp-ink-3)', fontSize: 12 }} />{fdate(due)}
        </div>
      )}
      {!edit && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel>Message to citizens · optional</FieldLabel>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Team will inspect the manhole tomorrow morning." style={TEXTAREA} />
        </label>
      )}
      <Note>{edit ? 'Supporters see the change on the case timeline.' : takeup ? 'Opens an official case now, before the community threshold. Supporters see that it was taken up early, plus the department, team and target date.' : 'An official case ID is issued. Every supporter sees the department, team and target date.'}</Note>
    </Drawer>
  );
}

export function RejectDrawer({ issue, open, onClose }: { issue: Issue; open: boolean; onClose: () => void }) {
  const { toast } = useConsole();
  const [reason, setReason] = useState<string | null>(null);
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<UploadedProof[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const okR = !!reason, okN = note.trim().length >= 15, okP = proof.length > 0 && !uploading, ok = okR && okN && okP;

  // Closing without submitting must not leave uploaded photos orphaned in Cloudinary.
  const cancel = () => { if (proof.length) deleteCloudinaryImages(proof.map((p) => p.publicId)).catch(() => {}); onClose(); };

  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    try {
      await rejectCase(await token(), issue.id, { reason: reason!, note, proof: proof.map(({ url, publicId }) => ({ url, publicId })), ref });
      toast('Case rejected · supporters notified with reason');
      onClose();
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not reject'); }
    setBusy(false);
  }

  return (
    <Drawer open={open} onClose={cancel} eyebrow={issue.caseId || issue.id} title="Reject this case"
      footer={<><LinkButton onClick={cancel}>Cancel</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={submit} disabled={!ok || busy} style={{ background: 'var(--cp-pulse)', color: '#fff' }}><i className="ph-bold ph-x-circle" style={{ marginRight: 8 }} />Reject case</PrimaryButton></>}>
      <span style={{ font: '500 13px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', marginTop: -10 }}>{issue.title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Reason · required</FieldLabel>
        {rejectReasons().map(({ label: l, icon }) => {
          const on = reason === l;
          return (
            <button key={l} onClick={() => setReason(l)} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 14, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left' }}>
              <i className={`ph-bold ${icon}`} style={{ fontSize: 17, color: 'var(--cp-ink-2)' }} /><span style={{ flex: 1 }}>{l}</span>{on && <i className="ph-fill ph-check-circle" style={{ fontSize: 19 }} />}
            </button>
          );
        })}
        {rejectReasons().find((x) => x.label === reason)?.needsRef && (
          <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Existing case ID, e.g. CP-CHN-24781" style={{ height: 46, padding: '0 14px', borderRadius: 14, border: '1.5px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', outline: 'none' }} />
        )}
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Explanation · required</FieldLabel>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Explain what the inspection found, in plain words citizens will understand." style={TEXTAREA} />
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Supporting photos · required</FieldLabel>
        <ProofUploader value={proof} onChange={setProof} onBusyChange={setUploading} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 14, background: 'var(--cp-surface-2)' }}>
        {([[okR, 'Reason selected'], [okN, 'Explanation (15+ characters)'], [okP, uploading ? 'Uploading photos…' : 'At least one photo uploaded']] as [boolean, string][]).map(([g, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 12.5px/1.2 Outfit,sans-serif', color: g ? 'var(--cp-ink)' : 'var(--cp-ink-3)' }}><i className={g ? 'ph-fill ph-check-circle' : 'ph-bold ph-circle'} style={{ fontSize: 16 }} />{l}</span>
        ))}
      </div>
      <Note>The reason, explanation and photos are shown to every citizen who supported this case.</Note>
    </Drawer>
  );
}

export function PostUpdateDrawer({ issue, open, onClose }: { issue: Issue; open: boolean; onClose: () => void }) {
  const { toast } = useConsole();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = note.trim().length >= 5;
  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    try { await postUpdate(await token(), issue.id, note); toast('Update posted to citizens'); onClose(); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not post'); }
    setBusy(false);
  }
  return (
    <Drawer open={open} onClose={onClose} eyebrow={issue.caseId || issue.id} title="Post an update"
      footer={<><LinkButton onClick={onClose}>Cancel</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={submit} disabled={!ok || busy}><i className="ph-bold ph-megaphone" style={{ marginRight: 8 }} />Post update</PrimaryButton></>}>
      <span style={{ font: '500 13px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', marginTop: -10 }}>{issue.title}</span>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Message to citizens</FieldLabel>
        <textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="e.g. Material has arrived, work resumes Monday." style={TEXTAREA} />
      </label>
      <Note>Posted on the public case timeline and sent to all supporters.</Note>
    </Drawer>
  );
}

export function FixDrawer({ issue, open, onClose }: { issue: Issue; open: boolean; onClose: () => void }) {
  const { toast } = useConsole();
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<UploadedProof[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = proof.length > 0 && !uploading;
  const cancel = () => { if (proof.length) deleteCloudinaryImages(proof.map((p) => p.publicId)).catch(() => {}); onClose(); };
  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    try { await markFixed(await token(), issue.id, { note, proof: proof.map(({ url, publicId }) => ({ url, publicId })) }); toast('Marked fixed · citizens asked to confirm'); onClose(); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not mark fixed'); }
    setBusy(false);
  }
  return (
    <Drawer open={open} onClose={cancel} eyebrow={issue.caseId || issue.id} title="Mark as fixed"
      footer={<><LinkButton onClick={cancel}>Cancel</LinkButton><div style={{ flex: 1 }} /><PrimaryButton onClick={submit} disabled={!ok || busy} style={{ background: 'var(--cp-leaf)', color: '#fff' }}><i className="ph-bold ph-check-circle" style={{ marginRight: 8 }} />Send for confirmation</PrimaryButton></>}>
      <span style={{ font: '500 13px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', marginTop: -10 }}>{issue.title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>After photos · required</FieldLabel>
        <ProofUploader value={proof} onChange={setProof} onBusyChange={setUploading} />
        {uploading && <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Uploading… you can send once every photo is in.</span>}
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Work summary · optional</FieldLabel>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Manhole cover replaced, road surface patched." style={TEXTAREA} />
      </label>
      <Note>{`Citizens will be asked to confirm. ${getConfig().fixConfirmsNeeded} confirmations close the case; 3 “not fixed” responses reopen it.`}</Note>
    </Drawer>
  );
}
