'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { useFilters } from '@/lib/hooks/useFilters';
import { TAGS, ICON_TO_CAT } from '@/lib/domain/constants';
import { analyze } from '@/lib/domain/analyze';
import type { Analysis } from '@/lib/domain/analyze';
import type { Category } from '@/lib/domain/types';
import { projectToFakeMap } from '@/lib/domain/geo';
import { newShot, MAX_SHOTS } from '@/lib/domain/report-draft';
import { topTags } from '@/lib/domain/rules';
import type { Shot } from '@/lib/domain/report-draft';
import type { GeocodeResult } from '@/lib/geo/nominatim';
import { saveDraftPhoto, removeDraftPhoto, removeDraftPhotos } from '@/lib/local/draftPhotos';
import { dataUrlToFile } from '@/lib/local/localPhoto';
import { uploadPhoto } from '@/lib/cloudinary/upload';
import { submitReport, joinIssue } from '@/server/actions/report';
import { deleteCloudinaryImages } from '@/server/actions/cloudinary';
import { FilterPanel } from './FilterPanel';
import { LocationDrawer } from './LocationDrawer';
import { BottomNav } from './BottomNav';
import { DesktopRail } from './DesktopRail';
import { ReportScreen } from '../screens/ReportScreen';
import { AiScreen } from '../screens/AiScreen';
import { SimilarScreen } from '../screens/SimilarScreen';
import { ThresholdModal } from './ThresholdModal';
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
const ONBOARD_ROUTE = '/onboard-member';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    issues, loading, me, authReady, meReady, authed, meInitials, mob, wide, logout,
    supported, toggleSupport, handleOppose, handleAddEvidence, handleAddComment, handleEditComment, handleDeleteComment, handleValidateFix,
    handleEditReport, handleDeleteReport,
    thresholdIssue, closeThreshold, showThreshold,
    mapMaximized, mobileMapMax,
    filterOpen, setFilterOpen, locationOpen, setLocationOpen,
    editFor, setEditFor, commentsFor, setCommentsFor, verifyFor, setVerifyFor,
    caseInfoFor, setCaseInfoFor, profileDrawerOpen, setProfileDrawerOpen,
    openIssue, openCase, setVotes, setJustJoinedId,
  } = useApp();
  // FilterPanel/LocationDrawer act on whichever route is currently active —
  // useFilters is pathname-driven, so calling it here mirrors the active page's filter state.
  const { f, setF } = useFilters(issues);

  // Report flow — a linear draft, opened from the rail/nav "Report" button.
  const [reportStep, setReportStep] = useState<ReportStep>(null);
  const [cat, setCat] = useState<Category>('road');
  const [icon, setIcon] = useState<string | null>(null); // null = the category's default icon
  const [anon, setAnon] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [location, setLocation] = useState<GeocodeResult | null>(null);
  const [an, setAn] = useState<Analysis | null>(null);
  // 'uploading' while photos are going to Cloudinary, 'saving' during the
  // Firestore write — both only start once the report is actually being
  // submitted (see doPostNew/doJoin), never at capture time.
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needConfirm = useMemo(
    () => issues.filter(i => i.stage === 'resolved' && supported[i.id]).length,
    [issues, supported],
  );

  const goReport = useCallback(() => {
    setCat('road');
    setIcon(null);
    setAnon(me.anonDefault ?? false);
    setTitle('');
    setDesc('');
    setTags([]);
    setShots([]);
    setLocation(null);
    setAn(null);
    setReportStep('report');
  }, [me.anonDefault]);

  // Nothing's been uploaded to Cloudinary yet at this point (that only ever
  // happens inside doPostNew/doJoin) — cancelling just clears the local
  // draft cache for whatever photos were captured.
  const closeFlow = useCallback(() => {
    if (submitPhase !== 'idle') return;
    removeDraftPhotos(shots.map(s => s.id));
    setAn(null);
    setSubmitError(null);
    setReportStep(null);
  }, [shots, submitPhase]);

  const addShot = useCallback((dataUrl: string) => {
    setShots(prev => {
      if (prev.length >= MAX_SHOTS) return prev;
      const shot = newShot(dataUrl);
      saveDraftPhoto(shot.id, dataUrl);
      return [...prev, shot];
    });
  }, []);

  const removeShot = useCallback((id: string) => {
    removeDraftPhoto(id);
    setShots(prev => prev.filter(s => s.id !== id));
  }, []);

  const restoreShot = useCallback((shot: Shot, index: number) => {
    if (shot.dataUrl) saveDraftPhoto(shot.id, shot.dataUrl);
    setShots(prev => {
      const next = [...prev];
      next.splice(index, 0, shot);
      return next;
    });
  }, []);

  const retakeAllShots = useCallback(() => {
    setShots(prev => {
      removeDraftPhotos(prev.map(s => s.id));
      return [];
    });
  }, []);

  const onSlideSubmit = useCallback(() => {
    if (!location) return;
    const { x, y } = projectToFakeMap(location.lat, location.lng);
    setAn(analyze(cat, issues, { title, street: location.address, x, y, lat: location.lat, lng: location.lng, city: location.city }));
    setReportStep('ai');
  }, [cat, issues, location, title]);

  // Only now — the report is actually being saved — do any photos go to
  // Cloudinary. Anything that succeeds gets rolled back (deleted) if a later
  // step in this same submit fails, and the local draft is left intact
  // either way so a failed attempt can be retried without re-capturing.
  const uploadDraftShots = useCallback(async () => {
    const toUpload = shots.filter(s => s.dataUrl && !s.url);
    const uploaded = await Promise.all(
      toUpload.map(async s => {
        const file = dataUrlToFile(s.dataUrl!, `${s.id}.webp`);
        const { url, publicId } = await uploadPhoto(file);
        return { shotId: s.id, url, publicId };
      }),
    );
    const urlByShot = new Map(uploaded.map(u => [u.shotId, u.url]));
    const photoUrls = shots.map(s => s.url ?? urlByShot.get(s.id)).filter((u): u is string => !!u);
    return { photoUrls, publicIds: uploaded.map(u => u.publicId) };
  }, [shots]);

  const doPostNew = useCallback(async () => {
    if (!an || !location) return;
    setSubmitError(null);
    setSubmitPhase('uploading');
    const effectiveTags = tags.length ? tags : [...(TAGS[an.cat as keyof typeof TAGS] ?? []).slice(0, 2), 'velachery'];

    let photoUrls: string[], publicIds: string[];
    try {
      ({ photoUrls, publicIds } = await uploadDraftShots());
    } catch (err) {
      console.error('photo upload failed:', err);
      setSubmitError("Couldn't upload your photos — check your connection and try again.");
      setSubmitPhase('idle');
      return;
    }

    setSubmitPhase('saving');
    try {
      const result = await submitReport({
        cat, anon, text: desc, tags: effectiveTags, icon: icon ?? undefined, photos: shots.length, by: me.name, uid: me.uid, photoUrls,
        title, lat: location.lat, lng: location.lng, address: location.address, city: location.city, area: location.area,
      });
      removeDraftPhotos(shots.map(s => s.id));
      setAn(null);
      setSubmitPhase('idle');
      setReportStep(null);
      openIssue(result.id);
    } catch (err) {
      console.error('submitReport failed:', err);
      await deleteCloudinaryImages(publicIds);
      setSubmitError("Couldn't save your report — try again.");
      setSubmitPhase('idle');
    }
  }, [an, cat, icon, anon, title, desc, tags, shots, location, uploadDraftShots, openIssue, me.name, me.uid]);

  const doJoin = useCallback(async (id: string) => {
    if (!an) return;
    const match = an.matches.find(m => m.id === id);
    setSubmitError(null);
    setSubmitPhase('uploading');

    let photoUrls: string[], publicIds: string[];
    try {
      ({ photoUrls, publicIds } = await uploadDraftShots());
    } catch (err) {
      console.error('photo upload failed:', err);
      setSubmitError("Couldn't upload your photos — check your connection and try again.");
      setSubmitPhase('idle');
      return;
    }

    setSubmitPhase('saving');
    try {
      const res = await joinIssue({ joinId: id, cat, anon, text: desc, tags, photos: shots.length, by: me.name, uid: me.uid, score: match?.score ?? 90, photoUrls });
      removeDraftPhotos(shots.map(s => s.id));
      setAn(null);
      setSubmitPhase('idle');
      setReportStep(null);
      // joinIssue already counted this citizen's support server-side —
      // mark it locally too (no extra server call, that would double-count),
      // and flag it for a one-shot "just joined" confetti on the detail page.
      setVotes(prev => ({ ...prev, [id]: 'up' }));
      setJustJoinedId(id);
      openIssue(id);
      if (res.caseCreated) showThreshold(id, res.caseId);
    } catch (err) {
      console.error('joinIssue failed:', err);
      await deleteCloudinaryImages(publicIds);
      setSubmitError("Couldn't join this report — try again.");
      setSubmitPhase('idle');
    }
  }, [an, cat, anon, desc, tags, shots, uploadDraftShots, openIssue, setVotes, setJustJoinedId, showThreshold, me.name, me.uid]);

  // One of the 7 real category icons sets the actual category (driving the
  // AI mock + what gets saved); one of the 4 generic "Other" icons is purely
  // a cosmetic override and leaves the category untouched.
  const onIcon = useCallback((iconStr: string) => {
    const mappedCat = ICON_TO_CAT[iconStr];
    if (mappedCat) { setCat(mappedCat); setIcon(null); }
    else setIcon(iconStr);
  }, []);

  const onAiNext = useCallback(() => {
    if (!an) return;
    // Stay on 'ai' (not null) for the no-duplicates path — doPostNew's own
    // submitPhase drives AiScreen's busy state, and only it moves on from
    // here once the submit actually finishes (or stays put on failure so
    // the same button can retry).
    if (an.matches.length > 0) { setReportStep('similar'); return; }
    doPostNew();
  }, [an, doPostNew]);

  // Route guard: anyone not fully onboarded (signed in + Aadhaar-verified +
  // named) belongs at /onboard-member, whatever URL they landed on.
  // Waits for meReady so a reload of a deep link is not bounced before the profile arrives.
  useEffect(() => {
    if (authReady && meReady && !loading && !authed && pathname !== ONBOARD_ROUTE) {
      router.replace(ONBOARD_ROUTE);
    }
  }, [authReady, meReady, loading, authed, pathname, router]);

  if (loading || !authReady) return <LoadingScreen />;
  if (!authed && pathname !== ONBOARD_ROUTE) return <LoadingScreen />;

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
                  cat={cat} icon={icon} anon={anon} title={title} desc={desc} tags={tags} shots={shots} location={location} mob={mob}
                  onClose={closeFlow} onIcon={onIcon} onAnon={setAnon} onTitle={setTitle} onDesc={setDesc} onTags={setTags} onLocationPicked={setLocation}
                  onAddShot={addShot} onRemoveShot={removeShot} onRestoreShot={restoreShot} onRetakeAll={retakeAllShots}
                  onSlideSubmit={onSlideSubmit}
                />
              )}
              {reportStep === 'ai' && an && (
                <AiScreen an={an} onNext={onAiNext} onClose={closeFlow} mob={mob} photoCount={shots.length} submitPhase={submitPhase} submitError={submitError} />
              )}
              {reportStep === 'similar' && an && an.matches.length > 0 && (
                <SimilarScreen
                  an={an} anon={anon} issues={issues} mob={mob} photoCount={shots.length}
                  onJoin={doJoin} onPostNew={doPostNew} onBack={() => setReportStep('report')} onClose={closeFlow}
                  submitPhase={submitPhase} submitError={submitError}
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
                    cat={cat} icon={icon} anon={anon} title={title} desc={desc} tags={tags} shots={shots} location={location} mob={false}
                    onClose={closeFlow} onIcon={onIcon} onAnon={setAnon} onTitle={setTitle} onDesc={setDesc} onTags={setTags} onLocationPicked={setLocation}
                    onAddShot={addShot} onRemoveShot={removeShot} onRestoreShot={restoreShot} onRetakeAll={retakeAllShots}
                    onSlideSubmit={onSlideSubmit}
                  />
                )}
                {reportStep === 'ai' && an && (
                  <AiScreen an={an} onNext={onAiNext} onClose={closeFlow} mob={false} photoCount={shots.length} submitPhase={submitPhase} submitError={submitError} />
                )}
                {reportStep === 'similar' && an && an.matches.length > 0 && (
                  <SimilarScreen
                    an={an} anon={anon} issues={issues} mob={false} photoCount={shots.length}
                    onJoin={doJoin} onPostNew={doPostNew} onBack={() => setReportStep('report')} onClose={closeFlow}
                    submitPhase={submitPhase} submitError={submitError}
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
          onLogout={logout}
        />
      )}

      {thresholdIssue && (
        <ThresholdModal
          // thresholdIssue is captured before the vote lands; the live copy carries the new counts.
          issue={{ ...thresholdIssue, ...issues.find(i => i.id === thresholdIssue.id), caseId: thresholdIssue.caseId }}
          onClose={closeThreshold}
          onTrack={() => { closeThreshold(); if (thresholdIssue.caseId) openCase(thresholdIssue.caseId); }}
        />
      )}

      {editFor && (() => {
        const editIssue = issues.find(i => i.id === editFor);
        if (!editIssue) return null;
        return (
          <EditReportScreen
            issue={editIssue} mob={mob}
            onClose={() => setEditFor(null)}
            onSave={(t, text, tags) => { handleEditReport(editIssue.id, t, text, tags); setEditFor(null); }}
            onDelete={() => { handleDeleteReport(editIssue.id); setEditFor(null); }}
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
