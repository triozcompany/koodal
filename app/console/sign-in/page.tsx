'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMob } from '@/lib/console/useMob';
import { currentOrg } from '@/lib/console/org';
import { checkStaffCredentials, signInStaff } from '@/server/actions/console-auth';
import { useConsole } from '../_components/ConsoleProvider';
import { FieldLabel, PrimaryButton } from '../_components/Drawer';
import { TEST_STAFF, TEST_STAFF_PASSWORD } from '@/lib/seed/accounts';
import { getPublicConfig } from '@/server/actions/public-config';

const INPUT = { height: 54, padding: '0 18px', borderRadius: 16, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 15px/1 Outfit,sans-serif', outline: 'none' } as const;
const H1 = { font: "400 34px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' } as const;
const SUB = { font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' } as const;

// Seeded by scripts/seed-console.ts; listed while test mode is on so testers can pick an account instead of typing it.
const TEST_ACCOUNTS = TEST_STAFF.map((s) => ({ id: s.id, name: s.name, role: s.role === 'admin' ? 'Admin' : 'Staff', scope: s.note }));
const TEST_PASSWORD = TEST_STAFF_PASSWORD;
const TEST_CODE = '123456';

function useDesk() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const u = () => setDesk(window.innerWidth >= 1100);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);
  return desk;
}

export default function SignIn() {
  const router = useRouter();
  const mob = useMob();
  const desk = useDesk();
  const { staff, ready, signIn } = useConsole();
  const [step, setStep] = useState<'id' | 'otp'>('id');
  const [empId, setEmpId] = useState('');
  const [pwd, setPwd] = useState('');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [testMode, setTestMode] = useState(false);
  useEffect(() => { getPublicConfig().then((c) => setTestMode(c.testMode)).catch(() => {}); }, []);

  useEffect(() => { if (ready && staff) router.replace('/console'); }, [ready, staff, router]);

  async function submitId() {
    if (busy) return;
    if (!empId.trim() || !pwd) { setErr('Enter your employee ID and password.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await checkStaffCredentials(empId, pwd);
      if (!r.ok) setErr(r.error ?? 'Employee ID or password is incorrect.'); else setStep('otp');
    } catch { setErr('Could not reach the server. Try again.'); }
    setBusy(false);
  }

  async function submitOtp() {
    if (busy) return;
    if (otp.length !== 6) { setErr('Enter all six digits.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await signInStaff(empId, pwd);
      if ('error' in r) { setErr(r.error); setStep('id'); }
      else { await signIn(r.token, r.staff); router.replace('/console'); return; }
    } catch { setErr('Could not sign you in. Try again.'); }
    setBusy(false);
  }

  const ErrLine = err ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-pulse-deep)' }}>
      <i className="ph-bold ph-warning-circle" />{err}
    </span>
  ) : null;
  const wide = { height: 56, width: '100%', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 } as const;

  const pick = (a: (typeof TEST_ACCOUNTS)[number]) => { setEmpId(a.id); setPwd(TEST_PASSWORD); setErr(''); };
  const initials = (n: string) => n.split(' ').map((w) => w[0]).join('');
  const Head = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <FieldLabel>Test accounts</FieldLabel>
      <span style={{ height: 20, padding: '0 8px', borderRadius: 999, background: 'var(--cp-marigold)', color: '#0f0f0f', font: '700 10px/20px Outfit,sans-serif', letterSpacing: '.06em' }}>DEMO</span>
      <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Tap one to fill the form</span>
    </span>
  );
  // Desktop: three cards in a row; mobile: stacked rows.
  const Accounts = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Head}
      <div style={{ display: 'grid', gridTemplateColumns: desk ? 'repeat(3,minmax(0,1fr))' : 'minmax(0,1fr)', gap: 10 }}>
        {TEST_ACCOUNTS.map((a) => {
          const on = empId === a.id && pwd === TEST_PASSWORD;
          return (
            <button key={a.id} type="button" onClick={() => pick(a)} style={{ display: 'flex', flexDirection: desk ? 'column' : 'row', alignItems: desk ? 'flex-start' : 'center', gap: desk ? 10 : 12, padding: desk ? 14 : '10px 14px', borderRadius: 18, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', color: 'var(--cp-ink)', textAlign: 'left', cursor: 'pointer', position: 'relative' }}>
              <span style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: 'var(--cp-marigold)', color: '#0f0f0f', font: "400 15px/36px 'DM Serif Display',serif", textAlign: 'center' }}>{initials(a.name)}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>{a.name}</span>
                <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{a.id} · {a.role}</span>
                <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{a.scope}</span>
              </span>
              {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 20, position: desk ? 'absolute' : 'static', top: 12, right: 12 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
  const Note = (
    <span style={{ display: 'flex', gap: 8, padding: '12px 14px', borderRadius: 14, background: 'var(--cp-surface-2)', font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
      <i className="ph-bold ph-shield-check" style={{ fontSize: 16, color: 'var(--cp-peacock)', flex: 'none' }} />
      Every decision you make is logged and appears on the public case timeline.
    </span>
  );
  const Brand = (dark: boolean) => (
    <Link href="/" aria-label="Koodal home" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none', alignSelf: 'flex-start' }}>
      <span style={{ width: 40, height: 40, borderRadius: '50%', background: dark ? '#fff' : 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
        <img src="/koodal-mark.png" alt="Koodal" style={{ width: 30, height: 30, objectFit: 'contain', filter: dark ? undefined : 'invert(1)' }} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: '700 18px/1 Outfit,sans-serif', letterSpacing: '.06em' }}>KOODAL</span>
        <span style={{ font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.22em', color: dark ? 'var(--cp-marigold)' : 'var(--cp-pulse)' }}>CONSOLE</span>
      </span>
    </Link>
  );
  const NAVLINK = { display: 'inline-flex', alignItems: 'center', gap: 6, font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', textDecoration: 'none', whiteSpace: 'nowrap' } as const;
  const TopNav = (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', maxWidth: desk ? undefined : 400, background: 'var(--cp-bg)', paddingTop: 8, paddingBottom: 8 }}>
      <Link href="/" style={NAVLINK}><i className="ph-bold ph-arrow-left" />Back to home</Link>
      <Link href="/console/get-started" style={NAVLINK}>Get started<i className="ph-bold ph-arrow-right" /></Link>
    </div>
  );
  const FLOW = [['ph-megaphone', 'Citizens report', 'Photo, place and category from the app'], ['ph-users-three', 'Neighbours verify', 'Five supporters send it to your desk'], ['ph-bank', 'You decide and assign', 'Approve, reject with proof, or take up early'], ['ph-check-circle', 'Citizens confirm', 'The case closes only when they say it is fixed']];

  const form = step === 'id' ? (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ ...H1, fontSize: mob ? 30 : desk ? 42 : 34 }}>Sign in to Koodal Console</span>
        <span style={SUB}>Use your employee ID and password. We&apos;ll send a one-time code to confirm it&apos;s you.</span>
      </div>
      {desk && testMode && Accounts}
      <div style={{ display: 'grid', gridTemplateColumns: desk ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel>Employee ID</FieldLabel>
          <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="GCC-0000" autoCapitalize="characters" style={INPUT} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel>Password</FieldLabel>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitId()} placeholder="••••••••" style={INPUT} />
        </label>
      </div>
      {ErrLine}
      <PrimaryButton onClick={submitId} disabled={busy} style={wide}>Continue<i className="ph-bold ph-arrow-right" /></PrimaryButton>
      {!desk && testMode && Accounts}
    </>
  ) : (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ ...H1, fontSize: mob ? 30 : desk ? 42 : 34 }}>Enter the 6-digit code</span>
        <span style={SUB}>Signing in as {empId}. Demo mode: enter any six digits. Text-message codes are not switched on yet.</span>
      </div>
      <input
        autoFocus inputMode="numeric" maxLength={6} value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && submitOtp()}
        placeholder="000000"
        style={{ ...INPUT, height: 68, borderRadius: 18, font: '600 30px/1 Outfit,sans-serif', letterSpacing: '.5em', textAlign: 'center' }}
      />
      <button type="button" onClick={() => setOtp(TEST_CODE)} style={{ alignSelf: desk ? 'flex-start' : 'center', height: 34, padding: '0 14px', borderRadius: 999, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>Use test code {TEST_CODE}</button>
      {ErrLine}
      <PrimaryButton onClick={submitOtp} disabled={busy} style={{ ...wide, opacity: otp.length === 6 ? 1 : 0.5 }}>Verify &amp; continue<i className="ph-bold ph-arrow-right" /></PrimaryButton>
      <button onClick={() => { setStep('id'); setErr(''); setOtp(''); }} style={{ alignSelf: desk ? 'flex-start' : 'center', border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        <i className="ph-bold ph-arrow-left" />Use a different account
      </button>
    </>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: desk ? 'minmax(0,5fr) minmax(0,7fr)' : 'minmax(0,1fr)', minHeight: '100dvh' }}>
      {desk && (
        <div data-cp-theme="dark" style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '40px 48px', background: '#000', color: '#f5f5f5', overflow: 'hidden' }}>
          {Brand(true)}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, maxWidth: 440 }}>
            {FLOW.map(([ic, t, d]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 18, background: '#141414', border: '1px solid #262626' }}>
                <span style={{ width: 38, height: 38, flex: 'none', borderRadius: '50%', background: '#1f1f1f', display: 'grid', placeItems: 'center', fontSize: 18, color: 'var(--cp-marigold)' }}><i className={`ph-bold ${ic}`} /></span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ font: '600 14px/1.2 Outfit,sans-serif' }}>{t}</span>
                  <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: '#9a9a9a' }}>{d}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
            <span style={{ font: "400 46px/1 'DM Serif Display',serif", letterSpacing: '-.03em', textWrap: 'balance' }}>Every case here started with your community.</span>
            <span style={{ font: '400 15px/1.5 Outfit,sans-serif', color: '#bdbdbd', textWrap: 'pretty' }}>Citizens report and verify; your departments decide, assign and fix; citizens confirm the result.</span>
          </div>
          <span style={{ font: '500 12px/1 Outfit,sans-serif', color: '#7c7c7c' }}>{currentOrg.name}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: desk ? 'space-between' : 'center', alignItems: desk ? 'stretch' : 'center', gap: 28, padding: desk ? '40px 72px' : '32px 20px', background: 'var(--cp-bg)' }}>
        {TopNav}
        <div style={{ width: '100%', maxWidth: desk ? 640 : 400, display: 'flex', flexDirection: 'column', gap: 22, animation: 'cp-in .4s cubic-bezier(.2,.9,.25,1.1) both' }}>
          {!desk && Brand(false)}
          {form}
        </div>
        <div style={{ maxWidth: desk ? 640 : 400, width: '100%' }}>{Note}</div>
      </div>
    </div>
  );
}
