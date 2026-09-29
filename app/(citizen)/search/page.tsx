'use client';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { SearchScreen } from '../screens/SearchScreen';
import { DesktopSearch } from '../screens/DesktopSearch';

export default function SearchPage() {
  const { issues, me, meInitials, supported, toggleSupport, openIssue, mob, setFilterOpen, setEditFor, openProfile } = useApp();
  const { f, setF, fCount } = useFilters(issues);

  if (mob) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SearchScreen
          issues={issues}
          supported={supported}
          meInitials={meInitials}
          meVerified={me.verified}
          onOpen={openIssue}
          onSupport={toggleSupport}
          onFilter={() => setFilterOpen(true)}
          onEdit={setEditFor}
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
      <DesktopSearch
        issues={issues}
        f={f}
        onFilterChange={setF}
        onOpen={openIssue}
        onEdit={setEditFor}
        onFilter={() => setFilterOpen(true)}
        fCount={fCount}
      />
    </div>
  );
}
