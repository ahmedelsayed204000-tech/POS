import { clampSessionMinutes, formatFocusTime, nextSessionMinutes } from './focusSessions';

test('clamps selectable focus duration to safe bounds', () => { expect(clampSessionMinutes(2)).toBe(5); expect(clampSessionMinutes(240)).toBe(180); });
test('adjusts the next session gently in five-minute steps', () => { expect(nextSessionMinutes(25, 'shorter')).toBe(20); expect(nextSessionMinutes(25, 'longer')).toBe(30); expect(nextSessionMinutes(25, 'equal')).toBe(25); });
test('formats a visible focus timer', () => expect(formatFocusTime(1505)).toBe('25:05'));
