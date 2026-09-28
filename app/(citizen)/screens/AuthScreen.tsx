'use client';
import { useState } from 'react';

interface Props {
  onDone: (name: string, area: string, anon: boolean) => void;
  onSkip?: () => void;
  mob?: boolean;
}

const INTRO_SLIDES = [
  {
    icon: 'ph-map-pin',
    c: 'var(--cp-pulse)',
    k: 'Report issues',
    t: 'Fix your street, together.',
    s: 'Snap a photo, describe the issue in Tamil or English, and let AI do the rest.',
  },
  {
    icon: 'ph-users-three',
    c: 'var(--cp-peacock)',
    k: 'Community',
    t: 'Your neighbours, your city.',
    s: 'Issues gain credibility when more residents support them. One voice becomes many.',
  },
  {
    icon: 'ph-buildings',
    c: 'var(--cp-marigold)',
    k: 'Government',
    t: 'Straight to the officials.',
    s: 'Verified issues go to Greater Chennai Corp, Metrowater, and TNEB automatically.',
  },
];

const AREAS = ['Velachery', 'Adyar', 'Tambaram', 'Anna Nagar', 'T. Nagar', 'Madipakkam'];
const DEMO_PHONE = '98401 23456';
const DEMO_OTP = ['4', '8', '2', '1', '3', '7'];
const DEMO_AADHAR = '7624 8391 5047';
const DEMO_NAME = 'Karthik Subramaniam';

type Step = 'intro' | 'phone' | 'otp' | 'aad' | 'profile' | 'perm';

const PROG_STEPS: Step[] = ['intro', 'phone', 'otp', 'aad', 'profile', 'perm'];

export function AuthScreen({ onDone, onSkip, mob = true }: Props) {
  const [introIdx, setIntroIdx] = useState(0);
  const [step, setStep] = useState<Step>('intro');
  const [phone, setPhone] = useState('');
  const [otpFilled, setOtpFilled] = useState(0);
  const [aadhar, setAadhar] = useState('');
  const [aadConsent, setAadConsent] = useState(false);
  const [aadVerified, setAadVerified] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [anonDefault, setAnonDefault] = useState(false);
  const [busy, setBusy] = useState(false);

  const progIdx = PROG_STEPS.indexOf(step);
  const auProg = PROG_STEPS.map((_, i) => ({ c: i <= progIdx ? 'var(--cp-ink)' : 'var(--cp-line)' }));

  const auInit = name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'KS';
  const auPhOk = phone.replace(/\D/g, '').length >= 10;
  const auPhF = `${phone.slice(0, 5)} ${phone.slice(5, 10)}` || DEMO_PHONE;
  const aadDigits = aadhar.replace(/\D/g, '');
  const aadOk = aadDigits.length >= 12;

  function sendOtp() {
    if (!auPhOk) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep('otp');
      let filled = 0;
      const t = setInterval(() => {
        filled += 1;
        setOtpFilled(filled);
        if (filled >= 6) clearInterval(t);
      }, 280);
    }, 800);
  }

  function fillDemoAadhar() {
    setAadhar(DEMO_AADHAR);
    setAadConsent(true);
    setTimeout(() => setAadVerified(true), 600);
  }

  function goBack() {
    if (step === 'phone') setStep('intro');
    else if (step === 'otp') setStep('phone');
    else if (step === 'aad') setStep('otp');
    else if (step === 'profile') setStep('aad');
    else if (step === 'perm') setStep('profile');
  }

  const canBack = step !== 'intro';

  const priLabel =
    step === 'intro' ? (introIdx < 2 ? 'Next' : 'Get started') :
    step === 'phone' ? (busy ? '…' : 'Send OTP') :
    step === 'otp' ? (otpFilled < 6 ? 'Waiting for code…' : 'Verify') :
    step === 'aad' ? (aadVerified ? 'Continue' : (aadOk && aadConsent ? 'Verify Aadhaar' : 'Skip for now')) :
    step === 'profile' ? 'Continue' :
    'Allow location';

  const priDisabled =
    (step === 'phone' && !auPhOk) ||
    (step === 'otp' && otpFilled < 6) ||
    busy;

  function onPrimary() {
    if (step === 'intro') {
      if (introIdx < 2) setIntroIdx(i => i + 1);
      else setStep('phone');
    } else if (step === 'phone') {
      sendOtp();
    } else if (step === 'otp') {
      setStep('aad');
    } else if (step === 'aad') {
      setStep('profile');
    } else if (step === 'profile') {
      setStep('perm');
    } else {
      onDone(name || DEMO_NAME, area || 'Velachery', anonDefault);
    }
  }

  const slide = INTRO_SLIDES[introIdx];

  const auCols = mob ? 'minmax(0,1fr)' : 'minmax(0,1.1fr) minmax(0,1fr)';
  const auPad = mob ? '16px 20px 24px' : '40px 48px';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--cp-bg)', color: 'var(--cp-ink)', display: 'grid', gridTemplateColumns: auCols, animation: 'cp-row .3s ease-out both' }}>
      {/* Desktop left sidebar */}
      {!mob && (
        <aside style={{ position: 'relative', overflowX: 'hidden', overflowY: 'auto', minHeight: 0, background: '#18181b', color: '#fafafa', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ position: 'absolute', inset: '-20%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(rgb(255 255 255 / .05) 2px,transparent 2px),linear-gradient(90deg,rgb(255 255 255 / .05) 2px,transparent 2px)', backgroundSize: '56px 56px' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-wave-triangle" style={{ fontSize: 22, color: '#18181b' }}></i>
            </div>
            <span style={{ font: '700 20px/1 Outfit,sans-serif', letterSpacing: '.06em' }}>KOODAL</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 26 }}>
            <span style={{ font: "400 48px/1 'DM Serif Display',serif", letterSpacing: '-.035em', maxWidth: 520 }}>Fix your street, together.</span>
            {INTRO_SLIDES.map((s, k) => (
              <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: step === 'intro' ? (k === introIdx ? 1 : 0.45) : 1, transition: 'opacity .3s' }}>
                <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 13, background: s.c, display: 'grid', placeItems: 'center', fontSize: 20, color: '#fff' }}>
                  <i className={`ph-bold ${s.icon}`}></i>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 420 }}>
                  <span style={{ font: '700 16px/1.2 Outfit,sans-serif' }}>{s.t}</span>
                  <span style={{ font: '400 13px/1.45 Outfit,sans-serif', color: '#a1a1aa' }}>{s.s}</span>
                </span>
              </div>
            ))}
          </div>
          <span style={{ position: 'relative', font: '500 12px/1 Outfit,sans-serif', color: '#71717a', letterSpacing: '.06em' }}>GREATER CHENNAI · COIMBATORE · MADURAI</span>
        </aside>
      )}

      {/* Main form section */}
      <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', padding: auPad, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
          {canBack && (
            <button
              onClick={goBack}
              style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', transition: 'transform .12s' }}
            >
              <i className="ph-bold ph-arrow-left" />
            </button>
          )}
          <div style={{ flex: 1, display: 'flex', gap: 4 }}>
            {auProg.map((pg, i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: pg.c, transition: 'background .3s' }} />
            ))}
          </div>
          {step === 'intro' && onSkip && (
            <button
              onClick={onSkip}
              style={{ border: 'none', background: 'none', color: 'var(--cp-ink-3)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer' }}
            >Skip</button>
          )}
        </div>

        {/* Intro slides */}
        {step === 'intro' && (
          <div key={introIdx} style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'cp-row .35s ease-out both' }}>
            <div style={{ position: 'relative', aspectRatio: '390/280', borderRadius: 28, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <span style={{ width: 96, height: 96, borderRadius: 30, background: slide.c, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 44, boxShadow: `0 20px 40px -18px ${slide.c}`, animation: 'cp-pop .5s cubic-bezier(.3,1.6,.5,1) both' }}>
                  <i className={`ph-bold ${slide.icon}`} />
                </span>
              </div>
              <span style={{ position: 'absolute', left: 14, bottom: 14, height: 26, padding: '0 10px', borderRadius: 13, background: 'var(--cp-surface)', font: '600 11.5px/26px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{slide.k}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' } as React.CSSProperties}>{slide.t}</span>
              <span style={{ font: '400 14.5px/1.5 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{slide.s}</span>
            </div>
          </div>
        )}

        {/* Phone step */}
        {step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'cp-row .3s ease-out both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Enter your number</span>
              <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>We'll text a 6-digit code. Your number is never shown publicly.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 60, padding: '0 16px', borderRadius: 18, border: `1.5px solid ${auPhOk ? 'var(--cp-leaf)' : 'var(--cp-line)'}`, background: 'var(--cp-surface)', transition: 'border-color .15s' }}>
              <span style={{ font: '600 17px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>+91</span>
              <span style={{ width: 1, height: 26, background: 'var(--cp-line)', flexShrink: 0 }} />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                inputMode="numeric"
                placeholder="98401 23456"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '600 18px/1 Outfit,sans-serif', letterSpacing: '.04em' }}
              />
              {auPhOk && <i className="ph-fill ph-check-circle" style={{ color: 'var(--cp-leaf)', fontSize: 22, animation: 'cp-pop .3s both' }} />}
            </div>
            <button onClick={() => setPhone(DEMO_PHONE)} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, color: 'var(--cp-ink-3)', font: '500 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Use demo number</button>
          </div>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'cp-row .3s ease-out both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Enter the code</span>
              <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
                Sent to +91 {auPhF} ·{' '}
                <button onClick={goBack} style={{ border: 'none', background: 'none', padding: 0, color: 'var(--cp-pulse)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}>Change</button>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 8 }}>
              {DEMO_OTP.map((d, k) => {
                const filled = k < otpFilled;
                return (
                  <span
                    key={k}
                    style={{ height: 62, borderRadius: 16, border: `1.5px solid ${filled ? 'var(--cp-edge)' : 'var(--cp-line)'}`, background: filled ? 'var(--cp-surface-2)' : 'transparent', display: 'grid', placeItems: 'center', font: '700 23px/1 Outfit,sans-serif', transition: 'all .15s', animation: filled ? 'cp-pop .25s both' : 'none' }}
                  >
                    {filled ? d : ''}
                  </span>
                );
              })}
            </div>
            <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
              {otpFilled < 6 ? 'Auto-reading SMS…' : 'Code verified — tap Continue'}
            </span>
          </div>
        )}

        {/* Aadhaar step */}
        {step === 'aad' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'cp-row .3s ease-out both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Verify you're a resident</span>
              <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>One-time Aadhaar e-KYC. Officials see a verified badge — never your Aadhaar number.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 60, padding: '0 16px', borderRadius: 18, border: `1.5px solid ${aadOk ? 'var(--cp-leaf)' : 'var(--cp-line)'}`, background: 'var(--cp-surface)' }}>
              <i className="ph-bold ph-identification-card" style={{ fontSize: 22, color: 'var(--cp-ink-3)' }} />
              <input
                value={aadhar}
                onChange={e => setAadhar(e.target.value)}
                inputMode="numeric"
                placeholder="XXXX XXXX XXXX"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '600 18px/1 Outfit,sans-serif', letterSpacing: '.06em' }}
              />
            </div>
            <button onClick={fillDemoAadhar} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, color: 'var(--cp-ink-3)', font: '500 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Use demo Aadhaar</button>
            <button
              onClick={() => setAadConsent(a => !a)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)' }}
            >
              <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 7, border: `1.5px solid ${aadConsent ? 'var(--cp-leaf)' : 'var(--cp-line)'}`, background: aadConsent ? 'var(--cp-leaf)' : 'transparent', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, transition: 'all .15s' }}>
                {aadConsent && <i className="ph-bold ph-check" />}
              </span>
              <span style={{ font: '500 12.5px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>I consent to UIDAI e-KYC for identity verification. Koodal stores only a verified flag.</span>
            </button>
            {aadVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'var(--cp-leaf-soft)', animation: 'cp-pop2 .25s both' }}>
                <i className="ph-fill ph-seal-check" style={{ fontSize: 24, color: 'var(--cp-leaf)', flexShrink: 0 }} />
                <span style={{ font: '600 13px/1.3 Outfit,sans-serif' }}>Verified · resident of Tamil Nadu</span>
              </div>
            )}
          </div>
        )}

        {/* Profile step */}
        {step === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'cp-row .3s ease-out both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Set up your profile</span>
              <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>This is how neighbours see you, unless you post anonymously.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 22, background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', font: "400 21px/64px 'DM Serif Display',serif", textAlign: 'center' }}>{auInit}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>YOUR AREA</span>
              <input
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="Search your locality"
                style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', width: '100%' }}
              />
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {AREAS.map(ar => {
                  const sel = area === ar;
                  return (
                    <button
                      key={ar}
                      onClick={() => setArea(ar)}
                      style={{ flexShrink: 0, height: 34, padding: '0 13px', borderRadius: 999, border: `1px solid ${sel ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: sel ? 'var(--cp-ink)' : 'var(--cp-surface)', color: sel ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}
                    >
                      {ar}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setAnonDefault(a => !a)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)' }}
            >
              <i className="ph-bold ph-detective" style={{ fontSize: 22 }} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '600 13.5px/1.1 Outfit,sans-serif' }}>Post anonymously by default</span>
                <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>You can change this on every report</span>
              </span>
              <span style={{ position: 'relative', width: 46, height: 28, borderRadius: 14, background: anonDefault ? 'var(--cp-pulse)' : 'var(--cp-surface-2)', transition: 'background .2s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 3, left: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgb(0 0 0 / .25)', transform: anonDefault ? 'translateX(18px)' : 'none', transition: 'transform .3s cubic-bezier(.3,1.6,.5,1)' }} />
              </span>
            </button>
          </div>
        )}

        {/* Location permission step */}
        {step === 'perm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'cp-row .3s ease-out both' }}>
            <div style={{ position: 'relative', aspectRatio: '16/11', borderRadius: 28, overflow: 'hidden', background: 'var(--cp-map)' }}>
              <div style={{ position: 'absolute', inset: '-20%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '40px 40px' }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: '50%', background: 'var(--cp-pulse)', border: '3px solid #fff', boxShadow: '0 0 0 12px rgba(234,88,12,.18)' }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: '50%', background: 'var(--cp-pulse)', animation: 'cp-ping 1.8s infinite' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: "400 28px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em' }}>See what's happening around you</span>
              <span style={{ font: '400 14px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Location pins your reports accurately and shows issues within 1.5 km. We never share your live location.</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1, minHeight: 12 }} />

        {/* Bottom action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {step === 'intro' && introIdx > 0 && (
              <button
                onClick={() => setIntroIdx(i => i - 1)}
                style={{ flex: 3, minWidth: 0, height: 54, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer' }}
              >Back</button>
            )}
            <button
              onClick={onPrimary}
              disabled={priDisabled}
              style={{ flex: 7, minWidth: 0, height: 56, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15.5px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: priDisabled ? 'default' : 'pointer', opacity: priDisabled ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'opacity .2s' }}
            >
              {busy && <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'cp-spin .7s linear infinite', flexShrink: 0 }} />}
              {priLabel}
            </button>
          </div>
          {step === 'intro' && (
            <span style={{ font: '500 12px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}>
              Demo only — no real OTP or Aadhaar check.
            </span>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}
