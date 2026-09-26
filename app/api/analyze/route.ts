import { NextResponse } from 'next/server';
import { classifyReport, findSimilarIssues, translateAndExtract, summarizeForGov } from '@/lib/gemini';
import { getState } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

const CATS: Record<string, { l: string; icon: string; dept: string }> = {
  road: { l: 'Roads', icon: 'ph-road-horizon', dept: 'Roads & Bridges' },
  drain: { l: 'Drains', icon: 'ph-waves', dept: 'Storm Water Drains' },
  garbage: { l: 'Garbage', icon: 'ph-trash', dept: 'Solid Waste Mgmt' },
  light: { l: 'Streetlights', icon: 'ph-lightbulb', dept: 'Electrical' },
  water: { l: 'Water & sewage', icon: 'ph-drop', dept: 'Water & Sewerage' },
  tree: { l: 'Trees', icon: 'ph-tree', dept: 'Parks & Trees' },
  footpath: { l: 'Footpaths', icon: 'ph-person-simple-walk', dept: 'Roads & Bridges' },
};

// Scene configs mirror the design's mock data for the camera demo
const SCENES: Record<string, { cat: string; sev: string; label: string; p: number; title: string; size: string; risk: string; street: string; x: number; y: number; voice: { lang: string; text: string; en: string } }> = {
  sewage: { cat: 'water', sev: 'critical', label: 'Sewage overflow', p: 95, title: 'Sewage overflowing onto the road', size: '~15 m stretch', risk: 'Health hazard · bus stop 30 m', street: '100 Feet Rd, Vijayanagar', x: 48, y: 47, voice: { lang: 'Tanglish', text: '"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"', en: 'Drainage overflowing near the bus stand, it has been like this for days' } },
  pothole: { cat: 'road', sev: 'high', label: 'Pothole', p: 96, title: 'Deep pothole on the carriageway', size: '~1.1 × 0.7 m', risk: 'Two-wheeler route · signal 40 m', street: 'Taramani Link Rd', x: 58, y: 40, voice: { lang: 'Tamil', text: '"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"', en: 'Very big pit, bikes fall at night' } },
  garbage: { cat: 'garbage', sev: 'high', label: 'Garbage dump', p: 93, title: 'Uncollected garbage heap', size: '~3 m² heap', risk: 'Near market · stray dogs', street: 'Velachery Main Rd', x: 41, y: 66, voice: { lang: 'Tanglish', text: '"Three days-a garbage edukkala, smell romba jaasthi"', en: 'Garbage not collected for three days, the smell is terrible' } },
  light: { cat: 'light', sev: 'medium', label: 'Streetlight out', p: 91, title: 'Streetlights not working', size: '3 poles dark', risk: 'Women walk here after work', street: 'Balaji Nagar 2nd St', x: 74, y: 70, voice: { lang: 'Tanglish', text: '"Street full-a dark, ladies nadakka bayapadranga"', en: 'The street is fully dark, women are afraid to walk' } },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, scene, text, city, issueId } = body as {
      type: 'scene' | 'classify' | 'translate' | 'similar' | 'summarize';
      scene?: string;
      text?: string;
      city?: string;
      issueId?: string;
    };

    if (type === 'scene' && scene) {
      // Camera demo: return scene data + find similar issues from Firestore
      const sc = SCENES[scene];
      if (!sc) return NextResponse.json({ error: 'Unknown scene' }, { status: 400 });

      const state = await getState();
      const candidates = state.issues.filter(
        i => i.city === 'Chennai' && i.cat === sc.cat && !['closed', 'rejected'].includes(i.stage) && i.km < 3,
      );
      const matches = candidates
        .map(i => {
          const m = Math.hypot(i.x - sc.x, i.y - sc.y) * 30;
          return { id: i.id, title: i.title, dist: Math.round(m), score: Math.max(0, Math.round(98 - m / 20)), sup: i.sup, by: i.by, h: Math.round((Date.now() - i.created) / 3600e3), stage: i.stage };
        })
        .filter(m => m.dist < 700)
        .sort((a, b) => b.score - a.score);

      const dept = sc.cat === 'water' ? 'Metrowater (CMWSSB)' : CATS[sc.cat].dept;
      return NextResponse.json({
        ...sc, scene, dept, corp: 'Greater Chennai Corp.', catLabel: CATS[sc.cat].l, icon: CATS[sc.cat].icon,
        summary: `${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`,
        matches, strong: matches[0] && matches[0].score >= 85 ? matches[0] : null,
      });
    }

    if (type === 'classify' && text) {
      const result = await classifyReport(text, city || 'Chennai');
      return NextResponse.json(result);
    }

    if (type === 'translate' && text) {
      const result = await translateAndExtract(text);
      return NextResponse.json(result);
    }

    if (type === 'similar' && text) {
      const state = await getState();
      const candidates = state.issues
        .filter(i => !['closed', 'rejected'].includes(i.stage))
        .map(i => ({ id: i.id, title: i.title, area: i.area, stage: i.stage }));
      const result = await findSimilarIssues(text, candidates);
      return NextResponse.json(result);
    }

    if (type === 'summarize' && issueId) {
      const state = await getState();
      const issue = state.issues.find(i => i.id === issueId);
      if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const result = await summarizeForGov(issue, issue.events.length, issue.merged.length);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/analyze', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
