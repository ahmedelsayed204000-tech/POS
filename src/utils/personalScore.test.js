import DEF from '../data/defaults';
import { getDateContext } from './dates';
import {
  LIFE_DIMENSIONS,
  dimensionEvidence,
  journeyFor,
  normalizeScoreWeights,
  personalScore,
} from './personalScore';

const dateContext = getDateContext(new Date('2026-07-22T12:00:00'));
const clone = (value) => structuredClone(value);

test('uses only the dimensions and weights selected by the user', () => {
  const data = { ...DEF, personalization: { ...DEF.personalization, activeDimensions: ['growth'], scoreWeights: { growth: 100 } } };
  const result = personalScore(data, dateContext);
  expect(result.evidence).toHaveLength(1);
  expect(result.evidence[0].key).toBe('growth');
  expect(result.score).toBeGreaterThanOrEqual(0);
});

test.each(Object.keys(LIFE_DIMENSIONS))('scores selectable %s dimension with evidence metadata', (key) => {
  const data = clone(DEF);
  data.personalization = { ...data.personalization, activeDimensions: [key], scoreWeights: { [key]: 10 } };
  const result = personalScore(data, dateContext);
  const evidence = result.evidence[0];

  expect(result.evidence).toHaveLength(1);
  expect(evidence.key).toBe(key);
  expect(Number.isFinite(result.score)).toBe(true);
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(10);
  expect(Number.isFinite(result.confidence)).toBe(true);
  expect(evidence.coverage).toBeGreaterThanOrEqual(0);
  expect(evidence.coverage).toBeLessThanOrEqual(1);
  expect(evidence.freshness).toBeGreaterThanOrEqual(0);
  expect(evidence.freshness).toBeLessThanOrEqual(1);
  expect(['current', 'limited', 'missing', 'stale']).toContain(evidence.state);
  expect(evidence.explanation).toEqual(expect.any(String));
  expect(evidence.sources.length).toBeGreaterThan(0);
});

test('normalizes score weights instead of requiring a total of 100', () => {
  const normalized = normalizeScoreWeights(['growth', 'resources'], { growth: 2, resources: 1 });
  const data = clone(DEF);
  data.personalization = { ...data.personalization, activeDimensions: ['growth', 'resources'], scoreWeights: { growth: 2, resources: 1 } };
  const result = personalScore(data, dateContext);

  expect(normalized.requiresTotal100).toBe(false);
  expect(normalized.total).toBe(3);
  expect(normalized.weights.growth).toBeCloseTo(2 / 3);
  expect(normalized.weights.resources).toBeCloseTo(1 / 3);
  expect(result.weightsMustTotal100).toBe(false);
  expect(result.weightTotal).toBe(3);
});

test('falls back to equal weighting when selected weights are all zero', () => {
  const normalized = normalizeScoreWeights(['growth', 'resources'], { growth: 0, resources: 0 });

  expect(normalized.total).toBe(0);
  expect(normalized.weights.growth).toBeCloseTo(0.5);
  expect(normalized.weights.resources).toBeCloseTo(0.5);
});

test('does not let sparse data create a misleading score', () => {
  const data = {
    ...clone(DEF),
    goals: [],
    learn: { sql: [], pbi: [], stats: [], mba: [], sessions: [] },
    habits: { defs: [], logs: {} },
    fitness: { workouts: [] },
    finance: { income: [], expenses: [], assets: [], liabilities: [] },
    timeLog: [],
    weeklyReviews: [],
    personalization: {
      ...DEF.personalization,
      activeDimensions: Object.keys(LIFE_DIMENSIONS),
      scoreWeights: Object.fromEntries(Object.keys(LIFE_DIMENSIONS).map((key) => [key, 10])),
    },
  };

  const result = personalScore(data, dateContext);

  expect(result.score).toBe(0);
  expect(result.confidence).toBe(0);
  expect(result.contributingEvidence).toBe(0);
  expect(result.missingEvidence).toBe(Object.keys(LIFE_DIMENSIONS).length);
});

test('stale evidence lowers confidence and is excluded from scoring', () => {
  const data = clone(DEF);
  data.personalization = { ...data.personalization, activeDimensions: ['meaning'], scoreWeights: { meaning: 100 } };
  data.weeklyReviews = [{ id: 1, date: '2026-04-01', satisfaction: 10 }];

  const result = personalScore(data, dateContext);
  const evidence = dimensionEvidence(data, dateContext).meaning;

  expect(evidence.state).toBe('stale');
  expect(evidence.contributes).toBe(false);
  expect(result.staleEvidence).toBe(1);
  expect(result.contributingEvidence).toBe(0);
  expect(result.score).toBe(0);
});

test('fresh weekly review dates count as current meaning evidence', () => {
  const data = clone(DEF);
  data.personalization = { ...data.personalization, activeDimensions: ['meaning'], scoreWeights: { meaning: 100 } };
  data.weeklyReviews = [{ id: 1, week: 'W30-2026', date: '2026-07-22', satisfaction: 8 }];

  const result = personalScore(data, dateContext);
  const evidence = result.evidence[0];

  expect(evidence.state).toBe('current');
  expect(evidence.contributes).toBe(true);
  expect(result.contributingEvidence).toBe(1);
  expect(result.score).toBeCloseTo(8);
});

test('savedAt-only legacy reviews still provide freshness for meaning', () => {
  const data = clone(DEF);
  data.personalization = { ...data.personalization, activeDimensions: ['meaning'], scoreWeights: { meaning: 100 } };
  data.weeklyReviews = [{ id: 1, week: 'W30-2026', savedAt: '2026-07-22T09:00:00.000Z', satisfaction: 7 }];

  const evidence = dimensionEvidence(data, dateContext).meaning;

  expect(evidence.state).toBe('current');
  expect(evidence.contributes).toBe(true);
  expect(evidence.value).toBeCloseTo(0.7);
});

test('builds one linked journey from goals through reflection', () => {
  const result = journeyFor(DEF, '2026-07-18');
  expect(result.map((item) => item.key)).toEqual(['goal', 'outcome', 'task', 'focus', 'reflect']);
});
