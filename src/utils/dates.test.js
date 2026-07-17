import { getDateContext, getIsoWeekLabel } from './dates';

test('builds a leap-year date context', () => expect(getDateContext(new Date(2028, 1, 29)).daysInMonth).toBe(29));
test('uses ISO week labels across year boundaries', () => expect(getIsoWeekLabel(new Date(2021, 0, 1))).toBe('W53-2020'));
