// Pixel-distance clustering shared by the citizen Nearby map and the Console map.

export interface Px { x: number; y: number }

/** Greedy grouping: an item joins the first existing group within `px` pixels. Items flagged
 * `pinned` (the selected case) always stand alone and never absorb others, so a selected pin
 * or a fly-to target can never disappear inside a cluster. */
export function groupByPixel<T>(items: T[], project: (item: T) => Px, pinned: (item: T) => boolean, px: number): T[][] {
  const groups: { at: Px; items: T[]; solo: boolean }[] = [];
  for (const item of items) {
    const p = project(item);
    if (pinned(item)) { groups.push({ at: p, items: [item], solo: true }); continue; }
    const near = groups.find((g) => !g.solo && Math.hypot(g.at.x - p.x, g.at.y - p.y) < px);
    if (near) near.items.push(item); else groups.push({ at: p, items: [item], solo: false });
  }
  return groups.map((g) => g.items);
}

/** The count bubble. `wrap` is handed to maplibregl.Marker, so layout styles live on the inner
 * element (maplibre positions the wrapper itself). */
export function clusterElement(count: number, onClick: () => void): HTMLDivElement {
  const wrap = document.createElement('div');
  const inner = document.createElement('div');
  const s = Math.min(58, 38 + count * 2);
  inner.style.cssText = `display:grid;place-items:center;width:${s}px;height:${s}px;border-radius:50%;background:var(--cp-ink);color:var(--cp-bg);font:700 14px/1 Outfit,sans-serif;cursor:pointer;box-shadow:0 0 0 5px color-mix(in oklch,var(--cp-ink) 18%,transparent),0 8px 18px -8px rgb(0 0 0 / .5);`;
  inner.textContent = String(count);
  wrap.appendChild(inner);
  wrap.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return wrap;
}
