'use client';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { IssuesProvider } from '@/lib/issues-context';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <IssuesProvider>
        {children}
      </IssuesProvider>
    </ThemeProvider>
  );
}
