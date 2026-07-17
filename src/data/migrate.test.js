import DEF from './defaults';
import { migrateData } from './migrate';

test('migrates legacy aliases without losing current defaults', () => {
  const result = migrateData({ tl: [{ id: 1 }], learn: { ses: [] }, fitness: { w: [], wt: [] } });
  expect(result.timeLog).toEqual([{ id: 1 }]);
  expect(result.learn.sessions).toEqual([]);
  expect(result.fitness.workouts).toEqual([]);
  expect(result.settings).toEqual(DEF.settings);
});

test('rejects non-object import data', () => expect(migrateData([])).toBeNull());

test('adds sports and work/career collections to restored legacy data', () => {
  const result = migrateData({ settings: { name: 'Restored user' } });
  expect(result.sports.profile.primarySport).toBeTruthy();
  expect(result.sports.sessions).toEqual(DEF.sports.sessions);
  expect(result.workCareer.shifts).toEqual(DEF.workCareer.shifts);
  expect(result.workCareer.development).toEqual(DEF.workCareer.development);
});

test('adds workspace check-ins without changing restored preferences', () => {
  const result = migrateData({ settings: { name: 'Restored user', currency: 'USD' } });
  expect(result.workspacePulse).toEqual({});
  expect(result.settings.name).toBe('Restored user');
  expect(result.settings.currency).toBe('USD');
});

test('adds behavior preferences with consent disabled for legacy data', () => {
  const result = migrateData({ settings: { name: 'Legacy user' } });
  expect(result.behaviorPreferences.consent).toEqual(DEF.behaviorPreferences.consent);
  expect(Object.values(result.behaviorPreferences.consent).every((value) => value === false)).toBe(true);
  expect(result.tasks).toEqual([]);
  expect(result.behaviorEvents).toEqual([]);
});

test('preserves behavior choices while adding new consent defaults', () => {
  const result = migrateData({ behaviorPreferences: { coachingTone: 'direct', consent: { behaviorEvents: true } } });
  expect(result.behaviorPreferences.coachingTone).toBe('direct');
  expect(result.behaviorPreferences.consent.behaviorEvents).toBe(true);
  expect(result.behaviorPreferences.consent.passiveDetection).toBe(false);
});
