import React, { useMemo, useState } from 'react';
import { lifeScore, netWorth, scoreFinance, scoreHabits, scoreFitness } from '../../utils/scores';
import './life-garden.css';

const Icon = ({ name, className = '' }) => <span className={`material-symbols-rounded ${className}`} aria-hidden="true">{name}</span>;

const PERIOD_COPY = {
  today: { eyebrow: 'LIFE SCORE', title: 'Growing steadily', action: "Add today's win" },
  week: { eyebrow: 'WEEKLY RHYTHM', title: 'Build consistency', action: 'Add a weekly win' },
  month: { eyebrow: 'JULY DIRECTION', title: 'Make steady progress', action: 'Add a monthly milestone' },
};

export default function Dashboard({ data, setData, navigate, dateContext }) {
  const [period, setPeriod] = useState('today');
  const [plannerText, setPlannerText] = useState('');
  const [plannerReply, setPlannerReply] = useState('');
  const [winText, setWinText] = useState('');
  const [addingWin, setAddingWin] = useState(false);
  const [notice, setNotice] = useState('');
  const today = dateContext.today;
  const settings = data.settings || {};
  const currency = settings.currency || 'EGP';

  const plan = useMemo(() => {
    const stored = (data.dailyPlan || []).filter((item) => item.date === today);
    if (stored.length) return stored.slice(0, 3);
    return (data.habits?.defs || []).slice(0, 3).map((habit, index) => ({
      id: `habit-${habit.id}`,
      habitId: habit.id,
      text: habit.name.replace(/\s*\([^)]*\)/g, ''),
      done: Boolean(data.habits.logs[`${today}_${habit.id}`]),
      meta: index === 0 ? '45 min · Focus' : index === 1 ? 'Energy support' : 'Fuel your growth',
      time: ['9:30 AM', '7:30 AM', '8:45 AM'][index],
      icon: ['light_mode', 'water_drop', 'menu_book'][index],
    }));
  }, [data.dailyPlan, data.habits, today]);

  const mPrefix = today.slice(0, 7);
  const income = (data.finance?.income || []).filter((item) => item.date.startsWith(mPrefix)).reduce((sum, item) => sum + Number(item.amt || 0), 0);
  const expenses = (data.finance?.expenses || []).filter((item) => item.date.startsWith(mPrefix)).reduce((sum, item) => sum + Number(item.amt || 0), 0);
  const surplus = Math.max(0, income - expenses);
  const safeToday = Math.round(surplus / 30);
  const emergency = Math.round(safeToday * .3);
  const investments = Math.round(safeToday * .5);
  const mindful = Math.max(0, safeToday - emergency - investments);
  const worth = netWorth(data.finance || {});
  const score = lifeScore(data);
  const habitPct = Math.round(scoreHabits(data.habits) * 100);
  const healthPct = Math.round(scoreFitness(data.fitness, settings.fitnessTarget || 5) * 100);
  const moneyPct = Math.round(scoreFinance(data.finance) * 100);
  const doneCount = plan.filter((item) => item.done).length;
  const weeklyDays = Math.max(1, Math.min(5, doneCount + 2));

  const togglePlan = (item) => {
    if (item.habitId) {
      const key = `${today}_${item.habitId}`;
      setData((previous) => ({ ...previous, habits: { ...previous.habits, logs: { ...previous.habits.logs, [key]: !previous.habits.logs[key] } } }));
    } else {
      setData((previous) => ({ ...previous, dailyPlan: (previous.dailyPlan || []).map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry) }));
    }
  };

  const addWin = () => {
    if (!winText.trim()) return;
    setData((previous) => ({ ...previous, dailyPlan: [...(previous.dailyPlan || []), { id: Date.now(), date: today, text: winText.trim(), done: true }] }));
    setWinText('');
    setAddingWin(false);
    setNotice('Win added. Your garden is growing.');
  };

  const askPlanner = () => {
    if (!plannerText.trim()) return;
    setPlannerReply('I suggest protecting a 45-minute focus block before noon, then reviewing spending after lunch. I kept the evening light for recovery.');
    setPlannerText('');
  };

  const rebalance = () => {
    setNotice('Your day is rebalanced: one focus block, one health action, and one money check.');
    window.setTimeout(() => setNotice(''), 3500);
  };

  const rescue = () => {
    setData((previous) => ({ ...previous, habitResets: [...(previous.habitResets || []), { id: Date.now(), date: today, completed: true }] }));
    setNotice('Reset started: breathe, move, and choose your next two minutes.');
  };

  const navItems = [
    ['home', 'Today', 'dashboard'], ['explore', 'Compass', 'compass'], ['checklist', 'Tasks', 'tasks'], ['route', 'Journey', 'goals'], ['routine', 'Habits', 'habits'],
    ['account_balance_wallet', 'Money', 'finance'], ['sports_soccer', 'Sports', 'sports'],
    ['work', 'Career', 'workcareer'], ['favorite', 'Coach', 'automations'],
  ];
  const periodCopy = PERIOD_COPY[period];

  return <div className="lg-shell">
    <header className="lg-header">
      <button className="lg-brand" onClick={() => navigate('dashboard')}>
        <Icon name="psychiatry" /><span><b>Life Garden</b><small>PersonalOS</small></span>
      </button>
      <nav className="lg-primary-nav" aria-label="Primary navigation">
        {navItems.map(([icon, label, view]) => <button key={label} className={view === 'dashboard' ? 'active' : ''} onClick={() => navigate(view)}><Icon name={icon} />{label}</button>)}
      </nav>
      <div className="lg-period" role="tablist" aria-label="Planning period">
        {['today', 'week', 'month'].map((item) => <button role="tab" aria-selected={period === item} key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
      </div>
      <div className="lg-date"><span>{dateContext.now.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</span><Icon name="light_mode" /></div>
    </header>

    <main className="lg-grid">
      <aside className="lg-planner">
        <div className="lg-greeting"><h1>Good morning,<br />{settings.name || 'You'}</h1><p>Your life is compounding beautifully.</p></div>
        <section className="lg-assistant-intro"><h2><Icon name="auto_awesome" /> Planning assistant</h2><p>I turn your goals into practical plans and adjust them around your energy, time, and money.</p></section>
        <section className="lg-plan-card">
          <h3>{period === 'today' ? "Today's plan" : period === 'week' ? 'Weekly priorities' : 'Monthly milestones'}</h3>
          {plan.map((item, index) => <button className={`lg-plan-row ${item.done ? 'done' : ''}`} key={item.id} onClick={() => togglePlan(item)}>
            <span className="lg-step">{item.done ? <Icon name="check" /> : index + 1}</span>
            <span className="lg-plan-icon"><Icon name={item.icon || 'task_alt'} /></span>
            <span><b>{item.text}</b><small>{item.meta || (item.done ? 'Completed' : 'Planned')}</small></span>
            <time>{item.time || ''}</time>
          </button>)}
        </section>
        <button className="lg-focus-card" onClick={() => navigate('timelog')}><span className="lg-focus-icon"><Icon name="psychiatry" /></span><span><small>Suggested focus</small><b>Protect your deep-work window</b><em>Your energy is strongest mid-morning.</em></span><Icon name="chevron_right" /></button>
        <div className="lg-ask"><input value={plannerText} onChange={(event) => setPlannerText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && askPlanner()} placeholder="Ask the planner…" aria-label="Ask the planner" /><button onClick={askPlanner} aria-label="Send to planner"><Icon name="send" /></button></div>
        {plannerReply && <div className="lg-reply"><Icon name="auto_awesome" /><p>{plannerReply}</p></div>}
        <button className="lg-rescue" onClick={rescue}><Icon name="cycle" /><span><b>Feeling an urge?</b><small>Start a 2-minute reset.</small></span><Icon name="arrow_forward" /></button>
        <button className="lg-rebalance" onClick={rebalance}><Icon name="sync" /> Rebalance my day</button>
      </aside>

      <section className="lg-garden-panel">
        <div className="lg-score"><small>{periodCopy.eyebrow}</small><strong>{period === 'today' ? score.toFixed(1) : period === 'week' ? `${weeklyDays}/5` : '62%'}</strong><span>{period === 'today' ? '/10' : ''}</span><p>{periodCopy.title} <Icon name="eco" /></p></div>
        <div className="lg-garden-visual">
          <div className="lg-orbit orbit-one" /><div className="lg-orbit orbit-two" />
          <img src="/life-garden-hero.png" alt="A growing tree connecting habits, health, and money" />
          <button className="lg-metric habits" onClick={() => navigate('habits')}><Icon name="psychiatry" /><small>Habits</small><strong>{habitPct}%</strong><span>Building</span></button>
          <button className="lg-metric health" onClick={() => navigate('health')}><Icon name="ecg_heart" /><small>Health</small><strong>{healthPct}%</strong><span>Energizing</span></button>
          <button className="lg-metric money" onClick={() => navigate('finance')}><Icon name="savings" /><small>Money</small><strong>{moneyPct}%</strong><span>Compounding</span></button>
        </div>
        {addingWin ? <div className="lg-win-input"><input autoFocus value={winText} onChange={(event) => setWinText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addWin()} placeholder="What went well?" /><button onClick={addWin}>Save win</button><button onClick={() => setAddingWin(false)}>Cancel</button></div> : <button className="lg-win" onClick={() => setAddingWin(true)}><span><Icon name="eco" /></span>{periodCopy.action}</button>}
        <p className="lg-win-caption">Every small win grows your life.</p>
        <section className="lg-week-strip">
          <div><small>This week</small><h3>Build consistency</h3><p>{weeklyDays} of 5 priority days</p><div className="lg-mini-progress"><span style={{ width: `${weeklyDays / 5 * 100}%` }} /></div></div>
          <div className="lg-days">{['M','T','W','T','F','S','S'].map((day, index) => <span key={`${day}-${index}`} className={index < weeklyDays ? 'done' : index === 6 ? 'next' : ''}>{day}<i>{index < weeklyDays ? <Icon name="check" /> : ''}</i></span>)}</div>
          <button onClick={() => navigate('review')}><Icon name="calendar_month" /><span><small>Next weekly review</small><b>Sunday, July 19</b></span></button>
        </section>
      </section>

      <aside className="lg-money-panel">
        <div className="lg-money-head"><small>Money flow today</small><button onClick={() => navigate('finance')} aria-label="View money details"><Icon name="visibility" /></button><h2>Cash flow surplus</h2><strong>{safeToday.toLocaleString()} <em>{currency}</em></strong><p>{surplus > 0 ? "You're ahead of plan" : 'Start with one small money win'}</p></div>
        <div className="lg-flow-line" />
        {[
          ['shield', 'To Emergency Fund', emergency, 'Building security', '#2f7d56'],
          ['trending_up', 'To Investments', investments, 'Growing your future', '#2b876f'],
          ['person', 'To You', mindful, 'Enjoy mindfully', '#d09227'],
        ].map(([icon, label, value, sub, color]) => <button className="lg-allocation" key={label} onClick={() => navigate('finance')}><span style={{ color }}><Icon name={icon} /></span><div><small>{label}</small><strong>{value.toLocaleString()} {currency}</strong><p>{sub}</p><i><b style={{ width: `${Math.min(100, Math.max(20, value / Math.max(1, safeToday) * 100))}%`, background: color }} /></i></div></button>)}
        <section className="lg-net-worth"><small>Net worth</small><strong>{worth.toLocaleString()} {currency}</strong><p><Icon name="arrow_upward" /> 6.2% this month</p><div className="lg-sparkline"><span /><span /><span /><span /><span /><span /></div></section>
        <section className="lg-month-focus"><small>July focus</small><h3><Icon name="eco" /> Make steady progress</h3>
          <div><Icon name="shield" /><span><b>Emergency fund</b><i><em style={{ width: '62%' }} /></i></span><strong>62%</strong></div>
          <div><Icon name="menu_book" /><span><b>Read 2 books</b><i><em style={{ width: '50%' }} /></i></span><strong>50%</strong></div>
          <button onClick={() => setPeriod('month')}><Icon name="calendar_month" /> Plan the month <Icon name="chevron_right" /></button>
        </section>
      </aside>
    </main>
    {notice && <div className="lg-toast" role="status"><Icon name="auto_awesome" />{notice}</div>}
  </div>;
}
