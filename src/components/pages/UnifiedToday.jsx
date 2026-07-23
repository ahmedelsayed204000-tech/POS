import React, { useMemo, useState } from 'react';
import { activityFor, journeyFor, personalScore } from '../../utils/personalScore';
import { getSleepSchedule } from '../../utils/sleepSchedule';

const Icon = ({ children }) => <span className="material-symbols-rounded" aria-hidden="true">{children}</span>;

export default function UnifiedToday({ data, setData, navigate, dateContext }) {
  const [winText, setWinText] = useState('');
  const [notice, setNotice] = useState('');
  const score = useMemo(() => personalScore(data, dateContext), [data, dateContext]);
  const journey = useMemo(() => journeyFor(data, dateContext.today), [data, dateContext.today]);
  const activity = useMemo(() => activityFor(data, dateContext.today), [data, dateContext.today]);
  const sleepGuidance = useMemo(() => getSleepSchedule(data.health?.records?.[0], { ...data.automations, sleepTargetMinutes: 480 }), [data.health?.records, data.automations]);
  const plan = useMemo(() => {
    const stored = (data.dailyPlan || []).filter((item) => item.date === dateContext.today);
    if (stored.length) return stored.slice(0, 3);
    return (data.habits?.defs || []).slice(0, 3).map((habit) => ({
      id: `habit-${habit.id}`,
      habitId: habit.id,
      text: habit.name.replace(/\s*\([^)]*\)/g, ''),
      done: Boolean(data.habits?.logs?.[`${dateContext.today}_${habit.id}`]),
      meta: habit.category || 'Daily rhythm',
      icon: habit.icon || 'task_alt',
    }));
  }, [data.dailyPlan, data.habits, dateContext.today]);
  const current = journey.find((item) => !item.done) || journey[journey.length - 1];
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };
  const togglePlan = (item) => {
    if (item.habitId) {
      const key = `${dateContext.today}_${item.habitId}`;
      setData((previous) => ({ ...previous, habits: { ...previous.habits, logs: { ...previous.habits.logs, [key]: !previous.habits.logs[key] } } }));
      return;
    }
    setData((previous) => ({ ...previous, dailyPlan: (previous.dailyPlan || []).map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry) }));
  };
  const addWin = () => {
    if (!winText.trim()) return;
    const now = new Date().toISOString();
    const id = `win-${Date.now()}`;
    setData((previous) => ({
      ...previous,
      dailyPlan: [...(previous.dailyPlan || []), { id, date: dateContext.today, text: winText.trim(), done: true, meta: 'Win recorded', icon: 'eco' }],
      behaviorEvents: previous.behaviorPreferences?.consent?.behaviorEvents ? [...(previous.behaviorEvents || []), { id: `${now}-win`, type: 'daily_win_recorded', occurredAt: now, entityType: 'dailyPlan', entityId: id, metadata: { title: winText.trim() } }] : (previous.behaviorEvents || []),
    }));
    setWinText('');
    showNotice('Win added. Your Garden has one more proof point.');
  };
  const rescue = () => {
    const now = new Date().toISOString();
    setData((previous) => ({ ...previous, habitRecoveries: [...(previous.habitRecoveries || []), { id: `reset-${Date.now()}`, date: dateContext.today, completedAt: now, note: 'Started from Today reset' }] }));
    showNotice('Reset started: breathe, move, and choose the next two minutes.');
  };

  return <div className="ux-today">
    <section className="ux-welcome">
      <div>
        <small>TODAY - YOUR WAY</small>
        <h1>Good morning,<br />{data.settings?.name || 'You'}.</h1>
        <p>Your life is uniquely yours. Today is about progress that fits you.</p>
      </div>
      <div className="ux-score-summary">
        <div><small>LIFE SCORE</small><strong>{score.score.toFixed(1)}</strong><span>/10</span></div>
        <div className="ux-score-ring" style={{ '--score': `${score.score * 10}%` }} />
        <ul>
          <li><i className="good" />Contributing <b>{score.contributingEvidence} areas</b></li>
          <li><i />Confidence check <b>{score.confidence}%</b></li>
          <li><i className="missing" />Missing data <b>{score.missingEvidence} areas</b></li>
          <li><i className="stale" />Stale data <b>{score.staleEvidence} areas</b></li>
        </ul>
      </div>
    </section>

    <div className="ux-home-grid">
      <main>
        <section className="ux-journey">
          <header>
            <div><small>TODAY'S JOURNEY</small><h2>{data.personalization.primaryPriority}</h2></div>
          </header>
          <div className="ux-journey-track">{journey.map((item, index) => {
            const isCurrent = current.key === item.key;
            return (
              <button
                key={item.key}
                className={`${item.done ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => navigate(item.view)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Open ${item.label}: ${item.title}`}
              >
                <span><Icon>{item.done ? 'check' : ['eco', 'task_alt', 'checklist', 'timer', 'auto_stories'][index]}</Icon></span>
                <small>{item.label}</small>
                <b>{item.title}</b>
              </button>
            );
          })}</div>
        </section>

        <section className="ux-plan">
          <header><div><small>TODAY'S PLAN</small><h2>Small actions, visible progress.</h2></div><button onClick={() => navigate('compass')}>Adjust plan</button></header>
          <div className="ux-plan-list">
            {plan.map((item, index) => <button key={item.id} className={item.done ? 'done' : ''} onClick={() => togglePlan(item)} aria-pressed={item.done}>
              <span>{item.done ? <Icon>check</Icon> : index + 1}</span>
              <Icon>{item.icon || 'task_alt'}</Icon>
              <b>{item.text}</b>
              <small>{item.done ? 'Complete' : item.meta || 'Planned'}</small>
            </button>)}
          </div>
          <div className="ux-win-row">
            <input aria-label="Record a win" value={winText} onChange={(event) => setWinText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addWin()} placeholder="Add a win from today" />
            <button onClick={addWin}>Save win</button>
          </div>
        </section>

        <section className="ux-activity">
          <header><div><small>YOUR DAY SO FAR</small><h2>One connected story.</h2></div><button onClick={() => navigate('reports')}>View reports</button></header>
          {activity.length ? activity.map((item) => (
            <div className="ux-activity-row" key={item.id}>
              <span><Icon>{item.icon}</Icon></span>
              <div><b>{item.title}</b><small>{item.detail}</small></div>
              <time>{item.at?.includes('T') ? new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</time>
            </div>
          )) : (
            <div className="ux-empty">
              <Icon>eco</Icon>
              <b>Your activity will grow here.</b>
              <p>Choose today's outcome or start the next action. PersonalOS will connect it to the rest of your Garden.</p>
            </div>
          )}
        </section>
      </main>

      <aside className="ux-now">
        <small>NOW</small>
        <h2><Icon>timer</Icon>{current.label}</h2>
        <p>{current.title}</p>
        <button className="primary" onClick={() => navigate(current.view)}>Continue today's journey <Icon>arrow_forward</Icon></button>
        <button className="ux-reset-action" onClick={rescue}><Icon>cycle</Icon><span><b>Need a reset?</b><small>Start with two minutes.</small></span></button>
        <div className={`ux-sleep-card ${sleepGuidance.level}`}>
          <small>SLEEP-AWARE SCHEDULE</small>
          <b>{sleepGuidance.title}</b>
          <p>{sleepGuidance.message}</p>
          <span><Icon>timer</Icon>Suggested focus start: {sleepGuidance.focusStart}</span>
          {sleepGuidance.reminder && <em>{sleepGuidance.reminder}</em>}
        </div>
        <div className="ux-score-breakdown">
          <header><b>Life score breakdown</b></header>
          {score.evidence.map((item) => (
            <div key={item.key}>
              <span className="ux-breakdown-label">
                <span><Icon>{item.icon}</Icon>{item.label}</span>
                <small>{item.stateLabel} - {item.confidence}% evidence</small>
              </span>
              <progress max="1" value={item.value} />
              <b>{(item.value * 10).toFixed(1)}</b>
            </div>
          ))}
          <p>{score.calculation}</p>
        </div>
      </aside>
    </div>
    {notice && <div className="ux-toast" role="status"><Icon>auto_awesome</Icon>{notice}</div>}
  </div>;
}
