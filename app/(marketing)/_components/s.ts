import type { CSSProperties } from 'react';

// The design reference is inline-styled; this turns its CSS strings into React style
// objects so values are copied verbatim instead of hand-transcribed.
export function s(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (!k) continue;
    out[k.startsWith('--') ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out as CSSProperties;
}
