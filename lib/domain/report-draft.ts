/** A photo captured in the report flow. `dataUrl` is a local, compressed
 * preview (see lib/local/localPhoto.ts) present from capture until submit —
 * nothing is uploaded to Cloudinary yet at that point. `url` is only ever
 * set once the real upload happens at submit time (see AppShell's
 * doPostNew/doJoin); `icon` is a generic placeholder glyph, shown only in
 * the brief gap before `dataUrl`/`url` itself renders. */
export interface Shot {
  id: string;
  icon: string;
  ts: number;
  dataUrl?: string;
  url?: string;
}

export const MAX_SHOTS = 5;

export function newShot(dataUrl: string): Shot {
  return { id: crypto.randomUUID(), icon: 'ph-image', ts: Date.now(), dataUrl };
}

/** The goal-gradient bar has 4 segments mapping to the 4 real flow steps —
 * Capture / Report / Analyze / Match — this module only owns the first two
 * (the report screen never knows about AI-analysis or match-found progress).
 * A segment for a step not yet reached must be exactly 0, never partially
 * filled from an unrelated field's weight. Segment 2's own weights (desc 25,
 * tag 10, slide 15) are kept as originally specified, just rescaled to this
 * one segment's 0-1 range (÷50 instead of ÷100) rather than the whole bar. */
export function calcReportSegments(opts: { hasShot: boolean; hasDesc: boolean; hasTag: boolean; slideFrac?: number }): [number, number] {
  const seg1 = opts.hasShot ? 1 : 0;
  const seg2 = !opts.hasShot || !opts.hasDesc ? 0 : Math.min(1, (25 + (opts.hasTag ? 10 : 0) + (opts.slideFrac ?? 0) * 15) / 50);
  return [seg1, seg2];
}

export interface ReportHint {
  icon: string;
  text: string;
  ready: boolean; // true once photo + description are both done (tags stay optional)
}

export function getReportHint(hasShot: boolean, hasDesc: boolean, hasTag: boolean): ReportHint {
  if (!hasShot) return { icon: 'ph-camera', text: 'Add a photo to begin', ready: false };
  if (!hasDesc) return { icon: 'ph-check', text: "Photo added · say what's wrong", ready: false };
  if (!hasTag) return { icon: 'ph-lightning', text: 'Almost there · add a tag or slide to post', ready: true };
  return { icon: 'ph-flag-checkered', text: 'All set · just slide to post', ready: true };
}
