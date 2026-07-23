import DEF from '../data/defaults';

export const privacyExportPayload = (data, kind) => {
  if (kind === 'personalization') {
    return {
      exportedAt: new Date().toISOString(),
      kind,
      personalization: data.personalization || DEF.personalization,
      behaviorPreferences: {
        habitStyle: data.personalization?.habitStyle,
        capacity: data.personalization?.capacity,
        coachingTone: data.behaviorPreferences?.coachingTone,
        consent: data.behaviorPreferences?.consent || DEF.behaviorPreferences.consent,
      },
    };
  }
  if (kind === 'behaviorHistory') {
    return {
      exportedAt: new Date().toISOString(),
      kind,
      behaviorEvents: data.behaviorEvents || [],
    };
  }
  return { exportedAt: new Date().toISOString(), kind: 'unknown' };
};

export const resetPersonalization = (data) => ({
  ...data,
  personalization: { ...DEF.personalization },
  behaviorPreferences: {
    ...data.behaviorPreferences,
    coachingTone: DEF.behaviorPreferences.coachingTone,
  },
});

export const deleteBehaviorHistory = (data) => ({
  ...data,
  behaviorEvents: [],
});
