'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { s } from './s';
import { Reveal } from './Reveal';
import { PLANS, TRIAL_DAYS, planPer, planPrice, type Cycle } from './data';

export function Pricing() {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle>('yearly');
  return (
    <Reveal id="pricing" className="kd-sec" style={s('max-width:1200px;padding:120px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />Pricing</span>
      <h2 className="kd-h2"><span className="kd-hi">Simple</span> pricing that grows with you</h2>
      <p className="kd-lede">Priced by the size of your community. Members never pay. Every plan starts with a {TRIAL_DAYS}-day free trial.</p>
      <div style={s('align-self:center;display:flex;gap:4px;padding:4px;border-radius:14px;background:#f1ebe4;margin-top:10px')}>
        {(['monthly', 'yearly'] as const).map((k) => {
          const on = cycle === k;
          return (
            <button key={k} onClick={() => setCycle(k)} style={{ ...s('height:38px;padding:0 16px;border-radius:11px;border:none;font:600 13px/1 Outfit,sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:all .2s'), background: on ? '#fff' : 'transparent', color: on ? '#0f0f0f' : '#4d4d4d', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none' }}>
              {k === 'monthly' ? 'Monthly' : 'Yearly'}
              {k === 'yearly' && <span style={s('height:18px;padding:0 6px;border-radius:999px;background:#e8f7ee;color:#12a150;font:700 10px/18px Outfit,sans-serif;white-space:nowrap')}>2 MONTHS FREE</span>}
            </button>
          );
        })}
      </div>
      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:20px;align-items:stretch')}>
        {PLANS.map((p, k) => {
          const hi = k === 2;
          return (
            <div key={p.k} className="kd-card" style={{ ...s('padding:26px;display:flex;flex-direction:column;gap:16px'), background: hi ? '#0f0f0f' : '#fff', color: hi ? '#f5f5f5' : '#0f0f0f', borderColor: hi ? '#0f0f0f' : '#f0ebe5' }}>
              <div style={s('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
                <span style={s('font:600 20px/1 Outfit,sans-serif')}>{p.l}</span>
                {hi && <span style={s('height:24px;padding:0 10px;border-radius:999px;background:#e8590c;color:#fff;font:600 11px/24px Outfit,sans-serif')}>Most popular</span>}
              </div>
              <span style={s('font:400 13.5px/1.45 Outfit,sans-serif;opacity:.7;min-height:40px')}>{p.for}</span>
              <div style={s('display:flex;align-items:baseline;gap:6px')}>
                <span style={s('font:700 40px/1 Outfit,sans-serif;letter-spacing:-.03em')}>{planPrice(p, cycle)}</span>
                <span style={s('font:500 13px/1.3 Outfit,sans-serif;opacity:.6')}>{planPer(p, cycle)}</span>
              </div>
              <div style={{ ...s('display:flex;flex-direction:column;gap:9px;padding-top:14px'), borderTop: `1px solid ${hi ? '#262626' : '#f0ebe5'}` }}>
                {p.feats.map((x) => (
                  <span key={x} style={s('display:flex;gap:9px;align-items:flex-start;font:500 13.5px/1.4 Outfit,sans-serif')}>
                    <i className="ph-bold ph-check-circle" style={s('font-size:16px;color:#e8590c;margin-top:1px;flex:none')} />{x}
                  </span>
                ))}
              </div>
              <button className="kd-planbtn" style={{ background: hi ? '#e8590c' : '#0f0f0f' }} onClick={() => router.push(`/get-started?plan=${p.k}`)}>
                {p.m == null ? 'Talk to us' : 'Start free trial'}<i className="ph-bold ph-arrow-right" />
              </button>
            </div>
          );
        })}
      </div>
      <span style={s('text-align:center;font:500 13px/1.5 Outfit,sans-serif;color:#8a8a8a')}>Every plan includes unlimited cases, AI triage, maps, insights and 12 Indian languages. Prices exclude GST.</span>
    </Reveal>
  );
}
