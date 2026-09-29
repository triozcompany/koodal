'use client';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { FeedScreen } from '../screens/FeedScreen';

export default function FeedsPage() {
  const { issues, me, meInitials, mob, wide, supported, opposed, toggleSupport, openIssue, setCommentsFor, handleOppose, openProfile } = useApp();
  const { filtered } = useFilters(issues);

  return (
    <FeedScreen
      issues={filtered}
      supported={supported}
      opposed={opposed}
      meInitials={meInitials}
      meVerified={me.verified}
      mob={mob}
      wide={wide}
      onOpen={openIssue}
      onSupport={toggleSupport}
      onComments={setCommentsFor}
      onOppose={handleOppose}
      onProfile={openProfile}
    />
  );
}
