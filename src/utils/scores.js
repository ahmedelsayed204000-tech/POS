// ─── SCORE ENGINE ─────────────────────────────────────────────────────────────
// All functions are PURE — no side effects, no state.
// Each dimension returns a value in [0.0, 1.0].
// lifeScore() returns a value in [0.0, 10.0].

import { fmt, getDateContext } from './dates';
import { SUBS } from '../constants/nav';

// ── 1. HABITS ────────────────────────────────────────────────────────────────
// Score = average per-habit completion rate across all days elapsed this month.
export const scoreHabits = (habits, dateContext = getDateContext()) => {
  const { defs, logs } = habits;
  const elapsed = Math.min(dateContext.now.getDate(), dateContext.daysInMonth);
  if (!elapsed || !defs.length) return 0;

  const rates = defs.map((hb) => {
    let done = 0;
    for (let d = 1; d <= elapsed; d++) {
      if (logs[`${fmt(new Date(dateContext.year, dateContext.month, d))}_${hb.id}`]) done++;
    }
    return done / elapsed;
  });

  return rates.reduce((a, b) => a + b, 0) / rates.length;
};

// ── 2. TIME ───────────────────────────────────────────────────────────────────
// Score = hours logged this week / weekly target (capped at 1.0).
export const scoreTime = (timeLog, weekTarget = 45, dateContext = getDateContext()) => {
  const wsStr = fmt(dateContext.weekStart);
  const weStr = fmt(dateContext.weekEnd);
  const total = timeLog
    .filter((e) => e.date >= wsStr && e.date < weStr)
    .reduce((s, e) => s + (e.hrs || 0), 0);
  return Math.min(1, total / weekTarget);
};

// ── 3. FINANCE ────────────────────────────────────────────────────────────────
// Score = savings rate this month (income - expenses) / income.
// Returns 0 if no income recorded.
export const scoreFinance = (finance, dateContext = getDateContext()) => {
  const income = (finance.income || [])
    .filter((e) => e.date.startsWith(dateContext.monthPrefix))
    .reduce((s, e) => s + (e.amt || 0), 0);

  const expenses = (finance.expenses || [])
    .filter((e) => e.date.startsWith(dateContext.monthPrefix))
    .reduce((s, e) => s + (e.amt || 0), 0);

  return income ? Math.max(0, Math.min(1, (income - expenses) / income)) : 0;
};

// ── 4. LEARNING ───────────────────────────────────────────────────────────────
// Score = average % of topics marked "done" across all 4 subjects.
export const scoreLearn = (learn) => {
  const rates = SUBS.map(({ k }) => {
    const topics = learn[k] || [];
    return topics.length
      ? topics.filter((t) => t.s === 'done').length / topics.length
      : 0;
  });
  return rates.reduce((a, b) => a + b, 0) / SUBS.length;
};

// ── 5. FITNESS ────────────────────────────────────────────────────────────────
// Score = workout sessions this week (excl. Rest) / weekly target.
export const scoreFitness = (fitness, fitnessTarget = 5, dateContext = getDateContext()) => {
  const wsStr = fmt(dateContext.weekStart);
  const weStr = fmt(dateContext.weekEnd);
  const sessions = (fitness.workouts || []).filter(
    (w) => w.date >= wsStr && w.date < weStr && w.type !== 'Rest'
  ).length;
  return Math.min(1, sessions / fitnessTarget);
};

// ── 6. GOALS ─────────────────────────────────────────────────────────────────
// Score = average pct across all goals / 100.
export const scoreGoals = (goals) =>
  goals.length
    ? goals.reduce((s, g) => s + (g.pct || 0), 0) / (goals.length * 100)
    : 0;

// ── LIFE SCORE ────────────────────────────────────────────────────────────────
// Equal-weighted average of all 6 dimensions × 10 → [0, 10].
export const lifeScore = (data, dateContext = getDateContext()) => {
  const s = data.settings || {};
  return (
    (scoreHabits(data.habits, dateContext) +
      scoreTime(data.timeLog, s.weekTarget || 45, dateContext) +
      scoreFinance(data.finance, dateContext) +
      scoreLearn(data.learn) +
      scoreFitness(data.fitness, s.fitnessTarget || 5, dateContext) +
      scoreGoals(data.goals)) /
    6 *
    10
  );
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
export const netWorth = (finance) =>
  (finance.assets || []).reduce((s, a) => s + (a.value || 0), 0) -
  (finance.liabilities || []).reduce((s, l) => s + (l.amount || 0), 0);

export const studyStreak = (sessions = [], dateContext = getDateContext()) => {
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = fmt(new Date(dateContext.year, dateContext.month, dateContext.now.getDate() - i));
    if (sessions.some((s) => s.date === d)) streak++;
    else break;
  }
  return streak;
};
