import C from './theme';

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
// Each entry maps to one page component.
// `id` is the view string used in App.jsx router.

const NAV = [
  { id: 'health', icon: '❤️', label: 'Health', color: C.green },
  { id: 'automations', icon: '⚡', label: 'Automations', color: C.purple },
  { id: 'dashboard', icon: '🏠', label: 'Dashboard',     color: C.gold    },
  { id: 'habits',    icon: '📅', label: 'Habits',        color: C.teal    },
  { id: 'timelog',   icon: '⏱', label: 'Time Log',      color: C.blue    },
  { id: 'finance',   icon: '💰', label: 'Finance',       color: C.green   },
  { id: 'learning',  icon: '📚', label: 'Learning',      color: C.purple  },
  { id: 'fitness',   icon: '💪', label: 'Fitness',       color: C.orange  },
  { id: 'sports',    icon: 'SP', label: 'Sports & Athlete', color: C.teal },
  { id: 'workcareer', icon: 'WC', label: 'Work & Career', color: C.purple },
  { id: 'goals',     icon: '🎯', label: 'Goals',         color: C.red     },
  { id: 'reports',   icon: '📈', label: 'Reports',       color: '#27AE60' },
  { id: 'notion',    icon: '📝', label: 'Notion',        color: C.notion  },
  { id: 'books',     icon: '📖', label: 'Reading',       color: C.book    },
  { id: 'review',    icon: '🔄', label: 'Weekly Review', color: C.review  },
  { id: 'settings',  icon: '⚙️', label: 'Settings',      color: C.settings},
];

export default NAV;

// ─── SUBJECT LIST (Learning tab) ─────────────────────────────────────────────
export const SUBS = [
  { k: 'sql',   label: 'SQL',        ic: '🗄️', c: C.blue   },
  { k: 'pbi',   label: 'Power BI',   ic: '📊', c: C.purple },
  { k: 'stats', label: 'Statistics', ic: '📐', c: C.orange },
  { k: 'mba',   label: 'MBA',        ic: '🎓', c: C.red    },
];

// ─── TIME LOG CATEGORIES ──────────────────────────────────────────────────────
export const TIME_CATS = [
  'Day Job',
  'Project Work',
  'SQL Study',
  'Power BI Study',
  'Statistics Study',
  'MBA',
  'Gym / Boxing',
  'Family & Personal',
  'Freelance / Biz Dev',
  'Other',
];

// ─── EXPENSE CATEGORIES ───────────────────────────────────────────────────────
export const EXP_CATS = [
  'Housing',
  'Food & Groceries',
  'Transport',
  'Health & Gym',
  'Education/MBA',
  'Entertainment',
  'Savings',
  'Personal Care',
  'Other',
];
