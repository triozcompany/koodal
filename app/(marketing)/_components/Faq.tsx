'use client';
import { useState } from 'react';
import { s } from './s';
import { Reveal } from './Reveal';
import { FAQS } from './data';

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Reveal id="faq" className="kd-sec" style={s('max-width:820px;padding:120px 20px 20px')}>
      <h2 className="kd-h2">Frequently <span className="kd-hi">asked</span> questions</h2>
      <div style={s('display:flex;flex-direction:column;gap:10px;margin-top:24px')}>
        {FAQS.map(([q, a], k) => {
          const on = open === k;
          return (
            <div key={q} className="kd-faq" style={s('background:#fff;border:1px solid #f0ebe5;border-radius:20px;box-shadow:0 1px 0 #f3eee8,0 24px 50px -36px rgb(0 0 0 / .25);overflow:hidden;transition:border-color .2s')}>
              <button onClick={() => setOpen(on ? null : k)} style={s('width:100%;display:flex;align-items:center;gap:14px;padding:20px 22px;border:none;background:transparent;color:#0f0f0f;cursor:pointer;text-align:left;font:600 16px/1.35 Outfit,sans-serif')}>
                {q}
                <span style={{ ...s('margin-left:auto;width:30px;height:30px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:14px;transition:transform .3s cubic-bezier(.3,1.6,.5,1),background .2s'), background: on ? '#e8590c' : '#f7f2ec', color: on ? '#fff' : '#0f0f0f', transform: `rotate(${on ? 45 : 0}deg)` }}><i className="ph-bold ph-plus" /></span>
              </button>
              {on && <p style={s('margin:0;padding:0 22px 20px;font:400 15px/1.6 Outfit,sans-serif;color:#5b5b5b;animation:kd-up .35s both')}>{a}</p>}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
