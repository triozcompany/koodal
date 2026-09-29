'use client';
import { useCallback, useEffect, useState } from 'react';

export interface Prefs {
  lang: string;
  notif: Record<string, boolean>;
  ch: Record<string, boolean>;
  timeout: '15m' | '30m' | '60m';
}
const KEY = 'cp-console-prefs';
export const DEFAULT_PREFS: Prefs = {
  lang: 'en',
  notif: { threshold: true, sla: true, reopen: true, dispute: true, digest: false },
  ch: { push: true, email: true, sms: false },
  timeout: '30m',
};

// Per-device preferences. Nothing here needs to reach the server or other devices.
export function readPrefs(): Prefs {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEFAULT_PREFS; }
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  useEffect(() => setPrefs(readPrefs()), []);
  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return [prefs, update] as const;
}

// Same 12 languages as the design (the citizen app's list plus Urdu).
export const LANGUAGES: [string, string, string][] = [
  ['en', 'English', 'English'], ['ta', 'தமிழ்', 'Tamil'], ['hi', 'हिन्दी', 'Hindi'], ['te', 'తెలుగు', 'Telugu'], ['kn', 'ಕನ್ನಡ', 'Kannada'], ['ml', 'മലയാളം', 'Malayalam'],
  ['bn', 'বাংলা', 'Bengali'], ['mr', 'मराठी', 'Marathi'], ['gu', 'ગુજરાતી', 'Gujarati'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'], ['or', 'ଓଡ଼ିଆ', 'Odia'], ['ur', 'اردو', 'Urdu'],
];
export const TIMEOUT_MIN = { '15m': 15, '30m': 30, '60m': 60 } as const;
