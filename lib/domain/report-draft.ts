import type { SceneKey } from './analyze';

/** A simulated photo in the report flow — matches the app-wide convention of
 * styled placeholder blocks instead of real uploaded images (see PhotosScreen,
 * DetailScreen's mosaic, Feed's carousel — none of them store real image bytes). */
export interface Shot {
  id: string;
  icon: string;
  ts: number;
}

export const MAX_SHOTS = 5;

export const SCENE_ICONS: Record<SceneKey, string> = {
  sewage: 'ph-drop',
  pothole: 'ph-road-horizon',
  garbage: 'ph-trash',
  light: 'ph-lightbulb',
};

export const SCENE_LABELS: Record<SceneKey, string> = {
  sewage: 'Sewage overflow',
  pothole: 'Pothole',
  garbage: 'Garbage dump',
  light: 'Streetlight out',
};

export const SCENE_STREETS: Record<SceneKey, string> = {
  sewage: '100 Feet Rd, Vijayanagar',
  pothole: 'Taramani Link Rd',
  garbage: 'Velachery Main Rd',
  light: 'Balaji Nagar 2nd St',
};

export function newShot(scene: SceneKey): Shot {
  return { id: crypto.randomUUID(), icon: SCENE_ICONS[scene], ts: Date.now() };
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
  if (!hasShot) return { icon: 'ph-map-pin', text: 'Location pinned · add a photo', ready: false };
  if (!hasDesc) return { icon: 'ph-check', text: "Photo added · say what's wrong", ready: false };
  if (!hasTag) return { icon: 'ph-lightning', text: 'Almost there · add a tag or slide to post', ready: true };
  return { icon: 'ph-flag-checkered', text: 'All set · just slide to post', ready: true };
}
