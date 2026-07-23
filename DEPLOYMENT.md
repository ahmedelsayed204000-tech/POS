# Test deployment

## Recommended first deployment

Publish the frontend as a browser-only test. Do not configure Supabase, health connections, or OAuth delivery until the basic user journeys have been tested.

1. Push the repository to a private GitHub repository.
2. Import that repository into Vercel.
3. Accept the detected Vite settings. `vercel.json` supplies the build command, output directory, and SPA fallback.
4. Leave all environment variables unset for the first test.
5. Verify `/`, `/app`, refresh on `/app`, mobile layout, import/export, and local persistence.

Each tester's information remains in that browser. Clearing site storage removes it, so testers should use JSON export for backup.

## Local QA before release

Run the unit suite, production build, and browser smoke before publishing a tester build:

```bash
pnpm test
pnpm build
pnpm qa:browser
pnpm qa:ux
```

`pnpm qa:browser` expects the app to already be running and defaults to `http://127.0.0.1:5173/app`. If Vite picked a different port, set `QA_BASE_URL`, for example:

```bash
QA_BASE_URL=http://127.0.0.1:5174 pnpm qa:browser
```

The browser smoke captures desktop and mobile screenshots, checks horizontal overflow, opens and dismisses the profile modal, exercises core navigation, and records console/page errors in `qa/rendered-qa/qa-results.json`. The UX certification runner exercises the deeper test-user journey and writes evidence to `qa/ux-certification`.

## Optional Supabase test

Apply the migrations in `supabase/migrations`, then add these frontend values in the Vercel project settings:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Configure the deployed `/app` URL as an allowed OAuth redirect in Supabase. These are browser-visible project values; do not place service-role keys or provider client secrets in frontend variables.

Before inviting real users, complete `docs/supabase-email-readiness.md`. Supabase's default email service is only suitable for exploration and team-address testing; configure custom SMTP, verify the production redirect allow-list, verify the hosted Magic Link email template, and send a real end-to-end email to a non-team inbox. Locally, run:

```bash
pnpm audit:supabase-email
```

The audit intentionally reports dashboard-only production items as requiring verification when they cannot be proven from repo files.

## Integration server

`server/index.mjs` is a development service and is not deployed by the frontend configuration. Email delivery and provider connections require a separately secured backend deployment and server-only secrets. Do not publish `server/data/connections.json`.

## Release checklist

- `pnpm test` passes.
- `pnpm build` passes.
- `pnpm qa:browser` passes against the running local app.
- No `.env*` file other than `.env.example` is tracked.
- No real personal, health, financial, or behavioral data is included in defaults or screenshots.
- The site is labeled as a test version.
- Export, reset, and offline/local-only behavior are verified.
- Supabase RLS is verified before enabling account sync.
- Supabase custom SMTP, email template, redirect allow-list, and real-inbox magic-link flow are verified before enabling email sign-in for real users.
