export type Stage = 'reported' | 'community' | 'review' | 'verified' | 'assigned' | 'progress' | 'resolved' | 'closed' | 'rejected';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'road' | 'drain' | 'garbage' | 'light' | 'water' | 'tree' | 'footpath';
export type Priority = 'P1' | 'P2' | 'P3';

export interface Voice { lang: string; text: string; en: string; }
export interface MergedReport { by: string; h: number; text: string; sim: number; me?: boolean; id?: string; }
export interface Evidence { id?: string; by: string; uid: string; ts: number; kind?: 'initial' | 'followup'; }
export interface IssueEvent { ts: number; title: string; sub: string; icon: string; kind: string; photo: string; }
export interface Comment { id?: string; by: string; uid?: string; text: string; ts: number; me?: boolean; edited?: boolean; }

export interface Issue {
  id: string;
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
  verified: boolean;
  anonDefault: boolean;
  verifiedAt?: number;
  name: string;
  area: string;
  phone?: string;
}

