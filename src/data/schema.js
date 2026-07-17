import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD date');
const id = z.union([z.number(), z.string()]);
const moneyEntry = z.object({ id, date, amt: z.number().finite() });

export const personalDataSchema = z.object({
  health: z.object({ records: z.array(z.object({ date, source: z.string(), steps: z.number().finite().optional(), sleepMinutes: z.number().finite().nonnegative().optional(), sleepScore: z.number().finite().optional(), restingHeartRate: z.number().finite().optional(), hrv: z.number().finite().optional(), weightKg: z.number().finite().positive().optional(), calories: z.number().finite().nonnegative().optional(), recovery: z.number().finite().min(0).max(100).optional(), workoutMinutes: z.number().finite().nonnegative().optional(), updatedAt: z.string().optional() })) }).optional(),
  workspacePulse: z.record(z.object({
    customFocus: z.string().optional(),
    focusDone: z.record(z.boolean()).optional(),
    checkIns: z.array(z.object({ id, date, note: z.string(), energy: z.number().int().min(1).max(5) })).optional(),
  })),
  habitGarden: z.object({
    northStar: z.string(), selectedPlantId: z.string(), baseStreak: z.number().finite().nonnegative(),
    plants: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), meaning: z.string(), desiredOutcome: z.string() })),
    preferences: z.object({ pace: z.enum(['gentle','steady','strong','intense']), times: z.array(z.enum(['morning','midday','evening','anytime'])), adaptSleep: z.boolean(), adaptShifts: z.boolean(), adaptTraining: z.boolean() }),
    actions: z.array(z.object({ id: z.string(), habitId: id, title: z.string(), subtitle: z.string(), icon: z.string(), paused: z.boolean() })),
  }),
  sports: z.object({
    profile: z.object({ primarySport: z.string(), level: z.enum(['beginner', 'recreational', 'competitive', 'elite']), weeklyTarget: z.number().finite().min(1).max(21), heightCm: z.number().finite().positive(), weightKg: z.number().finite().positive(), goals: z.string() }),
    sessions: z.array(z.object({ id, date, sport: z.string(), type: z.string(), duration: z.number().finite().min(1).max(1440), intensity: z.number().finite().min(1).max(10), distanceKm: z.number().finite().nonnegative(), calories: z.number().finite().nonnegative(), status: z.enum(['planned', 'completed', 'skipped']), notes: z.string() })),
    nutrition: z.array(z.object({ id, date, mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']), food: z.string(), calories: z.number().finite().nonnegative(), protein: z.number().finite().nonnegative(), carbs: z.number().finite().nonnegative(), fat: z.number().finite().nonnegative(), waterMl: z.number().finite().nonnegative(), notes: z.string() })),
    metrics: z.array(z.object({ id, date, metric: z.string(), value: z.number().finite(), unit: z.string(), source: z.string(), notes: z.string() })),
  }),
  workCareer: z.object({
    profile: z.object({ employer: z.string(), role: z.string(), weeklyHoursTarget: z.number().finite().min(0).max(168), careerGoal: z.string() }),
    shifts: z.array(z.object({ id, date, start: z.string(), end: z.string(), breakMinutes: z.number().finite().min(0).max(720), type: z.enum(['regular', 'night', 'overtime', 'on_call', 'remote', 'leave']), employer: z.string(), role: z.string(), status: z.enum(['scheduled', 'completed', 'missed', 'cancelled']), notes: z.string() })),
    development: z.array(z.object({ id, type: z.enum(['course', 'certification', 'workshop', 'postgraduate', 'degree', 'self_study']), title: z.string(), provider: z.string(), field: z.string(), status: z.enum(['planned', 'active', 'paused', 'completed', 'cancelled']), startDate: z.string(), targetDate: z.string(), progress: z.number().finite().min(0).max(100), weeklyHoursTarget: z.number().finite().min(0).max(168), notes: z.string() })),
    opportunities: z.array(z.object({ id, organization: z.string(), role: z.string(), type: z.enum(['job', 'promotion', 'freelance', 'internship', 'research']), status: z.enum(['interested', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn']), date: z.string(), nextAction: z.string(), notes: z.string() })),
  }),
  habits: z.object({
    defs: z.array(z.object({ id, cat: z.string(), name: z.string().min(1), tgt: z.number().finite() })),
    logs: z.record(z.union([z.boolean(), z.string(), z.number()])),
  }),
  timeLog: z.array(z.object({ id, date, cat: z.string(), act: z.string(), hrs: z.number().finite().nonnegative() })),
  finance: z.object({
    income: z.array(moneyEntry.extend({ src: z.string() })),
    expenses: z.array(moneyEntry.extend({ cat: z.string(), sub: z.string() })),
    budget: z.record(z.number().finite().nonnegative()),
    assets: z.array(z.object({ id, name: z.string(), cat: z.string(), value: z.number().finite() })),
    liabilities: z.array(z.object({ id, name: z.string(), cat: z.string(), amount: z.number().finite() })),
  }),
  learn: z.object({
    sql: z.array(z.object({ id, name: z.string(), s: z.enum(['todo', 'active', 'done']), hrs: z.number().finite(), note: z.string() })),
    pbi: z.array(z.object({ id, name: z.string(), s: z.enum(['todo', 'active', 'done']), hrs: z.number().finite(), note: z.string() })),
    stats: z.array(z.object({ id, name: z.string(), s: z.enum(['todo', 'active', 'done']), hrs: z.number().finite(), note: z.string() })),
    mba: z.array(z.object({ id, name: z.string(), s: z.enum(['todo', 'active', 'done']), hrs: z.number().finite(), note: z.string() })),
    sessions: z.array(z.object({ id, date, sub: z.string(), topic: z.string(), min: z.number().finite().nonnegative() })),
  }),
  fitness: z.object({
    workouts: z.array(z.object({ id, date, type: z.string(), dur: z.number().finite().nonnegative(), intensity: z.number().finite(), note: z.string() })),
    weights: z.array(z.object({ id, date, kg: z.number().finite().positive(), bf: z.number().finite().nonnegative() })),
  }),
  goals: z.array(z.object({ id, goal: z.string(), cat: z.string(), pri: z.enum(['P1', 'P2', 'P3']), pct: z.number().finite().min(0).max(100), target: z.string(), action: z.string() })),
  career: z.array(z.object({ id, company: z.string(), role: z.string(), date, status: z.string(), notes: z.string(), priority: z.string() })),
  books: z.array(z.object({ id, title: z.string(), author: z.string(), genre: z.string(), status: z.enum(['Want', 'Reading', 'Done']), rating: z.number().int().min(0).max(5), note: z.string(), finished: z.string() })),
  notes: z.array(z.object({ id, date, text: z.string(), time: z.string() })),
  weeklyReviews: z.array(z.object({ id, week: z.string(), wins: z.string(), challenges: z.string(), lessons: z.string(), p1: z.string(), p2: z.string(), p3: z.string(), satisfaction: z.union([z.string(), z.number()]), savedAt: z.string().optional(), autoScore: z.number().optional(), scores: z.record(z.number()).optional() })),
  aiHistory: z.array(z.unknown()),
  scoreLog: z.array(z.object({ date, score: z.number().finite().min(0).max(10) })),
  dailyPlan: z.array(z.object({ id, date, text: z.string(), done: z.boolean(), source: z.string().optional() })),
  dailyCompass: z.array(z.object({
    id, date, successDefinition: z.string(), primaryOutcome: z.string(), secondaryOutcomes: z.array(z.string()).max(2),
    obstacle: z.string(), firstAction: z.string(), energy: z.number().int().min(1).max(5), availableMinutes: z.number().int().min(5).max(1440),
    firstBlockMinutes: z.number().int().min(5).max(180), bufferMinutes: z.number().int().min(0).max(240), stoppingTime: z.string(),
    lowEnergyPlan: z.string(), createdAt: z.string(), updatedAt: z.string(),
  })),
  netWorthHistory: z.array(z.object({ date, netWorth: z.number().finite(), assets: z.number().finite(), liabilities: z.number().finite() })),
  goalHistory: z.array(z.object({ date, goals: z.array(z.object({ id, pct: z.number().finite().min(0).max(100) })) })),
  investmentPlan: z.object({ profile: z.enum(['conservative', 'balanced', 'growth']), monthlyContribution: z.number().finite().nonnegative(), targets: z.record(z.number().finite().min(0).max(100)) }),
  automations: z.object({ provider: z.enum(['auto', 'google', 'microsoft']), email: z.string(), timezone: z.string(), morningTime: z.string(), eveningTime: z.string(), quietStart: z.string(), quietEnd: z.string(), enabled: z.boolean() }),
  behaviorPreferences: z.object({
    workingHoursStart: z.string(), workingHoursEnd: z.string(), wakeTime: z.string(), sleepTime: z.string(),
    focusSessionMinutes: z.number().int().min(5).max(180), reminderFrequency: z.enum(['minimal', 'balanced', 'frequent']),
    quietStart: z.string(), quietEnd: z.string(), workdays: z.array(z.number().int().min(0).max(6)), restDays: z.array(z.number().int().min(0).max(6)),
    coachingTone: z.enum(['gentle', 'supportive', 'direct']), gamification: z.enum(['off', 'gentle', 'full']),
    accessibility: z.object({ reducedMotion: z.boolean(), highContrast: z.boolean(), largeText: z.boolean() }),
    consent: z.object({ behaviorEvents: z.boolean(), contextualRecommendations: z.boolean(), healthPersonalization: z.boolean(), passiveDetection: z.boolean() }),
    disabledFeatures: z.array(z.string()),
  }),
  tasks: z.array(z.object({
    id, title: z.string().min(1), desiredOutcome: z.string(), nextAction: z.string(), expectedMinutes: z.number().int().min(0).max(1440),
    actualMinutes: z.number().int().min(0).max(1440).nullable(), energy: z.enum(['low', 'medium', 'high']), priority: z.enum(['P1', 'P2', 'P3']),
    deadline: z.string(), scheduledStart: z.string(), scheduledEnd: z.string(), dependencies: z.array(id), context: z.string(),
    status: z.enum(['inbox', 'planned', 'in_progress', 'completed', 'postponed', 'cancelled']), postponementCount: z.number().int().nonnegative(),
    postponementReason: z.string(), goalId: id.nullable(), createdAt: z.string(), updatedAt: z.string(),
  })),
  behaviorEvents: z.array(z.object({ id, type: z.string(), occurredAt: z.string(), entityType: z.string(), entityId: id.nullable(), metadata: z.record(z.unknown()) })),
  focusSessions: z.array(z.unknown()),
  ifThenPlans: z.array(z.unknown()),
  settings: z.object({ name: z.string(), weekTarget: z.number().finite().positive(), fitnessTarget: z.number().finite().positive(), currency: z.string().min(1), goalNetWorth: z.number().finite(), notionUrl: z.string() }),
}).strict();

export const validateImport = (text) => {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return { success: false, message: 'The selected file is not valid JSON.' };
  }
  const result = personalDataSchema.safeParse(value);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, message: `Import rejected: ${result.error.issues[0].path.join('.') || 'root'} — ${result.error.issues[0].message}` };
};
