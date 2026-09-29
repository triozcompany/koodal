import type { Issue } from './types';
import { CATS, CITY } from './constants';

export type SceneKey = 'sewage' | 'pothole' | 'garbage' | 'light';

const SCENES = {
  sewage: {
    cat: 'water' as const, sev: 'critical' as const, label: 'Sewage overflow', p: 95,
    title: 'Sewage overflowing onto the road', size: '~15 m stretch',
    risk: 'Health hazard · bus stop 30 m', street: '100 Feet Rd, Vijayanagar', x: 48, y: 47,
    voice: { lang: 'Tanglish', text: '"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"', en: 'Drainage overflowing near the bus stand, it has been like this for days' },
  },
  pothole: {
    cat: 'road' as const, sev: 'high' as const, label: 'Pothole', p: 96,
    title: 'Deep pothole on the carriageway', size: '~1.1 × 0.7 m',
    risk: 'Two-wheeler route · signal 40 m', street: 'Taramani Link Rd', x: 58, y: 40,
    voice: { lang: 'Tamil', text: '"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"', en: 'Very big pit, bikes fall at night' },
  },
  garbage: {
    cat: 'garbage' as const, sev: 'high' as const, label: 'Garbage dump', p: 93,
    title: 'Uncollected garbage heap', size: '~3 m² heap',
    risk: 'Near market · stray dogs', street: 'Velachery Main Rd', x: 41, y: 66,
    voice: { lang: 'Tanglish', text: '"Three days-a garbage edukkala, smell romba jaasthi"', en: 'Garbage not collected for three days, the smell is terrible' },
  },
  light: {
    cat: 'light' as const, sev: 'medium' as const, label: 'Streetlight out', p: 91,
    title: 'Streetlights not working', size: '3 poles dark',
    risk: 'Women walk here after work', street: 'Balaji Nagar 2nd St', x: 74, y: 70,
    voice: { lang: 'Tanglish', text: '"Street full-a dark, ladies nadakka bayapadranga"', en: 'The street is fully dark, women are afraid to walk' },
  },
} as const;

export type AnalysisMatch = {
  id: string; title: string; dist: number; score: number; sup: number; by: string; h: number; stage: string;
};

export type Analysis = {
  cat: string; sev: string; label: string; p: number; title: string; size: string; risk: string;
  street: string; x: number; y: number;
  voice: { lang: string; text: string; en: string };
  dept: string; corp: string; catLabel: string; icon: string;
  summary: string; matches: AnalysisMatch[]; strong: AnalysisMatch | null;
  scene: SceneKey;
};

function deptFor(cat: string): string {
  if (cat === 'water') return CITY.Chennai.water!;
  return CATS[cat as keyof typeof CATS]?.dept ?? '';
}

/** Shared distance/confidence formula for "is this the same real-world problem?" —
 * used both by the report-time similarity check below and by the server-side
 * case-merge dedup guard (server/actions/issue.ts), so both places agree on what
 * counts as a match instead of re-deriving the same magic numbers twice. */
export function matchScore(ax: number, ay: number, bx: number, by: number): { dist: number; score: number } {
  const m = Math.hypot(ax - bx, ay - by) * 30;
  return { dist: Math.round(m), score: Math.max(0, Math.round(98 - m / 20)) };
}

export function analyze(scene: SceneKey, issues: Issue[]): Analysis {
  const sc = SCENES[scene];
  const H = 3600e3;
  const now = Date.now();
  const matches: AnalysisMatch[] = issues
    .filter(i => i.city === 'Chennai' && i.cat === sc.cat && !['closed', 'rejected'].includes(i.stage) && i.km < 3)
    .map(i => {
      const { dist, score } = matchScore(i.x, i.y, sc.x, sc.y);
      return {
        id: i.id, title: i.title, dist,
        score,
        sup: i.sup, by: i.by, h: Math.round((now - i.created) / H), stage: i.stage,
      };
    })
    .filter(m => m.dist < 700)
    .sort((a, b) => b.score - a.score);

  const strong = matches[0] && matches[0].score >= 85 ? matches[0] : null;

  return {
    ...sc,
    scene,
    dept: deptFor(sc.cat),
    corp: CITY.Chennai.corp,
    catLabel: CATS[sc.cat].l,
    icon: CATS[sc.cat].icon,
    summary: `${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`,
    matches,
    strong,
  };
}
