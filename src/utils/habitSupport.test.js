import { completionLabel, enrichHabit } from './habitSupport';

test('enriches a legacy habit without changing its name or target', () => {
  const habit = enrichHabit({ id: 1, name: 'Walk', tgt: 5 });
  expect(habit).toMatchObject({ id: 1, name: 'Walk', tgt: 5, habitType: 'build', normalVersion: 'Walk', passiveDetectionConsent: false });
});

test('preserves explicit habit support choices', () => expect(enrichHabit({ name: 'Read', cue: 'After breakfast', minimumVersion: 'Read one page', perceivedEffort: 1 }).cue).toBe('After breakfast'));
test('labels the minimum version as valid success', () => expect(completionLabel('minimum')).toBe('Minimum success'));
