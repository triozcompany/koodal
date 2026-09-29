import { s } from './s';

const ITEMS = [['ph-road-horizon', 'Potholes', '#e8590c'], ['ph-arrows-down-up', 'Broken lifts', '#f5b30a'], ['ph-wifi-high', 'Hostel Wi-Fi', '#0f8b83'], ['ph-lightbulb', 'Streetlights', '#f5b30a'], ['ph-drop', 'Leaks & plumbing', '#0f8b83'], ['ph-trash', 'Garbage', '#12a150'], ['ph-shield-check', 'Gate security', '#6b5bd6'], ['ph-flask', 'Lab equipment', '#e8590c'], ['ph-fork-knife', 'Canteen', '#c2410c'], ['ph-waves', 'Drains', '#0f8b83']];
const MASK = 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)';

export function IssueMarquee() {
  return (
    <div style={{ margin: '90px 0 0', overflow: 'hidden', WebkitMaskImage: MASK, maskImage: MASK }}>
      <div style={s('display:flex;gap:12px;width:max-content;animation:kd-marquee 38s linear infinite')}>
        {[0, 1].flatMap((n) => ITEMS.map(([i, l, c]) => (
          <span key={n + l} style={s('display:flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:999px;background:#fff;border:1px solid #f0ebe5;font:600 14px/1 Outfit,sans-serif;color:#4d4d4d;white-space:nowrap')}>
            <i className={`ph-bold ${i}`} style={{ fontSize: 17, color: c }} />{l}
          </span>
        )))}
      </div>
    </div>
  );
}
