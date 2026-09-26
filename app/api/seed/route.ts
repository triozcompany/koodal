import { NextResponse } from 'next/server';
import { buildSeedIssues, SEED_SEQ, SEED_CASE_SEQ } from '@/data/seed-data';
import { seedFirestore } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const now = Date.now();
    const issues = buildSeedIssues(now);
    await seedFirestore(issues, SEED_SEQ, SEED_CASE_SEQ);
    return NextResponse.json({ ok: true, seeded: issues.length });
  } catch (err) {
    console.error('POST /api/seed', err);
    return NextResponse.json({ error: 'Seed failed', detail: String(err) }, { status: 500 });
  }
}
