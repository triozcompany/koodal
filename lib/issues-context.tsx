'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Issue, UserActions, Me } from '@/lib/domain/types';

const ME_DEFAULT: Me = { verified: true, anonDefault: false, name: 'Divya Raghavan', area: 'Velachery, Chennai' };
const MY_DEFAULT: UserActions = { support: {}, opposed: {}, contrib: {}, validated: {}, confirmed: {} };

interface IssuesCtx {
  issues: Issue[];
  loading: boolean;
  my: UserActions;
  me: Me;
  setMy: (fn: (prev: UserActions) => UserActions) => void;
}

const Ctx = createContext<IssuesCtx>({ issues: [], loading: true, my: MY_DEFAULT, me: ME_DEFAULT, setMy: () => {} });

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [my, setMy] = useState<UserActions>(MY_DEFAULT);

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('created', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return <Ctx.Provider value={{ issues, loading, my, me: ME_DEFAULT, setMy }}>{children}</Ctx.Provider>;
}

export const useIssues = () => useContext(Ctx);
