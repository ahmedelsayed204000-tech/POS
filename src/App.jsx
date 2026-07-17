import React, { useCallback, useEffect, useRef, useState } from 'react';
import DEF, { STORAGE_KEY } from './data/defaults';
import { LEGACY_KEYS, migrateData } from './data/migrate';
import { lifeScore, netWorth } from './utils/scores';
import { useDateContext } from './utils/dates';
import GardenWorkspace from './components/layout/GardenWorkspace';
import Dashboard from './components/pages/Dashboard';
import DailyCommandCenter from './components/pages/DailyCommandCenter';
import Tasks from './components/pages/Tasks';
import IfThenPlans from './components/pages/IfThenPlans';
import FocusSessions from './components/pages/FocusSessions';
import HabitBuilder from './components/pages/HabitBuilder';
import Habits from './components/pages/Habits';
import TimeLog from './components/pages/TimeLog';
import Finance from './components/pages/Finance';
import Learning from './components/pages/Learning';
import Fitness from './components/pages/Fitness';
import Goals from './components/pages/Goals';
import Reports from './components/pages/Reports';
import Notion from './components/pages/Notion';
import ReadingList from './components/pages/ReadingList';
import WeeklyReview from './components/pages/WeeklyReview';
import Settings from './components/pages/Settings';
import Automations from './components/pages/Automations';
import Health from './components/pages/Health';
import Sports from './components/pages/Sports';
import WorkCareer from './components/pages/WorkCareer';
import AccountSync from './components/AccountSync';
import { useCloudSync } from './lib/useCloudSync';

export default function App() {
  const [data, setDataState] = useState(DEF);
  const [view, setView] = useState('dashboard');
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const migrated = raw && migrateData(JSON.parse(raw));
      if (migrated) setDataState(migrated);
    } catch (error) { console.warn('PersonalOS: failed to load saved data', error); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    if (!loaded || data.scoreLog?.some((entry) => entry.date === dateContext.today)) return;
    setData((previous) => ({ ...previous, scoreLog: [...(previous.scoreLog || []), { date: dateContext.today, score: Number(lifeScore(previous).toFixed(1)) }].slice(-60) }));
  }, [loaded, dateContext.today, setData]);

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

  if (!loaded) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#0D1B2A', color: '#fff', fontFamily: 'Arial, sans-serif' }}>Loading Personal OS…</div>;

  const pageProps = { data, setData, navigate: setView, dateContext };
  const pages = {
    dashboard: <Dashboard {...pageProps} />, compass: <DailyCommandCenter {...pageProps} />, tasks: <Tasks {...pageProps} />, plans: <IfThenPlans {...pageProps} />, focus: <FocusSessions {...pageProps} />, habitbuilder: <HabitBuilder {...pageProps} />, habits: <Habits {...pageProps} />, timelog: <TimeLog {...pageProps} />,
    finance: <Finance {...pageProps} />, learning: <Learning {...pageProps} />, fitness: <Fitness {...pageProps} />,
    goals: <Goals {...pageProps} />, reports: <Reports data={data} dateContext={dateContext} />,
    notion: <Notion {...pageProps} />, books: <ReadingList {...pageProps} />, review: <WeeklyReview {...pageProps} />,
    settings: <Settings {...pageProps} />,
    automations: <Automations {...pageProps} />,
    health: <Health {...pageProps} />,
    sports: <Sports {...pageProps} />,
    workcareer: <WorkCareer {...pageProps} />,
  };
  if (view === 'dashboard') return <><Dashboard {...pageProps} /><AccountSync cloud={cloud} /></>;
  if (view === 'habits') return <><Habits {...pageProps} /><AccountSync cloud={cloud} /></>;
  if (view === 'focus') return <div style={{ minHeight: '100vh', background: '#030914', padding: '7vh 18px' }}><FocusSessions {...pageProps} /></div>;
  return <>
    <GardenWorkspace
      view={view}
      data={data}
      setData={setData}
      navigate={setView}
      dateContext={dateContext}
      saved={saved}
      canUndo={canUndo}
      onUndo={undo}
    >
      {pages[view] ?? pages.dashboard}
    </GardenWorkspace>
    <AccountSync cloud={cloud} />
  </>;
}
