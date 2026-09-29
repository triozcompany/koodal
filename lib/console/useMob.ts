'use client';
import { useEffect, useState } from 'react';

// Same 720px breakpoint as the citizen app's viewport hook (lib/app-context.tsx), which is
// not exported and lives behind the citizen AppProvider.
export function useMob() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const update = () => setMob(window.innerWidth < 720);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return mob;
}

export function useDesk() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const update = () => setDesk(window.innerWidth >= 1100);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return desk;
}
