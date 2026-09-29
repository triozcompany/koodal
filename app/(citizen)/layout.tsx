'use client';
import { Suspense } from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AppProvider } from '@/lib/app-context';
import { AppShell } from './components/AppShell';

function ShellFallback() {
  return <div style={{ height: '100dvh', background: 'var(--cp-bg)' }} />;
}

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense fallback={<ShellFallback />}>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </Suspense>
    </ThemeProvider>
  );
}
