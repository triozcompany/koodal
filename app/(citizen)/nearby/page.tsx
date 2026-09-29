'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { DEFAULT_FILTER } from '@/lib/domain/filters';
import { HomeScreen } from '../screens/HomeScreen';
import { DesktopHome } from '../screens/DesktopHome';

export default function NearbyPage() {
  const router = useRouter();
  const {
    issues, me, mob, wide, supported, toggleSupport, openIssue, openProfile,
    setFilterOpen, setLocationOpen, mapMaximized, setMapMaximized, mobileMapMax, setMobileMapMax,
  } = useApp();
  const { f, setF, filtered, fCount } = useFilters(issues);

  if (mob) {
    return (
      <HomeScreen
        issues={filtered}
        f={f}
        onFilter={() => setFilterOpen(true)}
        onLocation={() => setLocationOpen(true)}
        onOpen={openIssue}
        onSupport={toggleSupport}
        onClearFilters={() => setF(DEFAULT_FILTER)}
        supported={supported}
        fCount={fCount}
        me={me}
        onOpenDrawer={openProfile}
        onMapMaximize={setMobileMapMax}
        navHidden={mobileMapMax}
      />
    );
  }

  return (
    <DesktopHome
      issues={filtered}
      f={f}
      onFilter={() => setFilterOpen(true)}
      onLocation={() => setLocationOpen(true)}
      onOpen={openIssue}
      onSupport={toggleSupport}
      supported={supported}
      fCount={fCount}
      onSearch={() => router.push('/search')}
      wide={wide}
      mapMaximized={mapMaximized}
      onMapMaximize={() => setMapMaximized(true)}
      onMapMinimize={() => setMapMaximized(false)}
    />
  );
}
