import { getSleepSchedule } from './sleepSchedule';

test('protects the schedule after very short sleep', () => expect(getSleepSchedule({ sleepMinutes: 320 }).level).toBe('recovery'));
test('keeps normal schedule after sufficient sleep', () => expect(getSleepSchedule({ sleepMinutes: 480 }).level).toBe('ready'));
