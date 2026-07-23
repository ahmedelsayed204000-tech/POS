import React, { useMemo, useState } from 'react';
import './goal-garden.css';

const Icon = ({ children }) => <span className="material-symbols-rounded" aria-hidden="true">{children}</span>;
const categories = ['Health & energy', 'Focus & learning', 'Finance', 'Career', 'Relationships', 'Custom'];
const paceOptions = [['gentle', 'Gentle', '1–2 / week'], ['steady', 'Steady', '3–4 / week'], ['strong', 'Strong', '5–6 / week'], ['intense', 'Intense', 'Daily']];
const timeOptions = [['morning', 'light_mode', 'Morning'], ['midday', 'wb_sunny', 'Midday'], ['evening', 'bedtime', 'Evening'], ['anytime', 'schedule', 'Anytime']];
const replacements = [
  { title: 'Take a 10-minute walk', subtitle: 'A gentle reset for body and mind.', icon: 'directions_walk' },
  { title: 'Read for 15 minutes', subtitle: 'Give your attention somewhere useful.', icon: 'menu_book' },
  { title: 'Prepare one healthy meal', subtitle: 'Make good energy easier tomorrow.', icon: 'nutrition' },
  { title: 'Review today’s spending', subtitle: 'Keep your money goal in view.', icon: 'savings' },
];

const navItems = [
  ['dashboard', 'grid_view', 'Today'], ['habits', 'psychiatry', 'Habits'], ['finance', 'account_balance_wallet', 'Finance'],
  ['timelog', 'schedule', 'Time Log'], ['learning', 'menu_book', 'Learning'], ['fitness', 'fitness_center', 'Fitness'],
  ['sports', 'sports_soccer', 'Sports & Athlete'], ['workcareer', 'work', 'Work & Career'], ['goals', 'track_changes', 'Goals'],
  ['reports', 'monitoring', 'Reports'], ['notion', 'description', 'Notion'], ['books', 'auto_stories', 'Reading'],
  ['review', 'event_available', 'Weekly Review'], ['settings', 'settings', 'Settings'],
];

export default function Habits({ data, setData, navigate, dateContext, embedded = false }) {
  const garden = data.habitGarden;
  const today = dateContext.today;
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [newPlant, setNewPlant] = useState('');
  const [addingPlant, setAddingPlant] = useState(false);
  const selectedPlant = garden.plants.find((plant) => plant.id === garden.selectedPlantId) || garden.plants[0];
  const activeActions = garden.actions.filter((action) => !action.paused);
  const completedCount = activeActions.filter((action) => data.habits.logs[`${today}_${action.habitId}`]).length;
  const completion = activeActions.length ? completedCount / activeActions.length : 0;
  const streak = garden.baseStreak + (completion === 1 ? 1 : 0);

  const week = useMemo(() => {
    const current = new Date(`${today}T12:00:00`);
    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(current); date.setDate(current.getDate() - 6 + offset);
      return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString('en', { weekday: 'short' }), day: date.getDate(), today: offset === 6 };
    });
  }, [today]);

  const updateGarden = (recipe) => setData((previous) => ({ ...previous, habitGarden: recipe(previous.habitGarden) }));
  const updatePlant = (patch) => updateGarden((current) => ({ ...current, plants: current.plants.map((plant) => plant.id === current.selectedPlantId ? { ...plant, ...patch } : plant) }));
  const updatePreference = (key, value) => updateGarden((current) => ({ ...current, preferences: { ...current.preferences, [key]: value } }));
  const updateAction = (id, patch) => updateGarden((current) => ({ ...current, actions: current.actions.map((action) => action.id === id ? { ...action, ...patch } : action) }));
  const toggleTime = (value) => updateGarden((current) => {
    const currentTimes = current.preferences.times;
    const times = currentTimes.includes(value) ? currentTimes.filter((time) => time !== value) : [...currentTimes, value];
    return { ...current, preferences: { ...current.preferences, times: times.length ? times : ['anytime'] } };
  });
  const toggleAction = (action) => setData((previous) => {
    const key = `${today}_${action.habitId}`;
    return { ...previous, habits: { ...previous.habits, logs: { ...previous.habits.logs, [key]: !previous.habits.logs[key] } } };
  });
  const moveAction = (id, direction) => updateGarden((current) => {
    const index = current.actions.findIndex((action) => action.id === id);
    const next = Math.max(0, Math.min(current.actions.length - 1, index + direction));
    if (next === index) return current;
    const actions = [...current.actions]; const [item] = actions.splice(index, 1); actions.splice(next, 0, item);
    return { ...current, actions };
  });
  const replaceAction = (action) => {
    const replacement = replacements[(garden.actions.findIndex((item) => item.id === action.id) + action.title.length) % replacements.length];
    updateAction(action.id, replacement);
  };
  const addPlant = () => {
    const name = newPlant.trim(); if (!name) return;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    updateGarden((current) => ({ ...current, selectedPlantId: id, plants: [...current.plants, { id, name, category: 'Custom', meaning: `Grow the part of life that ${name.toLowerCase()} represents.`, desiredOutcome: `Make steady progress toward ${name.toLowerCase()}.` }] }));
    setNewPlant(''); setAddingPlant(false);
  };
  const addAction = () => {
    const id = `custom-${Date.now()}`; const habitId = Date.now();
    setData((previous) => ({ ...previous, habits: { ...previous.habits, defs: [...previous.habits.defs, { id: habitId, cat: '✨', name: 'My new action', tgt: 3 }] }, habitGarden: { ...previous.habitGarden, actions: [...previous.habitGarden.actions, { id, habitId, title: 'My new action', subtitle: 'Make this action your own.', icon: 'add_task', paused: false }] } }));
    setEditingAction(id);
  };

  return <div className={`goal-garden-shell${embedded ? ' embedded' : ''}${panelOpen ? ' panel-open' : ''}`}>
    {!embedded && <aside className="gg-sidebar">
      <button className="gg-brand" onClick={() => navigate('dashboard')}><span className="gg-brand-mark"><Icon>psychiatry</Icon></span><span><b>PERSONAL OS</b><small>Goal Garden</small></span></button>
      <nav aria-label="PersonalOS categories">{navItems.map(([itemView, icon, label]) => {
        const active = itemView === 'habits';
        return <button key={itemView} className={active ? 'active' : ''} onClick={() => navigate(itemView)} title={label} aria-current={active ? 'page' : undefined} aria-label={`Open ${label}`}><Icon>{icon}</Icon><span>{label}</span></button>;
      })}</nav>
      <div className="gg-profile"><span>{(data.settings?.name || 'Y')[0]}</span><div><b>{data.settings?.name || 'You'}</b><small>Your garden is growing</small></div></div>
    </aside>}

    <main className="gg-main">
      {!embedded && <header className="gg-top"><div><Icon>light_mode</Icon><span><b>{dateContext.now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b><small>Good morning, {data.settings?.name || 'You'}</small></span></div><button onClick={() => setPanelOpen(true)} aria-label="Open garden preferences"><Icon>psychiatry</Icon>Shape my garden</button></header>}
      <section className="gg-north-star"><small>MY NORTH STAR</small><h1>{garden.northStar}</h1><span><i /><Icon>eco</Icon><i /></span></section>
      <div className="gg-plants" aria-label="Goal plants">{garden.plants.map((plant) => <button key={plant.id} className={plant.id === garden.selectedPlantId ? 'active' : ''} onClick={() => updateGarden((current) => ({ ...current, selectedPlantId: plant.id }))}><img src="/goal-garden-energy.png" alt="" /><b>{plant.name}</b></button>)}<button className="add" onClick={() => { setAddingPlant(true); setPanelOpen(true); }}><span><Icon>add</Icon></span><b>Add goal</b></button></div>

      <section className="gg-focus-grid">
        <div className="gg-plant-story"><h2><Icon>psychiatry</Icon>{selectedPlant.name}<button onClick={() => setPanelOpen(true)} aria-label="Edit selected goal"><Icon>edit</Icon></button></h2><p>{selectedPlant.meaning}</p><div className="gg-stat"><strong>{streak}</strong><span>Day streak</span><Icon>light_mode</Icon></div><div className="gg-milestone"><small>NEXT MILESTONE</small><b>Day {streak < 14 ? 14 : streak + 7}</b><span>{streak < 14 ? 'Your next leaf is almost here.' : 'Keep nurturing this rhythm.'}</span></div></div>
        <div className="gg-plant-visual"><img src="/goal-garden-energy.png" alt={`A growing ${selectedPlant.name} plant`} />{completedCount > 0 && <div className="gg-celebration"><Icon>psychiatry</Icon><span><b>Great work, {data.settings?.name || 'You'}!</b><small>You’ve earned new growth today.</small></span></div>}</div>
      </section>

      <section className="gg-today"><div className="gg-section-title"><div><h2>Today’s actions</h2><p>Tap once as you complete each action.</p></div><span>{completedCount}/{activeActions.length} complete</span></div><div className="gg-action-cards">{activeActions.slice(0, 3).map((action) => { const done = Boolean(data.habits.logs[`${today}_${action.habitId}`]); return <button key={action.id} className={done ? 'done' : ''} onClick={() => toggleAction(action)}><span><Icon>{action.icon}</Icon></span><div><b>{action.title}</b><small>{action.subtitle}</small></div><i><Icon>{done ? 'check' : 'radio_button_unchecked'}</Icon></i></button>; })}</div></section>
      <section className="gg-week"><b>This week</b>{week.map((day) => <div key={day.key} className={day.today ? 'today' : ''}><span>{day.label}</span><strong>{day.day}</strong><i>{day.today ? completedCount : day.day % 3 ? '✓' : ''}</i></div>)}<small>{Math.round(completion * 100)}% today</small></section>
    </main>

    {panelOpen && <aside className="gg-panel" aria-label="Shape my garden preferences">
      <div className="gg-panel-head"><div><h2>Shape my garden</h2><p>Design a system that grows with you.</p></div><button onClick={() => setPanelOpen(false)} aria-label="Close preferences"><Icon>close</Icon></button></div>
      <div className="gg-panel-scroll">
        <PanelSection number="1" title="Your North Star"><label>Rename your North Star<input value={garden.northStar} onChange={(event) => updateGarden((current) => ({ ...current, northStar: event.target.value }))} /></label></PanelSection>
        <PanelSection number="2" title="Your goal plants"><p>Add, select or reorder the goals that matter most.</p><div className="gg-panel-plants">{garden.plants.map((plant) => <button key={plant.id} className={plant.id === garden.selectedPlantId ? 'active' : ''} onClick={() => updateGarden((current) => ({ ...current, selectedPlantId: plant.id }))}><img src="/goal-garden-energy.png" alt="" /><span>{plant.name}</span></button>)}<button onClick={() => setAddingPlant(true)}><Icon>add</Icon><span>Add goal</span></button></div>{addingPlant && <div className="gg-inline-add"><input autoFocus value={newPlant} onChange={(event) => setNewPlant(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addPlant()} placeholder="Name this goal" /><button onClick={addPlant}>Add</button></div>}<div className="gg-chips">{categories.map((category) => <button key={category} className={selectedPlant.category === category ? 'active' : ''} onClick={() => updatePlant({ category })}>{category}</button>)}</div></PanelSection>
        <PanelSection number="3" title={`About this plant: ${selectedPlant.name}`}><label>Meaning to me<textarea value={selectedPlant.meaning} onChange={(event) => updatePlant({ meaning: event.target.value })} /></label><label>Desired outcome<textarea value={selectedPlant.desiredOutcome} onChange={(event) => updatePlant({ desiredOutcome: event.target.value })} /></label><span className="gg-mini-label">Preferred weekly pace</span><div className="gg-pace">{paceOptions.map(([value, label, hint]) => <button key={value} className={garden.preferences.pace === value ? 'active' : ''} onClick={() => updatePreference('pace', value)}><b>{label}</b><small>{hint}</small></button>)}</div><span className="gg-mini-label">Available times</span><div className="gg-time-chips">{timeOptions.map(([value, icon, label]) => <button key={value} className={garden.preferences.times.includes(value) ? 'active' : ''} onClick={() => toggleTime(value)}><Icon>{icon}</Icon>{label}</button>)}</div><span className="gg-mini-label">Adapt suggestions to</span><div className="gg-adapt">{[['adaptSleep','Sleep patterns'],['adaptShifts','Work shifts'],['adaptTraining','Training schedule']].map(([key, label]) => <button key={key} className={garden.preferences[key] ? 'active' : ''} onClick={() => updatePreference(key, !garden.preferences[key])}><span>{label}</span><i /></button>)}</div></PanelSection>
        <PanelSection number="4" title="Suggested daily actions"><p>Reorder, edit, replace or pause anything.</p><div className="gg-action-editor">{garden.actions.map((action, index) => <div key={action.id} className={action.paused ? 'paused' : ''}><span className="drag"><Icon>drag_indicator</Icon></span><span className="action-icon"><Icon>{action.icon}</Icon></span>{editingAction === action.id ? <input autoFocus value={action.title} onChange={(event) => updateAction(action.id, { title: event.target.value })} onBlur={() => setEditingAction(null)} onKeyDown={(event) => event.key === 'Enter' && setEditingAction(null)} /> : <button className="action-name" onClick={() => setEditingAction(action.id)}><b>{action.title}</b><small>{action.subtitle}</small></button>}<div className="row-actions"><button onClick={() => moveAction(action.id, -1)} disabled={index === 0} aria-label="Move action up"><Icon>arrow_upward</Icon></button><button onClick={() => moveAction(action.id, 1)} disabled={index === garden.actions.length - 1} aria-label="Move action down"><Icon>arrow_downward</Icon></button><button onClick={() => replaceAction(action)} aria-label="Replace action"><Icon>sync</Icon></button><button onClick={() => updateAction(action.id, { paused: !action.paused })} aria-label={action.paused ? 'Resume action' : 'Pause action'}><Icon>{action.paused ? 'play_arrow' : 'pause'}</Icon></button></div></div>)}</div><button className="gg-add-action" onClick={addAction}><Icon>add</Icon>Add my own action</button></PanelSection>
      </div>
      <div className="gg-panel-foot"><span><Icon>psychiatry</Icon>Your garden can change as your life changes.</span><button onClick={() => setPanelOpen(false)}><Icon>psychiatry</Icon>Grow my garden</button></div>
    </aside>}
  </div>;
}

function PanelSection({ number, title, children }) { return <section className="gg-panel-section"><h3><span>{number}</span>{title}</h3>{children}</section>; }
