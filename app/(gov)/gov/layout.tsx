'use client';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
