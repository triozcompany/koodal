import type { Stage, Severity } from './types';

/** Citizen status pill [bg, fg, label] */
export const PILL: Record<Stage, [string, string, string]> = {
  reported:  ['var(--cp-surface-2)',   'var(--cp-ink-2)',       'New'],
  community: ['var(--cp-marigold)',    'var(--cp-on-marigold)', 'Gathering support'],
  review:    ['var(--cp-peacock-soft)','var(--cp-ink)',         'With govt'],
  verified:  ['var(--cp-peacock)',     '#fff',                  'Official case'],
  assigned:  ['var(--cp-peacock)',     '#fff',                  'Official case'],
  progress:  ['var(--cp-pulse)',       '#fff',                  'In progress'],
  resolved:  ['var(--cp-leaf-soft)',  'var(--cp-ink)',          'Fixed · confirm'],
  closed:    ['var(--cp-leaf)',        '#fff',                  'Closed'],
  rejected:  ['var(--cp-surface-2)',  'var(--cp-ink-3)',        'Not accepted'],
};

/** Government stage style [label, bg, fg, icon] */
export const GS: Record<string, [string, string, string, string]> = {
  pending:  ['Pending approval',  'var(--cp-marigold)',    'var(--cp-on-marigold)', 'ph-hourglass-medium'],
  assigned: ['Assigned',          'var(--cp-peacock)',     '#fff',                  'ph-user-circle-check'],
  progress: ['In progress',       'var(--cp-pulse)',       '#fff',                  'ph-hard-hat'],
  reopened: ['Reopened',          'var(--cp-pulse-soft)',  'var(--cp-pulse-deep)',  'ph-arrow-counter-clockwise'],
  fixed:    ['Fixed · confirming','var(--cp-leaf-soft)',   'var(--cp-ink)',         'ph-check'],
  closed:   ['Closed',            'var(--cp-leaf)',        '#fff',                  'ph-seal-check'],
  rejected: ['Rejected',          'var(--cp-surface-2)',  'var(--cp-ink-3)',        'ph-x-circle'],
};

/** Map pin colours [bg, fg] */
export const PIN: Record<Stage, [string, string]> = {
  reported:  ['var(--cp-surface)',     'var(--cp-ink-2)'],
  community: ['var(--cp-marigold)',    'var(--cp-on-marigold)'],
  review:    ['var(--cp-peacock-soft)','var(--cp-ink)'],
  verified:  ['var(--cp-peacock)',     '#fff'],
  assigned:  ['var(--cp-peacock)',     '#fff'],
  progress:  ['var(--cp-pulse)',       '#fff'],
  resolved:  ['var(--cp-leaf-soft)',  'var(--cp-ink)'],
  closed:    ['var(--cp-leaf)',        '#fff'],
  rejected:  ['var(--cp-surface-2)',  'var(--cp-ink-3)'],
};

/** Severity label [bg, fg, label] */
export const SEVL: Record<Severity, [string, string, string]> = {
  critical: ['var(--cp-pulse-soft)',    'var(--cp-pulse-deep)', 'Critical'],
  high:     ['var(--cp-pulse-soft)',    'var(--cp-pulse-deep)', 'High risk'],
  medium:   ['var(--cp-marigold-soft)', 'var(--cp-ink)',        'Medium'],
  low:      ['var(--cp-surface-2)',     'var(--cp-ink-3)',      'Low'],
};

/** 5-segment track colours: ink-3 → marigold → peacock → pulse → leaf */
export const SEGC: string[] = [
  'var(--cp-ink-3)',
  'var(--cp-marigold)',
  'var(--cp-peacock)',
  'var(--cp-pulse)',
  'var(--cp-leaf)',
];

/** Progress track step [icon, label] */
export const TRACK: [string, string][] = [
  ['ph-flag',        'Reported'],
  ['ph-users-three', 'Community'],
  ['ph-seal-check',  'Verified'],
  ['ph-hard-hat',    'Action'],
  ['ph-check',       'Fixed'],
];

/** Avatar background colours (cycle by index % 4) */
export const AVB: string[] = [
  'var(--cp-marigold-soft)',
  'var(--cp-peacock-soft)',
  'var(--cp-pulse-soft)',
  'var(--cp-leaf-soft)',
];
