'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMob } from '@/lib/console/useMob';
import { currentOrg } from '@/lib/console/org';
import { checkStaffCredentials, signInStaff } from '@/server/actions/console-auth';
import { useConsole } from '../_components/ConsoleProvider';
import { FieldLabel, PrimaryButton } from '../_components/Drawer';

const INPUT = { height: 54, padding: '0 18px', borderRadius: 16, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 15px/1 Outfit,sans-serif', outline: 'none' } as const;
const H1 = { font: "400 34px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' } as const;
const SUB = { font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' } as const;

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: desk ? 'minmax(0,1.1fr) minmax(0,1fr)' : 'minmax(0,1fr)', minHeight: '100vh' }}>
      {desk && (
        <div data-cp-theme="dark" style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '40px 48px', background: '#000', color: '#f5f5f5', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}>
              <img src="/koodal-mark.png" alt="Koodal" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '700 19px/1 Outfit,sans-serif', letterSpacing: '.06em' }}>KOODAL</span>
              <span style={{ font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.22em', color: 'var(--cp-marigold)' }}>CONSOLE</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
            <span style={{ font: "400 52px/1 'DM Serif Display',serif", letterSpacing: '-.03em', textWrap: 'balance' }}>Every case here started with your community.</span>
            <span style={{ font: '400 15px/1.5 Outfit,sans-serif', color: '#bdbdbd', textWrap: 'pretty' }}>Citizens report and verify; your departments decide, assign and fix; citizens confirm the result.</span>
          </div>
          <span style={{ font: '500 12px/1 Outfit,sans-serif', color: '#7c7c7c' }}>{currentOrg.name}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 20px', background: 'var(--cp-bg)' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 22, animation: 'cp-in .4s cubic-bezier(.2,.9,.25,1.1) both' }}>
          {!desk && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
                <img src="/koodal-mark.png" alt="Koodal" style={{ width: 26, height: 26, objectFit: 'contain', filter: 'invert(1)' }} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '700 17px/1 Outfit,sans-serif', letterSpacing: '.06em' }}>KOODAL</span>
                <span style={{ font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.22em', color: 'var(--cp-pulse)' }}>CONSOLE</span>
              </span>
            </div>
          )}

          {step === 'id' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ ...H1, fontSize: mob ? 30 : 34 }}>Sign in to Koodal Console</span>
                <span style={SUB}>Use your employee ID and password. We&apos;ll send a one-time code to confirm it&apos;s you.</span>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <FieldLabel>Employee ID</FieldLabel>
                <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="GCC-0000" autoCapitalize="characters" style={INPUT} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <FieldLabel>Password</FieldLabel>
                <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitId()} placeholder="••••••••" style={INPUT} />
              </label>
              {ErrLine}
              <PrimaryButton onClick={submitId} disabled={busy} style={wide}>Continue<i className="ph-bold ph-arrow-right" /></PrimaryButton>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ ...H1, fontSize: mob ? 30 : 34 }}>Enter the 6-digit code</span>
                <span style={SUB}>Demo mode: enter any six digits. Text-message codes are not switched on yet.</span>
              </div>
              <input
                autoFocus inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && submitOtp()}
                placeholder="000000"
                style={{ ...INPUT, height: 68, borderRadius: 18, font: '600 30px/1 Outfit,sans-serif', letterSpacing: '.5em', textAlign: 'center' }}
              />
              {ErrLine}
              <PrimaryButton onClick={submitOtp} disabled={busy} style={{ ...wide, opacity: otp.length === 6 ? 1 : 0.5 }}>Verify &amp; continue<i className="ph-bold ph-arrow-right" /></PrimaryButton>
              <button onClick={() => { setStep('id'); setErr(''); setOtp(''); }} style={{ alignSelf: 'center', border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <i className="ph-bold ph-arrow-left" />Use a different account
              </button>
            </>
          )}

          <span style={{ display: 'flex', gap: 8, padding: '12px 14px', borderRadius: 14, background: 'var(--cp-surface-2)', font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-bold ph-shield-check" style={{ fontSize: 16, color: 'var(--cp-peacock)', flex: 'none' }} />
            Every decision you make is logged and appears on the public case timeline.
          </span>
        </div>
      </div>
    </div>
  );
}
