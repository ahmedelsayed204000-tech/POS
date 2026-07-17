// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
// Single source of truth for every colour used in the app.
// Import as:  import C from '../constants/theme';

const C = {
  // Brand
  navy:    '#063F2F',
  navy2:   '#0D6547',
  gold:    '#D6A62F',

  // Backgrounds
  bg:      '#FBF8EF',
  card:    '#FFFDF8',
  g0:      '#F3F0E6',
  g1:      '#E4E1D7',
  g2:      '#9CAA9F',
  g3:      '#63766C',
  dark:    '#153B30',
  border:  '#D6DED7',

  // Semantic
  green:   '#247C5A',
  lgreen:  '#E8F1E9',
  red:     '#9F554B',
  lred:    '#F6E9E5',
  orange:  '#B67A32',
  lorange: '#F8EFE0',
  purple:  '#6F7657',
  lpurple: '#EEF0E5',
  teal:    '#3F7C6B',
  lteal:   '#E7F0EB',
  blue:    '#517768',
  lblue:   '#E9EFEC',

  // Feature colours
  notion:  '#66785E',
  book:    '#A97736',
  review:  '#687957',
  settings:'#3C5F52',
};

export default C;

// ─── CATEGORY COLOURS (Time Log) ─────────────────────────────────────────────
export const CAT_COLORS = {
  'Day Job':           C.blue,
  'Project Work':      C.green,
  'SQL Study':         C.teal,
  'Power BI Study':    C.purple,
  'Statistics Study':  C.orange,
  'MBA':               C.red,
  'Gym / Boxing':      '#A46F36',
  'Family & Personal': '#4E7666',
  'Freelance / Biz Dev':'#6F7657',
  'Other':             C.g3,
};

// ─── WORKOUT COLOURS ──────────────────────────────────────────────────────────
export const WORKOUT_COLORS = {
  Gym:           C.blue,
  Boxing:        C.red,
  Cardio:        C.green,
  'Yoga/Stretch':C.teal,
  Rest:          C.g3,
  Other:         C.orange,
};

// ─── CAREER STATUS COLOURS ────────────────────────────────────────────────────
export const CAREER_STATUS_COLORS = {
  Applied:   C.blue,
  Screening: C.orange,
  Interview: C.purple,
  Offer:     C.green,
  Accepted:  C.teal,
  Rejected:  C.red,
  Withdrawn: C.g3,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const scoreColor = (pct) => pct >= 70 ? C.green : pct >= 40 ? C.orange : C.red;
export const scoreBg    = (pct) => pct >= 70 ? C.lgreen : pct >= 40 ? C.lorange : C.lred;
