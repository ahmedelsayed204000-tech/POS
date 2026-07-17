# PersonalOS — Engineering Handoff

**Version:** July 2026 workspace

**Updated:** July 17, 2026
**Status:** Functional React prototype with local-first persistence, optional Supabase cloud sync, and experimental integration services

## 1. Product summary

PersonalOS is a personal planning and life-tracking application covering daily planning, habits, time, money, learning, health, fitness, sports, career development, goals, reading, reports, and weekly reflection.

The product currently has two surfaces:

- A public marketing website at `/`.
- The interactive application at `/app`, or `#app` when opened as a standalone local HTML file.

The current visual direction combines a conventional productivity dashboard with the newer **Life Garden / Goal Garden** experience. The application is usable, but these design systems are not yet fully unified.

## 2. Current architecture

```text
Root.jsx
├── Website.jsx                         public product website
└── App.jsx                             application state and view selection
    ├── localStorage                    primary local persistence
    ├── useCloudSync                    optional Supabase auth and sync
    ├── Dashboard / Habits              custom full-page experiences
    └── GardenWorkspace                 shared shell for most other modules
        └── selected page component

Optional services
├── Supabase                            authentication, document sync, domain tables
├── server/index.mjs                    OAuth and test-reminder development service
└── iOS Health companion source         HealthKit ingestion starting point
```

### Frontend

- React 18 with functional components and hooks.
- Vite 7 build system.
- Recharts for charts.
- Zod for import validation.
- No routing library. `Root.jsx` selects website versus app from the URL, while `App.jsx` uses a `view` string for in-app navigation.
- Most application data remains one object owned by `App.jsx` and passed to pages as `{ data, setData }`.
- Styling is a mixture of shared CSS and legacy inline styles.

### Persistence and history

- The browser is the primary persistence layer.
- Data is stored under the stable localStorage key `pos_final`. Do not rename this key without an explicit migration.
- Saves are debounced by 700 ms.
- A local backup document is saved alongside the main state.
- In-memory undo retains the last 20 state changes for the current session.
- Legacy storage keys `pos_v3` through `pos_v7` are migrated on load.
- JSON imports are parsed and validated with Zod before application.

### Optional Supabase sync

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured:

- Users can authenticate with Google or Microsoft/Azure OAuth.
- The full application document is stored in `public.personal_data`.
- Local changes are uploaded after a 900 ms debounce once remote state is loaded.
- Sports and work/career data is also mirrored into normalized domain tables.
- Row-level security restricts public tables to the authenticated owner.

The app remains usable in local-only mode when Supabase is not configured.

## 3. Implemented product surfaces

### Website and launch flow

- Responsive marketing website with interactive product previews.
- Launches the application through `/app` or the local-file hash route.
- Uses the Life Garden brand imagery and product narrative.

### Dashboard

- Life-area overview and planning-assistant presentation.
- Daily plan display with completion controls.
- Monthly income and expense summary.
- Goal, habit, health, learning, and review summaries.
- Quick actions for adding a win, asking the planner, rebalancing the day, and rescuing an overloaded day.
- Navigation into related modules.

Some recommendations are currently presentation rules rather than a complete adaptive planning engine.

### Goal Garden and habits

- Goal plants with a selected North Star.
- Editable plant meaning, desired outcome, and category.
- Habit actions attached to the garden.
- Add, replace, reorder, pause, and complete actions.
- Pace and preferred-time settings.
- Optional adaptation preferences for sleep, shift work, and training.
- Daily garden progress and positive completion feedback.
- Existing habit definitions and date-keyed completion logs are preserved underneath the garden experience.

The current habit schema does not yet implement the full cue/minimum/normal/stretch/recovery model proposed for the behavior-support roadmap.

### Garden workspace and check-ins

- Shared page shell for most modules.
- Page-specific goals, summaries, and calls to action.
- Editable daily focus.
- One-to-five energy check-in.
- Reflection or win capture.
- Per-workspace check-in history, limited to the latest 30 records.
- Daily focus-completion state.

Dashboard and Habits currently use their own full-page layouts instead of this shared shell.

### Daily planning

- `dailyPlan` records dated actions with completion state.
- The dashboard reads and updates the current day's plan.
- Daily Compass asks for success criteria, one primary outcome, up to two secondary outcomes, likely friction, the smallest first action, energy, available time, stopping time, and a low-energy fallback.
- It derives a first focus block and transition buffer from available capacity and the user's preferred focus duration.
- Saving creates a typed P1 task and mirrors the selected outcomes into the existing dashboard plan.
- Planning events are stored only when behavior-event consent is enabled.

### Time log

- Dated activity entries with category, description, and hours.
- Weekly totals and target comparison.
- Category breakdown chart.
- Add and delete controls.

### Tasks and postponement support

- Typed task records with outcome, editable smallest next action, duration estimate, energy, priority, deadline, status, and postponement history.
- Deterministic, editable next-action suggestions for common vague tasks such as presentations, study, exercise, and communication.
- One-question postponement diagnosis with transparent matching guidance for unclear, oversized, blocked, low-energy, anxious, low-importance, conflicting, or unwanted work.
- Task creation, completion, and postponement events are recorded only when behavior-event consent is enabled.
- Tasks can be explicitly started and completed with actual duration; elapsed time is used when a start timestamp is available.
- Estimate accuracy compares expected and actual duration without grading the user.
- Duration guidance appears only after two comparable completed tasks and includes transition or recovery time.

### If–Then plans

- Action plans connect a recognizable situation to a small chosen behavior.
- Coping plans connect a likely obstacle to an alternative response.
- Suggestions are derived from current high-priority or postponed tasks and preferred work start time.
- Every suggestion must be selected, edited if needed, saved as a draft, and explicitly confirmed before becoming active.
- Users can remove plans at any time; plan creation and confirmation events respect behavior-event consent.

### Flexible focus sessions

- Focus sessions can be linked to an open task or started with a general objective.
- Users choose duration and can pause, resume, extend by five minutes, finish, or use an emergency exit.
- The focus state shows only the objective, smallest next action, visible timer, essential controls, and thought parking.
- Completion reflection asks about useful progress, interruption, and whether the next session should be shorter, equal, or longer.
- Focus start and end events are stored only with behavior-event consent.

### Finance and investing

- Income and expense entry management.
- Budget-versus-actual monitoring by category.
- Assets, liabilities, and current net-worth calculation.
- Daily net-worth snapshots retained for up to 365 days.
- Investment allocation helper with profile and target percentages in `InvestmentPlan.jsx`.

`InvestmentPlan.jsx` is implemented but is not currently registered as an independent navigation destination.

### Learning and focus timer

- SQL, Power BI, Statistics, and MBA learning tracks.
- To Do, Active, and Done topic states.
- Topic notes, filters, progress summaries, and next-topic guidance.
- Manual learning-session logging.
- Pomodoro-style focus and break timer.
- Completed focus periods can create learning-session records.

The timer is still owned by the Learning module; it is not yet a domain-wide flexible focus-session system.

### Fitness

- Workout logging with type, duration, intensity, and notes.
- Weight and body-fat records.
- Weekly workout and active-minute summaries.
- Add and delete controls.

### Health and sleep-aware planning

- CSV import for normalized daily health records.
- Duplicate-day merging.
- Supported normalized fields include sleep, steps, workouts, resting heart rate, HRV, active energy, and weight when present in the source.
- Sleep-aware scheduling helper with recovery, lighter-focus, and ready states.
- Automated tests for CSV normalization, merging, and sleep guidance.

`SleepSchedule.jsx` exists as a reusable component but is not currently a separate navigation destination.

### Sports and athlete tracking

- Athlete profile with sport, level, weekly target, body measurements, and goals.
- Training-session log with type, duration, intensity, distance, calories, status, and notes.
- Nutrition log with macros, water, and notes.
- Athlete metric log for measurements such as resting heart rate.
- Add, edit-profile, and delete flows.
- Supabase tables and owner-only RLS policies for profiles, sessions, nutrition, and metrics.

### Work and career

- Work profile with employer, role, weekly-hours target, and career goal.
- Shift scheduling with start/end time, breaks, type, role, status, and notes.
- Career-development records for courses, postgraduate study, certifications, and similar items.
- Opportunity pipeline with organization, role, type, status, dates, next action, and notes.
- Supabase tables and owner-only RLS policies for all work/career collections.

The older Goals page also contains a separate career-application collection. These two opportunity models should eventually be consolidated.

### Goals

- P1, P2, and P3 goal groups.
- Progress percentage, target, category, and editable next action.
- Add, update, and delete controls.
- Daily goal-progress snapshots retained for up to 365 days.
- Basic comparison with the previous snapshot.
- Legacy career-application pipeline.

### Reading

- Reading goal and progress.
- Want, Reading, and Done states.
- Ratings, search, filtering, add, and remove flows.

### Reports

- Life Score and six-dimension summaries.
- Life Score trend.
- Weight trend.
- Seven-day study-minutes chart.
- Net-worth progress.
- Habit ranking.

The reports are descriptive and are not yet the behavior-support analytics or Awareness Dashboard described in the future roadmap.

### Weekly review

- Wins, challenges, lessons, and three priorities.
- Satisfaction input.
- Auto-calculated Life Score and dimension scores.
- Update-in-place for the current week.
- Review history.

### Automations and connections

- Reminder delivery preference for Google/Gmail or Microsoft/Outlook.
- Morning and evening reminder times.
- Quiet hours and timezone.
- Enable/disable control.
- Development OAuth server supporting Google, Microsoft, Notion, Fitbit, and WHOOP authorization flows.
- OAuth token encryption at rest when `TOKEN_ENCRYPTION_KEY` is configured.
- Gmail and Microsoft Graph test-reminder delivery endpoint.

Important limitation: the current Node service stores encrypted connections in a local JSON file and is suitable for local development, not a production multi-user deployment. It does not yet run a scheduling worker that automatically sends saved reminders.

### Notion

- Validated outbound Notion workspace shortcut.
- Guidance for separating long-form notes and project databases from PersonalOS execution data.
- OAuth support exists in the development server.

Two-way Notion data synchronization is not implemented.

### Settings and data safety

- Profile name, currency, time target, fitness target, and net-worth goal.
- Notion URL preference.
- JSON export.
- Validated JSON import with migration.
- Reset with confirmation.
- Automatic local backup writing.

`restoreBackup` exists in the page implementation but currently references a legacy backup key and is not exposed by a visible button. This needs correction before being presented as a working restore feature.

### Account sync controls

- Local/cloud status display.
- Google and Microsoft sign-in when Supabase is configured.
- Manual sync action.
- Sign-out.
- Clear error/status reporting.

### iOS Health companion source

- `ios/HealthSyncService.swift` and setup notes provide a starting point for HealthKit authorization and normalized upload.
- Intended read types are limited to sleep, steps, workouts, resting heart rate, HRV, active energy, and weight.

This is source scaffolding only. It requires an Xcode target, HealthKit entitlements, privacy strings, and a secure HTTPS ingestion API before it is runnable.

## 4. Backend schema

### Initial backend migration

`20260717110744_initial_personalos_backend.sql` creates:

- `public.profiles`
- `public.personal_data`
- `public.health_records`
- `public.automation_preferences`
- `public.sync_jobs`
- `private.provider_connections`

Public user tables use row-level security. Provider connections are isolated in a private schema with direct client access revoked.

### Sports and work migration

`20260717132019_add_sports_work_and_education_tracking.sql` creates:

- `public.athlete_profiles`
- `public.training_sessions`
- `public.nutrition_logs`
- `public.athlete_metrics`
- `public.work_profiles`
- `public.work_shifts`
- `public.career_development`
- `public.career_opportunities`

Indexes support user/date or user/status lookup, and all tables use owner-only RLS policies.

## 5. Key files

```text
src/
├── Root.jsx                         website/app surface selection
├── App.jsx                          root state, local persistence, history, view map
├── constants/
│   ├── nav.js                       navigation and category constants
│   └── theme.js                     legacy color tokens
├── data/
│   ├── defaults.js                  canonical default document and storage key
│   ├── migrate.js                   backward-compatible document migration
│   ├── schema.js                    Zod import validation
│   └── health.js                    health CSV normalization and merging
├── lib/
│   ├── supabase.js                  optional Supabase client
│   ├── useCloudSync.js              auth and document synchronization
│   └── personalDataRepository.js    document save and domain-table mirroring
├── components/
│   ├── AccountSync.jsx              authentication and sync controls
│   ├── website/                     public website
│   ├── layout/                      GardenWorkspace and legacy layout components
│   ├── ui/                          reusable form and display primitives
│   └── pages/                       product modules
└── utils/
    ├── dates.js                     current date and ISO-week helpers
    ├── scores.js                    Life Score calculations
    └── sleepSchedule.js             sleep-aware guidance

server/index.mjs                     integration/OAuth development server
supabase/migrations/                 database schema and RLS
ios/                                 HealthKit companion starting point
scripts/build-standalone.mjs         single-file offline preview packager
qa/                                  visual QA captures
```

## 6. Build, test, and run

```bash
pnpm install
pnpm start
pnpm test
pnpm build
```

The Vite development URL is normally `http://localhost:5173`; use `/app` for the application surface.

Optional local integration service:

```bash
pnpm automation-api
```

It defaults to `http://localhost:8787` and requires the relevant OAuth client variables plus `TOKEN_ENCRYPTION_KEY` before storing tokens.

Optional Supabase frontend variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Current automated coverage

- Calendar/date handling, leap years, and ISO week boundaries.
- Legacy data migration and preservation of new collections.
- JSON import validation.
- Workspace check-in schema validation.
- Health CSV normalization and duplicate merging.
- Sleep-aware schedule recommendations.

The project does not yet have broad component or end-to-end coverage for critical user journeys.

## 7. Standalone preview

`scripts/build-standalone.mjs` converts a completed Vite build into one HTML file. It embeds compiled CSS, JavaScript, and required PNG assets and verifies that no built-asset links remain. `PersonalOS-local.html` is the generated local preview artifact.

## 8. Known risks and technical debt

1. The root data object and prop drilling will become difficult to maintain as behavior-support features grow.
2. The app has two partially overlapping visual/layout systems.
3. Dashboard and Habits do not use the same shell as most other pages.
4. In-app navigation is not URL-addressable and lacks browser-history semantics.
5. Daily planning is not yet a full task domain model.
6. Learning owns the only focus timer; general focus sessions are not implemented.
7. Career opportunities are duplicated between `goals/career` and `workCareer/opportunities`.
8. Some implemented components are not wired into navigation: Daily Command Center, Investment Plan, and Sleep Schedule.
9. Automated reminder scheduling is not implemented; only preferences, OAuth, and test delivery exist.
10. The development OAuth token store is not production-ready.
11. Domain-table mirroring deletes and reinserts collections on every save, which is simple but inefficient and loses stable database row identity.
12. Remote sync uses last-loaded/last-saved document semantics and has no explicit conflict-resolution UI.
13. Privacy controls do not yet cover behavioral history, contextual tracking, personalization, or selective deletion.
14. Accessibility has not received complete screen-reader, keyboard, large-text, contrast, and reduced-motion validation.
15. Several source files and legacy strings contain mojibake character encoding that should be normalized carefully.

## 9. Behavior-support roadmap status

The July behavior-change and cosmic-visual-system brief is a future product roadmap, not a description of completed functionality.

### Foundations already available

- Persisted behavior-support preferences for work hours, sleep/wake times, focus duration, reminder frequency, coaching tone, gamification, and accessibility.
- Explicit opt-in consent controls for behavior events, contextual recommendations, health personalization, and passive detection; all default to off for new and migrated data.
- Reserved task, behavior-event, focus-session, and If–Then-plan collections for staged implementation.
- Daily plans and completion state.
- Goals with next actions.
- Habit completion history.
- Energy and reflection check-ins.
- Learning focus timer.
- Sleep-aware guidance.
- Reminder preferences and quiet hours.
- Weekly reflection.
- Local and optional cloud persistence.
- Some user-controlled adaptation preferences.

### Not yet implemented as complete systems

- Rich tasks with estimates, dependencies, energy, postponement diagnosis, and actual duration.
- Full Daily Compass planning interview.
- Behavior-event ledger and consent model.
- If–Then plans.
- General flexible focus sessions and thought parking.
- Cue/minimum/normal/stretch habit model and recovery history.
- Bad-habit trigger diary and replacement planning.
- Adaptive reminder decision engine and explanation UI.
- Resilient-consistency analytics and identity evidence.
- Behavior-based weekly recommendations.
- Full privacy center, selective deletion, and behavioral export controls beyond the new foundational consent settings.
- Cosmic theme, Time Dimension, Time Gravity, constellations, habit orbits, or Memory Corridor.
- Cognitive Load Mode, awareness exercises, or adaptive visual stimulation.

## 10. Recommended next phase

The safest next phase is a narrow behavior-support vertical slice:

1. Introduce explicit task, preference/consent, focus-session, and behavior-event models with migrations.
2. Build the Daily Compass around one primary outcome and no more than two secondary outcomes.
3. Connect a selected task to a general focus session with a smallest next action and thought parking.
4. Record completion, interruption, postponement, and reflection events.
5. Generate a transparent weekly summary from those events.
6. Add privacy and deletion controls before deeper personalization.

Keep existing modules operational throughout the migration. Treat cosmic visualization as an optional, accessible layer after the behavioral foundation is stable and validated.

## 11. Maintenance rules

- Preserve the `pos_final` storage key.
- Update `defaults.js`, `migrate.js`, and `schema.js` together when the document shape changes.
- Add migration and schema tests for every new persisted collection.
- Maintain local-only operation even when integrations are unavailable.
- Never expose provider secrets or tokens to frontend code.
- Keep recommendations explainable, editable, and optional.
- Do not claim planned behavior-support or cognitive features are implemented until their data model, UI, tests, consent controls, and user journey are all present.
