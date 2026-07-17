# PersonalOS

A calm, local-first personal planning and life-tracking application. The repository contains anonymized demonstration data; personal information should be imported or entered only in a trusted deployment.

## Setup
```bash
npm install
npm start
```
Vite normally opens at http://localhost:5173. Open `/app` for the application surface.

## Test deployment

The frontend can be deployed from GitHub to Vercel using the included `vercel.json`. Leave Supabase environment variables unset for a browser-only test, or configure the publishable Supabase values in the hosting dashboard for account sync. Never commit `.env.local` or server OAuth secrets.

## Current modules
- Dashboard, habits, time log, finance, learning, fitness, goals/career, reports, reading, weekly review, settings, and a Notion workspace shortcut.
- Notion is configured as a safe outbound workspace link in Settings. A two-way sync is intentionally deferred until a backend with Notion OAuth is available.

## Project Structure
```
src/
├── constants/
│   ├── theme.js        # All colours
│   └── nav.js          # Sidebar nav items
├── data/
│   └── defaults.js     # Default data + STORAGE_KEY
├── utils/
│   ├── dates.js        # Date helpers (TODAY, fmt, WS, WE …)
│   └── scores.js       # All 6 dimension score functions + lifeScore()
├── components/
│   ├── ui/             # Reusable atoms (Bar, Button, Input …)
│   ├── layout/         # Sidebar + TopBar
│   └── pages/          # One file per tab
└── App.jsx             # Root: load/save + router
```

## Common bugs to check
- `data.learn.sessions` may be undefined → guarded with `|| []`
- `data.finance.assets / liabilities` may be undefined → guarded with `|| []`
- Pomodoro `useEffect` dep array needs `[timeLeft, running]` — not `[left, run]`
- Storage key is `pos_final` — changing it loses all saved data
