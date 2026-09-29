'use client';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { DetailScreen } from '../../screens/DetailScreen';

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const router = useRouter();
  const {
    issues, mob, meInitials, supported, opposed,
    toggleSupport, handleOppose, handleAddEvidence,
    setEditFor, setCommentsFor, setVerifyFor, setCaseInfoFor,
    openIssue,
  } = useApp();

  // A caseId can be shared by more than one issue doc (see castVote's dedup-merge
  // guard) — the "primary" is whichever was created first, the actual case-owner.
  const candidates = issues.filter(i => i.caseId === caseId);
  const issue = candidates.length
    ? candidates.reduce((a, b) => (a.created < b.created ? a : b))
    : undefined;

  if (!issue) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <i className="ph-bold ph-question" style={{ fontSize: 40, color: 'var(--cp-ink-3)' }} />
        <span style={{ font: '600 14px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Case not found.</span>
        <button onClick={() => router.push('/cases')} style={{ height: 40, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer' }}>
          Back to Cases
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
      backLabel="Cases"
      meInitials={meInitials}
      onBack={() => router.push('/cases')}
      onSupport={() => toggleSupport(issue.id)}
      onOppose={() => handleOppose(issue.id)}
      onAddEvidence={() => handleAddEvidence(issue.id)}
      onEdit={() => setEditFor(issue.id)}
      onComments={() => setCommentsFor(issue.id)}
      onPhotos={() => router.push(`/issues/${issue.id}/evidences`)}
      onVerify={() => setVerifyFor(issue.id)}
      onViewCase={() => setCaseInfoFor(issue.id)}
      onOpenReport={openIssue}
    />
  );
}
