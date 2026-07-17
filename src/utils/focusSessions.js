export const clampSessionMinutes = (minutes) => Math.max(5, Math.min(180, Math.round(Number(minutes) || 25)));

export function nextSessionMinutes(currentMinutes, preference) {
  const current = clampSessionMinutes(currentMinutes);
  if (preference === 'shorter') return Math.max(5, current - 5);
  if (preference === 'longer') return Math.min(180, current + 5);
  return current;
}

export function formatFocusTime(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
