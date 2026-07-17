export function recommendDailyPlan({ availableMinutes, energy, preferredFocusMinutes }) {
  const available = Math.max(5, Math.min(1440, Number(availableMinutes) || 60));
  const preferred = Math.max(5, Math.min(180, Number(preferredFocusMinutes) || 25));
  const bufferMinutes = Math.min(60, Math.max(5, Math.round(available * 0.1)));
  const usableMinutes = Math.max(5, available - bufferMinutes);
  const energyLimit = Number(energy) <= 2 ? 15 : Number(energy) === 3 ? 30 : preferred;
  const firstBlockMinutes = Math.max(5, Math.min(preferred, energyLimit, usableMinutes));
  return { availableMinutes: available, bufferMinutes, firstBlockMinutes };
}

export function taskEnergyFromCheckIn(energy) {
  if (Number(energy) <= 2) return 'low';
  if (Number(energy) >= 4) return 'high';
  return 'medium';
}
