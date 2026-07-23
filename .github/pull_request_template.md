## Summary

- 

## Verification

- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm qa:browser` against a running local app, or reason skipped:
- [ ] Desktop/mobile screenshots and `qa/rendered-qa/qa-results.json` reviewed when UI changed
- [ ] Supabase email readiness checked when auth/email behavior changed

## Risk Checks

- [ ] No secrets or real personal data committed
- [ ] Persisted data shape changes include defaults, migration, schema, and tests
- [ ] Consent/privacy behavior checked when adding tracking, reminders, email, or personalization
