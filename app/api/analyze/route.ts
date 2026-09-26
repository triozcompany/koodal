import { NextResponse } from 'next/server';
import { classifyReport, findSimilarIssues, translateAndExtract, summarizeForGov } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, text, city, issueId, issueSummary, eventCount, reportCount, candidates } = body as {
      type: 'classify' | 'translate' | 'similar' | 'summarize';
      text?: string;
      city?: string;
      issueId?: string;
      issueSummary?: { title: string; area: string; city: string; dept: string; sev: string; summary: string };
      eventCount?: number;
      reportCount?: number;
      candidates?: Array<{ id: string; title: string; area: string; stage: string }>;
    };

    if (type === 'classify' && text) {
      const result = await classifyReport(text, city || 'Chennai');
      return NextResponse.json(result);
    }

    if (type === 'translate' && text) {
      const result = await translateAndExtract(text);
      return NextResponse.json(result);
    }

    if (type === 'similar' && text) {
      // Candidates are passed from the client (already filtered by city/category)
      const result = await findSimilarIssues(text, candidates || []);
      return NextResponse.json(result);
    }

    if (type === 'summarize' && issueSummary) {
      const result = await summarizeForGov(issueSummary, eventCount || 0, reportCount || 0);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/analyze', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
