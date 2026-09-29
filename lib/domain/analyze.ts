import type { Category, Issue, Severity } from './types';
import { CATS, CITY } from './constants';

export interface CatMockEntry {
  sev: Severity; label: string; p: number;
  title: string; size: string; risk: string; street: string; x: number; y: number;
  voice: { lang: string; text: string; en: string };
}

/** Mocked AI-classification content, one per real category — shared by the
 * client-side analysis preview (below) and server/actions/report.ts (the
 * actually-persisted issue), so the two can never drift apart. */
export const CAT_MOCK: Record<Category, CatMockEntry> = {
  water: {
    sev: 'critical', label: 'Sewage overflow', p: 95,
    title: 'Sewage overflowing onto the road', size: '~15 m stretch',
    risk: 'Health hazard · bus stop 30 m', street: '100 Feet Rd, Vijayanagar', x: 48, y: 47,
    voice: { lang: 'Tanglish', text: '"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"', en: 'Drainage overflowing near the bus stand, it has been like this for days' },
  },
  road: {
    sev: 'high', label: 'Pothole', p: 96,
    title: 'Deep pothole on the carriageway', size: '~1.1 × 0.7 m',
    risk: 'Two-wheeler route · signal 40 m', street: 'Taramani Link Rd', x: 58, y: 40,
    voice: { lang: 'Tamil', text: '"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"', en: 'Very big pit, bikes fall at night' },
  },
  garbage: {
    sev: 'high', label: 'Garbage dump', p: 93,
    title: 'Uncollected garbage heap', size: '~3 m² heap',
    risk: 'Near market · stray dogs', street: 'Velachery Main Rd', x: 41, y: 66,
    voice: { lang: 'Tanglish', text: '"Three days-a garbage edukkala, smell romba jaasthi"', en: 'Garbage not collected for three days, the smell is terrible' },
  },
  light: {
    sev: 'medium', label: 'Streetlight out', p: 91,
    title: 'Streetlights not working', size: '3 poles dark',
    risk: 'Women walk here after work', street: 'Balaji Nagar 2nd St', x: 74, y: 70,
    voice: { lang: 'Tanglish', text: '"Street full-a dark, ladies nadakka bayapadranga"', en: 'The street is fully dark, women are afraid to walk' },
  },
  drain: {
    sev: 'high', label: 'Blocked storm drain', p: 92,
    title: 'Storm drain blocked with silt and plastic', size: '~8 m stretch',
    risk: 'Waterlogs in monsoon · school 100 m', street: 'Anna Nagar 4th Ave', x: 36, y: 52,
    voice: { lang: 'Tanglish', text: '"Rain vandha drain full-a thanni nikkuthu, moodu konjam naala achu"', en: 'When it rains the drain fills with water — it has been blocked for a while' },
  },
  tree: {
    sev: 'medium', label: 'Fallen tree branch', p: 89,
    title: 'Fallen branch blocking the footpath', size: '~4 m branch',
    risk: 'Blocks school route · bus stop 60 m', street: 'Besant Nagar 5th Cross St', x: 63, y: 58,
    voice: { lang: 'Tanglish', text: '"Marathu kombu udhinu footpath full-a mudichirukku, nadakka mudiyala"', en: 'A tree branch has fallen and blocked the footpath, we cannot walk' },
  },
  footpath: {
    sev: 'medium', label: 'Damaged footpath', p: 90,
    title: 'Footpath tiles broken and uneven', size: '~10 m stretch',
    risk: 'Elderly crossing · market nearby', street: 'T Nagar Usman Rd', x: 52, y: 62,
    voice: { lang: 'Tanglish', text: '"Footpath full-a tiles udhaindhu kidakku, thatti vizhuvom polerukku"', en: 'The footpath tiles are all broken, we feel like we will trip and fall' },
  },
};

export type AnalysisMatch = {
  id: string; title: string; dist: number; score: number; sup: number; by: string; h: number; stage: string;
};

export type Analysis = {
  cat: string; sev: string; label: string; p: number; title: string; size: string; risk: string;
  street: string; x: number; y: number;
  voice: { lang: string; text: string; en: string };
  dept: string; corp: string; catLabel: string; icon: string;
  summary: string; matches: AnalysisMatch[]; strong: AnalysisMatch | null;
};

export function deptFor(cat: string): string {
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

export interface ReportLocation {
  title: string;
  street: string;
  x: number;
  y: number;
}

/** `cat` (the category chosen on the report form) still drives the mocked AI
 * classification (severity/risk flavor text/voice sample) — that part of the
 * demo is unrelated to location. `report` carries what's now real: the
 * user's own title and chosen location, used for matching against other
 * real issues and for the returned summary. */
export function analyze(cat: Category, issues: Issue[], report: ReportLocation): Analysis {
  const sc = CAT_MOCK[cat];
  const H = 3600e3;
  const now = Date.now();
  const matches: AnalysisMatch[] = issues
    .filter(i => i.city === 'Chennai' && i.cat === cat && !['closed', 'rejected'].includes(i.stage) && i.km < 3)
    .map(i => {
      const { dist, score } = matchScore(i.x, i.y, report.x, report.y);
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
    cat,
    title: report.title,
    street: report.street,
    x: report.x,
    y: report.y,
    dept: deptFor(cat),
    corp: CITY.Chennai.corp,
    catLabel: CATS[cat].l,
    icon: CATS[cat].icon,
    summary: `${sc.label} at ${report.street}. ${sc.risk}.`,
    matches,
    strong,
  };
}
