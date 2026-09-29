'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { TAGS } from '@/lib/domain/constants';
import { ME } from '@/lib/domain/constants';
import { analyze } from '@/lib/domain/analyze';
import type { SceneKey, Analysis } from '@/lib/domain/analyze';
import { newShot, MAX_SHOTS } from '@/lib/domain/report-draft';
import { topTags } from '@/lib/domain/rules';
import type { Shot } from '@/lib/domain/report-draft';
import { submitReport, joinIssue } from '@/server/actions/report';
import { FilterPanel } from './FilterPanel';
import { LocationDrawer } from './LocationDrawer';
import { BottomNav } from './BottomNav';
import { DesktopRail } from './DesktopRail';
import { ReportScreen } from '../screens/ReportScreen';
import { AiScreen } from '../screens/AiScreen';
import { SimilarScreen } from '../screens/SimilarScreen';
import { ThresholdModal } from './ThresholdModal';
import { AuthScreen } from '../screens/AuthScreen';
import { EditReportScreen } from '../screens/EditReportScreen';
import { CommentsSheet } from './CommentsSheet';
import { VerifyScreen } from '../screens/VerifyScreen';
import { CaseDetailScreen } from '../screens/CaseDetailScreen';
import { ProfileDrawer } from './ProfileDrawer';

type ReportStep = 'report' | 'ai' | 'similar' | null;

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--cp-bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 15, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
        <i className="ph-bold ph-wave-triangle" style={{ fontSize: 26, color: 'var(--cp-bg)', animation: 'cp-scan 1.2s ease-in-out infinite' }}></i>
      </div>
      <span style={{ font: '600 14px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Loading…</span>
    </div>
  );
}

const PRIMARY_ROUTES = ['/nearby', '/feeds', '/search', '/cases', '/profile', '/settings'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    issues, loading, me, meInitials, mob, wide,
    supported, toggleSupport, handleOppose, handleAddEvidence, handleAddComment, handleEditComment, handleDeleteComment, handleValidateFix,
    thresholdIssue, closeThreshold,
    mapMaximized, mobileMapMax,
    filterOpen, setFilterOpen, locationOpen, setLocationOpen,
    editFor, setEditFor, commentsFor, setCommentsFor, verifyFor, setVerifyFor,
    caseInfoFor, setCaseInfoFor, profileDrawerOpen, setProfileDrawerOpen,
    showAuth, setShowAuth,
    openIssue, openCase, setVotes, setJustJoinedId,
  } = useApp();
  // FilterPanel/LocationDrawer act on whichever route is currently active —
  // useFilters is pathname-driven, so calling it here mirrors the active page's filter state.
  const { f, setF } = useFilters(issues);

  // Report flow — a linear draft, opened from the rail/nav "Report" button.
  const [reportStep, setReportStep] = useState<ReportStep>(null);
  const [scene, setScene] = useState<SceneKey>('sewage');
  const [anon, setAnon] = useState(false);
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [an, setAn] = useState<Analysis | null>(null);
  const [meVerified, setMeVerified] = useState(me.verified);

  const needConfirm = useMemo(
    () => issues.filter(i => i.stage === 'resolved' && supported[i.id]).length,
    [issues, supported],
  );

  const goReport = useCallback(() => {
    setScene('sewage');
    setAnon(me.anonDefault ?? false);
    setDesc('');
    setTags([]);
    setShots([]);
    setAn(null);
    setReportStep('report');
  }, [me.anonDefault]);

  const closeFlow = useCallback(() => {
    setAn(null);
    setReportStep(null);
  }, []);

  const addShot = useCallback(() => {
    setShots(prev => (prev.length >= MAX_SHOTS ? prev : [...prev, newShot(scene)]));
  }, [scene]);

  const removeShot = useCallback((id: string) => {
    setShots(prev => prev.filter(s => s.id !== id));
  }, []);

  const restoreShot = useCallback((shot: Shot, index: number) => {
    setShots(prev => {
      const next = [...prev];
      next.splice(index, 0, shot);
      return next;
    });
  }, []);

  const retakeAllShots = useCallback(() => {
    setShots([]);
  }, []);

  const onSlideSubmit = useCallback(() => {
    setAn(analyze(scene, issues));
    setReportStep('ai');
  }, [scene, issues]);

  const doPostNew = useCallback(async () => {
    if (!an) return;
    const effectiveTags = tags.length ? tags : [...(TAGS[an.cat as keyof typeof TAGS] ?? []).slice(0, 2), 'velachery'];
    try {
      const result = await submitReport({ scene, anon, text: desc, tags: effectiveTags, photos: shots.length, by: ME.name });
      setAn(null);
      setReportStep(null);
      openIssue(result.id);
    } catch (err) {
      console.error('submitReport failed:', err);
      setAn(null);
      setReportStep(null);
    }
  }, [an, scene, anon, desc, tags, shots.length, openIssue]);

  const doJoin = useCallback(async (id: string) => {
    if (!an) return;
    const match = an.matches.find(m => m.id === id);
    try {
      await joinIssue({ joinId: id, scene, anon, text: desc, tags, photos: shots.length, by: ME.name, score: match?.score ?? 90 });
      setAn(null);
      setReportStep(null);
      // joinIssue already counted this citizen's support server-side —
      // mark it locally too (no extra server call, that would double-count),
      // and flag it for a one-shot "just joined" confetti on the detail page.
      setVotes(prev => ({ ...prev, [id]: 'up' }));
      setJustJoinedId(id);
      openIssue(id);
    } catch (err) {
      console.error('joinIssue failed:', err);
      setAn(null);
      setReportStep(null);
    }
  }, [an, scene, anon, desc, tags, shots.length, openIssue, setVotes, setJustJoinedId]);

  const onAiNext = useCallback(() => {
    if (!an) return;
    setReportStep(an.matches.length > 0 ? 'similar' : null);
    if (an.matches.length === 0) doPostNew();
  }, [an, doPostNew]);

  if (loading) return <LoadingScreen />;

  const showBottomNav = mob && !mobileMapMax && !reportStep && PRIMARY_ROUTES.includes(pathname);

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--cp-bg)' }}>
      {!mob && !mapMaximized && (
        <DesktopRail wide={wide} onReport={goReport} meInitials={meInitials} needConfirm={needConfirm} />
      )}

      <div style={{ flex: 1, position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}

        {/* Report / AI analysis / duplicate-check flow */}
        {reportStep && mob && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', background: 'var(--cp-bg)' }}>
            <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
              {reportStep === 'report' && (
                <ReportScreen
                  scene={scene} anon={anon} desc={desc} tags={tags} shots={shots} meVerified={meVerified} mob={mob}
                  onClose={closeFlow} onScene={setScene} onAnon={setAnon} onDesc={setDesc} onTags={setTags}
                  onAddShot={addShot} onRemoveShot={removeShot} onRestoreShot={restoreShot} onRetakeAll={retakeAllShots}
                  onSlideSubmit={onSlideSubmit} onVerified={() => setMeVerified(true)}
                />
              )}
              {reportStep === 'ai' && an && (
                <AiScreen an={an} onNext={onAiNext} onClose={closeFlow} mob={mob} photoCount={shots.length} />
              )}
              {reportStep === 'similar' && an && an.matches.length > 0 && (
                <SimilarScreen
                  an={an} anon={anon} issues={issues} mob={mob} photoCount={shots.length}
                  onJoin={doJoin} onPostNew={doPostNew} onBack={() => setReportStep('report')} onClose={closeFlow}
                />
              )}
            </div>
          </div>
        )}
        {reportStep && !mob && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
            <div onClick={closeFlow} style={{ position: 'absolute', inset: 0, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both', cursor: 'pointer' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, bottom: 10, width: 480, borderRadius: 20, border: '1px solid var(--cp-line)', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
                {reportStep === 'report' && (
                  <ReportScreen
                    scene={scene} anon={anon} desc={desc} tags={tags} shots={shots} meVerified={meVerified} mob={false}
                    onClose={closeFlow} onScene={setScene} onAnon={setAnon} onDesc={setDesc} onTags={setTags}
                    onAddShot={addShot} onRemoveShot={removeShot} onRestoreShot={restoreShot} onRetakeAll={retakeAllShots}
                    onSlideSubmit={onSlideSubmit} onVerified={() => setMeVerified(true)}
                  />
                )}
                {reportStep === 'ai' && an && (
                  <AiScreen an={an} onNext={onAiNext} onClose={closeFlow} mob={false} photoCount={shots.length} />
                )}
                {reportStep === 'similar' && an && an.matches.length > 0 && (
                  <SimilarScreen
                    an={an} anon={anon} issues={issues} mob={false} photoCount={shots.length}
                    onJoin={doJoin} onPostNew={doPostNew} onBack={() => setReportStep('report')} onClose={closeFlow}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verify drawer — triggered from Detail (/issues/[issueId]), the case page
            (/cases/[caseId]), or the Cases list's "Confirm fix" button, via shared context.
            VerifyScreen manages its own fixed/scrim chrome, no wrapper needed. */}
        {verifyFor && (() => {
          const vIssue = issues.find(i => i.id === verifyFor);
          if (!vIssue) return null;
          return (
            <VerifyScreen issue={vIssue} mob={mob} onBack={() => setVerifyFor(null)} onValidate={yes => handleValidateFix(vIssue.id, yes)} />
          );
        })()}

        {/* Case-info drawer — triggered by clicking the "OFFICIAL CASE" banner on DetailScreen,
            from either /issues/[issueId] or /cases/[caseId]. */}
        {caseInfoFor && (() => {
          const ciIssue = issues.find(i => i.id === caseInfoFor);
          if (!ciIssue) return null;
          return (
            <CaseDetailScreen issue={ciIssue} mob={mob} onBack={() => setCaseInfoFor(null)} />
          );
        })()}

        {filterOpen && (
          <FilterPanel f={f} onChange={setF} onClose={() => setFilterOpen(false)} desktop={!mob} trendingTags={pathname === '/search' ? topTags(issues) : undefined} />
        )}

        {locationOpen && (
          <LocationDrawer f={f} onChange={setF} onClose={() => setLocationOpen(false)} issues={issues} mobile={mob} />
        )}
      </div>

      {showBottomNav && <BottomNav needConfirm={needConfirm} onReport={goReport} />}

      {profileDrawerOpen && (
        <ProfileDrawer
          issues={issues}
          supported={supported}
          meInitials={meInitials}
          meVerified={me.verified}
          meName={me.name}
          meArea={me.area}
          onClose={() => setProfileDrawerOpen(false)}
          onLogout={() => setShowAuth(true)}
        />
      )}

      {thresholdIssue && (
        <ThresholdModal
          issue={thresholdIssue}
          onClose={closeThreshold}
          onTrack={() => { closeThreshold(); if (thresholdIssue.caseId) openCase(thresholdIssue.caseId); }}
        />
      )}

      {showAuth && <AuthScreen mob={mob} onDone={() => setShowAuth(false)} onSkip={() => setShowAuth(false)} />}

      {editFor && (() => {
        const editIssue = issues.find(i => i.id === editFor);
        if (!editIssue) return null;
        return (
          <EditReportScreen
            issue={editIssue} mob={mob}
            onClose={() => setEditFor(null)}
            onSave={() => setEditFor(null)}
            onDelete={() => setEditFor(null)}
          />
        );
      })()}

      {commentsFor && (() => {
        const cIssue = issues.find(i => i.id === commentsFor);
        if (!cIssue) return null;
        return (
          <CommentsSheet
            issue={cIssue} mob={mob} desktop={!mob}
            onSend={text => handleAddComment(commentsFor!, text)}
            onEditComment={(commentId, text) => handleEditComment(commentsFor!, commentId, text)}
            onDeleteComment={commentId => handleDeleteComment(commentsFor!, commentId)}
            onClose={() => setCommentsFor(null)}
          />
        );
      })()}
    </div>
  );
}
