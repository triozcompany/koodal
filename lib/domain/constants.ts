import type { Category, Stage, Severity, Issue } from './types';

export const CATS: Record<Category, { l: string; icon: string; dept: string }> = {
  road:     { l: 'Roads',           icon: 'ph-road-horizon',        dept: 'Roads & Bridges' },
  drain:    { l: 'Drains',          icon: 'ph-waves',               dept: 'Storm Water Drains' },
  garbage:  { l: 'Garbage',         icon: 'ph-trash',               dept: 'Solid Waste Mgmt' },
  light:    { l: 'Streetlights',    icon: 'ph-lightbulb',           dept: 'Electrical' },
  water:    { l: 'Water & sewage',  icon: 'ph-drop',                dept: 'Water & Sewerage' },
  tree:     { l: 'Trees',           icon: 'ph-tree',                dept: 'Parks & Trees' },
  footpath: { l: 'Footpaths',       icon: 'ph-person-simple-walk',  dept: 'Roads & Bridges' },
};

export const issueIcon = (i: Pick<Issue, 'cat' | 'icon'>) => i.icon ?? CATS[i.cat]?.icon;

/** Report-form icon picker: the category icons, then generic ones for reports that fit no category. */
export const ICON_CHOICES: { icon: string; label: string }[] = [
  ...Object.values(CATS).map(c => ({ icon: c.icon, label: c.l })),
  { icon: 'ph-warning', label: 'Other · hazard' },
  { icon: 'ph-megaphone', label: 'Other · complaint' },
  { icon: 'ph-question', label: 'Other · unsure' },
  { icon: 'ph-flag', label: 'Other · general' },
];

/** Reverse lookup from a category's icon glyph back to its Category — lets
 * the report-form icon picker tell a real category icon apart from one of
 * the 4 generic "Other" ones above (which have no entry here). */
export const ICON_TO_CAT: Partial<Record<string, Category>> = Object.fromEntries(
  (Object.entries(CATS) as [Category, { icon: string }][]).map(([cat, c]) => [c.icon, cat]),
);

export const CITY: Record<string, { corp: string; code: string; water?: string; officers: string[] }> = {
  Chennai:    { corp: 'Greater Chennai Corp.',  code: 'CHN', water: 'Metrowater (CMWSSB)', officers: ['JE Priya Natarajan', 'JE Karthik Rajan', 'AE Farida Begum'] },
  Coimbatore: { corp: 'Coimbatore City Corp.', code: 'CBE', officers: ['JE Suresh Babu', 'JE Nithya Krishnan'] },
  Madurai:    { corp: 'Madurai Corporation',   code: 'MDU', officers: ['JE Muthu Pandian', 'JE Selvi Arumugam'] },
};

export const STAGES: Record<Stage, { l: string; step: number }> = {
  reported:  { l: 'New',               step: 0 },
  community: { l: 'Gathering support', step: 1 },
  review:    { l: 'With govt',         step: 1 },
  verified:  { l: 'Official case',     step: 2 },
  assigned:  { l: 'Assigned',          step: 2 },
  progress:  { l: 'In progress',       step: 3 },
  resolved:  { l: 'Fixed · confirm',   step: 4 },
  closed:    { l: 'Closed',            step: 4 },
  rejected:  { l: 'Rejected',          step: 0 },
};

export const SEVW: Record<Severity, number> = { critical: 40, high: 30, medium: 20, low: 10 };

export const ORDER: Stage[] = ['reported', 'community', 'review', 'verified', 'assigned', 'progress', 'resolved', 'closed'];

export const USERS = ['Karthik S', 'Priya M', 'Arun K', 'Meena V', 'Senthil R', 'Lakshmi N', 'Farhan A', 'Revathi P', 'Vignesh B', 'Anitha J', 'Suresh T', 'Kavya R'];

export const VERIFIER = 'AE R. Ganesan';

export const TAGS: Record<Category, string[]> = {
  road:     ['pothole', 'road-safety', 'two-wheeler'],
  drain:    ['monsoon', 'waterlogging', 'drainage'],
  garbage:  ['garbage', 'swachh', 'smell'],
  light:    ['streetlight', 'night-safety', 'women-safety'],
  water:    ['sewage', 'health-hazard', 'metrowater'],
  tree:     ['tree-fall', 'footpath'],
  footpath: ['walkability', 'footpath', 'encroachment'],
};

export const H = 3600e3;
export const D = 24 * H;
