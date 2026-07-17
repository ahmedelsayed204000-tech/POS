import { recommendDailyPlan, taskEnergyFromCheckIn } from './dailyCompass';

test('reduces the first block on low-energy days', () => {
  expect(recommendDailyPlan({ availableMinutes: 120, energy: 2, preferredFocusMinutes: 45 })).toEqual({ availableMinutes: 120, bufferMinutes: 12, firstBlockMinutes: 15 });
});

test('never recommends more time than is available after buffer', () => {
  const plan = recommendDailyPlan({ availableMinutes: 20, energy: 5, preferredFocusMinutes: 60 });
  expect(plan.firstBlockMinutes).toBeLessThanOrEqual(15);
});

test('maps check-in energy to a task demand label', () => {
  expect(taskEnergyFromCheckIn(1)).toBe('low');
  expect(taskEnergyFromCheckIn(3)).toBe('medium');
  expect(taskEnergyFromCheckIn(5)).toBe('high');
});
