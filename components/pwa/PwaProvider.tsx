'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { IOSInstallHelp } from './IOSInstallHelp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window { __koodalBip?: BeforeInstallPromptEvent }
}

interface InstallState {
  /** The browser offered a native install prompt (Android / desktop Chromium). */
  canInstall: boolean;
  isIOS: boolean;
  /** Already running as an installed app. */
  isStandalone: boolean;
  /** Something can be offered to the user: a native prompt, or manual steps on iOS. */
  showInstall: boolean;
  /** Native prompt where available; otherwise opens the iOS "Add to Home Screen" steps. */
  promptInstall: () => Promise<void>;
}

const InstallContext = createContext<InstallState>({
  canInstall: false, isIOS: false, isStandalone: false, showInstall: false, promptInstall: async () => {},
});

export const useInstall = () => useContext(InstallContext);

export function PwaProvider({ children }: { children: ReactNode }) {
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  // Service worker: production only, so dev HMR is never served through a worker.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else { window.addEventListener('load', register, { once: true }); return () => window.removeEventListener('load', register); }
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const mq = window.matchMedia('(display-mode: standalone)');
    const readStandalone = () => setIsStandalone(mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    readStandalone();
    mq.addEventListener('change', readStandalone);

    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep the event so our own UI can trigger it
      deferred.current = e as BeforeInstallPromptEvent;
      window.__koodalBip = deferred.current;
      setCanInstall(true);
    };
    if (window.__koodalBip) { deferred.current = window.__koodalBip; setCanInstall(true); } // fired before hydration
    const onInstalled = () => {
      deferred.current = null;
      window.__koodalBip = undefined;
      setCanInstall(false);
      setIsStandalone(true);
      setIosHelp(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      mq.removeEventListener('change', readStandalone);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const ev = deferred.current;
    if (ev) {
      deferred.current = null; // a prompt event can only be used once
      window.__koodalBip = undefined;
      setCanInstall(false);
      await ev.prompt();
      await ev.userChoice;
      return;
    }
    if (isIOS) setIosHelp(true);
  }, [isIOS]);

  const value = useMemo<InstallState>(() => ({
    canInstall, isIOS, isStandalone, promptInstall,
    showInstall: !isStandalone && (canInstall || isIOS),
  }), [canInstall, isIOS, isStandalone, promptInstall]);

  return (
    <InstallContext.Provider value={value}>
      {children}
      {iosHelp && <IOSInstallHelp onClose={() => setIosHelp(false)} />}
    </InstallContext.Provider>
  );
}
