'use client';
import { useEffect } from 'react';
import { ConsoleProvider } from './_components/ConsoleProvider';
import './console.css';

// Like the citizen app there is no user-switchable theme: the base is always light and specific
// surfaces (rail, tab bar, decision cards, map preview, Settings) are always dark.
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  // One-off cleanup: an earlier build stored a theme choice in localStorage, and the shared
  // ThemeProvider would restore it (turning the citizen app dark too) on the next visit.
  useEffect(() => {
    try { localStorage.removeItem('cp-theme'); } catch {}
    document.documentElement.setAttribute('data-cp-theme', 'light');
  }, []);

  return (
    <ConsoleProvider>
      <div className="cp-console" data-cp-theme="light" style={{ minHeight: '100vh', background: 'var(--cp-bg)', color: 'var(--cp-ink)', fontFamily: 'Outfit,system-ui,sans-serif' }}>
        {children}
      </div>
    </ConsoleProvider>
  );
}
