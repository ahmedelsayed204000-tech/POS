import DEF from '../data/defaults';
import { deleteBehaviorHistory, privacyExportPayload, resetPersonalization } from './privacyControls';

test('exports only personalization and consent details for personalization export', () => {
  const payload = privacyExportPayload(DEF, 'personalization');

  expect(payload.kind).toBe('personalization');
  expect(payload.personalization).toEqual(DEF.personalization);
  expect(payload.behaviorPreferences.consent).toEqual(DEF.behaviorPreferences.consent);
  expect(payload.behaviorEvents).toBeUndefined();
});

test('exports behavior history without including profile answers', () => {
  const data = { ...DEF, behaviorEvents: [{ id: 1, type: 'task_created', occurredAt: '2026-07-22T10:00:00.000Z', entityType: 'task', entityId: 1, metadata: {} }] };
  const payload = privacyExportPayload(data, 'behaviorHistory');

  expect(payload.kind).toBe('behaviorHistory');
  expect(payload.behaviorEvents).toEqual(data.behaviorEvents);
  expect(payload.personalization).toBeUndefined();
});

test('resets personalization without clearing workspace data', () => {
  const data = { ...DEF, personalization: { ...DEF.personalization, completed: true, primaryPriority: 'Custom priority' }, goals: [{ id: 1, goal: 'Keep me', cat: 'Career', pri: 'P1', pct: 10, target: '2026', action: 'Next' }] };
  const result = resetPersonalization(data);

  expect(result.personalization).toEqual(DEF.personalization);
  expect(result.goals).toEqual(data.goals);
});

test('deletes behavior history without changing behavior consent', () => {
  const data = { ...DEF, behaviorEvents: [{ id: 1, type: 'task_created', occurredAt: '2026-07-22T10:00:00.000Z', entityType: 'task', entityId: 1, metadata: {} }], behaviorPreferences: { ...DEF.behaviorPreferences, consent: { ...DEF.behaviorPreferences.consent, behaviorEvents: true } } };
  const result = deleteBehaviorHistory(data);

  expect(result.behaviorEvents).toEqual([]);
  expect(result.behaviorPreferences.consent.behaviorEvents).toBe(true);
});
