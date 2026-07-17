import { mergeHealthRecords, parseHealthCsv } from './health';

test('normalizes common health CSV columns', () => {
  expect(parseHealthCsv('Date,Steps,Sleep Minutes,HRV\n2026-07-17,8000,420,55')).toEqual([{ date: '2026-07-17', steps: 8000, sleepMinutes: 420, hrv: 55, source: 'csv' }]);
});

test('merges imports by day without duplicate records', () => {
  expect(mergeHealthRecords([{ date: '2026-07-17', steps: 100 }], [{ date: '2026-07-17', sleepMinutes: 420 }])[0]).toMatchObject({ steps: 100, sleepMinutes: 420 });
});
