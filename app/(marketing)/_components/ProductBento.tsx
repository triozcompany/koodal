import { s } from './s';
import { Reveal } from './Reveal';

const ORGS: [string, string, string, string, string, boolean][] = [['GC', 'Greater Chennai Corp.', 'Citizen', '#0f8b83', '#fff', true], ['GV', 'Green Valley Apartments', 'Resident', '#f5b30a', '#0f0f0f', false], ['AU', 'ABC University', 'Student', '#f5f5f5', '#0f0f0f', false]];
const BARS = [38, 62, 45, 80, 56, 92, 70];
const title = 'font:600 22px/1.2 Outfit,sans-serif';
const body = 'font:400 14.5px/1.5 Outfit,sans-serif;color:#6b6b6b';
const shot = 'display:block;width:100%;margin-top:10px;border-radius:14px 14px 0 0;border:1px solid #efe7df;border-bottom:none';

export function ProductBento() {
  return (
    <Reveal id="product" className="kd-sec" style={s('max-width:1120px;padding:120px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#0f8b83')} />The product</span>
      <h2 className="kd-h2">Everything your community needs, <span className="kd-hi">nothing</span> it doesn’t</h2>
      <p className="kd-lede">One app for members, one console for your team, and one timeline everybody can see.</p>
      <div className="kd-bento">
        <div className="kd-card" style={s('padding:28px 28px 0;display:flex;flex-direction:column;gap:14px;overflow:hidden')}>
          <span style={s(title)}>A console your team will actually use</span>
          <span style={{ ...s(body), maxWidth: 520 }}>Decisions due, overdue cases and hotspots on one screen. Staff only see their own teams’ cases.</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shots/02-console.png" alt="Koodal Console case board" style={s(shot + ';transition:transform .5s cubic-bezier(.2,.9,.25,1)')} />
        </div>
        <div className="kd-card" style={s('padding:28px;display:flex;flex-direction:column;gap:14px')}>
          <span style={s(title)}>One account, every community</span>
          <span style={s(body)}>Switch between your city, your apartment and your campus in a tap.</span>
          <div style={s('margin-top:auto;display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:18px;background:#0f0f0f')}>
            {ORGS.map(([ini, n, r, bg, fg, on]) => (
              <div key={ini} style={{ ...s('display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;transition:background .2s'), background: on ? '#1e1e1e' : 'transparent' }}>
                <span style={{ ...s('width:32px;height:32px;flex:none;border-radius:9px;font:700 12px/32px Outfit,sans-serif;text-align:center'), background: bg, color: fg }}>{ini}</span>
                <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:3px')}>
                  <span style={s('font:600 13px/1.1 Outfit,sans-serif;color:#f5f5f5')}>{n}</span>
                  <span style={s('font:500 11px/1 Outfit,sans-serif;color:#8a8a8a')}>{r}</span>
                </span>
                {on && <i className="ph-bold ph-check" style={{ color: '#2dd4bf' }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="kd-card" style={s('padding:28px;display:flex;flex-direction:column;gap:14px')}>
          <span style={s(title)}>Insights that find patterns</span>
          <span style={s(body)}>See which areas and categories keep coming back.</span>
          <div style={s('margin-top:auto;display:flex;align-items:flex-end;gap:10px;height:150px;padding:14px;border-radius:18px;background:#faf7f3;border:1px solid #f1ebe4')}>
            {BARS.map((h, k) => (
              <div key={k} style={s('flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%')}>
                <div style={{ ...s('border-radius:8px 8px 3px 3px;transform-origin:bottom'), height: h + '%', background: k === 5 ? '#e8590c' : '#f3c9ad', animation: `kd-bar 1s ${(0.1 + k * 0.08).toFixed(2)}s cubic-bezier(.2,.9,.25,1) both` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="kd-card" style={s('padding:28px 28px 0;display:flex;flex-direction:column;gap:14px;overflow:hidden')}>
          <span style={s(title)}>A member app people open</span>
          <span style={{ ...s(body), maxWidth: 520 }}>Nearby issues on a map, a feed to support what matters, and a clear timeline until it’s fixed.</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shots/01-app.png" alt="Koodal app" style={s(shot)} />
        </div>
      </div>
    </Reveal>
  );
}
