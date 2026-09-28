import { describe, it, expect } from 'vitest';
import { bump, score, slaLeft, slaRisk, deptFor, step } from '../rules';
import { D, H } from '../constants';
import type { Issue } from '../types';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'CP-0001', cat: 'road', sev: 'high', city: 'Chennai', area: 'Velachery',
    street: 'Test St', title: 'Test', stage: 'reported', sup: 0, conf: 24,
    created: Date.now(), x: 0, y: 0, km: 0, anon: false, mine: false,
    by: 'Test', dept: 'Roads & Bridges', summary: '', voice: null,
    merged: [], history: '', caseId: null, assignee: null, prio: null,
    due: null, confirms: 0, needed: 25, valYes: 0, valNo: 0,
    evidence: [], events: [], reject: null, opp: 0, shares: 0,
    comments: [], text: '', tags: [],
    ...overrides,
  };
}

describe('score', () => {
  it('calculates priority score correctly', () => {
    const issue = makeIssue({ sev: 'critical', conf: 80, sup: 50 });
    // SEVW[critical]=40 + 80*0.4 + 50*0.3 = 40+32+15 = 87
    expect(score(issue)).toBe(87);
  });

  it('caps at 99', () => {
    const issue = makeIssue({ sev: 'critical', conf: 97, sup: 60 });
    // 40 + 97*0.4 + 60*0.3 = 40+38.8+18 = 96.8 → 97
    expect(score(issue)).toBeLessThanOrEqual(99);
  });

  it('low severity, low conf, low sup', () => {
    const issue = makeIssue({ sev: 'low', conf: 10, sup: 2 });
    // 10 + 10*0.4 + 2*0.3 = 10+4+0.6 = 14.6 → 15
    expect(score(issue)).toBe(15);
  });
});

describe('bump', () => {
  it('clamps conf to 97 max', () => {
    const issue = makeIssue({ conf: 95, stage: 'community', sup: 10 });
    bump(issue, 5);
    expect(issue.conf).toBe(97);
  });

  it('clamps conf to 5 min', () => {
    const issue = makeIssue({ conf: 7, stage: 'reported', sup: 1 });
    bump(issue, -5);
    expect(issue.conf).toBe(5);
  });

  it('transitions reported → community when sup >= 5', () => {
    const issue = makeIssue({ stage: 'reported', sup: 5, conf: 30 });
    bump(issue, 1);
    expect(issue.stage).toBe('community');
  });

  it('transitions community → review when conf crosses 80', () => {
    const issue = makeIssue({ stage: 'community', sup: 10, conf: 79 });
    const crossed = bump(issue, 2);
    expect(crossed).toBe(true);
    expect(issue.stage).toBe('review');
    expect(issue.conf).toBe(81);
  });

  it('does not cross if already >= 80', () => {
    const issue = makeIssue({ stage: 'community', sup: 10, conf: 85 });
    const crossed = bump(issue, 2);
    expect(crossed).toBe(false);
    expect(issue.stage).toBe('community');
  });

  it('does not transition non-community/reported stage', () => {
    const issue = makeIssue({ stage: 'assigned', sup: 10, conf: 78 });
    const crossed = bump(issue, 5);
    expect(crossed).toBe(false);
    expect(issue.stage).toBe('assigned');
  });
});

describe('slaRisk', () => {
  it('returns 0 when no due date', () => {
    expect(slaRisk(makeIssue({ due: null, stage: 'progress' }))).toBe(0);
  });

  it('returns 0 when resolved', () => {
    const issue = makeIssue({ due: Date.now() - D, stage: 'resolved' });
    expect(slaRisk(issue)).toBe(0);
  });

  it('returns 2 when overdue', () => {
    const issue = makeIssue({ due: Date.now() - H, stage: 'progress' });
    expect(slaRisk(issue)).toBe(2);
  });

  it('returns 1 when < 24h remaining', () => {
    const issue = makeIssue({ due: Date.now() + 12 * H, stage: 'progress' });
    expect(slaRisk(issue)).toBe(1);
  });

  it('returns 0 when > 24h remaining', () => {
    const issue = makeIssue({ due: Date.now() + 3 * D, stage: 'progress' });
    expect(slaRisk(issue)).toBe(0);
  });
});

describe('slaLeft', () => {
  it('returns empty string when no due date', () => {
    expect(slaLeft(makeIssue({ due: null }))).toBe('');
  });

  it('returns overdue string when past due', () => {
    const issue = makeIssue({ due: Date.now() - 2 * D - 3 * H });
    expect(slaLeft(issue)).toMatch(/^Overdue 2d/);
  });

  it('returns X left string when future', () => {
    const issue = makeIssue({ due: Date.now() + 3 * D + 5 * H });
    expect(slaLeft(issue)).toMatch(/^3d.*left$/);
  });

  it('uses hours-only format when < 1 day', () => {
    const issue = makeIssue({ due: Date.now() + 10 * H });
    expect(slaLeft(issue)).toMatch(/^10h left$/);
  });
});

describe('deptFor', () => {
  it('maps road to Roads & Bridges', () => {
    expect(deptFor('road', 'Chennai')).toBe('Roads & Bridges');
  });

  it('maps water + Chennai to Metrowater', () => {
    expect(deptFor('water', 'Chennai')).toBe('Metrowater (CMWSSB)');
  });

  it('maps water + Coimbatore to Water & Sewerage (no special water dept)', () => {
    expect(deptFor('water', 'Coimbatore')).toBe('Water & Sewerage');
  });
});

describe('step', () => {
  it('reported is step 0', () => { expect(step('reported')).toBe(0); });
  it('community is step 1', () => { expect(step('community')).toBe(1); });
  it('assigned is step 2', () => { expect(step('assigned')).toBe(2); });
  it('closed is step 4', () => { expect(step('closed')).toBe(4); });
});
