# Test deployment

## Recommended first deployment

Publish the frontend as a browser-only test. Do not configure Supabase, health connections, or OAuth delivery until the basic user journeys have been tested.

1. Push the repository to a private GitHub repository.
2. Import that repository into Vercel.
3. Accept the detected Vite settings. `vercel.json` supplies the build command, output directory, and SPA fallback.
4. Leave all environment variables unset for the first test.
5. Verify `/`, `/app`, refresh on `/app`, mobile layout, import/export, and local persistence.

Each tester's information remains in that browser. Clearing site storage removes it, so testers should use JSON export for backup.

## Optional Supabase test

Apply the migrations in `supabase/migrations`, then add these frontend values in the Vercel project settings:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Configure the deployed `/app` URL as an allowed OAuth redirect in Supabase. These are browser-visible project values; do not place service-role keys or provider client secrets in frontend variables.

## Integration server

`server/index.mjs` is a development service and is not deployed by the frontend configuration. Email delivery and provider connections require a separately secured backend deployment and server-only secrets. Do not publish `server/data/connections.json`.

## Release checklist

- `pnpm test` passes.
- `pnpm build` passes.
- No `.env*` file other than `.env.example` is tracked.
- No real personal, health, financial, or behavioral data is included in defaults or screenshots.
- The site is labeled as a test version.
- Export, reset, and offline/local-only behavior are verified.
- Supabase RLS is verified before enabling account sync.
