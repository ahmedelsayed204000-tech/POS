import { scoreFinance, scoreFitness, scoreGoals, scoreHabits, scoreLearn, scoreTime } from './scores';
import { fmt, getDateContext } from './dates';

export const LIFE_DIMENSIONS = {
  growth: { label: 'Growth', icon: 'eco', view: 'goals' },
  wellbeing: { label: 'Wellbeing', icon: 'favorite', view: 'health' },
  relationships: { label: 'Relationships', icon: 'diversity_3', view: 'habits' },
  resources: { label: 'Resources', icon: 'account_balance_wallet', view: 'finance' },
  meaning: { label: 'Meaning', icon: 'self_improvement', view: 'review' },
  learning: { label: 'Learning', icon: 'menu_book', view: 'learning' },
};

const clamp = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const DAY_MS = 24 * 60 * 60 * 1000;

const daysSince = (date, dateContext) => {
  if (!date) return Infinity;
  const parsed = date instanceof Date ? date : new Date(`${String(date).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return Infinity;
  return Math.max(0, Math.floor((dateContext.now - parsed) / DAY_MS));
};

const recentDate = (items, picker = (item) => item.date) => (items || [])
  .map(picker)
  .filter(Boolean)
  .sort()
  .at(-1);
const reviewDate = (review) => review?.date || review?.savedAt?.slice(0, 10);

const freshnessFromDays = (days, freshDays = 7, staleDays = 30) => {
  if (!Number.isFinite(days)) return 0;
  if (days <= freshDays) return 1;
  if (days >= staleDays) return 0;
  return 1 - ((days - freshDays) / (staleDays - freshDays));
};

const evidenceState = (coverage, freshness) => {
  const confidence = Math.round(clamp(coverage) * clamp(freshness) * 100);
  if (!coverage) return { confidence, state: 'missing', stateLabel: 'Missing data' };
  if (freshness < 0.35) return { confidence, state: 'stale', stateLabel: 'Stale evidence' };
  if (coverage < 0.5) return { confidence, state: 'limited', stateLabel: 'Limited evidence' };
  return { confidence, state: 'current', stateLabel: 'Current evidence' };
};

const assessment = ({ key, value, coverage, freshness = 1, sources, explanation }) => {
  const state = evidenceState(coverage, freshness);
  return {
    key,
    ...LIFE_DIMENSIONS[key],
    value: clamp(value),
    coverage: clamp(coverage),
    freshness: clamp(freshness),
    sources,
    explanation,
    ...state,
    contributes: state.confidence >= 35,
  };
};

export function dimensionScores(data, dateContext) {
  const settings = data.settings || {};
  const reviews = [...(data.weeklyReviews || [])].sort((a, b) => String(reviewDate(b) || '').localeCompare(String(reviewDate(a) || '')));
  const relationshipHabits = (data.habits?.defs || []).filter((habit) => /family|friend|relationship|community/i.test(habit.name));
  const relationshipDone = relationshipHabits.filter((habit) => data.habits.logs?.[`${dateContext?.today}_${habit.id}`]).length;
  return {
    growth: clamp((scoreGoals(data.goals || []) + scoreLearn(data.learn || {})) / 2),
    wellbeing: clamp((scoreHabits(data.habits || { defs: [], logs: {} }, dateContext) + scoreFitness(data.fitness || { workouts: [] }, settings.fitnessTarget || 5, dateContext)) / 2),
    relationships: relationshipHabits.length ? clamp(relationshipDone / relationshipHabits.length) : 0,
    resources: clamp((scoreFinance(data.finance || {}, dateContext) + scoreTime(data.timeLog || [], settings.weekTarget || 45, dateContext)) / 2),
    meaning: reviews.length ? clamp(Number(reviews[0]?.satisfaction || 0) / 10) : 0,
    learning: clamp(scoreLearn(data.learn || {})),
  };
}

export function dimensionEvidence(data, dateContext = getDateContext()) {
  const context = { ...getDateContext(), ...dateContext };
  const settings = data.settings || {};
  const today = context.today;
  const month = context.monthPrefix;
  const wsStr = fmt(context.weekStart);
  const weStr = fmt(context.weekEnd);
  const learnTopics = ['sql', 'pbi', 'stats', 'mba'].flatMap((key) => data.learn?.[key] || []);
  const monthHabitDefs = data.habits?.defs || [];
  const monthHabitLogs = Object.keys(data.habits?.logs || {}).filter((key) => key.startsWith(month));
  const weekWorkouts = (data.fitness?.workouts || []).filter((item) => item.date >= wsStr && item.date < weStr && item.type !== 'Rest');
  const relationshipHabits = monthHabitDefs.filter((habit) => /family|friend|relationship|community/i.test(habit.name));
  const relationshipDone = relationshipHabits.filter((habit) => data.habits?.logs?.[`${today}_${habit.id}`]).length;
  const monthIncome = (data.finance?.income || []).filter((item) => item.date?.startsWith(month));
  const monthExpenses = (data.finance?.expenses || []).filter((item) => item.date?.startsWith(month));
  const weekTime = (data.timeLog || []).filter((item) => item.date >= wsStr && item.date < weStr);
  const reviews = [...(data.weeklyReviews || [])].sort((a, b) => String(reviewDate(b) || '').localeCompare(String(reviewDate(a) || '')));
  const latestReview = reviews[0];

  const values = dimensionScores(data, context);
  return {
    growth: assessment({
      key: 'growth',
      value: values.growth,
      coverage: ((data.goals || []).length ? 0.5 : 0) + (learnTopics.length ? 0.5 : 0),
      freshness: (data.goals || []).length || learnTopics.length ? 1 : 0,
      sources: ['Goals progress', 'Learning completion'],
      explanation: 'Average of goal progress and learning progress when those records exist.',
    }),
    wellbeing: assessment({
      key: 'wellbeing',
      value: values.wellbeing,
      coverage: (monthHabitDefs.length ? 0.35 : 0) + (monthHabitLogs.length ? 0.25 : 0) + (weekWorkouts.length ? 0.4 : 0),
      freshness: Math.max(monthHabitLogs.length ? 1 : 0, weekWorkouts.length ? freshnessFromDays(daysSince(recentDate(weekWorkouts), context), 3, 14) : 0),
      sources: ['Habit completions this month', 'Fitness sessions this week'],
      explanation: 'Blends habit consistency and weekly movement; definitions alone are limited evidence until there are recent completions.',
    }),
    relationships: assessment({
      key: 'relationships',
      value: relationshipHabits.length ? relationshipDone / relationshipHabits.length : 0,
      coverage: relationshipHabits.length ? (relationshipDone ? 1 : 0.45) : 0,
      freshness: relationshipDone ? 1 : 0,
      sources: ['Relationship/community habits completed today'],
      explanation: 'Uses relationship, friend, family, or community habits completed today.',
    }),
    resources: assessment({
      key: 'resources',
      value: values.resources,
      coverage: (monthIncome.length ? 0.4 : 0) + (monthExpenses.length ? 0.2 : 0) + (weekTime.length ? 0.4 : 0),
      freshness: Math.max(
        monthIncome.length || monthExpenses.length ? freshnessFromDays(daysSince(recentDate([...monthIncome, ...monthExpenses]), context), 14, 45) : 0,
        weekTime.length ? freshnessFromDays(daysSince(recentDate(weekTime), context), 3, 14) : 0
      ),
      sources: ['Current-month finance records', 'Current-week time log'],
      explanation: 'Blends current-month savings rate with current-week logged time.',
    }),
    meaning: assessment({
      key: 'meaning',
      value: latestReview ? Number(latestReview.satisfaction || 0) / 10 : 0,
      coverage: latestReview?.satisfaction ? 1 : 0,
      freshness: freshnessFromDays(daysSince(reviewDate(latestReview), context), 14, 45),
      sources: ['Most recent weekly review satisfaction'],
      explanation: 'Uses the latest weekly review satisfaction and marks it stale as it ages.',
    }),
    learning: assessment({
      key: 'learning',
      value: values.learning,
      coverage: learnTopics.length ? 1 : 0,
      freshness: learnTopics.length ? 1 : 0,
      sources: ['Learning topic completion across active subjects'],
      explanation: 'Uses completion across tracked learning topics; empty subjects do not create performance evidence.',
    }),
  };
}

export function normalizeScoreWeights(active, weights = {}) {
  const raw = active.map((key) => ({ key, weight: Math.max(0, Number(weights[key] ?? 1)) }));
  const total = raw.reduce((sum, item) => sum + item.weight, 0);
  const fallback = raw.length ? 1 / raw.length : 0;
  return {
    total,
    requiresTotal100: false,
    weights: Object.fromEntries(raw.map((item) => [item.key, total ? item.weight / total : fallback])),
  };
}

export function personalScore(data, dateContext) {
  const personalization = data.personalization || {};
  const active = personalization.activeDimensions || ['growth', 'wellbeing', 'resources', 'meaning'];
  const weights = personalization.scoreWeights || {};
  const allEvidence = dimensionEvidence(data, dateContext);
  const evidence = active.filter((key) => LIFE_DIMENSIONS[key]).map((key) => ({ ...allEvidence[key], weight: Math.max(0, Number(weights[key] ?? 1)) }));
  const contributing = evidence.filter((item) => item.contributes);
  const normalized = normalizeScoreWeights(contributing.map((item) => item.key), weights);
  const score = contributing.length
    ? contributing.reduce((sum, item) => sum + item.value * normalized.weights[item.key], 0) * 10
    : 0;
  const confidence = Math.round(evidence.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, evidence.length));
  return {
    score,
    confidence,
    evidence,
    contributingEvidence: contributing.length,
    missingEvidence: evidence.filter((item) => item.state === 'missing').length,
    staleEvidence: evidence.filter((item) => item.state === 'stale').length,
    weightTotal: active.reduce((sum, key) => sum + Math.max(0, Number(weights[key] ?? 1)), 0),
    weightsMustTotal100: false,
    calculation: 'Selected dimension weights are normalized over dimensions with current enough evidence. Weights do not need to total 100. Missing and stale evidence lower confidence instead of counting as failure.',
  };
}

export function journeyFor(data, today) {
  const compass = (data.dailyCompass || []).find((item) => item.date === today);
  const goal = (data.goals || []).find((item) => item.pri === 'P1') || data.goals?.[0];
  const task = (data.tasks || []).find((item) => item.status === 'in_progress') || (data.tasks || []).find((item) => !['completed', 'cancelled'].includes(item.status));
  const focus = (data.focusSessions || []).find((item) => ['running', 'paused'].includes(item.status));
  return [
    { key: 'goal', label: 'Goal', title: goal?.goal || data.personalization?.successDefinition || 'Choose what matters now', view: 'goals', done: Boolean(goal) },
    { key: 'outcome', label: "Today’s outcome", title: compass?.primaryOutcome || 'Define a calm, specific outcome', view: 'compass', done: Boolean(compass?.primaryOutcome) },
    { key: 'task', label: 'Task', title: task?.title || compass?.firstAction || 'Choose the next visible action', view: 'tasks', done: Boolean(task) },
    { key: 'focus', label: 'Focus block', title: focus?.objective || task?.nextAction || 'Protect time for the next action', view: 'focus', done: Boolean(focus) },
    { key: 'reflect', label: 'Complete & reflect', title: 'Record what worked and adjust gently', view: 'review', done: false },
  ];
}

export function activityFor(data, today) {
  const activities = (data.behaviorEvents || []).slice(-20).reverse().map((event) => ({
    id: event.id, at: event.occurredAt, title: event.type.replaceAll('_', ' '), detail: event.metadata?.title || event.entityType, icon: event.type.includes('completed') ? 'check_circle' : 'arrow_forward',
  }));
  const checkIns = Object.values(data.workspacePulse || {}).flatMap((pulse) => pulse.checkIns || []).filter((item) => item.date === today).map((item) => ({ id: `check-${item.id}`, at: item.date, title: 'Check-in recorded', detail: item.note, icon: 'eco' }));
  return [...activities, ...checkIns].slice(0, 8);
}
