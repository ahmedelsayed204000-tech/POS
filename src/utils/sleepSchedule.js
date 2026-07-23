export const getSleepSchedule = (record, preferences = {}) => {
  const sleepMinutes = Number(record?.sleepMinutes || 0);
  const targetMinutes = Number(preferences.sleepTargetMinutes || 480);
  const deficit = Math.max(0, targetMinutes - sleepMinutes);
  if (!record) return { level: 'unknown', title: 'No sleep data yet', message: "Import or sync sleep data to personalize today's schedule.", focusStart: preferences.morningTime || '08:00', reminder: null };
  if (sleepMinutes < 360) return { level: 'recovery', title: 'Recovery-first day', message: `Sleep was ${Math.floor(sleepMinutes / 60)}h ${sleepMinutes % 60}m. Protect essential work, avoid overloading the evening, and prioritise an earlier wind-down.`, focusStart: '10:00', reminder: 'Start wind-down 60 minutes before your quiet hours.' };
  if (sleepMinutes < 420) return { level: 'lighter', title: 'Lighter-focus day', message: `You are ${deficit} minutes below your sleep target. Keep the morning focused, but move demanding work to a shorter block later in the day.`, focusStart: '09:00', reminder: 'Keep the evening review short and preserve your bedtime.' };
  return { level: 'ready', title: 'Ready for your planned schedule', message: `Sleep reached ${Math.floor(sleepMinutes / 60)}h ${sleepMinutes % 60}m. Your normal focus blocks and training plan are appropriate.`, focusStart: preferences.morningTime || '08:00', reminder: null };
};
