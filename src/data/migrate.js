import DEF from './defaults';

export const LEGACY_KEYS = ['pos_v7', 'pos_v6', 'pos_v5', 'pos_v4', 'pos_v3'];

export const migrateData = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = { ...DEF, ...raw };

  if (raw.tl && !raw.timeLog) {
    data.timeLog = data.tl;
    delete data.tl;
  }
  if (raw.learn?.ses && !raw.learn?.sessions) {
    data.learn = { ...data.learn, sessions: data.learn.ses };
    delete data.learn.ses;
  }
  if (raw.fitness?.w && !raw.fitness?.workouts) {
    data.fitness = { ...data.fitness, workouts: data.fitness.w };
    delete data.fitness.w;
  }
  if (raw.fitness?.wt && !raw.fitness?.weights) {
    data.fitness = { ...data.fitness, weights: data.fitness.wt };
    delete data.fitness.wt;
  }

  data.finance = { ...DEF.finance, ...data.finance, assets: data.finance?.assets ?? [], liabilities: data.finance?.liabilities ?? [] };
  data.learn = { ...DEF.learn, ...data.learn, sessions: data.learn?.sessions ?? [] };
  data.fitness = { ...DEF.fitness, ...data.fitness, workouts: data.fitness?.workouts ?? [], weights: data.fitness?.weights ?? [] };
  data.habits = { ...DEF.habits, ...data.habits, defs: data.habits?.defs ?? DEF.habits.defs, logs: data.habits?.logs ?? {} };
  data.timeLog = data.timeLog ?? [];
  data.goals = data.goals ?? [];
  data.career = data.career ?? [];
  data.books = data.books ?? [];
  data.notes = data.notes ?? [];
  data.weeklyReviews = data.weeklyReviews ?? [];
  data.scoreLog = data.scoreLog ?? [];
  data.health = { records: data.health?.records ?? [] };
  data.workspacePulse = data.workspacePulse ?? {};
  data.habitGarden = {
    ...DEF.habitGarden,
    ...data.habitGarden,
    plants: data.habitGarden?.plants ?? DEF.habitGarden.plants,
    actions: data.habitGarden?.actions ?? DEF.habitGarden.actions,
    preferences: { ...DEF.habitGarden.preferences, ...data.habitGarden?.preferences },
  };
  data.sports = {
    ...DEF.sports,
    ...data.sports,
    profile: { ...DEF.sports.profile, ...data.sports?.profile },
    sessions: data.sports?.sessions ?? [],
    nutrition: data.sports?.nutrition ?? [],
    metrics: data.sports?.metrics ?? [],
  };
  data.workCareer = {
    ...DEF.workCareer,
    ...data.workCareer,
    profile: { ...DEF.workCareer.profile, ...data.workCareer?.profile },
    shifts: data.workCareer?.shifts ?? [],
    development: data.workCareer?.development ?? [],
    opportunities: data.workCareer?.opportunities ?? [],
  };
  data.dailyPlan = data.dailyPlan ?? [];
  data.dailyCompass = data.dailyCompass ?? [];
  data.netWorthHistory = data.netWorthHistory ?? [];
  data.goalHistory = data.goalHistory ?? [];
  data.investmentPlan = data.investmentPlan ?? { profile: 'balanced', monthlyContribution: 0, targets: { Cash: 20, Bonds: 25, Equity: 45, Alternatives: 10 } };
  data.automations = data.automations ?? { provider: 'auto', email: '', timezone: 'Africa/Cairo', morningTime: '08:00', eveningTime: '21:00', quietStart: '22:00', quietEnd: '07:00', enabled: false };
  data.behaviorPreferences = {
    ...DEF.behaviorPreferences, ...data.behaviorPreferences,
    accessibility: { ...DEF.behaviorPreferences.accessibility, ...data.behaviorPreferences?.accessibility },
    consent: { ...DEF.behaviorPreferences.consent, ...data.behaviorPreferences?.consent },
    workdays: data.behaviorPreferences?.workdays ?? DEF.behaviorPreferences.workdays,
    restDays: data.behaviorPreferences?.restDays ?? DEF.behaviorPreferences.restDays,
    disabledFeatures: data.behaviorPreferences?.disabledFeatures ?? [],
  };
  data.tasks = data.tasks ?? [];
  data.behaviorEvents = data.behaviorEvents ?? [];
  data.focusSessions = data.focusSessions ?? [];
  data.ifThenPlans = data.ifThenPlans ?? [];
  data.settings = { ...DEF.settings, ...data.settings };
  return data;
};
