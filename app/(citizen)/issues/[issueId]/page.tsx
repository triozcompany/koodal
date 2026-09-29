'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { DetailScreen } from '../../screens/DetailScreen';

export default function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const router = useRouter();
  const {
    issues, mob, me, meInitials, supported, opposed,
    toggleSupport, handleOppose, handleAddEvidence,
    setEditFor, setCommentsFor, setVerifyFor, setCaseInfoFor,
    openIssue, justJoinedId, setJustJoinedId,
  } = useApp();

  const [confettiFired, setConfettiFired] = useState(false);
  useEffect(() => { setConfettiFired(false); }, [issueId]);

  const celebrateOnOpen = justJoinedId === issueId;
  useEffect(() => {
    if (celebrateOnOpen) setJustJoinedId(null);
  }, [celebrateOnOpen, setJustJoinedId]);

  const issue = issues.find(i => i.id === issueId);

  if (!issue) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <i className="ph-bold ph-question" style={{ fontSize: 40, color: 'var(--cp-ink-3)' }} />
        <span style={{ font: '600 14px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Issue not found.</span>
        <button onClick={() => router.push('/nearby')} style={{ height: 40, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer' }}>
          Back to Nearby
        </button>
      </div>
    );
  }

  return (
    <DetailScreen
      issue={issue}
      supported={!!supported[issue.id]}
      opposed={!!opposed[issue.id]}
      mob={mob}
      meInitials={meInitials}
      meUid={me.uid}
      confettiFired={confettiFired}
      celebrateOnOpen={celebrateOnOpen}
      onBack={() => router.back()}
      onSupport={() => toggleSupport(issue.id)}
      onOppose={() => handleOppose(issue.id)}
      onAddEvidence={(url) => handleAddEvidence(issue.id, url)}
      onEdit={() => setEditFor(issue.id)}
      onComments={() => setCommentsFor(issue.id)}
      onPhotos={() => router.push(`/issues/${issue.id}/evidences`)}
      onVerify={() => setVerifyFor(issue.id)}
      onViewCase={() => setCaseInfoFor(issue.id)}
      onOpenReport={openIssue}
      onConfettiDone={() => setConfettiFired(true)}
    />
  );
}
