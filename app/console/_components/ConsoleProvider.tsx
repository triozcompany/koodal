'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut as fbSignOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { currentOrg } from '@/lib/console/org';
import { deptName } from '@/lib/console/derive';
import type { Issue } from '@/lib/domain/types';
import { emptyMapState, type MapState } from '@/lib/console/mapState';
import { haptic } from '@/lib/haptics';
import type { StaffProfile } from '@/server/actions/console-auth';

export type StaffSession = StaffProfile;
const SESSION_KEY = 'cp-console-staff';
const RAIL_KEY = 'cp-console-rail';

interface Ctx {
  staff: StaffSession | null;
  ready: boolean;
  /** GCC issues, narrowed to the signed-in staff member's departments. */
  issues: Issue[];
  issuesReady: boolean;
  signIn: (token: string, staff: StaffSession) => Promise<void>;
  signOut: () => void;
  toast: (message: string) => void;
  railCollapsed: boolean;
  toggleRail: () => void;
  /** Map screen state that survives opening a case and coming back. Mutable on purpose. */
  mapState: { current: MapState };
}

const ConsoleCtx = createContext<Ctx>({ staff: null, ready: false, issues: [], issuesReady: false, signIn: async () => {}, signOut: () => {}, toast: () => {}, railCollapsed: false, toggleRail: () => {}, mapState: { current: emptyMapState() } });
export const useConsole = () => useContext(ConsoleCtx);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [railCollapsed, setRail] = useState(false);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [issuesReady, setIssuesReady] = useState(false);
  const mapState = useRef<MapState>(emptyMapState());
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setStaff(JSON.parse(s));
      setRail(localStorage.getItem(RAIL_KEY) === '1');
    } catch {}
    setReady(true);
  }, []);

  // One shared live subscription for every Console screen. Waits for Firebase to restore the
  // staff session first so reads carry the staff identity.
  useEffect(() => {
    if (!staff) { setAllIssues([]); setIssuesReady(false); return; }
    let unsub: (() => void) | undefined;
    const off = onAuthStateChanged(auth, () => {
      unsub?.();
      unsub = onSnapshot(query(collection(db, 'issues'), orderBy('created', 'desc')), (snap) => {
        setAllIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Issue)));
        setIssuesReady(true);
      }, () => setIssuesReady(true));
    });
    return () => { off(); unsub?.(); };
  }, [staff]);

  const issues = useMemo(
    () => allIssues.filter((i) => i.city === currentOrg.city && (!staff?.depts.length || staff.depts.includes(deptName(i)))),
    [allIssues, staff],
  );

  const toast = useCallback((m: string) => {
    haptic();
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);

  const toggleRail = useCallback(() => {
    setRail((c) => { try { localStorage.setItem(RAIL_KEY, c ? '0' : '1'); } catch {} return !c; });
  }, []);

  // Firebase custom-token sign-in gives Firestore reads a real auth identity with the staff claim.
  const signIn = useCallback(async (token: string, s: StaffSession) => {
    await signInWithCustomToken(auth, token);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
    setStaff(s);
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    setStaff(null);
    mapState.current = emptyMapState();
    fbSignOut(auth).catch(() => {});
  }, []);

  return (
    <ConsoleCtx.Provider value={{ staff, ready, issues, issuesReady, signIn, signOut, toast, railCollapsed, toggleRail, mapState }}>
      {children}
      {msg && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', zIndex: 150, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 14,
          background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 12.5px/1.25 Outfit,sans-serif', maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box',
          animation: 'cp-toast .35s cubic-bezier(.2,.9,.3,1.3) both', boxShadow: '0 10px 30px -10px rgba(0,0,0,.4)', pointerEvents: 'none',
        }}>
          <i className="ph-fill ph-check-circle" style={{ color: 'var(--cp-leaf)', fontSize: 16, flex: 'none' }} />
          <span>{msg}</span>
        </div>
      )}
    </ConsoleCtx.Provider>
  );
}
