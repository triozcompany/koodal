export type Stage = 'reported' | 'community' | 'review' | 'verified' | 'assigned' | 'progress' | 'resolved' | 'closed' | 'rejected';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'road' | 'drain' | 'garbage' | 'light' | 'water' | 'tree' | 'footpath';
export type Priority = 'P1' | 'P2' | 'P3';

export interface MapCamera { center: [number, number]; zoom: number; pitch: number; bearing: number; }

export interface Voice { lang: string; text: string; en: string; }
export interface MergedReport { by: string; h: number; text: string; sim: number; me?: boolean; id?: string; }
export interface Evidence { id?: string; by: string; uid: string; ts: number; kind?: 'initial' | 'followup'; url?: string; }
export interface IssueEvent { ts: number; title: string; sub: string; icon: string; kind: string; photo: string; }
export interface Comment { id?: string; by: string; uid?: string; text: string; ts: number; me?: boolean; edited?: boolean; }

export interface Issue {
  id: string;
  uid?: string;
  cat: Category;
  sev: Severity;
  city: string;
  area: string;
  street: string;
  title: string;
  stage: Stage;
  sup: number;
  conf: number;
  created: number;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  /** User-chosen icon at report time; absent → the category icon (see issueIcon). */
  icon?: string;
  km: number;
  anon: boolean;
  mine: boolean;
  by: string;
  dept: string;
  summary: string;
  voice: Voice | null;
  merged: MergedReport[];
  history: string;
  caseId: string | null;
  assignee: string | null;
  team?: string;
  prio: Priority | null;
  due: number | null;
  confirms: number;
  needed: number;
  valYes: number;
  valNo: number;
  evidence: Evidence[];
  events: IssueEvent[];
  reject: string | null;
  opp: number;
  shares: number;
  comments: Comment[];
  text: string;
  tags: string[];
  reopened?: number;
  disputes?: number;
  rejectNote?: string;
  rejectProof?: string[];
  rejectRef?: string;
  rejectedAt?: number;
  fixProof?: string[];
  fixNote?: string;
}

export interface Me {
  uid: string;
  verified: boolean;
  anonDefault: boolean;
  verifiedAt?: number;
  name: string;
  area: string;
  phone?: string;
  votes: Record<string, 'up' | 'down'>;
}

