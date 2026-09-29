import { s } from './s';
import { Reveal } from './Reveal';
import { TYPES } from './data';

const LABEL: Record<string, string> = { gov: 'Governments', apt: 'Apartments & communities', uni: 'Universities & campuses', inst: 'Institutions' };

export function OrgTypes() {
  return (
    <Reveal id="types" className="kd-sec" style={s('max-width:1120px;padding:120px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#f5b30a')} />Who it’s for</span>
      <h2 className="kd-h2">Same product. <span className="kd-hi">Your</span> words.</h2>
      <p className="kd-lede">Choose your type and Koodal sets up the right categories, teams and joining rules. Change any of it later.</p>
      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:30px')}>
        {TYPES.filter((t) => t.k !== 'other').map((t) => (
          <div key={t.k} className="kd-card" style={s('padding:24px;display:flex;flex-direction:column;gap:14px')}>
            <span className="kd-typeicon" style={{ ...s('width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:22px'), background: t.bg, color: t.fg }}><i className={`ph-bold ${t.icon}`} /></span>
            <span style={s('font:600 19px/1.2 Outfit,sans-serif')}>{LABEL[t.k]}</span>
            <span style={s('font:400 14px/1.5 Outfit,sans-serif;color:#6b6b6b')}>{t.s}</span>
            <div style={s('display:flex;flex-wrap:wrap;gap:6px;margin-top:auto')}>
              {t.chips.map((c) => <span key={c} style={s('height:26px;padding:0 10px;border-radius:999px;background:#f7f2ec;color:#4d4d4d;font:600 11.5px/26px Outfit,sans-serif')}>{c}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
