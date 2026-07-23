# Supabase Email Readiness

Verification date: July 22, 2026

## Current App Flow

- The app sends magic links with `supabase.auth.signInWithOtp`.
- The redirect target is `${window.location.origin}/app?profile=1`.
- After the secure link is clicked, Supabase signs the user in, returns to `/app?profile=1`, and the five-question profile check-in opens.

## What Is Verified In Repo

- Local Supabase redirect config includes:
  - `http://localhost:5173/app`
  - `http://localhost:5173/app?profile=1`
  - `http://127.0.0.1:5173/app`
  - `http://127.0.0.1:5173/app?profile=1`
- Local Supabase magic-link previews use `supabase/templates/magic_link.html`.
- The local template uses `{{ .ConfirmationURL }}`, which preserves Supabase verification and the redirect target.
- `scripts/supabase-auth-email-audit.mjs` reports local readiness and highlights production-only checks.

## Hosted Supabase Checks

These must be verified in the Supabase dashboard or Management API before real users are invited.

1. Authentication > URL Configuration
   - Site URL is the production app origin.
   - Redirect URLs include the production app path:
     - `https://YOUR_DOMAIN/app`
     - `https://YOUR_DOMAIN/app?profile=1`
   - Avoid broad production wildcards unless there is a clear preview-deployment need.

2. Authentication > Email Templates
   - Magic Link subject is production-ready.
   - Magic Link body uses `{{ .ConfirmationURL }}` or a custom `{{ .TokenHash }}` verification flow.
   - If using custom links, preserve the redirect target passed by the app.
   - Disable link tracking and link rewriting for auth emails.

3. Authentication > SMTP Settings
   - Custom SMTP is enabled.
   - From address uses a verified auth-sending domain.
   - SPF, DKIM, and DMARC pass for that domain.
   - Auth email is separate from marketing email infrastructure where possible.
   - Supabase’s default test mail service is not used for real users.

## End-To-End Real Email Test

Run this only after custom SMTP and production redirects are configured.

1. Deploy the frontend with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Open the production `/app` URL in a clean browser profile.
3. Use Account & backup > Email my profile check-in.
4. Send to a real non-team inbox.
5. Confirm the email is delivered to inbox, not spam.
6. Click the email link once.
7. Confirm the browser lands on `/app?profile=1`.
8. Confirm a Supabase session exists and the five-question profile modal is open.
9. Confirm the profile can be saved and cloud sync reaches `Cloud synced`.
10. Repeat once on mobile.

## Authentication Edge-Case Matrix

Run these against the production Supabase project after custom SMTP is enabled.

| Case | Steps | Expected result |
| --- | --- | --- |
| New user | Send a magic link to an address that has no Supabase user. Click the newest email link. | User lands on `/app?profile=1`; app shows cloud-loading state first; five-question profile opens only after the first remote document is created. |
| Returning user | On device A, save a profile answer and sync. On device B, request a magic link for the same email and click it. | Device B loads the remote document before profile editing is enabled; existing answers are visible and not overwritten by local defaults. |
| Expired link | Request two magic links, then click the older/expired one after requesting the newer link or after expiry. | App shows a clear rejected/expired link message and asks for a new email link. Profile questions are not editable from the failed link. |
| Rejected link | Attempt a malformed or allow-list-rejected redirect. | App shows the sign-in error from Supabase and does not open editable profile answers. |
| Logout | Sign in, wait for `Cloud synced`, then sign out. | Session clears, remote-ready state resets, local mode is shown, and `Sync now` is disabled until a new session exists. |
| Cross-device sync | Save changes on device A, press `Sync now`, then sign in on device B. | Device B loads the remote data before editing. The account panel shows cloud loading and then cloud synced. |

## In-App Guardrails

- Account status now distinguishes checking sign-in, email sent, loading cloud data, creating cloud backup, saving, synced, signing out, and error states.
- The profile modal is blocked while remote data is loading after login.
- Expired or rejected link errors are parsed from Supabase redirect fragments/query parameters and surfaced as actionable messages.
- Manual `Sync now` saves both the main document and mirrored profile row.

## Known Unverified Items

- A real production email has not been sent end-to-end from this workspace.
- Hosted Supabase redirect allow-list, hosted email template, custom SMTP credentials, sender-domain DNS, and deliverability cannot be proven from local files alone.
