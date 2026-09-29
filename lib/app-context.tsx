'use client';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import type { Issue, Me } from '@/lib/domain/types';
import { castVote, addEvidence, deleteEvidence, addComment, editComment, deleteComment, validateFix } from '@/server/actions/issue';
import { ME, D } from '@/lib/domain/constants';

const ME_DEFAULT: Me = { verified: true, anonDefault: false, name: ME.name, area: ME.area, phone: ME.phone, verifiedAt: Date.now() - 40 * D };

interface AppCtx {
  // Firestore-backed data
  issues: Issue[];
  loading: boolean;
  me: Me;
  meInitials: string;
  setMe: (patch: Partial<Me>) => void;

  // Viewport
  mob: boolean;
  wide: boolean;

  // Vote — one citizen, one direction at a time (switching is allowed, retracting isn't).
  // `supported` is a derived read-only view (votes[id] === 'up') kept for existing callers.
  votes: Record<string, 'up' | 'down'>;
  setVotes: (fn: (prev: Record<string, 'up' | 'down'>) => Record<string, 'up' | 'down'>) => void;
  supported: Record<string, boolean>;
  opposed: Record<string, boolean>;
  toggleSupport: (id: string) => Promise<void>;
  handleOppose: (id: string) => Promise<void>;
  handleAddEvidence: (id: string) => Promise<void>;
  handleDeleteEvidence: (id: string, evidenceId: string) => Promise<void>;
  handleAddComment: (id: string, text: string) => Promise<void>;
  handleEditComment: (id: string, commentId: string, text: string) => Promise<void>;
  handleDeleteComment: (id: string, commentId: string) => Promise<void>;
  handleValidateFix: (id: string, yes: boolean) => Promise<void>;

  // Community-verified celebration, triggered when support crosses the threshold
  thresholdIssue: Issue | null;
  closeThreshold: () => void;

  // Map maximize — shared between the Home route (which triggers it) and the
  // shell (which hides the rail/nav while it's active)
  mapMaximized: boolean;
  setMapMaximized: (v: boolean) => void;
  mobileMapMax: boolean;
  setMobileMapMax: (v: boolean) => void;

  // Drawers reachable from any route (rail buttons, screen headers)
  filterOpen: boolean;
  setFilterOpen: (v: boolean) => void;
  locationOpen: boolean;
  setLocationOpen: (v: boolean) => void;

  // Overlays triggered from Detail (/issues/[issueId]) or the case page (/cases/[caseId]) —
  // shared here because both routes need to reach the same setters
  editFor: string | null;
  setEditFor: (id: string | null) => void;
  commentsFor: string | null;
  setCommentsFor: (id: string | null) => void;
  verifyFor: string | null;
  setVerifyFor: (id: string | null) => void;
  caseInfoFor: string | null;
  setCaseInfoFor: (id: string | null) => void;
  profileDrawerOpen: boolean;
  setProfileDrawerOpen: (v: boolean) => void;

  // Onboarding/verification wizard — also doubles as the "log out" destination
  // (Settings' Log out just re-opens it, matching the design's own intent).
  showAuth: boolean;
  setShowAuth: (v: boolean) => void;

  // Navigate to an issue's real page
  openIssue: (id: string) => void;
  // Navigate to a case's real page (Cases list, ThresholdModal's "Track verification")
  openCase: (caseId: string) => void;
  // Avatar buttons everywhere call this one function — mob-aware branching
  // (drawer vs. real route) lives here, not repeated at every call site.
  openProfile: () => void;

  // Set by AppShell right before navigating to a just-joined issue, so its
  // detail page can show confetti once and know it's already supported.
  justJoinedId: string | null;
  setJustJoinedId: (id: string | null) => void;
}

const Ctx = createContext<AppCtx | null>(null);

function useViewport() {
  const [mob, setMob] = useState(true);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setMob(w < 720);
      setWide(w >= 1100);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return { mob, wide };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { mob, wide } = useViewport();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [thresholdIssue, setThresholdIssue] = useState<Issue | null>(null);
  const [mapMaximized, setMapMaximized] = useState(false);
  const [mobileMapMax, setMobileMapMax] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [editFor, setEditFor] = useState<string | null>(null);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [verifyFor, setVerifyFor] = useState<string | null>(null);
  const [caseInfoFor, setCaseInfoFor] = useState<string | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [justJoinedId, setJustJoinedId] = useState<string | null>(null);

  const [me, setMeState] = useState<Me>(ME_DEFAULT);
  const meInitials = useMemo(() => me.name.split(' ').filter(Boolean).map(s => s[0]).join(''), [me.name]);
  const setMe = useCallback((patch: Partial<Me>) => setMeState(prev => ({ ...prev, ...patch })), []);

  const supported = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const [id, dir] of Object.entries(votes)) if (dir === 'up') out[id] = true;
    return out;
  }, [votes]);

  const opposed = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const [id, dir] of Object.entries(votes)) if (dir === 'down') out[id] = true;
    return out;
  }, [votes]);

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('created', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Shared vote-casting: switching direction is allowed, re-casting the same
  // direction again is a no-op (no retract to neutral).
  const castVoteLocal = useCallback(async (id: string, dir: 'up' | 'down') => {
    const prevDir = votes[id] ?? null;
    if (prevDir === dir) return;
    setVotes(prev => ({ ...prev, [id]: dir }));
    try {
      const result = await castVote(id, dir, prevDir, me.name);
      if (result.caseCreated) {
        const issue = issues.find(i => i.id === id);
        if (issue) setThresholdIssue({ ...issue, caseId: result.caseId ?? issue.caseId });
      }
    } catch (err) {
      console.error('castVote failed:', err);
      setVotes(prev => {
        const next = { ...prev };
        if (prevDir) next[id] = prevDir; else delete next[id];
        return next;
      });
    }
  }, [votes, me.name, issues]);

  const toggleSupport = useCallback((id: string) => castVoteLocal(id, 'up'), [castVoteLocal]);
  const handleOppose = useCallback((id: string) => castVoteLocal(id, 'down'), [castVoteLocal]);

  const handleAddEvidence = useCallback(async (id: string) => {
    try { await addEvidence(id, me.name); } catch (err) { console.error('addEvidence failed:', err); }
  }, [me.name]);

  const handleDeleteEvidence = useCallback(async (id: string, evidenceId: string) => {
    try { await deleteEvidence(id, evidenceId); } catch (err) { console.error('deleteEvidence failed:', err); }
  }, []);

  const handleAddComment = useCallback(async (id: string, text: string) => {
    await addComment(id, me.name, text);
  }, [me.name]);

  const handleEditComment = useCallback(async (id: string, commentId: string, text: string) => {
    await editComment(id, commentId, text);
  }, []);

  const handleDeleteComment = useCallback(async (id: string, commentId: string) => {
    await deleteComment(id, commentId);
  }, []);

  const handleValidateFix = useCallback(async (id: string, yes: boolean) => {
    await validateFix(id, yes, me.name);
  }, [me.name]);

  const closeThreshold = useCallback(() => setThresholdIssue(null), []);

  const openIssue = useCallback((id: string) => {
    router.push(`/issues/${id}`);
  }, [router]);

  const openCase = useCallback((caseId: string) => {
    router.push(`/cases/${caseId}`);
  }, [router]);

  const openProfile = useCallback(() => {
    if (mob) setProfileDrawerOpen(true); else router.push('/profile');
  }, [mob, router]);

  const value: AppCtx = {
    issues, loading, me, meInitials, setMe,
    mob, wide,
    votes, setVotes,
    supported, opposed, toggleSupport, handleOppose,
    handleAddEvidence, handleDeleteEvidence, handleAddComment, handleEditComment, handleDeleteComment, handleValidateFix,
    thresholdIssue, closeThreshold,
    mapMaximized, setMapMaximized, mobileMapMax, setMobileMapMax,
    filterOpen, setFilterOpen, locationOpen, setLocationOpen,
    editFor, setEditFor, commentsFor, setCommentsFor, verifyFor, setVerifyFor,
    caseInfoFor, setCaseInfoFor, profileDrawerOpen, setProfileDrawerOpen,
    showAuth, setShowAuth,
    openIssue, openCase, openProfile,
    justJoinedId, setJustJoinedId,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
