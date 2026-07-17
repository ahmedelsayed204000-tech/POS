const aliases = {
  date: ['date', 'day', 'start date'], steps: ['steps', 'step count'], sleepMinutes: ['sleep minutes', 'sleep duration', 'sleep', 'duration'], sleepScore: ['sleep score', 'sleep quality'], restingHeartRate: ['resting heart rate', 'rhr'], hrv: ['hrv', 'heart rate variability'], weightKg: ['weight', 'weight kg', 'weight (kg)'], calories: ['calories', 'active calories', 'calories burned'], recovery: ['recovery', 'recovery score'], workoutMinutes: ['workout minutes', 'exercise minutes', 'active minutes'],
};
const keyFor = (heading) => Object.entries(aliases).find(([, values]) => values.includes(heading.trim().toLowerCase()))?.[0];
const number = (value) => { const parsed = Number(String(value || '').replace(/[^0-9.-]/g, '')); return Number.isFinite(parsed) ? parsed : undefined; };
export const parseHealthCsv = (text, source = 'csv') => {
  const [header = '', ...rows] = text.trim().split(/\r?\n/); const headings = header.split(','); const columns = headings.map(keyFor);
  if (!columns.includes('date')) throw new Error('CSV needs a date column (for example: Date, Day, or Start Date).');
  return rows.map((row) => { const values = row.split(','); const record = { source }; values.forEach((value, index) => { const key = columns[index]; if (!key) return; record[key] = key === 'date' ? value.trim().slice(0, 10) : number(value); }); return record; }).filter((record) => /^\d{4}-\d{2}-\d{2}$/.test(record.date));
};
export const mergeHealthRecords = (existing = [], incoming = []) => {
  const records = new Map(existing.map((record) => [record.date, record]));
  incoming.forEach((record) => records.set(record.date, { ...records.get(record.date), ...record, updatedAt: new Date().toISOString() }));
  return [...records.values()].sort((a, b) => b.date.localeCompare(a.date));
};
