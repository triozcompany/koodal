import { NextResponse } from 'next/server';
import { getState, saveIssue } from '@/lib/firestore';
import type { Issue } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await getState();
    return NextResponse.json(state);
  } catch (err) {
    console.error('GET /api/issues', err);
    return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const issue: Issue = await req.json();
    await saveIssue(issue);
    return NextResponse.json({ ok: true, id: issue.id });
  } catch (err) {
    console.error('POST /api/issues', err);
    return NextResponse.json({ error: 'Failed to save issue' }, { status: 500 });
  }
}
