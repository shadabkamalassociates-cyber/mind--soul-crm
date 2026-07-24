# SoulSensei CRM (Frontend)

A single React app covering both the **Admin CRM** and **Expert CRM** for SoulSensei, built to match the
workflow: categories -> expert onboarding -> service approval -> bookings -> live sessions (Google Meet) ->
reviews -> commission -> payouts.

This is frontend-only, wired to **RTK Query** against an in-memory mock backend so the UI, states, and
data flow are fully real -- swapping in a live API later only means changing `src/app/api/mockBaseQuery.js`
to `fetchBaseQuery({ baseUrl: '...' })`. Endpoint names, shapes, and tags in `src/app/api/api.js` are
already written REST-style so nothing else needs to change.

## Getting started

```bash
npm install
npm run dev
```

## Demo login

Admin and Expert now have **separate login pages** (not a shared form with a role toggle), and both sign in
with **phone number + password** instead of email:

- `/login` -> portal chooser (pick Admin or Expert)
- `/admin/login` -> Admin Login -- phone prefilled as `+91 90000 00001`
- `/expert/login` -> Expert Login -- phone prefilled as `+91 98200 11223` (Siddhi Shah, an already-approved
  expert with live services, bookings, and earnings)

Any password works in demo mode. Visiting a protected admin/expert URL while logged out redirects to that
role's own login page, not a shared one.

## Structure

```
src/
  app/
    store.js                Redux store
    api/
      mockDb.js              In-memory seed data (categories, experts, services, bookings, users, reviews, coupons, payouts, settings)
      mockBaseQuery.js        Simulates a REST backend (latency + CRUD) over mockDb
      api.js                  RTK Query endpoints (swap baseQuery here for a real API)
  features/auth/authSlice.js  Session state (persisted to sessionStorage for refresh-safety)
  components/                 Shared UI: Sidebar, DataTable, Modal, Badge, StatCard, StatusStepper, Common (Button/Field/inputs)
  layouts/                     AdminLayout, ExpertLayout (sidebar nav + pending-count badges)
  routes/ProtectedRoute.jsx    Role-based route guard
  pages/
    auth/
      LoginChooser.jsx         Portal picker (/login)
      AdminLogin.jsx           Admin phone+password login (/admin/login)
      ExpertLogin.jsx          Expert phone+password login (/expert/login)
      PhoneLoginCard.jsx       Shared visual shell used by both
    admin/                     Dashboard, Categories, Experts (+detail/review), Services (+detail/review),
                                Bookings, LiveSessions, Reviews, Coupons, Payouts, Settings
    expert/                    Dashboard, Profile (onboarding), Services (create/submit), LiveSessions,
                                Bookings, Earnings (payout requests), Reviews
```

## Login (update)

Admin and Expert now have **separate login pages** — `/login` is a portal-selection screen, then
`/admin/login` and `/expert/login` are distinct pages with their own branding. Both use a **phone number**
(not email) plus password (demo mode — any password works). The mock backend matches the phone number
against real records:

- **Admin demo number:** `+91 90000 00001`
- **Expert demo number:** `+91 98200 11223` (matches Siddhi Shah's record, so you sign in as her directly)

Entering an unrecognized number returns a real "no account found" error from the mock backend rather than
silently logging you in, so the phone-matching logic is genuinely exercised, not just decorative.

## Recorded video + live session (update)

A service can now carry two independent, optional pieces:

- **Recorded video** -- the expert uploads a file on the service form (stored as an in-browser object URL
  for this demo). It always enters `videoStatus: pending_review` on upload/re-upload. Admin watches it on
  the service review screen and approves or rejects it there -- separate from the service's own
  draft -> submitted -> approved -> live pipeline. If a video is attached, **"Publish as Live" stays
  disabled until that video is approved**, matching the requested flow (upload -> admin reviews -> approved -> goes live).
- **Live session** -- toggled with a checkbox ("This service also includes a live session"), independent of
  type. So a recorded course can *also* carry a scheduled Google Meet link for a live Q&A (see the seeded
  "Chakra Balancing: Recorded Practice + Live Q&A" service) -- it isn't limited to services typed as
  "Live Session" anymore.

Both admin and expert Live Sessions pages, and the services tables, now key off `hasLiveComponent` rather
than a fixed service `type`.

## Notes on the Google Meet live-session flow

Real Google Meet API access needs OAuth + a backend, so this frontend models the realistic flow instead:
an expert clicks **Create** to open meet.google.com/new in a new tab, then pastes the generated link
back into the service form. That link is stored on the service and surfaces everywhere relevant -- the
admin's Live Sessions monitor, the expert's Live Sessions page (Join / Start), and the service detail
review screen. When you're ready to go live for real, this is the seam where a Calendar/Meet API
integration would slot in.

## Organizations layer (from your notes)

Not built in this pass, but it fits cleanly on the current shape: add an `organizations` resource, give
experts an optional `organizationId`, and add an Admin "Organizations" page. Happy to add it as a follow-up.
