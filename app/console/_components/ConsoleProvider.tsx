'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut as fbSignOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { inJurisdiction } from '@/lib/console/org';
import { deptName, isDemo } from '@/lib/console/derive';
import { DEFAULT_CONFIG, setActiveConfig } from '@/lib/console/config';
import { DEFAULT_PREFS, clearPrefs, readPrefs, writePrefs, type Prefs } from '@/lib/console/prefs';
import type { Issue } from '@/lib/domain/types';
import { emptyMapState, type MapState } from '@/lib/console/mapState';
import { haptic } from '@/lib/haptics';
import { getMe, saveStaffPrefs, type StaffProfile } from '@/server/actions/console-auth';

export type StaffSession = StaffProfile;
const SESSION_KEY = 'cp-console-staff';
const RAIL_KEY = 'cp-console-rail';

interface Ctx {
  staff: StaffSession | null;
  ready: boolean;
  /** True once the org config (departments, SLA, reject reasons) for this session has loaded. */
  configReady: boolean;
  /** GCC issues, narrowed to the staff member's departments and (by default) to real, non-demo reports. */
  issues: Issue[];
  /** Everything in scope regardless of the demo toggle (for personal stats and logs). */
  allIssues: Issue[];
  /** This staff member's saved settings (staff/{id}.prefs). */
  prefs: Prefs;
  updatePrefs: (patch: Partial<Prefs>) => void;
  showDemo: boolean;
  setShowDemo: (v: boolean) => void;
  /** How many seeded demo issues are in scope (shown or hidden), for the Settings switch. */
  demoCount: number;
  issuesReady: boolean;
  signIn: (token: string, staff: StaffSession) => Promise<void>;
  signOut: () => void;
  toast: (message: string) => void;
  railCollapsed: boolean;
  toggleRail: () => void;
  /** Map screen state that survives opening a case and coming back. Mutable on purpose. */
  mapState: { current: MapState };
}

const ConsoleCtx = createContext<Ctx>({
  staff: null, ready: false, configReady: false, issues: [], allIssues: [], prefs: DEFAULT_PREFS, updatePrefs: () => {}, showDemo: false, setShowDemo: () => {}, demoCount: 0,
  issuesReady: false, signIn: async () => {}, signOut: () => {}, toast: () => {}, railCollapsed: false, toggleRail: () => {}, mapState: { current: emptyMapState() },
});
export const useConsole = () => useContext(ConsoleCtx);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [configReady, setConfigReady] = useState(false);
  const [railCollapsed, setRail] = useState(false);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [issuesReady, setIssuesReady] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mapState = useRef<MapState>(emptyMapState());
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((m: string) => {
    haptic();
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    clearPrefs();
    clearTimeout(saveTimer.current);
    setStaff(null);
    setPrefs(DEFAULT_PREFS);
    setConfigReady(false);
    setActiveConfig(DEFAULT_CONFIG);
    mapState.current = emptyMapState();
    fbSignOut(auth).catch(() => {});
  }, []);

  // First paint from the local cache (cached session, settings, rail); the effect below then confirms it with the server.
  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setStaff(JSON.parse(s));
      setRail(localStorage.getItem(RAIL_KEY) === '1');
      setPrefs(readPrefs());
    } catch {}
    setReady(true);
  }, []);

  // Once signed in: load the live profile, saved settings and org config, then start the shared issues
  // subscription that every Console screen reads. A cached session that Firebase no longer recognises,
  // or a deactivated staff account, is signed out.
  const staffId = staff?.id;
  useEffect(() => {
    if (!staffId) { setAllIssues([]); setIssuesReady(false); return; }
    let cancelled = false;
    let unsub: (() => void) | undefined;
    const off = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;
      if (!user) { signOut(); return; }
      try {
        const me = await getMe(await user.getIdToken());
        if (cancelled) return;
        setActiveConfig(me.config);
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(me.staff)); } catch {}
        setStaff(me.staff);
        setPrefs(me.prefs);
        writePrefs(me.prefs);
        setConfigReady(true);
      } catch {
        if (!cancelled) signOut();
        return;
      }
      unsub?.();
      unsub = onSnapshot(query(collection(db, 'issues'), orderBy('created', 'desc')), (snap) => {
        setAllIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Issue)));
        setIssuesReady(true);
      }, () => setIssuesReady(true));
    });
    return () => { cancelled = true; off(); unsub?.(); };
  }, [staffId, signOut]);

  // Settings are saved to the staff record shortly after the last change (and cached locally).
  const updatePrefs = useCallback((patch: Partial<Prefs>) => {
    const next = { ...prefsRef.current, ...patch };
    prefsRef.current = next;
    setPrefs(next);
    writePrefs(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const t = await auth.currentUser?.getIdToken();
        if (t) await saveStaffPrefs(t, prefsRef.current);
      } catch { toast('Could not save your settings. Check your connection.'); }
    }, 600);
  }, [toast]);

  const showDemo = prefs.showDemo;
  const setShowDemo = useCallback((v: boolean) => updatePrefs({ showDemo: v }), [updatePrefs]);

  // Department names come from the org config, so the scope is recomputed once it has loaded.
  const scoped = useMemo(
    () => allIssues.filter((i) => inJurisdiction(i) && (!staff?.depts.length || staff.depts.includes(deptName(i)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIssues, staff, configReady],
  );
  const issues = useMemo(() => (showDemo ? scoped : scoped.filter((i) => !isDemo(i))), [scoped, showDemo]);
  const demoCount = useMemo(() => scoped.filter(isDemo).length, [scoped]);

  const toggleRail = useCallback(() => {
    setRail((c) => { try { localStorage.setItem(RAIL_KEY, c ? '0' : '1'); } catch {} return !c; });
  }, []);

  // Firebase custom-token sign-in gives Firestore reads a real auth identity with the staff claim.
  const signIn = useCallback(async (token: string, s: StaffSession) => {
    await signInWithCustomToken(auth, token);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
    setStaff(s);
  }, []);

  return (
    <ConsoleCtx.Provider value={{ staff, ready, configReady, issues, allIssues: scoped, prefs, updatePrefs, showDemo, setShowDemo, demoCount, issuesReady, signIn, signOut, toast, railCollapsed, toggleRail, mapState }}>
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
