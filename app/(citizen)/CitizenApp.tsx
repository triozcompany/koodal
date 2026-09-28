'use client';
import { useState, useEffect, useCallback } from 'react';
import { useIssues } from '@/lib/issues-context';
import type { Issue } from '@/lib/domain/types';
import { TAGS } from '@/lib/domain/constants';
import { FilterPanel, type FilterState } from './components/FilterPanel';
import { LocationDrawer } from './components/LocationDrawer';
import { BottomNav } from './components/BottomNav';
import { DesktopRail } from './components/DesktopRail';
import { HomeScreen } from './screens/HomeScreen';
import { FeedScreen } from './screens/FeedScreen';
import { SearchScreen } from './screens/SearchScreen';
import { DetailScreen } from './screens/DetailScreen';
import { DesktopHome } from './screens/DesktopHome';
import { ReportScreen } from './screens/ReportScreen';
import { AiScreen } from './screens/AiScreen';
import { SimilarScreen } from './screens/SimilarScreen';
import { analyze } from '@/lib/domain/analyze';
import type { SceneKey, Analysis } from '@/lib/domain/analyze';
import { ThresholdScreen } from './screens/ThresholdScreen';
import { AuthScreen } from './screens/AuthScreen';
import { EditReportScreen } from './screens/EditReportScreen';
import { submitReport, joinIssue } from '@/server/actions/report';
import { ME } from '@/lib/domain/constants';

type Screen = 'home' | 'feed' | 'search' | 'cases' | 'detail' | 'report' | 'ai' | 'similar';

const STG: Record<string, string[]> = {
  new: ['reported'], gathering: ['community'], govt: ['review'],
  case: ['verified', 'assigned'], progress: ['progress'], fixed: ['resolved', 'closed'],
};

const DEFAULT_FILTER: FilterState = { region: 'near', cat: [], stage: [], sev: [] };

function applyFilter(issues: Issue[], f: FilterState): Issue[] {
  return issues.filter(i => {
    const regionOk = f.region === 'near'
      ? (i.city === 'Chennai' && i.km <= 1.5)
      : (i.city === f.region || i.area === f.region);
    if (!regionOk) return false;
    if (f.cat.length > 0 && !f.cat.includes(i.cat)) return false;
    if (f.sev.length > 0 && !f.sev.includes(i.sev)) return false;
    if (f.stage.length > 0) {
      const allowed = f.stage.flatMap(s => STG[s] ?? []);
      if (!allowed.includes(i.stage)) return false;
    }
    return true;
  });
}

function countFilters(f: FilterState): number {
  return (f.region !== 'near' ? 1 : 0) + f.cat.length + f.stage.length + f.sev.length;
}

export default function CitizenApp() {
  const { issues, loading, me } = useIssues();
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const s = new URLSearchParams(window.location.search).get('screen');
      if (s && ['home','feed','search','cases','detail','report','ai','similar'].includes(s)) return s as Screen;
    }
    return 'home';
  });
  const shotMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('screen');
  const [showAuth, setShowAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('screen') === 'auth';
    }
    return false;
  });
  const [showThreshold, setShowThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('screen') === 'threshold';
    }
    return false;
  });
  const [thresholdIssue, setThresholdIssue] = useState<Issue | null>(null);
  const [cur, setCur] = useState<string | null>(null);
  const [f, setF] = useState<FilterState>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [supported, setSupported] = useState<Record<string, boolean>>({});
  const [mob, setMob] = useState(true);
  const [wide, setWide] = useState(false);

  // Edit report state
  const [editFor, setEditFor] = useState<string | null>(null);

  // Map maximize state — desktop: hides DesktopRail; mobile: hides BottomNav
  const [mapMaximized, setMapMaximized] = useState(false);
  const [mobileMapMax, setMobileMapMax] = useState(false);

  // Report flow state
  const [scene, setScene] = useState<SceneKey>('sewage');
  const [anon, setAnon] = useState(false);
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [an, setAn] = useState<Analysis | null>(null);
  const [meVerified, setMeVerified] = useState(me?.verified ?? false);

  useEffect(() => {
    if (me?.verified) setMeVerified(true);
  }, [me?.verified]);

  // Auto-select first issue when arriving at detail screen without an issue ID (e.g. via ?screen=detail URL param)
  useEffect(() => {
    if (screen === 'detail' && !cur && issues.length > 0) {
      setCur(issues[0].id);
    }
  }, [screen, cur, issues]);

  // Auto-populate analysis for screenshot purposes (e.g. via ?screen=ai or ?screen=similar URL param)
  useEffect(() => {
    if ((screen === 'ai' || screen === 'similar') && !an && issues.length > 0) {
      setAn(analyze('sewage', issues));
    }
  }, [screen, an, issues]);

  // Auto-select threshold issue for ?screen=threshold screenshot
  useEffect(() => {
    if (showThreshold && !thresholdIssue && issues.length > 0) {
      setThresholdIssue(issues[0]);
    }
  }, [showThreshold, thresholdIssue, issues]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setMob(w < 720);
      setWide(w >= 1100);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const filtered = applyFilter(issues, f);
  const fCount = f.cat.length + f.stage.length + f.sev.length;
  const meInitials = me.name.split(' ').map((s: string) => s[0]).join('');
  const needConfirm = issues.filter(i => i.stage === 'resolved' && supported[i.id]).length;

  const open = useCallback((id: string) => {
    setCur(id);
    setScreen('detail');
  }, []);

  const goBack = useCallback(() => {
    setCur(null);
    setScreen(prev => prev === 'detail' ? 'home' : prev);
  }, []);

  const toggleSupport = useCallback((id: string) => {
    setSupported(prev => {
      const next = !prev[id];
      if (next) {
        const issue = issues.find(i => i.id === id);
        if (issue && issue.conf >= 80) {
          setThresholdIssue(issue);
          setShowThreshold(true);
        }
      }
      return { ...prev, [id]: next };
    });
  }, [issues]);

  const onCatChip = useCallback((cat: string) => {
    setF(prev => ({
      ...prev,
      cat: cat === 'all' ? [] : (prev.cat.length === 1 && prev.cat[0] === cat ? [] : [cat]),
    }));
  }, []);

  const goReport = useCallback(() => {
    setScene('sewage');
    setAnon(me?.anonDefault ?? false);
    setDesc('');
    setTags([]);
    setAn(null);
    setScreen('report');
  }, [me]);

  const onSlideSubmit = useCallback(() => {
    const result = analyze(scene, issues);
    setAn(result);
    setScreen('ai');
  }, [scene, issues]);

  const onAiNext = useCallback(() => {
    if (!an) return;
    if (an.matches.length > 0) {
      setScreen('similar');
    } else {
      doPostNew();
    }
  }, [an]);

  const doPostNew = useCallback(async () => {
    if (!an) return;
    const effectiveTags = tags.length ? tags : [...(TAGS[an.cat as keyof typeof TAGS] ?? []).slice(0, 2), 'velachery'];
    try {
      const result = await submitReport({
        scene,
        anon,
        text: desc,
        tags: effectiveTags,
        photos: 1,
        by: ME.name,
      });
      setAn(null);
      setScreen('home');
    } catch {
      setAn(null);
      setScreen('home');
    }
  }, [an, scene, anon, desc, tags]);

  const doJoin = useCallback(async (id: string) => {
    if (!an) return;
    const match = an.matches.find(m => m.id === id);
    try {
      await joinIssue({
        joinId: id,
        scene,
        anon,
        text: desc,
        tags,
        photos: 1,
        by: ME.name,
        score: match?.score ?? 90,
      });
      setCur(id);
      setAn(null);
      setScreen('detail');
    } catch {
      setAn(null);
      setScreen('home');
    }
  }, [an, scene, anon, desc, tags]);

  const closeFlow = useCallback(() => {
    setAn(null);
    setScreen('home');
  }, []);

  const isFlowScreen = ['report', 'ai', 'similar'].includes(screen);
  const showBottomNav = mob && ['home', 'feed', 'search', 'cases'].includes(screen) && !filterOpen && !mobileMapMax;

  const curIssue = cur ? issues.find(i => i.id === cur) ?? null : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--cp-bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
          <i className="ph-bold ph-wave-triangle" style={{ fontSize: 26, color: 'var(--cp-bg)', animation: 'cp-scan 1.2s ease-in-out infinite' }}></i>
        </div>
        <span style={{ font: '600 14px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--cp-bg)' }}>
      {/* Desktop rail — hidden when map is maximized */}
      {!mob && !isFlowScreen && !mapMaximized && (
        <DesktopRail
          screen={screen}
          wide={wide}
          onNav={s => setScreen(s as Screen)}
          onReport={goReport}
          meInitials={meInitials}
          needConfirm={needConfirm}
        />
      )}

      {/* Main content area */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {mob ? (
          /* ── Mobile screens ── */
          <>
            {screen === 'home' && (
              <HomeScreen
                issues={filtered}
                f={f}
                onFilter={() => setFilterOpen(true)}
                onLocation={() => setLocationOpen(true)}
                onOpen={open}
                onSupport={toggleSupport}
                onClearFilters={() => setF(DEFAULT_FILTER)}
                supported={supported}
                fCount={fCount}
                onCatChip={onCatChip}
                me={me}
                onMapMaximize={setMobileMapMax}
                navHidden={mobileMapMax}
              />
            )}
            {screen === 'feed' && (
              <FeedScreen
                issues={filtered}
                supported={supported}
                meInitials={meInitials}
                meVerified={me.verified}
                onOpen={open}
                onSupport={toggleSupport}
              />
            )}
            {screen === 'search' && (
              <SearchScreen
                issues={issues}
                supported={supported}
                meInitials={meInitials}
                meVerified={me.verified}
                onOpen={open}
                onSupport={toggleSupport}
                onFilter={() => setFilterOpen(true)}
                fCount={fCount}
              />
            )}
            {screen === 'cases' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, paddingBottom: 84 }}>
                <i className="ph-bold ph-briefcase" style={{ fontSize: 40, color: 'var(--cp-ink-3)' }}></i>
                <span style={{ font: '600 14px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', textAlign: 'center' }}>Your cases appear here.<br />Report an issue to get started.</span>
              </div>
            )}
            {screen === 'detail' && curIssue && (
              <DetailScreen
                issue={curIssue}
                supported={!!supported[curIssue.id]}
                onBack={goBack}
                onSupport={() => toggleSupport(curIssue.id)}
              />
            )}
            {screen === 'report' && (
              <ReportScreen
                scene={scene}
                anon={anon}
                desc={desc}
                tags={tags}
                meVerified={meVerified}
                mob={mob}
                onClose={closeFlow}
                onScene={setScene}
                onAnon={setAnon}
                onDesc={setDesc}
                onTags={setTags}
                onSlideSubmit={onSlideSubmit}
                onVerified={() => setMeVerified(true)}
              />
            )}
            {screen === 'ai' && an && (
              <AiScreen
                an={an}
                onNext={onAiNext}
                onClose={closeFlow}
                mob={mob}
                forceComplete={shotMode}
              />
            )}
            {screen === 'similar' && an && an.matches.length > 0 && (
              <SimilarScreen
                an={an}
                anon={anon}
                issues={issues}
                mob={mob}
                onJoin={doJoin}
                onPostNew={doPostNew}
                onBack={() => setScreen('report')}
                onClose={closeFlow}
              />
            )}
          </>
        ) : (
          /* ── Desktop layout ── */
          <>
            <DesktopHome
              issues={filtered}
              f={f}
              onFilter={() => setFilterOpen(true)}
              onLocation={() => setLocationOpen(true)}
              onOpen={open}
              onSupport={toggleSupport}
              supported={supported}
              fCount={fCount}
              onCatChip={onCatChip}
              onSearch={() => setScreen('search')}
              wide={wide}
              mapMaximized={mapMaximized}
              onMapMaximize={() => setMapMaximized(true)}
              onMapMinimize={() => setMapMaximized(false)}
            />
            {/* Desktop detail overlay */}
            {screen === 'detail' && curIssue && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                <div onClick={goBack} style={{ position: 'absolute', inset: 0, background: 'rgb(0 0 0 / .35)', animation: 'cp-in .22s ease-out both', cursor: 'pointer' }} />
                <div style={{ position: 'relative', zIndex: 1, width: 480, height: '100%', background: 'var(--cp-surface)', boxShadow: '-16px 0 48px -20px rgb(0 0 0 / .35)', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <DetailScreen
                    issue={curIssue}
                    supported={!!supported[curIssue.id]}
                    onBack={goBack}
                    onSupport={() => toggleSupport(curIssue.id)}
                  />
                </div>
              </div>
            )}
            {/* Desktop search overlay */}
            {screen === 'search' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 0 0' }}>
                <div onClick={() => setScreen('home')} style={{ position: 'absolute', inset: 0, background: 'rgb(0 0 0 / .25)', cursor: 'pointer' }} />
                <div style={{ position: 'relative', zIndex: 1, width: 560, height: 'calc(100% - 20px)', background: 'var(--cp-surface)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 48px -16px rgb(0 0 0 / .3)', animation: 'cp-pop2 .28s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <SearchScreen
                    issues={issues}
                    supported={supported}
                    meInitials={meInitials}
                    meVerified={me.verified}
                    onOpen={open}
                    onSupport={toggleSupport}
                    onFilter={() => setFilterOpen(true)}
                    fCount={fCount}
                  />
                </div>
              </div>
            )}
            {/* Desktop report flow overlay */}
            {screen === 'report' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
                <ReportScreen
                  scene={scene}
                  anon={anon}
                  desc={desc}
                  tags={tags}
                  meVerified={meVerified}
                  mob={false}
                  onClose={closeFlow}
                  onScene={setScene}
                  onAnon={setAnon}
                  onDesc={setDesc}
                  onTags={setTags}
                  onSlideSubmit={onSlideSubmit}
                  onVerified={() => setMeVerified(true)}
                />
              </div>
            )}
            {screen === 'ai' && an && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
                <AiScreen an={an} onNext={onAiNext} onClose={closeFlow} mob={false} forceComplete={shotMode} />
              </div>
            )}
            {screen === 'similar' && an && an.matches.length > 0 && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
                <SimilarScreen
                  an={an}
                  anon={anon}
                  issues={issues}
                  mob={false}
                  onJoin={doJoin}
                  onPostNew={doPostNew}
                  onBack={() => setScreen('report')}
                  onClose={closeFlow}
                />
              </div>
            )}
          </>
        )}

        {/* Filter panel */}
        {filterOpen && (
          <FilterPanel
            f={f}
            onChange={setF}
            onClose={() => setFilterOpen(false)}
            desktop={!mob}
          />
        )}

        {/* Location drawer */}
        {locationOpen && (
          <LocationDrawer
            f={f}
            onChange={setF}
            onClose={() => setLocationOpen(false)}
            issues={issues}
            mobile={mob}
          />
        )}
      </div>

      {/* Mobile bottom nav */}
      {showBottomNav && (
        <BottomNav
          screen={screen}
          needConfirm={needConfirm}
          onNav={s => setScreen(s as Screen)}
          onReport={goReport}
        />
      )}

      {/* Threshold overlay */}
      {showThreshold && thresholdIssue && (
        <ThresholdScreen issue={thresholdIssue} mob={mob} onClose={() => setShowThreshold(false)} />
      )}

      {/* Auth overlay */}
      {showAuth && (
        <AuthScreen mob={mob} onDone={() => setShowAuth(false)} onSkip={() => setShowAuth(false)} />
      )}

      {/* Edit report overlay */}
      {editFor && (() => {
        const editIssue = issues.find(i => i.id === editFor);
        if (!editIssue) return null;
        return (
          <EditReportScreen
            issue={editIssue}
            mob={mob}
            onClose={() => setEditFor(null)}
            onSave={() => setEditFor(null)}
            onDelete={() => { setEditFor(null); }}
          />
        );
      })()}
    </div>
  );
}
