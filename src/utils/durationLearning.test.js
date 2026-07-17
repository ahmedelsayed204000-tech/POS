import { durationRecommendation, elapsedMinutes, estimateAccuracy } from './durationLearning';

test('calculates symmetric estimate accuracy', () => {
  expect(estimateAccuracy(30, 30)).toBe(100);
  expect(estimateAccuracy(30, 60)).toBe(50);
});

test('waits for two comparable completed tasks before recommending', () => {
  const task = { id: 'new', energy: 'high' };
  expect(durationRecommendation(task, [{ id: '1', energy: 'high', status: 'completed', actualMinutes: 40 }])).toBeNull();
  expect(durationRecommendation(task, [{ id: '1', energy: 'high', status: 'completed', actualMinutes: 40 }, { id: '2', energy: 'high', status: 'completed', actualMinutes: 50 }])).toEqual({ suggestedMinutes: 45, recoveryMinutes: 10, sampleSize: 2 });
});

test('derives elapsed minutes from a started task', () => expect(elapsedMinutes('2026-07-17T10:00:00.000Z', '2026-07-17T10:26:00.000Z')).toBe(26));
