import Link from 'next/link';
import { s } from './s';
import { Reveal } from './Reveal';

export function CtaBand() {
  return (
    <Reveal style={s('padding:120px 16px 0')}>
      <div className="kd-cta-in" style={s('position:relative;max-width:1120px;margin:0 auto;border-radius:36px;overflow:hidden;background:#0f0f0f;color:#f5f5f5;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center')}>
        <div style={s('position:absolute;left:50%;top:-240px;width:700px;height:500px;margin-left:-350px;border-radius:50%;background:radial-gradient(closest-side,rgb(232 89 12 / .55),transparent);pointer-events:none;animation:kd-glow 6s ease-in-out infinite')} />
        <h2 className="kd-h2" style={s('position:relative;max-width:760px;color:inherit')}>Bring your community <span style={{ color: '#fb923c' }}>together</span> this week.</h2>
        <p style={s('position:relative;margin:0;max-width:520px;font:400 17px/1.6 Outfit,sans-serif;color:#bdbdbd')}>Set up in an afternoon. Invite people with a link. Cancel any time.</p>
        <div style={s('position:relative;display:flex;gap:10px;flex-wrap:wrap;justify-content:center')}>
          <Link href="/nearby" className="kd-btn white">Koodal app<i className="ph-bold ph-arrow-right" /></Link>
          <Link href="/console/sign-in" className="kd-btn ghost-dark">Koodal Console</Link>
        </div>
      </div>
    </Reveal>
  );
}
