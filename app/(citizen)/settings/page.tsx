'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { SettingsScreen } from '../screens/SettingsScreen';

export default function SettingsPage() {
  const router = useRouter();
  const { me, meInitials, mob, setMe, setVotes, logout } = useApp();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SettingsScreen
        me={me}
        meInitials={meInitials}
        mob={mob}
        setMe={setMe}
        clearVotes={() => { setVotes(() => ({})); setMe({ votes: {} }); }}
        onBack={() => router.push('/profile')}
        onLogout={logout}
      />
    </div>
  );
}
