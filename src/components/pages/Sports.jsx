import React, { useMemo, useState } from 'react';
import './tracker-pages.css';

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const number = (value) => Number(value || 0);

function Field({ label, children, full = false }) {
  return <div className={`tracker-field${full ? ' full' : ''}`}><label>{label}</label>{children}</div>;
}

export default function Sports({ data, setData, dateContext }) {
  const today = dateContext?.today || new Date().toISOString().slice(0, 10);
  const sports = data.sports;
  const [tab, setTab] = useState('training');
  const [session, setSession] = useState({ date: today, sport: sports.profile.primarySport, type: 'Training', duration: 60, intensity: 6, distanceKm: 0, calories: 0, status: 'completed', notes: '' });
  const [meal, setMeal] = useState({ date: today, mealType: 'breakfast', food: '', calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, notes: '' });
  const [metric, setMetric] = useState({ date: today, metric: 'Resting heart rate', value: 0, unit: 'bpm', source: 'manual', notes: '' });

  const updateSports = (recipe) => setData((previous) => ({ ...previous, sports: recipe(previous.sports) }));
  const updateProfile = (key, value) => updateSports((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  const remove = (collection, id) => updateSports((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }));
  const stats = useMemo(() => {
    const weekStart = new Date(`${today}T00:00:00`); weekStart.setDate(weekStart.getDate() - 6);
    const recent = sports.sessions.filter((item) => new Date(`${item.date}T00:00:00`) >= weekStart && item.status === 'completed');
    const todayMeals = sports.nutrition.filter((item) => item.date === today);
    return {
      sessions: recent.length,
      minutes: recent.reduce((sum, item) => sum + number(item.duration), 0),
      protein: todayMeals.reduce((sum, item) => sum + number(item.protein), 0),
      water: todayMeals.reduce((sum, item) => sum + number(item.waterMl), 0),
    };
  }, [sports, today]);

  const addSession = () => {
    if (!session.sport.trim() || !session.type.trim() || number(session.duration) < 1) return;
    updateSports((current) => ({ ...current, sessions: [{ ...session, id: uid(), duration: number(session.duration), intensity: number(session.intensity), distanceKm: number(session.distanceKm), calories: number(session.calories) }, ...current.sessions] }));
    setSession((current) => ({ ...current, type: 'Training', notes: '' }));
  };
  const addMeal = () => {
    if (!meal.food.trim()) return;
    updateSports((current) => ({ ...current, nutrition: [{ ...meal, id: uid(), calories: number(meal.calories), protein: number(meal.protein), carbs: number(meal.carbs), fat: number(meal.fat), waterMl: number(meal.waterMl) }, ...current.nutrition] }));
    setMeal((current) => ({ ...current, food: '', calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, notes: '' }));
  };
  const addMetric = () => {
    if (!metric.metric.trim() || !metric.unit.trim()) return;
    updateSports((current) => ({ ...current, metrics: [{ ...metric, id: uid(), value: number(metric.value) }, ...current.metrics] }));
  };

  return <div className="tracker-page">
    <section className="tracker-hero">
      <h1>Sports & Athlete Center</h1>
      <p>Plan any sport, record training load, connect food to performance, and keep body or wearable metrics in one athlete timeline.</p>
      <div className="tracker-kpis">
        <div className="tracker-kpi"><strong>{stats.sessions}/{sports.profile.weeklyTarget}</strong><span>sessions this week</span></div>
        <div className="tracker-kpi"><strong>{stats.minutes}</strong><span>training minutes</span></div>
        <div className="tracker-kpi"><strong>{stats.protein} g</strong><span>protein today</span></div>
        <div className="tracker-kpi"><strong>{(stats.water / 1000).toFixed(1)} L</strong><span>water today</span></div>
      </div>
    </section>

    <div className="tracker-tabs">{['profile', 'training', 'nutrition', 'metrics'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>

    {tab === 'profile' && <div className="tracker-card"><div className="tracker-card-head">Athlete profile <span className="tracker-pill">works for any sport</span></div><div className="tracker-card-body tracker-form">
      <Field label="PRIMARY SPORT"><input value={sports.profile.primarySport} onChange={(e) => updateProfile('primarySport', e.target.value)} placeholder="Football, running, boxing..." /></Field>
      <Field label="EXPERIENCE LEVEL"><select value={sports.profile.level} onChange={(e) => updateProfile('level', e.target.value)}>{['beginner','recreational','competitive','elite'].map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="WEEKLY SESSION TARGET"><input type="number" min="1" max="21" value={sports.profile.weeklyTarget} onChange={(e) => updateProfile('weeklyTarget', number(e.target.value))} /></Field>
      <Field label="HEIGHT (CM)"><input type="number" value={sports.profile.heightCm} onChange={(e) => updateProfile('heightCm', number(e.target.value))} /></Field>
      <Field label="WEIGHT (KG)"><input type="number" step="0.1" value={sports.profile.weightKg} onChange={(e) => updateProfile('weightKg', number(e.target.value))} /></Field>
      <Field label="PERFORMANCE GOALS" full><textarea value={sports.profile.goals} onChange={(e) => updateProfile('goals', e.target.value)} /></Field>
    </div></div>}

    {tab === 'training' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Log a training session</div><div className="tracker-card-body tracker-form">
      <Field label="DATE"><input type="date" value={session.date} onChange={(e) => setSession({ ...session, date: e.target.value })} /></Field>
      <Field label="SPORT"><input value={session.sport} onChange={(e) => setSession({ ...session, sport: e.target.value })} placeholder="Any sport" /></Field>
      <Field label="SESSION TYPE"><input value={session.type} onChange={(e) => setSession({ ...session, type: e.target.value })} placeholder="Strength, technique, match..." /></Field>
      <Field label="STATUS"><select value={session.status} onChange={(e) => setSession({ ...session, status: e.target.value })}>{['planned','completed','skipped'].map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="MINUTES"><input type="number" min="1" value={session.duration} onChange={(e) => setSession({ ...session, duration: e.target.value })} /></Field>
      <Field label="INTENSITY (1-10)"><input type="number" min="1" max="10" value={session.intensity} onChange={(e) => setSession({ ...session, intensity: e.target.value })} /></Field>
      <Field label="DISTANCE (KM)"><input type="number" min="0" step="0.1" value={session.distanceKm} onChange={(e) => setSession({ ...session, distanceKm: e.target.value })} /></Field>
      <Field label="CALORIES"><input type="number" min="0" value={session.calories} onChange={(e) => setSession({ ...session, calories: e.target.value })} /></Field>
      <Field label="NOTES" full><textarea value={session.notes} onChange={(e) => setSession({ ...session, notes: e.target.value })} /></Field>
      <div className="tracker-actions"><button className="tracker-primary" onClick={addSession}>Add session</button></div>
    </div></div><List title="Training timeline" items={sports.sessions} empty="No training sessions yet." render={(item) => <><div><h3>{item.sport} · {item.type}</h3><div className="tracker-meta"><span>{item.date}</span><span>{item.duration} min</span><span>Intensity {item.intensity}/10</span><span className="tracker-pill">{item.status}</span></div>{item.notes && <div className="tracker-note">{item.notes}</div>}</div><button className="tracker-danger" onClick={() => remove('sessions', item.id)}>Delete</button></>} /></div>}

    {tab === 'nutrition' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Log food & hydration</div><div className="tracker-card-body tracker-form">
      <Field label="DATE"><input type="date" value={meal.date} onChange={(e) => setMeal({ ...meal, date: e.target.value })} /></Field><Field label="MEAL"><select value={meal.mealType} onChange={(e) => setMeal({ ...meal, mealType: e.target.value })}>{['breakfast','lunch','dinner','snack','pre_workout','post_workout'].map((value) => <option key={value}>{value.replace('_',' ')}</option>)}</select></Field>
      <Field label="FOOD" full><input value={meal.food} onChange={(e) => setMeal({ ...meal, food: e.target.value })} placeholder="Meal or food" /></Field>
      {['calories','protein','carbs','fat','waterMl'].map((key) => <Field key={key} label={key === 'waterMl' ? 'WATER (ML)' : key.toUpperCase()}><input type="number" min="0" value={meal[key]} onChange={(e) => setMeal({ ...meal, [key]: e.target.value })} /></Field>)}
      <Field label="NOTES" full><textarea value={meal.notes} onChange={(e) => setMeal({ ...meal, notes: e.target.value })} /></Field><div className="tracker-actions"><button className="tracker-primary" onClick={addMeal}>Add food log</button></div>
    </div></div><List title="Nutrition timeline" items={sports.nutrition} empty="No food logs yet." render={(item) => <><div><h3>{item.food}</h3><div className="tracker-meta"><span>{item.date}</span><span className="tracker-pill">{item.mealType.replace('_',' ')}</span><span>{item.calories} kcal</span><span>P {item.protein}g · C {item.carbs}g · F {item.fat}g</span><span>{item.waterMl} ml water</span></div></div><button className="tracker-danger" onClick={() => remove('nutrition', item.id)}>Delete</button></>} /></div>}

    {tab === 'metrics' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Record performance metric</div><div className="tracker-card-body tracker-form">
      <Field label="DATE"><input type="date" value={metric.date} onChange={(e) => setMetric({ ...metric, date: e.target.value })} /></Field><Field label="METRIC"><input value={metric.metric} onChange={(e) => setMetric({ ...metric, metric: e.target.value })} placeholder="HRV, pace, body weight..." /></Field>
      <Field label="VALUE"><input type="number" step="0.01" value={metric.value} onChange={(e) => setMetric({ ...metric, value: e.target.value })} /></Field><Field label="UNIT"><input value={metric.unit} onChange={(e) => setMetric({ ...metric, unit: e.target.value })} /></Field>
      <Field label="SOURCE"><input value={metric.source} onChange={(e) => setMetric({ ...metric, source: e.target.value })} placeholder="manual, Fitbit, WHOOP..." /></Field><Field label="NOTES" full><textarea value={metric.notes} onChange={(e) => setMetric({ ...metric, notes: e.target.value })} /></Field><div className="tracker-actions"><button className="tracker-primary" onClick={addMetric}>Add metric</button></div>
    </div></div><List title="Performance timeline" items={sports.metrics} empty="No performance metrics yet." render={(item) => <><div><h3>{item.metric}: {item.value} {item.unit}</h3><div className="tracker-meta"><span>{item.date}</span><span className="tracker-pill">{item.source}</span></div>{item.notes && <div className="tracker-note">{item.notes}</div>}</div><button className="tracker-danger" onClick={() => remove('metrics', item.id)}>Delete</button></>} /></div>}
  </div>;
}

function List({ title, items, empty, render }) {
  return <div className="tracker-card"><div className="tracker-card-head">{title}<span>{items.length}</span></div><div className="tracker-card-body">{items.length ? <div className="tracker-list">{items.map((item) => <div className="tracker-item" key={item.id}>{render(item)}</div>)}</div> : <div className="tracker-empty">{empty}</div>}</div></div>;
}
