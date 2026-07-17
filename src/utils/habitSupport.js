export function enrichHabit(habit = {}) {
  const name = String(habit.name || habit.desiredBehavior || 'New habit');
  return {
    ...habit,
    desiredBehavior: habit.desiredBehavior || name,
    habitType: habit.habitType || 'build',
    personalReason: habit.personalReason || '',
    cue: habit.cue || '',
    minimumVersion: habit.minimumVersion || `Do two minutes of ${name.toLowerCase()}.`,
    normalVersion: habit.normalVersion || name,
    stretchVersion: habit.stretchVersion || '',
    preferredTime: habit.preferredTime || 'anytime',
    preferredLocation: habit.preferredLocation || '',
    replacementBehavior: habit.replacementBehavior || '',
    recoveryPlan: habit.recoveryPlan || 'Resume with the minimum version at the next suitable cue.',
    perceivedEffort: Math.max(1, Math.min(5, Number(habit.perceivedEffort) || 3)),
    passiveDetectionConsent: Boolean(habit.passiveDetectionConsent),
  };
}

export const completionLevels = ['minimum', 'normal', 'stretch'];
export const completionLabel = (level) => ({ minimum: 'Minimum success', normal: 'Normal version', stretch: 'Stretch version' }[level] || 'Completed');
