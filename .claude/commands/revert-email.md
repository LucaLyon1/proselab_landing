Revert the ExitIntentModal waitlist sign-up from Supascribe back to the original Resend implementation.

## Steps

1. Read the original Resend-based ExitIntentModal code from `.kb/resend-waitlist-implementation.md`
2. Replace the contents of `components/ExitIntentModal.tsx` with the original Resend implementation documented there
3. Verify the `/api/waitlist` route at `app/api/waitlist/route.ts` still exists and is intact
4. Verify the `resend` npm package is still installed (check `package.json`) — if not, run `npm install resend`
5. Verify `RESEND_API_KEY` and `RESEND_SEGMENT_ID` are referenced in the API route (the user will need to confirm these are set on the deployment platform)
6. Run `npx next build` to confirm the build passes
7. Remind the user to:
   - Confirm `RESEND_API_KEY` and `RESEND_SEGMENT_ID` env vars are set on their deployment platform
   - Remove or keep the Supascribe embed/script in `app/layout.tsx` depending on whether it's still used elsewhere (check `LandingPage.tsx` for the popup embed)

## Context

The Supascribe embed (`data-supascribe-embed-id="927249536913"`) replaced the Resend form on 2026-04-05. The Resend flow used a custom form that POSTed to `/api/waitlist`, which added contacts to a Resend audience segment and sent welcome + admin notification emails. The full original code is preserved in `.kb/resend-waitlist-implementation.md`.
