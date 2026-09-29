'use client';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { PhotosScreen } from '../../../screens/PhotosScreen';

export default function IssueEvidencesPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const router = useRouter();
  const { issues, mob, handleDeleteEvidence } = useApp();

  const issue = issues.find(i => i.id === issueId);

  if (!issue) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <i className="ph-bold ph-question" style={{ fontSize: 40, color: 'var(--cp-ink-3)' }} />
        <span style={{ font: '600 14px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Issue not found.</span>
      </div>
    );
  }

  return (
    <PhotosScreen
      issue={issue}
      mob={mob}
      onBack={() => router.back()}
      onDeleteEvidence={evidenceId => handleDeleteEvidence(issue.id, evidenceId)}
    />
  );
}
