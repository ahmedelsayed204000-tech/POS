# PersonalOS

A calm, local-first personal planning and life-tracking application. The repository contains anonymized demonstration data; personal information should be imported or entered only in a trusted deployment.

## Setup

```bash
npm install
npm start
```

Vite normally opens at `http://localhost:5173`. Open `/app` for the application surface. Workspace tabs are URL-addressable with `?view=`, for example `/app?view=tasks`.

## Verification

```bash
npm test
npm run build
```

Browser QA is available once the app is already running locally:

```bash
npm run qa:browser
npm run qa:ux
```

By default the QA scripts target `http://127.0.0.1:5173/app`. Set `QA_BASE_URL` when Vite is running on another port. `qa:browser` writes layout smoke evidence to `qa/rendered-qa`; `qa:ux` runs the deeper test-user journey and writes certification evidence to `qa/ux-certification`.

## Test Deployment

The frontend can be deployed from GitHub to Vercel using the included `vercel.json`. Leave Supabase environment variables unset for a browser-only test, or configure the publishable Supabase values in the hosting dashboard for account sync. Never commit `.env.local` or server OAuth secrets.

## Current Modules

- Unified Today with journey, daily plan, quick wins, reset support, sleep-aware guidance, activity story, and explainable Life Score.
- Daily Compass, Tasks, Focus, Habits, and selected life-dimension workspaces in the unified shell.
- Time log, finance, learning, fitness, goals/career, reports, reading, weekly review, settings, automations, and a Notion workspace shortcut.
- Optional Supabase account sync with Google, Microsoft, and email magic-link entry.
- Life Score uses the explainable `personalScore` model across current app surfaces, including evidence freshness, missing-data handling, confidence, and user-selected dimensions.

## Project Structure

```text
src/
  constants/
    theme.js        # Legacy color tokens
    nav.js          # Legacy navigation/category constants
  data/
    defaults.js     # Default data + STORAGE_KEY
  utils/
    dates.js        # Date helpers
    personalScore.js
    scores.js       # Legacy scoring helpers
  components/
    ui/             # Reusable atoms
    layout/         # UnifiedExperience + GardenWorkspace
    pages/          # App workspaces
    profile/        # Five-question profile check-in
  App.jsx           # Root state, persistence, view map
```

## Common Bugs To Check

- `data.learn.sessions` may be undefined, so guard with `|| []`.
- `data.finance.assets / liabilities` may be undefined, so guard with `|| []`.
- Pomodoro `useEffect` dep array needs `[timeLeft, running]`, not `[left, run]`.
- Storage key is `pos_final`; changing it loses saved data without a migration.
