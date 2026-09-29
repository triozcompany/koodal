import Link from 'next/link';
import { s } from './s';
import { Reveal } from './Reveal';

const CHECKS = ['People get a voice in their own language', 'Every step is on a public timeline', 'Members decide when it’s fixed', 'Teams get fewer duplicates and clear deadlines'];
const ORBS = [['8%', '10%', '110px', '#0f8b83', '#fff', 'ph-fill ph-bank', 'Governments', '6s', '0s', '38px'], ['62%', '2%', '96px', '#f5b30a', '#0f0f0f', 'ph-fill ph-buildings', 'Apartments', '7s', '.6s', '34px'], ['72%', '58%', '120px', '#0f0f0f', '#fff', 'ph-fill ph-graduation-cap', 'Campuses', '6.5s', '1.2s', '40px'], ['14%', '62%', '100px', '#e8590c', '#fff', 'ph-fill ph-first-aid-kit', 'Institutions', '7.5s', '.3s', '36px'], ['40%', '78%', '70px', '#fff4ec', '#c2410c', 'ph-fill ph-heart', 'Members', '5.5s', '.9s', '26px'], ['44%', '0%', '64px', '#eaf7f5', '#0f8b83', 'ph-fill ph-seal-check', 'Verified', '6s', '1.5s', '24px']];

export function Trust() {
  return (
    <Reveal className="kd-sec kd-trust" style={s('max-width:1120px;padding:120px 20px 20px')}>
      <div style={s('display:flex;flex-direction:column;gap:20px')}>
        <h2 className="kd-h2" style={{ textAlign: 'left' }}><span className="kd-hi">Trust</span> that runs three ways</h2>
        <p style={s('margin:0;font:400 17px/1.6 Outfit,sans-serif;color:#5b5b5b;max-width:480px')}>Nothing is closed until the people who reported it agree. That changes how communities and the people who run them work together.</p>
        <div style={s('display:flex;flex-direction:column;gap:12px')}>
          {CHECKS.map((t) => (
            <span key={t} style={s('display:flex;align-items:center;gap:12px;font:500 15px/1.4 Outfit,sans-serif')}>
              <span style={s('width:24px;height:24px;flex:none;border-radius:50%;background:#fff4ec;color:#e8590c;display:grid;place-items:center;font-size:13px')}><i className="ph-bold ph-check" /></span>{t}
            </span>
          ))}
        </div>
        <Link href="/get-started" className="kd-btn" style={s('align-self:flex-start;margin-top:8px')}>Start free trial<i className="ph-bold ph-arrow-right" /></Link>
      </div>
      <div style={s('position:relative;height:440px')}>
        {ORBS.map(([x, y, sz, bg, fg, icon, t, dur, d, fs]) => (
          <div key={t} className="kd-orb" title={t} style={{ ...s('position:absolute;border-radius:50%;display:grid;place-items:center;font-weight:700;line-height:1;box-shadow:0 24px 40px -20px rgb(0 0 0 / .35);border:4px solid #fff'), left: x, top: y, width: sz, height: sz, background: bg, color: fg, fontSize: fs, animation: `kd-float ${dur} ${d} ease-in-out infinite` }}><i className={icon} /></div>
        ))}
        <div style={s('position:absolute;left:50%;top:50%;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:24px;background:#fff;display:grid;place-items:center;box-shadow:0 24px 40px -18px rgb(232 89 12 / .5)')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/koodal-mark.png" alt="" style={s('width:56px;height:56px;object-fit:contain')} />
        </div>
      </div>
    </Reveal>
  );
}
