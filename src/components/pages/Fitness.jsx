import React, { useState } from 'react';
import C, { WORKOUT_COLORS } from '../../constants/theme';
import { Bar, Button, CardHeader, Input, Label, Select } from '../ui';
import { fmt } from '../../utils/dates';

const types = ['Gym', 'Boxing', 'Cardio', 'Yoga/Stretch', 'Rest', 'Other'];
const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };

export default function Fitness({ data, setData, dateContext }) {
  const { today: TODAY, weekStart: WS, weekEnd: WE } = dateContext;
  const fitness = data.fitness || { workouts: [], weights: [] };
  const workouts = fitness.workouts || [];
  const weights = fitness.weights || [];
  const [workout, setWorkout] = useState({ date: TODAY, type: 'Gym', dur: '60', intensity: '3', note: '' });
  const [weight, setWeight] = useState({ date: TODAY, kg: '', bf: '' });
  const target = data.settings?.fitnessTarget || 5;
  const thisWeek = workouts.filter((w) => w.date >= fmt(WS) && w.date < fmt(WE) && w.type !== 'Rest');
  const minutes = thisWeek.reduce((sum, w) => sum + Number(w.dur || 0), 0);
  const latestWeight = [...weights].sort((a, b) => b.date.localeCompare(a.date))[0];

  const addWorkout = () => {
    if (!workout.dur || Number(workout.dur) <= 0) return;
    setData((p) => ({ ...p, fitness: { ...p.fitness, workouts: [{ id: Date.now(), ...workout, dur: Number(workout.dur), intensity: Number(workout.intensity) }, ...(p.fitness?.workouts || [])] } }));
    setWorkout((p) => ({ ...p, note: '', dur: '60' }));
  };
  const addWeight = () => {
    if (!weight.kg || Number(weight.kg) <= 0) return;
    setData((p) => ({ ...p, fitness: { ...p.fitness, weights: [{ id: Date.now(), date: weight.date, kg: Number(weight.kg), bf: Number(weight.bf) || 0 }, ...(p.fitness?.weights || [])] } }));
    setWeight((p) => ({ ...p, kg: '', bf: '' }));
  };
  const remove = (key, id) => setData((p) => ({ ...p, fitness: { ...p.fitness, [key]: (p.fitness?.[key] || []).filter((item) => item.id !== id) } }));

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[['Sessions', `${thisWeek.length}/${target}`, C.orange], ['Active minutes', `${minutes}m`, C.blue], ['Current weight', latestWeight ? `${latestWeight.kg} kg` : '—', C.green], ['Body fat', latestWeight?.bf ? `${latestWeight.bf}%` : '—', C.red]].map(([label, value, color]) => <div key={label} style={{ background: '#fff', borderTop: `3px solid ${color}`, borderRadius: 10, padding: 11, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}><div style={{ color, fontSize: 19, fontWeight: 800 }}>{value}</div><div style={{ color: C.g3, fontSize: 9, fontWeight: 700 }}>{label}</div></div>)}
    </div>
    <div style={{ ...card, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 5 }}><span>This week’s training progress</span><span style={{ color: C.orange }}>{Math.min(100, thisWeek.length / target * 100).toFixed(0)}%</span></div><Bar p={thisWeek.length / target * 100} color={C.orange} /></div>
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card}><CardHeader icon="💪" title="LOG WORKOUT" color={C.orange} /><div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}><div><Label>DATE</Label><Input type="date" value={workout.date} onChange={(e) => setWorkout({ ...workout, date: e.target.value })} /></div><div><Label>TYPE</Label><Select value={workout.type} onChange={(e) => setWorkout({ ...workout, type: e.target.value })} options={types} /></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}><div><Label>MINUTES</Label><Input type="number" value={workout.dur} onChange={(e) => setWorkout({ ...workout, dur: e.target.value })} /></div><div><Label>INTENSITY</Label><Select value={workout.intensity} onChange={(e) => setWorkout({ ...workout, intensity: e.target.value })} options={['1', '2', '3', '4', '5']} /></div></div>
          <div><Label>NOTES</Label><Input value={workout.note} onChange={(e) => setWorkout({ ...workout, note: e.target.value })} placeholder="Workout details" /></div><Button onClick={addWorkout} color={C.orange} full>Save Workout</Button>
        </div></div>
        <div style={card}><CardHeader icon="⚖️" title="LOG MEASUREMENT" color={C.green} /><div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}><div><Label>DATE</Label><Input type="date" value={weight.date} onChange={(e) => setWeight({ ...weight, date: e.target.value })} /></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}><div><Label>KG</Label><Input type="number" value={weight.kg} onChange={(e) => setWeight({ ...weight, kg: e.target.value })} /></div><div><Label>BODY FAT %</Label><Input type="number" value={weight.bf} onChange={(e) => setWeight({ ...weight, bf: e.target.value })} /></div></div><Button onClick={addWeight} color={C.green} full>Save Measurement</Button></div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card}><CardHeader icon="📋" title="WORKOUT HISTORY" color={C.navy2} /><div style={{ maxHeight: 310, overflowY: 'auto' }}>{workouts.length ? workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).map((w, index) => <div key={w.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: index % 2 ? C.g0 : '#fff', borderBottom: `1px solid ${C.g1}` }}><span style={{ color: C.g3, fontSize: 10, minWidth: 75 }}>{w.date}</span><span style={{ color: WORKOUT_COLORS[w.type] || C.g3, fontSize: 10, fontWeight: 800, minWidth: 65 }}>{w.type}</span><span style={{ flex: 1, fontSize: 10, color: C.dark }}>{w.note || 'No notes'}</span><span style={{ fontWeight: 800, fontSize: 10 }}>{w.dur}m · {w.intensity}/5</span><button onClick={() => remove('workouts', w.id)} style={{ border: 'none', background: 'none', color: C.red, cursor: 'pointer' }}>×</button></div>) : <div style={{ padding: 20, textAlign: 'center', color: C.g2 }}>No workouts logged.</div>}</div></div>
        <div style={card}><CardHeader icon="📈" title="WEIGHT HISTORY" color={C.green} /><div>{weights.length ? weights.slice().sort((a, b) => b.date.localeCompare(a.date)).map((w, index) => <div key={w.id} style={{ display: 'flex', padding: '7px 12px', background: index % 2 ? C.g0 : '#fff', borderBottom: `1px solid ${C.g1}`, fontSize: 10 }}><span style={{ width: 110, color: C.g3 }}>{w.date}</span><b style={{ width: 90 }}>{w.kg} kg</b><span style={{ flex: 1 }}>{w.bf ? `${w.bf}% body fat` : '—'}</span><button onClick={() => remove('weights', w.id)} style={{ border: 'none', background: 'none', color: C.red, cursor: 'pointer' }}>×</button></div>) : <div style={{ padding: 20, textAlign: 'center', color: C.g2 }}>No measurements logged.</div>}</div></div>
      </div>
    </div>
  </div>;
}
