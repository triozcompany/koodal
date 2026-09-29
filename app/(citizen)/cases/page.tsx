'use client';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { CasesScreen } from '../screens/CasesScreen';
import { DesktopCases } from '../screens/DesktopCases';

export default function CasesPage() {
  const { issues, me, meInitials, supported, openCase, mob, setFilterOpen, setVerifyFor, openProfile } = useApp();
  const { f, setF, fCount } = useFilters(issues);

  if (mob) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <CasesScreen
          issues={issues}
          supported={supported}
          meInitials={meInitials}
          meVerified={me.verified}
          onOpen={openCase}
          onFilter={() => setFilterOpen(true)}
          onConfirmFix={setVerifyFor}
          onProfile={openProfile}
          f={f}
          onFilterChange={setF}
          fCount={fCount}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto' }}>
      <DesktopCases
        issues={issues}
        supported={supported}
        onOpen={openCase}
        onFilter={() => setFilterOpen(true)}
        onConfirmFix={setVerifyFor}
        f={f}
        onFilterChange={setF}
        fCount={fCount}
      />
    </div>
  );
}
