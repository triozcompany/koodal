'use client';
import { useEffect, useRef } from 'react';
import { ME } from '@/lib/domain/constants';

const OTP_DIGITS = '4821';

interface Props {
  step: number;
  otp: number;
  onNext: () => void;
  onClose: () => void;
}

export function IdSheet({ step, otp, onNext, onClose }: Props) {
  const otpBoxes = [0, 1, 2, 3].map(k => ({
    v: k < otp ? OTP_DIGITS[k] : '',
    bd: k < otp ? 'var(--cp-edge)' : 'var(--cp-line)',
    bg: k < otp ? 'var(--cp-surface-2)' : 'transparent',
  }));

  const btnLabel = step === 0 ? 'Send OTP' : step === 1 ? (otp < 4 ? 'Reading OTP…' : 'Verify') : 'Verified';
  const btnIcon = step === 2 ? 'ph-check-circle' : 'ph-arrow-right';
  const btnBg = step === 2 ? 'var(--cp-leaf)' : 'var(--cp-peacock)';

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }}
      />
      {/* Sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81, background: 'var(--cp-surface)', borderRadius: '24px 24px 0 0', padding: '0 20px 34px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both' }}>
        {/* Handle */}
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '400 26px/1.05 "DM Serif Display",serif', letterSpacing: '-.03em' }}>
            {step === 0 ? 'Confirm your identity' : step === 1 ? 'Enter the code' : 'Verified'}
          </span>
          <span style={{ font: '500 13.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            {step === 0
              ? 'Your name appears on the report as a verified resident.'
              : step === 1
              ? `Sent to ${ME.phone} · Auto-reading…`
              : 'Your identity is now verified.'}
          </span>
        </div>

        {/* Step 0: phone display */}
        {step === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 60, padding: '0 16px', borderRadius: 18, border: '1.5px solid var(--cp-peacock)', background: 'var(--cp-surface)' }}>
            <span style={{ font: '600 17px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>+91</span>
            <span style={{ width: 1, height: 26, background: 'var(--cp-line)' }} />
            <span style={{ flex: 1, font: '600 18px/1 Outfit,sans-serif', letterSpacing: '.04em' }}>
              {ME.phone.replace('+91 ', '')}
            </span>
            <i className="ph-fill ph-check-circle" style={{ color: 'var(--cp-leaf)', fontSize: 22 }}></i>
          </div>
        )}

        {/* Step 1: OTP boxes */}
        {step >= 1 && step < 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
            {otpBoxes.map((b, k) => (
              <span key={k} style={{ height: 62, borderRadius: 16, border: `1.5px solid ${b.bd}`, background: b.bg, display: 'grid', placeItems: 'center', font: '700 26px/1 Outfit,sans-serif', transition: 'all .15s' }}>
                {b.v}
              </span>
            ))}
          </div>
        )}

        {/* Step 2: verified badge */}
        {step === 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'var(--cp-leaf-soft)', animation: 'cp-pop2 .3s both' }}>
            <i className="ph-fill ph-seal-check" style={{ fontSize: 28, color: 'var(--cp-leaf)' }}></i>
            <span style={{ font: '600 14px/1.3 Outfit,sans-serif' }}>Verified resident of Tamil Nadu</span>
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={onNext}
          disabled={step === 1 && otp < 4}
          style={{
            height: 56, borderRadius: 999, border: 'none',
            background: btnBg, color: '#fff',
            font: '600 16px/1 Outfit,sans-serif', letterSpacing: '.01em',
            cursor: step === 1 && otp < 4 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            opacity: step === 1 && otp < 4 ? 0.7 : 1, transition: 'opacity .2s',
          }}
        >
          <i className={`ph-bold ${btnIcon}`} style={{ fontSize: 20 }}></i>
          {btnLabel}
        </button>

        <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}>
          Demo only — no real OTP sent.
        </span>
      </div>
    </>
  );
}
