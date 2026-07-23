import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import DEF, { STORAGE_KEY } from './data/defaults';
import { LEGACY_KEYS, migrateData } from './data/migrate';
import { netWorth } from './utils/scores';
import { personalScore } from './utils/personalScore';
import { useDateContext } from './utils/dates';
import GardenWorkspace from './components/layout/GardenWorkspace';
import UnifiedToday from './components/pages/UnifiedToday';
import AccountSync from './components/AccountSync';
import { useCloudSync } from './lib/useCloudSync';
import UnifiedExperience from './components/layout/UnifiedExperience';

const PAGE_LOADERS = {
  compass: () => import('./components/pages/DailyCommandCenter'),
  tasks: () => import('./components/pages/Tasks'),
  plans: () => import('./components/pages/IfThenPlans'),
  focus: () => import('./components/pages/FocusSessions'),
  habitbuilder: () => import('./components/pages/HabitBuilder'),
  habits: () => import('./components/pages/Habits'),
  timelog: () => import('./components/pages/TimeLog'),
  finance: () => import('./components/pages/Finance'),
  learning: () => import('./components/pages/Learning'),
  fitness: () => import('./components/pages/Fitness'),
  goals: () => import('./components/pages/Goals'),
  reports: () => import('./components/pages/Reports'),
  notion: () => import('./components/pages/Notion'),
  books: () => import('./components/pages/ReadingList'),
  review: () => import('./components/pages/WeeklyReview'),
  settings: () => import('./components/pages/Settings'),
  automations: () => import('./components/pages/Automations'),
  health: () => import('./components/pages/Health'),
  sports: () => import('./components/pages/Sports'),
  workcareer: () => import('./components/pages/WorkCareer'),
};

const PAGE_COMPONENTS = {
  compass: lazy(PAGE_LOADERS.compass),
  tasks: lazy(PAGE_LOADERS.tasks),
  plans: lazy(PAGE_LOADERS.plans),
  focus: lazy(PAGE_LOADERS.focus),
  habitbuilder: lazy(PAGE_LOADERS.habitbuilder),
  habits: lazy(PAGE_LOADERS.habits),
  timelog: lazy(PAGE_LOADERS.timelog),
  finance: lazy(PAGE_LOADERS.finance),
  learning: lazy(PAGE_LOADERS.learning),
  fitness: lazy(PAGE_LOADERS.fitness),
  goals: lazy(PAGE_LOADERS.goals),
  reports: lazy(PAGE_LOADERS.reports),
  notion: lazy(PAGE_LOADERS.notion),
  books: lazy(PAGE_LOADERS.books),
  review: lazy(PAGE_LOADERS.review),
  settings: lazy(PAGE_LOADERS.settings),
  automations: lazy(PAGE_LOADERS.automations),
  health: lazy(PAGE_LOADERS.health),
  sports: lazy(PAGE_LOADERS.sports),
  workcareer: lazy(PAGE_LOADERS.workcareer),
};
const VALID_VIEWS = new Set(['dashboard', ...Object.keys(PAGE_LOADERS)]);

const viewFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  const queryView = params.get('view');
  if (VALID_VIEWS.has(queryView)) return queryView;
  const hashMatch = window.location.hash.match(/^#app\/([^?]+)/);
  const hashView = hashMatch?.[1];
  return VALID_VIEWS.has(hashView) ? hashView : 'dashboard';
};

const writeViewToUrl = (nextView, mode = 'push') => {
  const method = mode === 'replace' ? 'replaceState' : 'pushState';
  if (window.location.protocol === 'file:') {
    const nextHash = nextView === 'dashboard' ? 'app' : `app/${nextView}`;
    if (window.location.hash !== `#${nextHash}`) window.history[method]({}, '', `#${nextHash}`);
    return;
  }
  const url = new URL(window.location.href);
  url.pathname = '/app';
  if (nextView === 'dashboard') url.searchParams.delete('view');
  else url.searchParams.set('view', nextView);
  if (window.location.href !== url.href) window.history[method]({}, '', url);
};

export default function App() {
  const [data, setDataState] = useState(DEF);
  const [view, setView] = useState(viewFromLocation);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const historyRef = useRef([]);
  const dateContext = useDateContext();
  const replaceData = useCallback((next) => setDataState(next), []);
  const cloud = useCloudSync({ data, loaded, replaceData });

  const setData = useCallback((next) => {
    setDataState((previous) => {
      const resolved = typeof next === 'function' ? next(previous) : next;
      if (resolved !== previous) {
        historyRef.current = [...historyRef.current, previous].slice(-20);
        setCanUndo(true);
      }
      return resolved;
    });
  }, []);
  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (previous) setDataState(previous);
    setCanUndo(historyRef.current.length > 0);
  }, []);
  const navigateView = useCallback((nextView, options = {}) => {
    const safeView = VALID_VIEWS.has(nextView) ? nextView : 'dashboard';
    setView(safeView);
    writeViewToUrl(safeView, options.replace ? 'replace' : 'push');
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const migrated = raw && migrateData(JSON.parse(raw));
      if (migrated) setDataState(migrated);
    } catch (error) { console.warn('PersonalOS: failed to load saved data', error); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    const syncViewFromUrl = () => setView(viewFromLocation());
    window.addEventListener('popstate', syncViewFromUrl);
    window.addEventListener('hashchange', syncViewFromUrl);
    writeViewToUrl(viewFromLocation(), 'replace');
    return () => {
      window.removeEventListener('popstate', syncViewFromUrl);
      window.removeEventListener('hashchange', syncViewFromUrl);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setData((previous) => {
      const score = Number(personalScore(previous, dateContext).score.toFixed(1));
      const existing = previous.scoreLog || [];
      if (existing.some((entry) => entry.date === dateContext.today && entry.score === score)) return previous;
      return { ...previous, scoreLog: [...existing.filter((entry) => entry.date !== dateContext.today), { date: dateContext.today, score }].slice(-60) };
    });
  }, [loaded, dateContext, dateContext.today, setData]);

  useEffect(() => {
    if (!loaded) return;
    setData((previous) => {
      const date = dateContext.today;
      const netWorthHistory = previous.netWorthHistory?.some((snapshot) => snapshot.date === date)
        ? previous.netWorthHistory
        : [...(previous.netWorthHistory || []), { date, netWorth: netWorth(previous.finance), assets: (previous.finance.assets || []).reduce((sum, item) => sum + Number(item.value || 0), 0), liabilities: (previous.finance.liabilities || []).reduce((sum, item) => sum + Number(item.amount || 0), 0) }].slice(-365);
      const goalHistory = previous.goalHistory?.some((snapshot) => snapshot.date === date)
        ? previous.goalHistory
        : [...(previous.goalHistory || []), { date, goals: (previous.goals || []).map((goal) => ({ id: goal.id, pct: goal.pct })) }].slice(-365);
      return netWorthHistory === previous.netWorthHistory && goalHistory === previous.goalHistory ? previous : { ...previous, netWorthHistory, goalHistory };
    });
  }, [loaded, dateContext.today, setData]);

  useEffect(() => {
    if (!loaded) return undefined;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(`${STORAGE_KEY}_backup`, JSON.stringify({ savedAt: new Date().toISOString(), data }));
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1400);
      } catch (error) { console.warn('PersonalOS: failed to save data', error); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [data, loaded]);

  if (!loaded) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#0D1B2A', color: '#fff', fontFamily: 'Arial, sans-serif' }}>Loading Personal OS...</div>;

  const pageProps = { data, setData, navigate: navigateView, dateContext };
  const preloadView = (nextView) => {
    if (nextView === 'dashboard') return;
    PAGE_LOADERS[nextView]?.();
  };
  const WorkspacePage = PAGE_COMPONENTS[view] || PAGE_COMPONENTS.compass;
  const workspacePage = view === 'habits'
    ? <WorkspacePage {...pageProps} embedded />
    : <WorkspacePage {...pageProps} />;
  const content = view === 'dashboard'
    ? <UnifiedToday {...pageProps} />
    : <GardenWorkspace view={view} data={data} setData={setData} navigate={navigateView} dateContext={dateContext} embedded>
      <Suspense fallback={<div className="ux-workspace-loading" role="status">Loading workspace</div>}>
        {workspacePage}
      </Suspense>
    </GardenWorkspace>;
  return <>
    <UnifiedExperience view={view} data={data} setData={setData} navigate={navigateView} preloadView={preloadView} dateContext={dateContext} saved={saved} canUndo={canUndo} onUndo={undo} cloud={cloud}>
      {content}
    </UnifiedExperience>
    <AccountSync cloud={cloud} data={data} setData={setData} />
  </>;
}
