import { s } from './s';
import { Reveal } from './Reveal';

const WAVE = [8, 14, 22, 16, 26, 12, 20, 10, 24, 18, 12, 22, 16, 8, 14, 20];
const panel = 'border-radius:20px;background:#faf7f3;border:1px solid #f1ebe4;padding:18px;display:flex;flex-direction:column;gap:10px;min-height:200px;box-sizing:border-box';
const Copy = ({ t, d }: { t: string; d: string }) => (
  <div style={s('display:flex;flex-direction:column;gap:6px;padding:0 8px 8px')}>
    <span style={s('font:600 19px/1.2 Outfit,sans-serif')}>{t}</span>
    <span style={s('font:400 14px/1.5 Outfit,sans-serif;color:#6b6b6b')}>{d}</span>
  </div>
);

export function AiCards() {
  return (
    <Reveal id="ai" className="kd-sec" style={s('max-width:1120px;padding:110px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#6b5bd6')} />Gemini inside</span>
      <h2 className="kd-h2">In-built <span className="kd-hi">AI</span> that does the tedious part</h2>
      <p className="kd-lede">AI organises reports so people can make the decisions. It never closes a case on its own.</p>
      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-top:30px')}>
        <div className="kd-card" style={s('padding:14px;display:flex;flex-direction:column;gap:18px')}>
          <div style={{ ...s(panel), gap: 12 }}>
            <span style={s("align-self:flex-start;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px 14px 14px 4px;background:#fff;box-shadow:0 6px 14px -10px rgb(0 0 0 / .3);font:500 13px/1.4 'Noto Sans Tamil',Outfit,sans-serif")}><i className="ph-fill ph-microphone" style={{ color: '#e8590c' }} />“ரோட்டுல சாக்கடை தண்ணி ஓடுது”</span>
            <div style={s('display:flex;align-items:center;gap:3px;height:26px;padding:0 6px')}>
              {WAVE.map((h, k) => <span key={k} style={{ ...s('width:4px;border-radius:2px;background:#e8590c;opacity:.75'), height: h, animation: `kd-wave 1.2s ${(k * 0.07).toFixed(2)}s ease-in-out infinite` }} />)}
            </div>
            <span style={s('align-self:flex-end;padding:10px 12px;border-radius:14px 14px 4px 14px;background:#e8590c;color:#fff;font:600 13px/1.35 Outfit,sans-serif;max-width:85%')}>Sewage overflowing onto the road</span>
          </div>
          <Copy t="Speak in any language" d="Voice notes in Tamil, Hindi, Tanglish and more become clear, structured reports." />
        </div>

        <div className="kd-card" style={s('padding:14px;display:flex;flex-direction:column;gap:18px')}>
          <div style={{ ...s(panel), justifyContent: 'center' }}>
            <span style={s('align-self:center;font:700 34px/1 Outfit,sans-serif;letter-spacing:-.02em')}>94%</span>
            <span style={s('align-self:center;font:500 12px/1 Outfit,sans-serif;color:#8a8a8a')}>match with an existing report</span>
            <div style={s('position:relative;height:74px;margin-top:6px')}>
              <div style={s('position:absolute;inset:0 30px 12px 0;border-radius:14px;background:#fff;border:1px solid #efe7df;padding:10px 12px;font:600 12.5px/1.3 Outfit,sans-serif;box-shadow:0 10px 20px -16px rgb(0 0 0 / .4)')}>Pothole near the signal<br /><span style={s('font-weight:500;color:#8a8a8a')}>28 neighbours support</span></div>
              <div style={s('position:absolute;inset:14px 0 0 30px;border-radius:14px;background:#e8590c;color:#fff;padding:10px 12px;font:600 12.5px/1.3 Outfit,sans-serif;animation:kd-merge 3.2s ease-in-out infinite')}>Deep pit at the junction<br /><span style={s('font-weight:500;opacity:.85')}>Your report</span></div>
            </div>
          </div>
          <Copy t="Duplicates merge themselves" d="The same problem filed ten times becomes one case with ten voices behind it." />
        </div>

        <div className="kd-card" style={s('padding:14px;display:flex;flex-direction:column;gap:18px')}>
          <div style={s(panel)}>
            <div style={s('padding:12px;border-radius:14px;background:#fff;border:1px solid #efe7df;display:flex;flex-direction:column;gap:8px;box-shadow:0 10px 20px -16px rgb(0 0 0 / .4)')}>
              <div style={s('display:flex;gap:6px')}>
                <span style={s('height:22px;padding:0 9px;border-radius:999px;background:#fff4ec;color:#c2410c;font:600 11px/22px Outfit,sans-serif')}>High risk</span>
                <span style={s('height:22px;padding:0 9px;border-radius:999px;background:#f5f5f5;font:600 11px/22px Outfit,sans-serif')}>Lifts</span>
              </div>
              <span style={s('font:600 13.5px/1.3 Outfit,sans-serif')}>Block B lift stops between floors</span>
              <span style={s('display:flex;align-items:center;gap:6px;font:500 12px/1 Outfit,sans-serif;color:#8a8a8a')}><i className="ph-bold ph-arrow-right" />Suggested team · Maintenance</span>
            </div>
            <div style={s('display:flex;gap:6px;align-items:center;font:500 12px/1 Outfit,sans-serif;color:#8a8a8a')}><span style={s('width:8px;height:8px;border-radius:50%;background:#12a150;animation:kd-blink 1.6s ease-in-out infinite')} />Team reviews before it&apos;s assigned</div>
          </div>
          <Copy t="Right team, first time" d="AI suggests category, severity and team. Your people approve and assign." />
        </div>
      </div>
    </Reveal>
  );
}
