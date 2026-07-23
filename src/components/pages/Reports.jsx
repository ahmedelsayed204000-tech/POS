import React, { useMemo } from 'react';
import C from '../../constants/theme';
import { Bar, CardHeader } from '../ui';
import { netWorth, scoreFinance, scoreFitness, scoreGoals, scoreHabits, scoreLearn, scoreTime, studyStreak } from '../../utils/scores';
import { personalScore } from '../../utils/personalScore';
import { fmt } from '../../utils/dates';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };

export default function Reports({ data, dateContext }) {
  const { today: TODAY, now: NOW } = dateContext;
  const settings = data.settings || {};
  const dimensions = [
    ['Habits', scoreHabits(data.habits), C.teal], ['Time', scoreTime(data.timeLog, settings.weekTarget || 45), C.blue], ['Finance', scoreFinance(data.finance), C.green], ['Learning', scoreLearn(data.learn), C.purple], ['Fitness', scoreFitness(data.fitness, settings.fitnessTarget || 5), C.orange], ['Goals', scoreGoals(data.goals), C.red],
  ];
  const studyDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const date = fmt(new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - (6 - i))); const minutes = (data.learn?.sessions || []).filter((session) => session.date === date).reduce((sum, session) => sum + Number(session.min || 0), 0); return { date: date.slice(5), minutes }; }), [data.learn]);
  const maxMinutes = Math.max(1, ...studyDays.map((day) => day.minutes));
  const currentLifeScore = personalScore(data, dateContext).score;
  const scoreHistory = [...(data.scoreLog || []).filter((entry) => entry.date !== TODAY), { date: TODAY, score: Number(currentLifeScore.toFixed(1)) }].slice(-21);
  const bestHabit = [...(data.habits?.defs || [])].map((habit) => { const done = Object.keys(data.habits?.logs || {}).filter((key) => key.endsWith(`_${habit.id}`)).length; return { ...habit, pct: Math.min(100, done / Math.max(1, NOW.getDate()) * 100) }; }).sort((a, b) => b.pct - a.pct).slice(0, 7);
  const money = (value) => `${Number(value || 0).toLocaleString()} ${settings.currency || 'EGP'}`;
  const stats = [['Life score', `${currentLifeScore.toFixed(1)}/10`, C.gold], ['Net worth', money(netWorth(data.finance)), C.green], ['Study streak', `${studyStreak(data.learn?.sessions || [])} days`, C.purple], ['Books read', `${(data.books || []).filter((book) => book.status === 'Done').length}`, C.book]];

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>{stats.map(([label, value, color]) => <div key={label} style={{ background: '#fff', borderTop: `3px solid ${color}`, borderRadius: 10, padding: 11, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}><div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div><div style={{ fontSize: 9, fontWeight: 700, color: C.g3 }}>{label}</div></div>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={card}><CardHeader icon="🎯" title="LIFE SCORE DIMENSIONS" color={C.navy2} /><div style={{ padding: 13 }}>{dimensions.map(([label, value, color]) => <div key={label} style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}><b>{label}</b><span style={{ color, fontWeight: 800 }}>{(value * 100).toFixed(0)}%</span></div><Bar p={value * 100} color={color} /></div>)}</div></div>
      <div style={card}><CardHeader icon="📚" title="STUDY MINUTES · LAST 7 DAYS" color={C.purple} /><div style={{ height: 180, padding: '15px 16px 22px', display: 'flex', alignItems: 'end', gap: 9 }}>{studyDays.map((day) => <div key={day.date} style={{ flex: 1, minWidth: 0, display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'end', textAlign: 'center' }}><div style={{ fontSize: 9, color: C.purple, fontWeight: 700, marginBottom: 3 }}>{day.minutes || ''}</div><div style={{ height: `${Math.max(day.minutes ? 5 : 1, day.minutes / maxMinutes * 130)}px`, background: C.purple, borderRadius: '5px 5px 0 0' }} /><div style={{ fontSize: 8, color: C.g3, marginTop: 4 }}>{day.date}</div></div>)}</div></div>
      <div style={card}><CardHeader icon="📈" title="LIFE SCORE HISTORY" color={C.gold} /><div style={{ padding: 13, display: 'flex', alignItems: 'end', gap: 4, height: 140 }}>{scoreHistory.map((entry, index) => <div key={`${entry.date}-${index}`} title={`${entry.date}: ${entry.score}/10`} style={{ flex: 1, minWidth: 3, height: `${Math.max(4, entry.score / 10 * 110)}px`, background: index === scoreHistory.length - 1 ? C.gold : `${C.gold}70`, borderRadius: '3px 3px 0 0' }} />)}{!scoreHistory.length && <span style={{ color: C.g2, fontSize: 10 }}>Scores will appear after you use the app.</span>}</div><div style={{ padding: '0 13px 11px', fontSize: 9, color: C.g3 }}>Each bar is a saved daily score. Current score is shown at the right.</div></div>
      <div style={card}><CardHeader icon="✅" title="HABIT LEADERBOARD" color={C.teal} /><div style={{ padding: 13 }}>{bestHabit.map((habit) => <div key={habit.id} style={{ marginBottom: 9 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}><span>{habit.cat} {habit.name}</span><b style={{ color: C.teal }}>{habit.pct.toFixed(0)}%</b></div><Bar p={habit.pct} color={C.teal} /></div>)}</div></div>
    </div>
  </div>;
}
