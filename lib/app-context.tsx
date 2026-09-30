'use client';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged, signInWithCustomToken, signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import type { Issue, Me, MapCamera } from '@/lib/domain/types';
import { castVote, addEvidence, deleteEvidence, addComment, editComment, deleteComment, validateFix, editReport, deleteReport } from '@/server/actions/issue';
import { updateProfile } from '@/server/actions/auth';
import { getPublicConfig } from '@/server/actions/public-config';

const GUEST_ME: Me = { uid: '', verified: false, anonDefault: false, name: '', area: '', votes: {} };

interface AppCtx {
  // Firestore-backed data
  issues: Issue[];
  loading: boolean;
  me: Me;
  // True once Firebase Auth has reported its initial state (signed in or not) —
  // distinct from `loading` (issues), so the shell can tell "still checking"
  // apart from "checked, and there's no session" (which is what gates AuthScreen).
  authReady: boolean;
  /** The signed-in uid's profile doc has arrived; until then `me` is the guest placeholder and `authed` reads false. */
  meReady: boolean;
  authed: boolean;
  meInitials: string;
  setMe: (patch: Partial<Me>) => void;
  // Called by AuthScreen once signInWithPhone (server action) returns a custom
  // token — this is the one place the client Firebase Auth SDK is touched.
  signInWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;

  // Viewport
  mob: boolean;
  wide: boolean;

  // Vote — one citizen, one direction at a time (switching is allowed, retracting isn't).
  // `supported` is a derived read-only view (votes[id] === 'up') kept for existing callers.
  // Optimistic local cache, seeded once per sign-in from the persisted `me.votes`
  // (the actual source of truth, written server-side by castVote/joinIssue).
  votes: Record<string, 'up' | 'down'>;
  setVotes: (fn: (prev: Record<string, 'up' | 'down'>) => Record<string, 'up' | 'down'>) => void;
  supported: Record<string, boolean>;
  opposed: Record<string, boolean>;
  toggleSupport: (id: string) => Promise<void>;
  handleOppose: (id: string) => Promise<void>;
  handleAddEvidence: (id: string, url?: string) => Promise<void>;
  handleDeleteEvidence: (id: string, evidenceId: string) => Promise<void>;
  handleAddComment: (id: string, text: string) => Promise<void>;
  handleEditComment: (id: string, commentId: string, text: string) => Promise<void>;
  handleDeleteComment: (id: string, commentId: string) => Promise<void>;
  handleValidateFix: (id: string, yes: boolean) => Promise<void>;
  handleEditReport: (id: string, title: string, text: string, tags: string[]) => Promise<void>;
  handleDeleteReport: (id: string) => Promise<void>;

  // Community-verified celebration, triggered when support crosses the threshold
  thresholdIssue: Issue | null;
  closeThreshold: () => void;
  showThreshold: (id: string, caseId?: string) => void;
  /** Case thresholds and test mode from orgs/gcc (defaults until loaded). */
  publicConfig: { caseSupporters: number; caseConfidence: number; testMode: boolean };

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

  // Nearby screen state — persisted here (not local component state) so it
  // survives navigating to /issues/[id] and back. HomeScreen/DesktopHome/
  // NearbyMap fully unmount on that route change (this app doesn't have Next's
  // Cache Components <Activity> preservation enabled), so without this the
  // list scroll, selection, drawer position, and map camera reset every time.
  nearbySelectedId: string | null;
  setNearbySelectedId: (id: string | null) => void;
  nearbySheetHidden: boolean;
  setNearbySheetHidden: (v: boolean) => void;
  nearbySheetTop: number | null;
  setNearbySheetTop: (v: number | null | ((prev: number | null) => number | null)) => void;
  nearbyListOpen: boolean;
  setNearbyListOpen: (v: boolean) => void;
  nearbyListScroll: number;
  setNearbyListScroll: (v: number) => void;
  nearbyMapCamera: MapCamera | null;
  setNearbyMapCamera: (c: MapCamera) => void;

  // Same idea for Search (query/sort/scroll) and Feed (scroll) — both fully
  // unmount on navigating to an issue and back too.
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchSortMode: string;
  setSearchSortMode: (v: string) => void;
  searchScroll: number;
  setSearchScroll: (v: number) => void;
  feedScroll: number;
  setFeedScroll: (v: number) => void;
  refresh: () => Promise<void>;
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
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [me, setMeState] = useState<Me>(GUEST_ME);
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [thresholdIssue, setThresholdIssue] = useState<Issue | null>(null);
  const [publicConfig, setPublicConfig] = useState({ caseSupporters: 5, caseConfidence: 80, testMode: false });
  const [mapMaximized, setMapMaximized] = useState(false);
  const [mobileMapMax, setMobileMapMax] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [editFor, setEditFor] = useState<string | null>(null);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [verifyFor, setVerifyFor] = useState<string | null>(null);
  const [caseInfoFor, setCaseInfoFor] = useState<string | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [justJoinedId, setJustJoinedId] = useState<string | null>(null);
  const [nearbySelectedId, setNearbySelectedId] = useState<string | null>(null);
  const [nearbySheetHidden, setNearbySheetHidden] = useState(false);
  const [nearbySheetTop, setNearbySheetTop] = useState<number | null>(null);
  const [nearbyListOpen, setNearbyListOpen] = useState(true);
  const [nearbyListScroll, setNearbyListScroll] = useState(0);
  const [nearbyMapCamera, setNearbyMapCamera] = useState<MapCamera | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSortMode, setSearchSortMode] = useState('relevant');
  const [searchScroll, setSearchScroll] = useState(0);
  const [feedScroll, setFeedScroll] = useState(0);

  const meInitials = useMemo(() => me.name.split(' ').filter(Boolean).map(s => s[0]).join(''), [me.name]);
  // Signed in AND has finished the onboarding wizard (Aadhaar + profile) —
  // this, not mere uid presence, is what lets AppShell show the real app
  // instead of AuthScreen. AuthScreen itself only needs `me.uid` (available
  // right after sign-in) to make its own verifyAadhaar/updateProfile calls;
  // it deliberately defers setting `name` until its very last step, so this
  // flag doesn't flip — and swap AuthScreen out from under the wizard — early.
  const authed = !!(me.uid && me.verified && me.name);

  const setMe = useCallback((patch: Partial<Me>) => {
    setMeState(prev => ({ ...prev, ...patch }));
    const { name, area, anonDefault, votes: v } = patch;
    const persistable = {
      ...(name !== undefined && { name }),
      ...(area !== undefined && { area }),
      ...(anonDefault !== undefined && { anonDefault }),
      ...(v !== undefined && { votes: v }),
    };
    if (authUid && Object.keys(persistable).length) {
      updateProfile(authUid, persistable).catch(err => console.error('updateProfile failed:', err));
    }
  }, [authUid]);

  const signInWithToken = useCallback(async (token: string) => {
    await signInWithCustomToken(auth, token);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

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

  // Track Firebase Auth's own session — the real, persistent identity.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setAuthUid(user?.uid ?? null);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // While signed in, `me` is a live view of this uid's Firestore user doc —
  // profile edits and verification state made anywhere (this tab or another)
  // show up here automatically.
  useEffect(() => {
    if (!authUid) { setMeState(GUEST_ME); return; }
    const unsub = onSnapshot(doc(db, 'users', authUid), snap => {
      const data = snap.data();
      setMeState({
        uid: authUid,
        verified: !!data?.verified,
        anonDefault: !!data?.anonDefault,
        verifiedAt: data?.verifiedAt,
        name: data?.name ?? '',
        area: data?.area ?? '',
        phone: data?.phone,
        votes: data?.votes ?? {},
      });
    });
    return unsub;
  }, [authUid]);

  // Seed the optimistic local vote cache once per sign-in from the persisted
  // record — not on every doc update, so a vote this tab just cast (already
  // applied optimistically below) isn't clobbered by its own round-trip.
  useEffect(() => {
    setVotes(me.uid ? (me.votes ?? {}) : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.uid]);

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('created', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const refresh = useCallback(async () => {
    const snap = await getDocs(query(collection(db, 'issues'), orderBy('created', 'desc')));
    setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
  }, []);

  // `mine` is derived here, not trusted from Firestore — it's "does this
  // issue's creator uid match the signed-in uid," recomputed whenever either changes.
  const issuesWithMine = useMemo(
    () => issues.map(i => ({ ...i, mine: !!(me.uid && i.uid === me.uid) })),
    [issues, me.uid],
  );

  useEffect(() => { getPublicConfig().then(setPublicConfig).catch(() => {}); }, []);

  const showThreshold = useCallback((id: string, caseId?: string) => {
    const issue = issuesWithMine.find(i => i.id === id);
    if (issue) setThresholdIssue({ ...issue, caseId: caseId ?? issue.caseId });
  }, [issuesWithMine]);

  // Shared vote-casting: switching direction is allowed, re-casting the same
  // direction again is a no-op (no retract to neutral).
  const castVoteLocal = useCallback(async (id: string, dir: 'up' | 'down') => {
    const prevDir = votes[id] ?? null;
    if (prevDir === dir) return;
    setVotes(prev => ({ ...prev, [id]: dir }));
    try {
      const result = await castVote(id, dir, prevDir, me.name, me.uid);
      if (result.caseCreated) showThreshold(id, result.caseId);
    } catch (err) {
      console.error('castVote failed:', err);
      setVotes(prev => {
        const next = { ...prev };
        if (prevDir) next[id] = prevDir; else delete next[id];
        return next;
      });
    }
  }, [votes, me.name, me.uid, showThreshold]);

  const toggleSupport = useCallback((id: string) => castVoteLocal(id, 'up'), [castVoteLocal]);
  const handleOppose = useCallback((id: string) => castVoteLocal(id, 'down'), [castVoteLocal]);

  const handleAddEvidence = useCallback(async (id: string, url?: string) => {
    try { await addEvidence(id, me.name, me.uid, url); } catch (err) { console.error('addEvidence failed:', err); }
  }, [me.name, me.uid]);

  const handleDeleteEvidence = useCallback(async (id: string, evidenceId: string) => {
    try { await deleteEvidence(id, evidenceId); } catch (err) { console.error('deleteEvidence failed:', err); }
  }, []);

  const handleAddComment = useCallback(async (id: string, text: string) => {
    await addComment(id, me.name, me.uid, text);
  }, [me.name, me.uid]);

  const handleEditComment = useCallback(async (id: string, commentId: string, text: string) => {
    await editComment(id, commentId, text);
  }, []);

  const handleDeleteComment = useCallback(async (id: string, commentId: string) => {
    await deleteComment(id, commentId);
  }, []);

  const handleValidateFix = useCallback(async (id: string, yes: boolean) => {
    await validateFix(id, yes, me.name);
  }, [me.name]);

  const handleEditReport = useCallback(async (id: string, title: string, text: string, tags: string[]) => {
    await editReport(id, me.uid, title, text, tags);
  }, [me.uid]);

  const handleDeleteReport = useCallback(async (id: string) => {
    await deleteReport(id, me.uid);
  }, [me.uid]);

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
    issues: issuesWithMine, loading, me, authReady, meReady: !authUid || me.uid === authUid, authed, meInitials, setMe, signInWithToken, logout,
    mob, wide,
    votes, setVotes,
    supported, opposed, toggleSupport, handleOppose,
    handleAddEvidence, handleDeleteEvidence, handleAddComment, handleEditComment, handleDeleteComment, handleValidateFix,
    handleEditReport, handleDeleteReport,
    thresholdIssue, closeThreshold, showThreshold, publicConfig,
    mapMaximized, setMapMaximized, mobileMapMax, setMobileMapMax,
    filterOpen, setFilterOpen, locationOpen, setLocationOpen,
    editFor, setEditFor, commentsFor, setCommentsFor, verifyFor, setVerifyFor,
    caseInfoFor, setCaseInfoFor, profileDrawerOpen, setProfileDrawerOpen,
    openIssue, openCase, openProfile,
    justJoinedId, setJustJoinedId,
    nearbySelectedId, setNearbySelectedId,
    nearbySheetHidden, setNearbySheetHidden,
    nearbySheetTop, setNearbySheetTop,
    nearbyListOpen, setNearbyListOpen,
    nearbyListScroll, setNearbyListScroll,
    nearbyMapCamera, setNearbyMapCamera,
    searchQuery, setSearchQuery, searchSortMode, setSearchSortMode, searchScroll, setSearchScroll,
    feedScroll, setFeedScroll, refresh,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
