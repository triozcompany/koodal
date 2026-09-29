'use client';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Segmented } from '@/components/ui';
import { currentOrg } from '@/lib/console/org';
import { useMob } from '@/lib/console/useMob';
import { LANGUAGES, usePrefs } from '@/lib/console/prefs';
import { fdatetime } from '@/lib/console/derive';
import { useConsole } from '../../_components/ConsoleProvider';
import { Drawer, PrimaryButton } from '../../_components/Drawer';

const CARD: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, padding: '18px 18px 8px', borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' };
const SECTION: CSSProperties = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' };
const GHOST: CSSProperties = { height: 44, padding: '0 16px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' };

const NOTIFS: [string, string, string][] = [
  ['threshold', 'New case crosses threshold', 'Instant alert when community support hits 80%'],
  ['sla', 'SLA about to breach', '24 hours before the deadline'],
  ['reopen', 'Case reopened by citizens', 'When 3 citizens say not fixed'],
  ['dispute', 'Citizen disputes a fix', 'Every “not fixed” response'],
  ['digest', 'Daily digest', '7:00 AM summary of your area'],
];
const CHANNELS: [string, string, string][] = [['push', 'Push', 'ph-device-mobile'], ['email', 'Email', 'ph-envelope-simple'], ['sms', 'SMS', 'ph-chat-text']];

function CardTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: "400 20px/1 'DM Serif Display',serif", paddingBottom: 8 }}><i className={`ph-bold ${icon}`} style={{ fontSize: 18 }} />{children}</span>;
}
function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} style={{ width: 48, height: 28, flex: 'none', borderRadius: 14, border: 'none', background: on ? 'var(--cp-leaf)' : 'var(--cp-line)', cursor: 'pointer', padding: 0, transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgb(0 0 0 / .25)', transition: 'left .25s cubic-bezier(.3,1.6,.5,1)' }} />
    </button>
  );
}

function LanguageDrawer({ open, onClose, lang, onPick }: { open: boolean; onClose: () => void; lang: string; onPick: (c: string) => void }) {
  const [q, setQ] = useState('');
  const list = LANGUAGES.filter(([, native, en]) => `${native} ${en}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Drawer dark open={open} onClose={onClose} eyebrow="Settings" title="Console language"
      footer={<><div style={{ flex: 1 }} /><PrimaryButton onClick={onClose}>Done</PrimaryButton></>}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 14px', borderRadius: 999, border: '1.5px solid var(--cp-line)', boxSizing: 'border-box', color: 'var(--cp-ink-3)', flex: 'none' }}>
        <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 16 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search languages" style={{ flex: 1, minWidth: 0, height: '100%', border: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', outline: 'none' }} />
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '-8px -8px 0' }}>
        {list.map(([code, native, en]) => (
          <button key={code} onClick={() => onPick(code)} className="cp-hover-row" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '0 12px', border: 'none', borderRadius: 14, background: lang === code ? 'var(--cp-surface-2)' : 'transparent', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: "600 15px/1.2 Outfit,'Noto Sans Tamil',sans-serif" }}>{native}</span>
              <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{en}</span>
            </span>
            {lang === code && <i className="ph-bold ph-check" style={{ fontSize: 17, color: 'var(--cp-peacock)' }} />}
          </button>
        ))}
        {list.length === 0 && <span style={{ padding: 16, textAlign: 'center', font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>No language matches.</span>}
      </div>
      <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Your choice is saved on this device. Console text is English for now; case content always stays in the language it was reported in.</span>
    </Drawer>
  );
}

export default function Settings() {
  const mob = useMob();
  const { staff, issues, signOut, toast } = useConsole();
  const [prefs, update] = usePrefs();
  const [langOpen, setLangOpen] = useState(false);

  const device = useMemo(() => {
    if (typeof navigator === 'undefined') return 'This browser';
    const ua = navigator.userAgent;
    const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return `${b} · ${/Mobile|Android|iPhone/.test(ua) ? 'phone' : 'computer'}`;
  }, []);

  if (!staff) return null;
  const scoped = staff.depts.length > 0;
  const lang = LANGUAGES.find(([c]) => c === prefs.lang) ?? LANGUAGES[0];

  // The action log is every decision, update and status change visible to this account.
  const exportLog = () => {
    const rows = [['Time', 'Case', 'Action', 'Detail']];
    issues.forEach((i) => i.events.filter((e) => e.kind === 'gov' || e.kind === 'fix').forEach((e) => rows.push([fdatetime(e.ts), i.caseId || i.id, e.title, e.sub])));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'koodal-console-action-log.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Action log downloaded · ${rows.length - 1} entries`);
  };

  return (
    <div data-cp-theme="dark" style={{ minHeight: '100vh', background: 'var(--cp-bg)', color: 'var(--cp-ink)' }}>
    <div style={{ maxWidth: 820, margin: '0 auto', padding: mob ? '18px 16px 28px' : '26px 24px 64px', display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <span style={{ fontFamily: "'DM Serif Display',serif", fontWeight: 400, fontSize: mob ? 30 : 38, lineHeight: 1.05, letterSpacing: '-.03em' }}>Settings</span>

      <span style={{ ...SECTION, marginBottom: -8 }}>Organization</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
        <span style={{ width: 48, height: 48, flex: 'none', borderRadius: 14, background: 'var(--cp-marigold)', color: '#0f0f0f', font: '700 16px/48px Outfit,sans-serif', textAlign: 'center' }}>GC</span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.01em' }}>{currentOrg.name}</span>
          <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Government · you&apos;re {scoped ? 'staff' : 'an admin'}</span>
        </span>
        <span style={{ flex: 'none', height: 26, padding: '0 11px', borderRadius: 999, background: scoped ? 'var(--cp-peacock-soft)' : 'var(--cp-marigold-soft)', color: 'var(--cp-ink)', font: '600 11.5px/26px Outfit,sans-serif' }}>{scoped ? 'Staff' : 'Admin'}</span>
      </div>

      <span style={{ ...SECTION, margin: '4px 0 -8px' }}>Personal</span>

      <div style={CARD}>
        <CardTitle icon="ph-bell">Notifications</CardTitle>
        {NOTIFS.map(([k, l, s]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>{l}</span>
              <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{s}</span>
            </span>
            <Switch on={!!prefs.notif[k]} label={l} onClick={() => update({ notif: { ...prefs.notif, [k]: !prefs.notif[k] } })} />
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '14px 0', borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ flex: '1 1 140px', font: '600 13.5px/1.2 Outfit,sans-serif' }}>Deliver via</span>
          {CHANNELS.map(([k, l, icon]) => {
            const on = !!prefs.ch[k];
            return <button key={k} onClick={() => update({ ch: { ...prefs.ch, [k]: !on } })} aria-pressed={on} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-ink)' : 'var(--cp-surface)', color: on ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}><i className={`ph-bold ${icon}`} />{l}</button>;
          })}
        </div>
      </div>

      <div style={{ ...CARD, gap: 12, padding: 18 }}>
        <CardTitle icon="ph-translate">Language</CardTitle>
        <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Console language. Case content stays in the language citizens used.</span>
        <button onClick={() => setLangOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: "600 14px/1.15 Outfit,'Noto Sans Tamil',sans-serif" }}>{lang[1]}</span>
            <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{lang[2]}</span>
          </span>
          <span style={{ font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Change</span>
          <i className="ph-bold ph-caret-right" style={{ fontSize: 14, color: 'var(--cp-ink-3)' }} />
        </button>
      </div>

      <div style={CARD}>
        <CardTitle icon="ph-lock-key">Security</CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>Two-step verification</span>
            <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>A one-time code at every sign-in. Required for staff accounts.</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--cp-leaf-soft)', font: '600 12px/1 Outfit,sans-serif' }}><i className="ph-fill ph-check-circle" style={{ color: 'var(--cp-leaf)' }} />On</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>Auto sign-out</span>
            <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>After inactivity</span>
          </span>
          <Segmented items={[{ value: '15m', label: '15 min' }, { value: '30m', label: '30 min' }, { value: '60m', label: '60 min' }]} value={prefs.timeout} onChange={(v) => update({ timeout: v as typeof prefs.timeout })} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>Active session</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 11, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 17 }}><i className={`ph-bold ${device.includes('phone') ? 'ph-device-mobile' : 'ph-desktop'}`} /></span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{device}</span>
              <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{currentOrg.city} · active now</span>
            </span>
            <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-leaf)', whiteSpace: 'nowrap' }}>This device</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
          <span style={{ flex: 1, font: '600 13.5px/1.2 Outfit,sans-serif' }}>Password</span>
          <button onClick={() => toast('Password reset link sent to your official email')} style={{ ...GHOST, height: 36, padding: '0 14px', font: '600 12.5px/1 Outfit,sans-serif' }}>Change password</button>
        </div>
      </div>

      <div style={CARD}>
        <CardTitle icon="ph-user-circle">Account</CardTitle>
        {([['Name', staff.name], ['Official email', staff.email ?? '—'], ['Employee ID', staff.id], ['Access level', `${scoped ? staff.depts.join(', ') : 'All departments'} · review, assign & follow up · ${currentOrg.short}`]] as const).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 0', borderTop: '1px solid var(--cp-line)' }}>
            <span style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', flex: 'none' }}>{k}</span>
            <span style={{ font: '600 13px/1.3 Outfit,sans-serif', textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 0 10px', borderTop: '1px solid var(--cp-line)' }}>
          <button onClick={exportLog} style={GHOST}><i className="ph-bold ph-download-simple" />Download action log</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => { signOut(); }} style={{ height: 44, padding: '0 18px', borderRadius: 999, border: '1.5px solid var(--cp-pulse)', background: 'var(--cp-surface)', color: 'var(--cp-pulse-deep)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><i className="ph-bold ph-sign-out" />Sign out</button>
        </div>
      </div>

      <LanguageDrawer open={langOpen} onClose={() => setLangOpen(false)} lang={prefs.lang} onPick={(c) => { update({ lang: c }); const l = LANGUAGES.find(([x]) => x === c)!; toast(`Language set to ${l[2]}`); setLangOpen(false); }} />
    </div>
    </div>
  );
}
