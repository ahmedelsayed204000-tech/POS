import React, { useMemo, useState } from 'react';
import C from '../../constants/theme';
import { Bar, Button, CardHeader, Input, Label, Textarea } from '../ui';
import { scoreFinance, scoreFitness, scoreGoals, scoreHabits, scoreLearn, scoreTime } from '../../utils/scores';
import { personalScore } from '../../utils/personalScore';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };

export default function WeeklyReview({ data, setData, dateContext }) {
  const WEEK_LABEL = dateContext.weekLabel;
  const existing = (data.weeklyReviews || []).find((review) => review.week === WEEK_LABEL);
  const [form, setForm] = useState(existing || { wins: '', challenges: '', lessons: '', p1: '', p2: '', p3: '', satisfaction: '7' });
  const scores = useMemo(() => [
    ['Habits', scoreHabits(data.habits), C.teal], ['Time', scoreTime(data.timeLog, data.settings?.weekTarget || 45), C.blue], ['Finance', scoreFinance(data.finance), C.green], ['Learning', scoreLearn(data.learn), C.purple], ['Fitness', scoreFitness(data.fitness, data.settings?.fitnessTarget || 5), C.orange], ['Goals', scoreGoals(data.goals), C.red],
  ], [data]);
  const currentLifeScore = personalScore(data, dateContext).score;
  const save = () => {
    const savedAt = new Date().toISOString();
    const review = { ...form, id: existing?.id || Date.now(), week: WEEK_LABEL, date: dateContext.today, savedAt, autoScore: Number(currentLifeScore.toFixed(1)), scores: Object.fromEntries(scores.map(([name, value]) => [name, Number(value.toFixed(3))])) };
    setData((p) => ({ ...p, weeklyReviews: [review, ...(p.weeklyReviews || []).filter((item) => item.week !== WEEK_LABEL)] }));
  };
  const history = data.weeklyReviews || [];

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ background: C.navy2, borderRadius: 14, padding: '17px 22px', color: '#fff', borderLeft: `4px solid ${C.gold}` }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>WEEKLY REVIEW · {WEEK_LABEL}</div><div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}><div style={{ fontSize: 34, fontWeight: 800 }}>{currentLifeScore.toFixed(1)}<span style={{ fontSize: 14 }}>/10</span></div><div style={{ fontSize: 11, opacity: .85 }}>Pause, learn, and set your next three priorities.</div></div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}><div style={card}><CardHeader icon="📝" title="REFLECT & PLAN" color={C.review} /><div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 9 }}><div><Label>WINS</Label><Textarea value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} placeholder="What went well?" /></div><div><Label>CHALLENGES</Label><Textarea value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} placeholder="What got in the way?" /></div><div><Label>LESSONS</Label><Textarea value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} placeholder="What will you change next week?" /></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>{['p1', 'p2', 'p3'].map((key, index) => <div key={key}><Label>PRIORITY {index + 1}</Label><Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="Specific outcome" /></div>)}</div><div style={{ maxWidth: 150 }}><Label>SATISFACTION (1–10)</Label><Input type="number" value={form.satisfaction} onChange={(e) => setForm({ ...form, satisfaction: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} /></div><Button onClick={save} color={C.review} full>{existing ? 'Update Review' : 'Save Review'}</Button></div></div><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><div style={card}><CardHeader icon="📊" title="WEEKLY SCORECARD" color={C.navy2} /><div style={{ padding: 12 }}>{scores.map(([name, value, color]) => <div key={name} style={{ marginBottom: 9 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}><b>{name}</b><span style={{ color, fontWeight: 800 }}>{(value * 100).toFixed(0)}%</span></div><Bar p={value * 100} color={color} /></div>)}</div></div><div style={card}><CardHeader icon="🗂️" title={`REVIEW HISTORY · ${history.length}`} color={C.navy2} /><div style={{ maxHeight: 280, overflowY: 'auto' }}>{history.map((review) => <div key={review.id} style={{ padding: 10, borderBottom: `1px solid ${C.g1}` }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}><b>{review.week}</b><span style={{ color: C.review, fontWeight: 800 }}>{review.autoScore}/10</span></div><div style={{ fontSize: 9, color: C.g3, marginTop: 3 }}>{review.p1 || 'No priority saved'}</div></div>)}{!history.length && <div style={{ padding: 15, textAlign: 'center', color: C.g2, fontSize: 10 }}>Your saved reviews will appear here.</div>}</div></div></div></div>
  </div>;
}
