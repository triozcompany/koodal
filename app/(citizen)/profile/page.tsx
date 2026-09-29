'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { ProfileScreen, type ProfileTab } from '../screens/ProfileScreen';
import { DesktopProfile } from '../screens/DesktopProfile';

const VALID_TABS: ProfileTab[] = ['reports', 'activity'];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { issues, me, meInitials, supported, opposed, mob, openIssue, toggleSupport, handleOppose, setCommentsFor } = useApp();

  const requested = searchParams.get('tab') as ProfileTab | null;
  const initialTab: ProfileTab = requested && VALID_TABS.includes(requested) ? requested : 'reports';

  if (mob) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ProfileScreen
          issues={issues}
          supported={supported}
          opposed={opposed}
          me={me}
          meInitials={meInitials}
          initialTab={initialTab}
          onOpen={openIssue}
          onSupport={toggleSupport}
          onOppose={handleOppose}
          onComments={setCommentsFor}
          onBack={() => router.push('/nearby')}
          onSettings={() => router.push('/settings')}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto' }}>
      <DesktopProfile
        issues={issues}
        supported={supported}
        opposed={opposed}
        me={me}
        meInitials={meInitials}
        initialTab={initialTab}
        onOpen={openIssue}
        onSupport={toggleSupport}
        onOppose={handleOppose}
        onComments={setCommentsFor}
      />
    </div>
  );
}
