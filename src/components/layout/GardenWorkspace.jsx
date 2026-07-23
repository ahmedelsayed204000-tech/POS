import React, { useEffect, useMemo, useState } from 'react';
import { netWorth } from '../../utils/scores';
import { personalScore } from '../../utils/personalScore';
import './garden-workspace.css';

const Icon = ({ children }) => <span className="material-symbols-rounded" aria-hidden="true">{children}</span>;

const NAV_ITEMS = [
  ['health', 'favorite', 'Health'], ['automations', 'bolt', 'Automations'], ['dashboard', 'home', 'Today'], ['compass', 'explore', 'Daily Compass'], ['tasks', 'checklist', 'Tasks'], ['plans', 'alt_route', 'If–Then Plans'], ['focus', 'timer', 'Focus'],
  ['habits', 'calendar_month', 'Habits'], ['habitbuilder', 'psychiatry', 'Habit Builder'], ['timelog', 'schedule', 'Time Log'], ['finance', 'account_balance_wallet', 'Finance'],
  ['learning', 'menu_book', 'Learning'], ['fitness', 'fitness_center', 'Fitness'], ['sports', 'sports_soccer', 'Sports & Athlete'],
  ['workcareer', 'work', 'Work & Career'], ['goals', 'track_changes', 'Goals'], ['reports', 'monitoring', 'Reports'],
  ['notion', 'description', 'Notion'], ['books', 'auto_stories', 'Reading'], ['review', 'event_available', 'Weekly Review'],
  ['settings', 'settings', 'Settings'],
];

const WORKSPACES = {
  compass: { icon: 'explore', eyebrow: 'DAILY COMPASS', title: 'Choose a day you can actually finish.', subtitle: 'Turn your available time and energy into one primary outcome, a clear first action and a stopping point.', focus: 'Choose the smallest useful action that starts today’s most important outcome.', cta: 'Reflect on today’s plan' },
  tasks: { icon: 'checklist', eyebrow: 'ACTION WORKSPACE', title: 'Make the next move unmistakably clear.', subtitle: 'Turn vague commitments into visible physical actions and respond to postponement without judgment.', focus: 'Choose one task and make its next action small enough to start now.', cta: 'Reflect on task friction' },
  plans: { icon: 'alt_route', eyebrow: 'IF–THEN PLANS', title: 'Choose your response before friction arrives.', subtitle: 'Connect a recognizable situation or obstacle to one small behavior you explicitly choose.', focus: 'Create one plan for the obstacle most likely to interrupt today’s priority.', cta: 'Reflect on a chosen response' },
  focus: { icon: 'timer', eyebrow: 'FOCUSED WORK', title: 'Stay with one useful action.', subtitle: 'Protect one chosen objective, park unrelated thoughts and stop or extend without penalty.', focus: 'Work only on the visible next action for the duration you selected.', cta: 'Reflect on this focus block' },
  habits: { icon: 'routine', eyebrow: 'HABIT RHYTHM', title: 'Grow through actions you can repeat.', subtitle: 'Keep your North Star, habit actions and weekly rhythm in one calm workspace.', focus: 'Complete the smallest valid version of one habit today.', cta: 'Shape today’s habits' },
  habitbuilder: { icon: 'psychiatry', eyebrow: 'HABIT BUILDER', title: 'Make consistency easier than intensity.', subtitle: 'Connect each habit to a stable cue, a valid minimum version and a compassionate recovery plan.', focus: 'Complete the minimum version at the next recognizable cue.', cta: 'Reflect on habit effort' },
  health: { icon: 'favorite', eyebrow: 'BODY & RECOVERY', title: 'Grow energy you can rely on.', subtitle: 'Bring sleep, recovery, movement and wearable data into one calm daily picture.', focus: 'Protect tonight’s recovery window and notice what gives you energy.', cta: 'Log a health check-in' },
  automations: { icon: 'bolt', eyebrow: 'AUTOMATION GARDEN', title: 'Let the system remember for you.', subtitle: 'Shape reminders around your actual routine, quiet hours and preferred account.', focus: 'Connect one delivery channel and protect your quiet hours.', cta: 'Tune reminders' },
  timelog: { icon: 'schedule', eyebrow: 'TIME RHYTHM', title: 'Give your best hours a purpose.', subtitle: 'See where your time goes and keep space for work, recovery and growth.', focus: 'Protect one focused block before the day becomes reactive.', cta: 'Reflect on time' },
  finance: { icon: 'account_balance_wallet', eyebrow: 'MONEY GARDEN', title: 'Grow freedom from every surplus.', subtitle: 'Connect cash flow, balance sheets, savings and investments to the life you want.', focus: 'Review today’s spending and give the next surplus a clear job.', cta: 'Record a money win' },
  learning: { icon: 'menu_book', eyebrow: 'LEARNING PATH', title: 'Turn curiosity into capability.', subtitle: 'Keep courses, skills and postgraduate study moving in a sustainable rhythm.', focus: 'Finish the smallest meaningful piece of your active learning goal.', cta: 'Log learning momentum' },
  fitness: { icon: 'fitness_center', eyebrow: 'MOVEMENT & STRENGTH', title: 'Train for the life you are building.', subtitle: 'Balance training load, body progress and recovery without losing consistency.', focus: 'Choose the session that matches today’s energy, not yesterday’s plan.', cta: 'Log a training win' },
  sports: { icon: 'sports_soccer', eyebrow: 'ATHLETE CENTER', title: 'Train with intention. Recover with context.', subtitle: 'Track any sport, food, hydration and performance signals in one timeline.', focus: 'Complete the next planned session and fuel it deliberately.', cta: 'Athlete check-in' },
  workcareer: { icon: 'work', eyebrow: 'WORK & CAREER', title: 'Build a career that keeps opening doors.', subtitle: 'Connect shifts, courses, postgraduate study and opportunities to your next role.', focus: 'Make one visible move toward your highest-priority career opportunity.', cta: 'Record career progress' },
  goals: { icon: 'track_changes', eyebrow: 'GOAL COMPASS', title: 'Keep the destination in sight.', subtitle: 'Turn long-term ambitions into the next clear move and celebrate visible progress.', focus: 'Advance one P1 goal with an action small enough to finish today.', cta: 'Goal check-in' },
  reports: { icon: 'monitoring', eyebrow: 'GROWTH STORY', title: 'See what your consistency is creating.', subtitle: 'Read the patterns across habits, money, learning, health and goals—not isolated numbers.', focus: 'Notice one pattern worth protecting and one that needs a gentler plan.', cta: 'Add an insight' },
  notion: { icon: 'description', eyebrow: 'PLANNER SYNC', title: 'Keep plans useful everywhere.', subtitle: 'Connect PersonalOS planning with your dedicated Notion workspace and weekly rhythm.', focus: 'Sync the next plan you genuinely intend to use.', cta: 'Planner check-in' },
  books: { icon: 'auto_stories', eyebrow: 'READING GARDEN', title: 'Let every book change something.', subtitle: 'Keep reading goals visible and capture ideas that deserve to become action.', focus: 'Read one focused section and write the idea you want to remember.', cta: 'Log reading progress' },
  review: { icon: 'event_available', eyebrow: 'WEEKLY RESET', title: 'Learn from the week without judging it.', subtitle: 'Turn wins, friction and lessons into a realistic plan for the next seven days.', focus: 'Name the week’s most useful lesson and choose three priorities.', cta: 'Start reflection' },
  settings: { icon: 'settings', eyebrow: 'PERSONAL PREFERENCES', title: 'Make PersonalOS feel like yours.', subtitle: 'Set targets, currency and connections so every workspace fits your real life.', focus: 'Review one preference that could make the system easier to maintain.', cta: 'Preference check-in' },
};

const sum = (items, picker) => (items || []).reduce((total, item) => total + Number(picker(item) || 0), 0);
const percent = (value) => `${Math.round(Math.max(0, Math.min(100, value)))}%`;

function workspaceStats(view, data, dateContext) {
  const today = dateContext.today;
  const month = dateContext.monthPrefix;
  const currency = data.settings?.currency || 'EGP';
  const records = data.health?.records || [];
  const latestHealth = records[records.length - 1] || {};
  const monthIncome = sum((data.finance?.income || []).filter((item) => item.date.startsWith(month)), (item) => item.amt);
  const monthExpenses = sum((data.finance?.expenses || []).filter((item) => item.date.startsWith(month)), (item) => item.amt);
  const learningTopics = ['sql', 'pbi', 'stats', 'mba'].flatMap((key) => data.learn?.[key] || []);
  const goals = data.goals || [];
  const pulseCount = (data.workspacePulse?.[view]?.checkIns || []).length;
  const refinedLifeScore = personalScore(data, dateContext).score;
  const common = [{ value: pulseCount, label: 'personal check-ins' }];

  const map = {
    compass: [{ value: (data.dailyCompass || []).some((entry) => entry.date === today) ? 'Ready' : 'Open', label: 'today’s plan' }, { value: data.behaviorPreferences?.focusSessionMinutes || 25, label: 'preferred focus min' }, { value: (data.tasks || []).filter((task) => task.deadline === today && task.status !== 'completed').length, label: 'actions today' }],
    tasks: [{ value: (data.tasks || []).filter((task) => !['completed', 'cancelled'].includes(task.status)).length, label: 'open tasks' }, { value: (data.tasks || []).filter((task) => task.status === 'postponed').length, label: 'need adjustment' }, { value: (data.tasks || []).filter((task) => task.status === 'completed').length, label: 'completed' }],
    plans: [{ value: (data.ifThenPlans || []).filter((plan) => plan.status === 'active').length, label: 'active plans' }, { value: (data.ifThenPlans || []).filter((plan) => plan.status === 'draft').length, label: 'awaiting choice' }, { value: (data.ifThenPlans || []).filter((plan) => plan.type === 'coping').length, label: 'coping plans' }],
    focus: [{ value: (data.focusSessions || []).filter((session) => session.status === 'completed').length, label: 'completed sessions' }, { value: (data.focusSessions || []).filter((session) => ['running', 'paused'].includes(session.status)).length ? 'Active' : 'Ready', label: 'focus state' }, { value: data.behaviorPreferences?.focusSessionMinutes || 25, label: 'preferred minutes' }],
    habitbuilder: [{ value: (data.habits?.defs || []).length, label: 'supported habits' }, { value: (data.habitRecoveries || []).length, label: 'recoveries' }, { value: (data.habits?.defs || []).filter((habit) => Number(habit.perceivedEffort) <= 2).length, label: 'lower-effort habits' }],
    health: [{ value: latestHealth.sleepMinutes ? `${(latestHealth.sleepMinutes / 60).toFixed(1)}h` : '—', label: 'latest sleep' }, { value: latestHealth.steps?.toLocaleString?.() || '—', label: 'latest steps' }, { value: latestHealth.recovery != null ? percent(latestHealth.recovery) : '—', label: 'recovery' }],
    automations: [{ value: data.automations?.enabled ? 'On' : 'Off', label: 'reminders' }, { value: data.automations?.morningTime || '08:00', label: 'morning plan' }, { value: data.automations?.provider || 'auto', label: 'delivery route' }],
    timelog: [{ value: `${sum((data.timeLog || []).filter((item) => item.date === today), (item) => item.hrs).toFixed(1)}h`, label: 'logged today' }, { value: (data.timeLog || []).filter((item) => item.date === today).length, label: 'time blocks' }, { value: `${data.settings?.weekTarget || 45}h`, label: 'weekly target' }],
    finance: [{ value: `${(monthIncome - monthExpenses).toLocaleString()} ${currency}`, label: 'monthly surplus' }, { value: `${netWorth(data.finance).toLocaleString()} ${currency}`, label: 'net worth' }, { value: monthIncome ? percent((monthIncome - monthExpenses) / monthIncome * 100) : '0%', label: 'savings rate' }],
    learning: [{ value: percent(learningTopics.length ? learningTopics.filter((item) => item.s === 'done').length / learningTopics.length * 100 : 0), label: 'curriculum complete' }, { value: learningTopics.filter((item) => item.s === 'active').length, label: 'active topics' }, { value: (data.learn?.sessions || []).filter((item) => item.date === today).length, label: 'sessions today' }],
    fitness: [{ value: (data.fitness?.workouts || []).filter((item) => item.date === today).length, label: 'sessions today' }, { value: `${sum((data.fitness?.workouts || []).filter((item) => item.date === today), (item) => item.dur)}m`, label: 'training today' }, { value: data.fitness?.weights?.at?.(-1)?.kg ? `${data.fitness.weights.at(-1).kg}kg` : '—', label: 'latest weight' }],
    sports: [{ value: `${(data.sports?.sessions || []).length}/${data.sports?.profile?.weeklyTarget || 4}`, label: 'session rhythm' }, { value: `${sum((data.sports?.nutrition || []).filter((item) => item.date === today), (item) => item.protein)}g`, label: 'protein today' }, { value: `${(sum((data.sports?.nutrition || []).filter((item) => item.date === today), (item) => item.waterMl) / 1000).toFixed(1)}L`, label: 'water today' }],
    workcareer: [{ value: (data.workCareer?.shifts || []).filter((item) => item.date === today).length, label: 'shifts today' }, { value: (data.workCareer?.development || []).filter((item) => item.status === 'active').length, label: 'active studies' }, { value: (data.workCareer?.opportunities || []).filter((item) => !['accepted', 'rejected', 'withdrawn'].includes(item.status)).length, label: 'open opportunities' }],
    goals: [{ value: percent(goals.length ? sum(goals, (goal) => goal.pct) / goals.length : 0), label: 'average progress' }, { value: goals.filter((goal) => goal.pri === 'P1').length, label: 'P1 goals' }, { value: goals.filter((goal) => goal.pct >= 50).length, label: 'past halfway' }],
    reports: [{ value: refinedLifeScore.toFixed(1), label: 'life score' }, { value: (data.scoreLog || []).length, label: 'daily snapshots' }, { value: (data.goalHistory || []).length, label: 'goal snapshots' }],
    notion: [{ value: data.settings?.notionUrl ? 'Linked' : 'Local', label: 'Notion status' }, { value: (data.dailyPlan || []).length, label: 'planned actions' }, { value: (data.notes || []).length, label: 'captured notes' }],
    books: [{ value: (data.books || []).filter((book) => book.status === 'Done').length, label: 'books finished' }, { value: (data.books || []).filter((book) => book.status === 'Reading').length, label: 'reading now' }, { value: percent((data.books || []).filter((book) => book.status === 'Done').length / 24 * 100), label: 'annual goal' }],
    review: [{ value: (data.weeklyReviews || []).length, label: 'reviews saved' }, { value: data.weeklyReviews?.at?.(-1)?.satisfaction || '—', label: 'last satisfaction' }, { value: refinedLifeScore.toFixed(1), label: 'current life score' }],
    settings: [{ value: data.settings?.currency || 'EGP', label: 'currency' }, { value: `${data.settings?.weekTarget || 45}h`, label: 'weekly target' }, { value: data.settings?.fitnessTarget || 5, label: 'fitness target' }],
  };
  return [...(map[view] || []), ...common].slice(0, 3);
}

export default function GardenWorkspace({ view, data, setData, navigate, dateContext, children, embedded = false }) {
  const meta = WORKSPACES[view] || WORKSPACES.goals;
  const pulse = data.workspacePulse?.[view] || {};
  const [panelOpen, setPanelOpen] = useState(false);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(3);
  const [focusDraft, setFocusDraft] = useState(pulse.customFocus || meta.focus);
  const stats = useMemo(() => workspaceStats(view, data, dateContext), [view, data, dateContext]);
  const todayDone = Boolean(pulse.focusDone?.[dateContext.today]);
  const latestCheckIn = pulse.checkIns?.[0];

  useEffect(() => {
    setPanelOpen(false);
    setNote('');
    setEnergy(3);
    setFocusDraft(data.workspacePulse?.[view]?.customFocus || meta.focus);
    window.scrollTo(0, 0);
  }, [view, meta.focus]);

  const updatePulse = (recipe) => setData((previous) => {
    const current = previous.workspacePulse?.[view] || { customFocus: '', focusDone: {}, checkIns: [] };
    return { ...previous, workspacePulse: { ...(previous.workspacePulse || {}), [view]: recipe(current) } };
  });

  const toggleFocus = () => updatePulse((current) => ({ ...current, focusDone: { ...(current.focusDone || {}), [dateContext.today]: !current.focusDone?.[dateContext.today] } }));
  const saveCheckIn = () => {
    updatePulse((current) => ({ ...current, customFocus: focusDraft.trim() || meta.focus, checkIns: [{ id: Date.now(), date: dateContext.today, note: note.trim() || 'Checked in with this workspace.', energy }, ...(current.checkIns || [])].slice(0, 30) }));
    setNote('');
    setPanelOpen(false);
  };

  return <div className={`garden-workspace${embedded ? ' embedded' : ''}${panelOpen ? ' checkin-open' : ''}`} data-workspace={view}>
    {!embedded && <aside className="garden-nav">
      <button className="garden-brand" onClick={() => navigate('dashboard')} aria-label="Open Today home"><span><Icon>psychiatry</Icon></span><div><b>PERSONAL OS</b><small>Life Garden</small></div></button>
      <nav aria-label="PersonalOS workspaces">{NAV_ITEMS.map(([itemView, icon, label]) => {
        const active = view === itemView;
        return <button key={itemView} className={active ? 'active' : ''} onClick={() => navigate(itemView)} title={label} aria-current={active ? 'page' : undefined} aria-label={`Open ${label}`}><Icon>{icon}</Icon><span>{label}</span></button>;
      })}</nav>
      <div className="garden-profile"><span>{(data.settings?.name || 'Y')[0]}</span><div><b>{data.settings?.name || 'You'}</b><small>Your system is growing</small></div></div>
    </aside>}

    <main className="garden-workspace-main">
      {!embedded && <header className="garden-topbar"><div><Icon>light_mode</Icon><span><b>{dateContext.now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b><small>One clear step at a time.</small></span></div><button onClick={() => setPanelOpen(true)} aria-label="Open workspace check-in"><Icon>tune</Icon>Shape this space</button></header>}

      <section className="garden-hero">
        <div className="garden-hero-copy"><small>{meta.eyebrow}</small><h1>{meta.title}</h1><p>{meta.subtitle}</p><div className="garden-focus"><span><Icon>{todayDone ? 'check_circle' : meta.icon}</Icon></span><div><small>TODAY’S FOCUS</small><b>{pulse.customFocus || meta.focus}</b></div></div></div>
        <div className="garden-hero-plant"><img src="/goal-garden-energy.png" alt="A growing plant representing steady progress" /></div>
        <div className="garden-stats">{stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </section>

      <section className="garden-actions" aria-label="Workspace quick actions">
        <button className={todayDone ? 'done' : ''} onClick={toggleFocus} aria-pressed={todayDone} aria-label={todayDone ? 'Mark today focus incomplete' : 'Mark today focus complete'}><span><Icon>{todayDone ? 'check' : 'task_alt'}</Icon></span><div><b>{todayDone ? 'Focus completed' : 'Complete today’s focus'}</b><small>{todayDone ? 'A meaningful step is recorded.' : 'One tap when the important step is done.'}</small></div></button>
        <button onClick={() => setPanelOpen(true)} aria-label={`Open reflection for ${meta.eyebrow}`}><span><Icon>edit_note</Icon></span><div><b>{meta.cta}</b><small>Adjust focus and reflection for this workspace.</small></div></button>
        {latestCheckIn && <div className="garden-latest"><Icon>eco</Icon><span><small>LATEST CHECK-IN · ENERGY {latestCheckIn.energy}/5</small><b>{latestCheckIn.note}</b></span></div>}
      </section>

      <section className="garden-detail">
        <div className="garden-detail-head"><div><small>DETAILS</small><h2>{meta.eyebrow.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</h2></div><span>Open deeper tools only when you need them.</span></div>
        <div className="garden-content">{children}</div>
      </section>
    </main>

    {panelOpen && <aside className="garden-checkin" aria-label="Workspace check-in panel">
      <div className="garden-checkin-head"><div><small>{meta.eyebrow}</small><h2>Shape this space</h2><p>Keep it personal, light and useful.</p></div><button onClick={() => setPanelOpen(false)} aria-label="Close workspace check-in"><Icon>close</Icon></button></div>
      <div className="garden-checkin-body"><label>Today’s focus<textarea value={focusDraft} onChange={(event) => setFocusDraft(event.target.value)} /></label><div><span>How is your energy?</span><div className="garden-energy">{[1,2,3,4,5].map((level) => <button key={level} className={energy === level ? 'active' : ''} onClick={() => setEnergy(level)} aria-label={`Energy ${level} of 5`} aria-pressed={energy === level}>{level}</button>)}</div></div><label>Reflection or win<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What moved forward, felt difficult, or needs adjusting?" /></label></div>
      <div className="garden-checkin-foot"><span><Icon>psychiatry</Icon>Your workspace can change as your life changes.</span><button onClick={saveCheckIn}><Icon>eco</Icon>Save check-in</button></div>
    </aside>}
  </div>;
}
