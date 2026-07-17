const roundToFive = (value) => Math.max(5, Math.round(value / 5) * 5);

export function estimateAccuracy(expectedMinutes, actualMinutes) {
  const expected = Number(expectedMinutes);
  const actual = Number(actualMinutes);
  if (expected <= 0 || actual <= 0) return null;
  return Math.max(0, Math.round((1 - Math.abs(expected - actual) / Math.max(expected, actual)) * 100));
}

export function durationRecommendation(task, tasks = []) {
  const history = tasks.filter((item) => item.id !== task.id && item.status === 'completed' && Number(item.actualMinutes) > 0 && item.energy === task.energy);
  if (history.length < 2) return null;
  const actuals = history.map((item) => Number(item.actualMinutes)).sort((a, b) => a - b);
  const middle = Math.floor(actuals.length / 2);
  const median = actuals.length % 2 ? actuals[middle] : (actuals[middle - 1] + actuals[middle]) / 2;
  const suggestedMinutes = roundToFive(median);
  const recoveryMinutes = task.energy === 'high' ? 10 : 5;
  return { suggestedMinutes, recoveryMinutes, sampleSize: history.length };
}

export function elapsedMinutes(startedAt, finishedAt = new Date().toISOString()) {
  const start = new Date(startedAt).getTime();
  const finish = new Date(finishedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(finish) || finish <= start) return null;
  return Math.max(1, Math.round((finish - start) / 60000));
}
