// ─── STORAGE ──────────────────────────────────────────────────────────────────
// ⚠️  Never change this key — doing so orphans all saved user data.
export const STORAGE_KEY = 'pos_final';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
import { fmt, NOW, YR, MO } from '../utils/dates';
import { enrichHabit } from '../utils/habitSupport';
const d = (daysAgo) => fmt(new Date(YR, MO, NOW.getDate() - daysAgo));
const TODAY = fmt(NOW);
const MP    = TODAY.slice(0, 7);   // "YYYY-MM"

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEF = {
  personalization: {
    completed: false,
    updatedAt: null,
    primaryPriority: 'Build consistency',
    activeDimensions: ['growth', 'wellbeing', 'resources', 'meaning'],
    scoreWeights: { growth: 30, wellbeing: 30, relationships: 0, resources: 25, meaning: 15, learning: 0 },
    habitStyle: 'balanced',
    capacity: 'moderate',
    coachingTone: 'supportive',
    successDefinition: 'Steady progress on what matters without sacrificing recovery.',
  },
  health: { records: [] },
  workspacePulse: {},
  habitGarden: {
    northStar: 'Become strong, focused and financially free.',
    selectedPlantId: 'energy',
    baseStreak: 12,
    plants: [
      { id: 'energy', name: 'Energy', category: 'Health & energy', meaning: 'Build your physical vitality to power everything you do.', desiredOutcome: 'Feel stronger, have more stamina, and wake up refreshed.' },
      { id: 'focus', name: 'Focus', category: 'Focus & learning', meaning: 'Create the clarity to learn deeply and finish meaningful work.', desiredOutcome: 'Protect daily focus and complete important learning goals.' },
      { id: 'freedom', name: 'Freedom', category: 'Finance', meaning: 'Grow the financial security that creates more life choices.', desiredOutcome: 'Save consistently and invest toward long-term freedom.' },
    ],
    preferences: { pace: 'steady', times: ['morning'], adaptSleep: true, adaptShifts: true, adaptTraining: true },
    actions: [
      { id: 'water', habitId: 5, title: 'Drink water', subtitle: 'Stay hydrated.', icon: 'water_drop', paused: false },
      { id: 'move', habitId: 3, title: 'Move for 20 minutes', subtitle: 'Get your body moving.', icon: 'directions_run', paused: false },
      { id: 'sleep', habitId: 16, title: 'Sleep before 11:00', subtitle: 'Protect your rest.', icon: 'bedtime', paused: false },
    ],
  },
  sports: {
    profile: {
      primarySport: 'General fitness',
      level: 'recreational',
      weeklyTarget: 4,
      heightCm: 175,
      weightKg: 75,
      goals: 'Build strength, improve conditioning, and recover consistently',
    },
    sessions: [
      { id: 1, date: TODAY, sport: 'Boxing', type: 'Technique', duration: 60, intensity: 7, distanceKm: 0, calories: 520, status: 'completed', notes: 'Footwork and combinations' },
    ],
    nutrition: [
      { id: 1, date: TODAY, mealType: 'breakfast', food: 'Eggs, oats and fruit', calories: 520, protein: 32, carbs: 55, fat: 18, waterMl: 500, notes: '' },
    ],
    metrics: [
      { id: 1, date: TODAY, metric: 'Resting heart rate', value: 58, unit: 'bpm', source: 'manual', notes: '' },
    ],
  },
  workCareer: {
    profile: {
      employer: 'Example Company',
      role: 'Analyst',
      weeklyHoursTarget: 40,
      careerGoal: 'Grow into a senior analytics role',
    },
    shifts: [
      { id: 1, date: TODAY, start: '09:00', end: '17:00', breakMinutes: 60, type: 'regular', employer: 'Example Company', role: 'Analyst', status: 'scheduled', notes: '' },
    ],
    development: [
      { id: 1, type: 'postgraduate', title: 'MBA', provider: 'Current university', field: 'Business Administration', status: 'active', startDate: '', targetDate: `${YR}-12-31`, progress: 55, weeklyHoursTarget: 6, notes: 'Operations Management is the current focus' },
    ],
    opportunities: [
      { id: 1, organization: 'Example Company', role: 'Senior Analytics Specialist', type: 'promotion', status: 'interested', date: TODAY, nextAction: 'Prepare portfolio and role-fit notes', notes: '' },
    ],
  },
  dailyPlan: [],
  dailyCompass: [],
  netWorthHistory: [],
  goalHistory: [],
  investmentPlan: { profile: 'balanced', monthlyContribution: 0, targets: { Cash: 20, Bonds: 25, Equity: 45, Alternatives: 10 } },
  automations: { provider: 'auto', email: '', timezone: 'Africa/Cairo', morningTime: '08:00', eveningTime: '21:00', quietStart: '22:00', quietEnd: '07:00', enabled: false },
  behaviorPreferences: {
    workingHoursStart: '09:00', workingHoursEnd: '17:00', wakeTime: '07:00', sleepTime: '23:00',
    focusSessionMinutes: 25, reminderFrequency: 'balanced', quietStart: '22:00', quietEnd: '07:00',
    workdays: [1, 2, 3, 4, 5], restDays: [0, 6], coachingTone: 'supportive', gamification: 'gentle',
    accessibility: { reducedMotion: false, highContrast: false, largeText: false },
    consent: { behaviorEvents: false, contextualRecommendations: false, healthPersonalization: false, passiveDetection: false, emailDelivery: false, reminders: false },
    disabledFeatures: [],
  },
  tasks: [],
  behaviorEvents: [],
  focusSessions: [],
  ifThenPlans: [],
  // ── HABITS ──────────────────────────────────────────────────────────────────
  habits: {
    defs: [
      { id: 1,  cat: '🧠', name: 'Daily Reading (30 min+)',    tgt: 7 },
      { id: 2,  cat: '🧠', name: 'Journaling & Reflection',    tgt: 7 },
      { id: 3,  cat: '💪', name: 'Gym Session',                tgt: 5 },
      { id: 4,  cat: '💪', name: 'Boxing Training',            tgt: 3 },
      { id: 5,  cat: '💪', name: 'Water Intake (3L+)',         tgt: 7 },
      { id: 6,  cat: '💪', name: 'Clean Eating',               tgt: 7 },
      { id: 7,  cat: '📚', name: 'SQL Study',                  tgt: 7 },
      { id: 8,  cat: '📚', name: 'Power BI Study',             tgt: 6 },
      { id: 9,  cat: '📚', name: 'Statistics Study',           tgt: 5 },
      { id: 10, cat: '📚', name: 'MBA Module',                 tgt: 6 },
      { id: 11, cat: '💼', name: 'Focused Project Work',       tgt: 5 },
      { id: 12, cat: '💼', name: 'Freelance Outreach',         tgt: 4 },
      { id: 13, cat: '💰', name: 'Review Daily Spending',      tgt: 7 },
      { id: 14, cat: '🏠', name: 'Family Quality Time',        tgt: 7 },
      { id: 15, cat: '✨', name: 'Custom Habit',               tgt: 5 },
      { id: 16, cat: '🌙', name: 'Sleep before 11:00',          tgt: 7 },
    ],
    logs: {},
  },
  habitRecoveries: [],

  // ── TIME LOG ─────────────────────────────────────────────────────────────────
  timeLog: [
    { id: 1, date: TODAY,  cat: 'Day Job',          act: 'Reporting and analysis',            hrs: 7.5 },
    { id: 2, date: TODAY,  cat: 'SQL Study',         act: 'String Functions — DataCamp',       hrs: 1.5 },
    { id: 3, date: TODAY,  cat: 'Gym / Boxing',      act: 'Boxing + upper body weights',       hrs: 1.0 },
    { id: 4, date: d(1),   cat: 'MBA',               act: 'Operations Management lecture',     hrs: 2.0 },
    { id: 5, date: d(1),   cat: 'Other',             act: 'Personal project work',             hrs: 1.5 },
    { id: 6, date: d(2),   cat: 'Power BI Study',    act: 'DAX measures practice',             hrs: 2.0 },
  ],

  // ── FINANCE ──────────────────────────────────────────────────────────────────
  finance: {
    income: [
      { id: 1, date: `${MP}-01`, src: 'Salary',             amt: 10000 },
      { id: 2, date: `${MP}-05`, src: 'Freelance project',  amt: 1500  },
    ],
    expenses: [
      { id: 1, date: `${MP}-01`, cat: 'Housing',         sub: 'Rent',            amt: 4500 },
      { id: 2, date: `${MP}-03`, cat: 'Food & Groceries', sub: 'Supermarket',    amt: 850  },
      { id: 3, date: `${MP}-01`, cat: 'Health & Gym',    sub: 'Gym membership',  amt: 600  },
      { id: 4, date: `${MP}-05`, cat: 'Education/MBA',   sub: 'Fees',            amt: 1500 },
      { id: 5, date: `${MP}-01`, cat: 'Savings',         sub: 'Monthly transfer',amt: 2000 },
    ],
    budget: {
      'Housing':         4500,
      'Food & Groceries':1200,
      'Transport':        600,
      'Health & Gym':     700,
      'Education/MBA':   1500,
      'Entertainment':    400,
      'Savings':         2000,
      'Personal Care':    300,
      'Other':            500,
    },
    assets: [
      { id: 1, name: 'Savings',                 cat: 'Cash',       value: 10000 },
      { id: 2, name: 'Emergency fund',           cat: 'Cash',       value: 8000  },
      { id: 3, name: 'Investment account',       cat: 'Investment', value: 4000  },
    ],
    liabilities: [
      { id: 1, name: 'Education balance',  cat: 'Education', amount: 5000 },
      { id: 2, name: 'Credit balance',     cat: 'Credit',    amount: 800  },
    ],
  },

  // ── LEARNING ─────────────────────────────────────────────────────────────────
  // ⚠️  Topic state field is "s" (not "status") — keep consistent.
  learn: {
    sql: [
      { id: 1,  name: 'SELECT, WHERE, ORDER BY',           s: 'done',   hrs: 6,  note: '' },
      { id: 2,  name: 'Aggregate Functions (GROUP BY)',     s: 'done',   hrs: 4,  note: '' },
      { id: 3,  name: 'JOINs — INNER, LEFT, RIGHT, FULL',  s: 'done',   hrs: 5,  note: '' },
      { id: 4,  name: 'Subqueries & CTEs',                  s: 'done',   hrs: 5,  note: '' },
      { id: 5,  name: 'Window Functions (RANK, LAG, LEAD)', s: 'done',   hrs: 6,  note: '' },
      { id: 6,  name: 'Date & Time Functions',              s: 'done',   hrs: 3,  note: '' },
      { id: 7,  name: 'String Functions & Pattern Matching',s: 'active', hrs: 3,  note: 'In Progress — DataCamp' },
      { id: 8,  name: 'CASE WHEN & Conditional Logic',      s: 'done',   hrs: 3,  note: '' },
      { id: 9,  name: 'Stored Procedures & Views',          s: 'todo',   hrs: 4,  note: '' },
      { id: 10, name: 'Query Optimization & Performance',   s: 'todo',   hrs: 4,  note: '' },
      { id: 11, name: 'SQL for Healthcare Analytics',        s: 'todo',   hrs: 8,  note: '' },
      { id: 12, name: 'Capstone: Insurance Claims Project',  s: 'todo',   hrs: 10, note: 'Portfolio piece' },
    ],
    pbi: [
      { id: 1,  name: 'Power BI Desktop Setup',             s: 'done',   hrs: 3,  note: '' },
      { id: 2,  name: 'Connecting Data Sources',            s: 'done',   hrs: 4,  note: '' },
      { id: 3,  name: 'Data Transformation (Power Query)',   s: 'done',   hrs: 5,  note: '' },
      { id: 4,  name: 'Data Modelling & Relationships',      s: 'active', hrs: 5,  note: 'In Progress' },
      { id: 5,  name: 'DAX Basics (SUM, CALCULATE)',         s: 'todo',   hrs: 5,  note: '' },
      { id: 6,  name: 'DAX Intermediate (FILTER, ALL)',      s: 'todo',   hrs: 6,  note: '' },
      { id: 7,  name: 'DAX Advanced (Time Intelligence)',    s: 'todo',   hrs: 6,  note: '' },
      { id: 8,  name: 'Professional Dashboard Design',       s: 'todo',   hrs: 8,  note: '' },
      { id: 9,  name: 'Row-Level Security & Publishing',     s: 'todo',   hrs: 4,  note: '' },
      { id: 10, name: 'Healthcare Analytics Project',        s: 'todo',   hrs: 10, note: 'Portfolio piece' },
    ],
    stats: [
      { id: 1,  name: 'Descriptive Statistics',             s: 'done',   hrs: 4,  note: '' },
      { id: 2,  name: 'Distributions & Histograms',         s: 'done',   hrs: 3,  note: '' },
      { id: 3,  name: 'Probability Theory & Rules',         s: 'active', hrs: 5,  note: 'Chapter 3' },
      { id: 4,  name: 'Normal & Binomial Distributions',    s: 'todo',   hrs: 5,  note: '' },
      { id: 5,  name: 'Hypothesis Testing (t-test)',         s: 'todo',   hrs: 6,  note: '' },
      { id: 6,  name: 'Confidence Intervals & p-values',    s: 'todo',   hrs: 5,  note: '' },
      { id: 7,  name: 'Correlation & Linear Regression',    s: 'todo',   hrs: 6,  note: '' },
      { id: 8,  name: 'Statistics in Python (scipy)',        s: 'todo',   hrs: 8,  note: '' },
      { id: 9,  name: 'Applied Stats: Healthcare Cases',     s: 'todo',   hrs: 8,  note: '' },
    ],
    mba: [
      { id: 1,  name: 'Managerial Accounting',              s: 'done',   hrs: 8,  note: '' },
      { id: 2,  name: 'Corporate Finance & Valuation',      s: 'done',   hrs: 10, note: '' },
      { id: 3,  name: 'Strategic Management',               s: 'done',   hrs: 10, note: '' },
      { id: 4,  name: 'Operations Management',              s: 'active', hrs: 8,  note: 'Quiz prep this week' },
      { id: 5,  name: 'Marketing Management',               s: 'todo',   hrs: 8,  note: '' },
      { id: 6,  name: 'Human Resources Management',         s: 'todo',   hrs: 8,  note: '' },
      { id: 7,  name: 'Business Analytics & Data Strategy', s: 'todo',   hrs: 10, note: '' },
      { id: 8,  name: 'Entrepreneurship & Innovation',      s: 'todo',   hrs: 8,  note: '' },
      { id: 9,  name: 'MBA Capstone / Thesis',              s: 'todo',   hrs: 20, note: 'Final deliverable' },
    ],
    sessions: [
      { id: 1, date: TODAY, sub: 'sql',   topic: 'String Functions',      min: 45 },
      { id: 2, date: d(1),  sub: 'stats', topic: 'Probability Ch.3',      min: 60 },
      { id: 3, date: d(1),  sub: 'mba',   topic: 'Operations Management', min: 90 },
      { id: 4, date: d(2),  sub: 'pbi',   topic: 'Data modelling',        min: 75 },
      { id: 5, date: d(3),  sub: 'sql',   topic: 'Window Functions',      min: 60 },
    ],
  },

  // ── FITNESS ──────────────────────────────────────────────────────────────────
  fitness: {
    workouts: [
      { id: 1, date: TODAY, type: 'Gym',    dur: 75, intensity: 4, note: 'Chest & Triceps: Bench 4×10' },
      { id: 2, date: TODAY, type: 'Boxing', dur: 60, intensity: 5, note: 'Sparring 3 rounds + pad work' },
      { id: 3, date: d(1),  type: 'Gym',    dur: 70, intensity: 4, note: 'Back & Biceps' },
      { id: 4, date: d(2),  type: 'Boxing', dur: 60, intensity: 5, note: 'Technical sparring' },
      { id: 5, date: d(3),  type: 'Gym',    dur: 65, intensity: 3, note: 'Legs: Squats 4×8' },
    ],
    weights: [
      { id: 1, date: d(21), kg: 89.2, bf: 22.5 },
      { id: 2, date: d(14), kg: 88.5, bf: 22.0 },
      { id: 3, date: d(7),  kg: 87.8, bf: 21.5 },
      { id: 4, date: TODAY, kg: 75, bf: 20 },
    ],
  },

  // ── GOALS ────────────────────────────────────────────────────────────────────
  goals: [
    { id: 1,  goal: 'Data Intelligence & Reporting Specialist Role', cat: 'Career',    pri: 'P1', pct: 40, target: 'Dec 2026', action: 'Apply to 2 more roles this week'         },
    { id: 2,  goal: 'SQL Advanced Certification (DataCamp)',          cat: 'Learning',  pri: 'P1', pct: 35, target: 'Dec 2026', action: 'Complete String Functions module'       },
    { id: 3,  goal: 'Power BI Certified Analytics Professional',      cat: 'Learning',  pri: 'P2', pct: 20, target: 'Dec 2026', action: 'Finish data modelling section'          },
    { id: 4,  goal: 'MBA Full Program Completion',                    cat: 'Education', pri: 'P1', pct: 55, target: 'Dec 2026', action: 'Operations Management quiz prep'        },
    { id: 5,  goal: 'Build a sustainable freelance pipeline',        cat: 'Freelance', pri: 'P2', pct: 25, target: 'Sep 2026', action: 'Send 3 thoughtful proposals this week'  },
    { id: 6,  goal: 'Save & Invest EGP 100,000',                     cat: 'Finance',   pri: 'P1', pct: 40, target: 'Dec 2026', action: 'Automate monthly savings transfer'      },
    { id: 7,  goal: 'Body Recomposition — 15% Body Fat',             cat: 'Health',    pri: 'P1', pct: 50, target: 'Sep 2026', action: '5 training sessions this week'          },
    { id: 8,  goal: 'Read 24 Books in 2026',                         cat: 'Personal',  pri: 'P3', pct: 50, target: 'Dec 2026', action: 'Finish current book by Sunday'          },
    { id: 9,  goal: 'Launch Healthcare Data Consulting',              cat: 'Business',  pri: 'P2', pct: 20, target: 'Oct 2026', action: 'Draft service packages'                 },
    { id: 10, goal: 'Statistics & Probability — ML-Ready',           cat: 'Learning',  pri: 'P2', pct: 10, target: 'Dec 2026', action: 'Complete Chapter 3 this week'           },
  ],

  // ── CAREER PIPELINE ──────────────────────────────────────────────────────────
  career: [
    { id: 1, company: 'Example Company (Internal)', role: 'Senior Analytics Specialist', date: `${MP}-10`, status: 'Applied', notes: 'Prepare relevant portfolio examples', priority: 'P1' },
    { id: 2, company: 'AXA Egypt',                   role: 'Data Analyst — Healthcare',                date: `${MP}-05`, status: 'Screening',    notes: 'Awaiting HR callback',                                  priority: 'P2' },
    { id: 3, company: 'Freelance Client',             role: 'Analytics Consultant',                     date: `${MP}-12`, status: 'Proposal Sent',notes: 'Example analytics project',                             priority: 'P2' },
  ],

  // ── BOOKS ────────────────────────────────────────────────────────────────────
  books: [
    { id: 1,  title: 'Atomic Habits',            author: 'James Clear',          genre: 'Self-Help',   status: 'Done',    rating: 5, note: 'Foundation of my habit system',             finished: '2026-01-15' },
    { id: 2,  title: 'Thinking, Fast and Slow',  author: 'Daniel Kahneman',      genre: 'Psychology',  status: 'Done',    rating: 4, note: 'Statistical intuition improved',            finished: '2026-02-05' },
    { id: 3,  title: 'Storytelling with Data',   author: 'Cole Nussbaumer',      genre: 'Data Viz',    status: 'Done',    rating: 5, note: 'Transformed my Power BI dashboards',        finished: '2026-03-20' },
    { id: 4,  title: 'Deep Work',                author: 'Cal Newport',           genre: 'Productivity',status: 'Done',    rating: 5, note: 'Changed study approach — Pomodoro',         finished: '2026-04-15' },
    { id: 5,  title: 'Never Split the Difference',author: 'Chris Voss',          genre: 'Business',    status: 'Done',    rating: 5, note: 'Negotiation for salary & clients',          finished: '2026-05-28' },
    { id: 6,  title: 'Good to Great',            author: 'Jim Collins',           genre: 'Business',    status: 'Done',    rating: 4, note: 'Hedgehog Concept fits my career',           finished: '2026-06-10' },
    { id: 7,  title: 'The Phoenix Project',       author: 'Gene Kim',             genre: 'Technology',  status: 'Done',    rating: 4, note: 'Useful systems-thinking principles',         finished: '2026-05-08' },
    { id: 8,  title: 'Factfulness',              author: 'Hans Rosling',          genre: 'Non-Fiction', status: 'Done',    rating: 4, note: 'Data-based worldview',                      finished: '2026-06-08' },
    { id: 9,  title: 'Shoe Dog',                 author: 'Phil Knight',           genre: 'Biography',   status: 'Done',    rating: 5, note: 'Inspiring entrepreneurship story',          finished: '2026-06-20' },
    { id: 10, title: 'The Data Detective',        author: 'Tim Harford',          genre: 'Analytics',   status: 'Done',    rating: 4, note: 'Data in context — very applicable',         finished: '2026-02-28' },
    { id: 11, title: 'Naked Statistics',          author: 'Charles Wheelan',      genre: 'Statistics',  status: 'Done',    rating: 4, note: 'Stats supplement — great for MBA',          finished: '2026-06-22' },
    { id: 12, title: 'The Art of Statistics',     author: 'David Spiegelhalter',  genre: 'Statistics',  status: 'Reading', rating: 0, note: 'Chapter 3 — Probability section',           finished: ''           },
    { id: 13, title: 'Python for Data Analysis',  author: 'Wes McKinney',         genre: 'Technical',   status: 'Want',    rating: 0, note: 'After stats module completes',               finished: ''           },
    { id: 14, title: 'The Lean Startup',          author: 'Eric Ries',            genre: 'Business',    status: 'Want',    rating: 0, note: 'For healthcare consulting launch',            finished: ''           },
  ],

  // ── MISC ─────────────────────────────────────────────────────────────────────
  notes:         [],
  weeklyReviews: [],
  aiHistory:     [],
  scoreLog:      [],   // populated by App.jsx on first load of each day

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  settings: {
    name:          'Demo User',
    weekTarget:    45,
    fitnessTarget: 5,
    currency:      'EGP',
    goalNetWorth:  100000,
    notionUrl:     '',
  },
};

DEF.habits.defs = DEF.habits.defs.map(enrichHabit);

export default DEF;
