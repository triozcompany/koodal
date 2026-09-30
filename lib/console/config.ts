import type { Severity } from '@/lib/domain/types';

// Organisation rules the Console runs on. They live in Firestore (`orgs/gcc`) so they can change
// without a deploy; DEFAULT_CONFIG is what the app used before and is the fallback for any field the
// document does not have.
export interface DeptConfig {
  name: string;
  icon: string;
  teams: string[];
  /** Department names the citizen app writes on a report (per category), which map to this department. */
  citizenDepts: string[];
}
export interface RejectReasonConfig { label: string; icon: string; needsRef?: boolean }
export interface OrgConfig {
  decisionSlaHours: number;
  targetDaysBySeverity: Record<Severity, number>;
  quickTargetDays: number[];
  rejectReasons: RejectReasonConfig[];
  departments: DeptConfig[];
  /** An issue becomes an official case at caseSupporters supporters OR caseConfidence % confidence. */
  caseSupporters: number;
  caseConfidence: number;
  /** Confidence (%) each support or join adds. */
  confPerSupport: number;
  /** Citizen confirmations needed to close a case the department marked fixed. */
  fixConfirmsNeeded: number;
  /** Unlocks seed/reset/wipe in Settings and shows test accounts on both sign-in pages. */
  testMode: boolean;
}

export const DEFAULT_CONFIG: OrgConfig = {
  decisionSlaHours: 48,
  targetDaysBySeverity: { critical: 5, high: 5, medium: 10, low: 14 },
  quickTargetDays: [3, 7, 14, 30],
  rejectReasons: [
    { label: 'Duplicate of an existing case', icon: 'ph-copy', needsRef: true },
    { label: 'Outside our jurisdiction', icon: 'ph-map-trifold' },
    { label: 'On private property', icon: 'ph-house-line' },
    { label: 'Already resolved on inspection', icon: 'ph-check-square' },
    { label: 'Not a civic issue', icon: 'ph-prohibit' },
    { label: 'Evidence does not match site', icon: 'ph-image-broken' },
  ],
  departments: [
    { name: 'Roads', icon: 'ph-road-horizon', teams: ['Roads Team'], citizenDepts: ['Roads & Bridges'] },
    { name: 'Water & Drainage', icon: 'ph-drop', teams: ['Water & Drainage Team'], citizenDepts: ['Storm Water Drains', 'Water & Sewerage', 'Metrowater (CMWSSB)'] },
    { name: 'Sanitation', icon: 'ph-trash', teams: ['Sanitation Team'], citizenDepts: ['Solid Waste Mgmt'] },
    { name: 'Streetlights', icon: 'ph-lightbulb', teams: ['Streetlights Team'], citizenDepts: ['Electrical'] },
    { name: 'Parks & Trees', icon: 'ph-tree', teams: ['Parks & Trees Team'], citizenDepts: ['Parks & Trees'] },
  ],
  caseSupporters: 5,
  caseConfidence: 80,
  confPerSupport: 8,
  fixConfirmsNeeded: 25,
  testMode: false,
};

const strs = (v: unknown): string[] | null => (Array.isArray(v) && v.length && v.every((x) => typeof x === 'string' && x) ? (v as string[]) : null);

/** Takes whatever is in Firestore and returns a complete, valid config; bad or missing fields fall back to the defaults. */
export function mergeConfig(raw: unknown): OrgConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_CONFIG;
  const sla = Number(r.decisionSlaHours);
  const days = (r.targetDaysBySeverity ?? {}) as Record<string, unknown>;
  const dayOf = (k: Severity) => (Number(days[k]) > 0 ? Number(days[k]) : d.targetDaysBySeverity[k]);
  const quick = Array.isArray(r.quickTargetDays) ? (r.quickTargetDays as unknown[]).map(Number).filter((n) => n > 0) : [];
  const reasons = Array.isArray(r.rejectReasons)
    ? (r.rejectReasons as Record<string, unknown>[]).filter((x) => typeof x?.label === 'string' && x.label).map((x) => ({ label: String(x.label), icon: typeof x.icon === 'string' && x.icon ? x.icon : 'ph-x-circle', needsRef: !!x.needsRef }))
    : [];
  const depts = Array.isArray(r.departments)
    ? (r.departments as Record<string, unknown>[]).flatMap((x) => {
        const teams = strs(x?.teams), citizen = strs(x?.citizenDepts);
        return typeof x?.name === 'string' && x.name && teams ? [{ name: x.name, icon: typeof x.icon === 'string' && x.icon ? x.icon : 'ph-buildings', teams, citizenDepts: citizen ?? [] }] : [];
      })
    : [];
  const pos = (k: 'caseSupporters' | 'caseConfidence' | 'confPerSupport' | 'fixConfirmsNeeded') => (Number(r[k]) > 0 ? Math.round(Number(r[k])) : d[k]);
  return {
    decisionSlaHours: sla > 0 ? sla : d.decisionSlaHours,
    targetDaysBySeverity: { critical: dayOf('critical'), high: dayOf('high'), medium: dayOf('medium'), low: dayOf('low') },
    quickTargetDays: quick.length ? quick : d.quickTargetDays,
    rejectReasons: reasons.length ? reasons : d.rejectReasons,
    departments: depts.length ? depts : d.departments,
    caseSupporters: pos('caseSupporters'),
    caseConfidence: Math.min(100, pos('caseConfidence')),
    confPerSupport: pos('confPerSupport'),
    fixConfirmsNeeded: pos('fixConfirmsNeeded'),
    testMode: r.testMode === true,
  };
}

// The active config is a module-level value: the client sets it once after sign-in, the server sets it
// (from a short cache) at the start of every Console action. Both read it through getConfig().
let active: OrgConfig = DEFAULT_CONFIG;
export const getConfig = () => active;
export const setActiveConfig = (c: OrgConfig) => { active = c; };
