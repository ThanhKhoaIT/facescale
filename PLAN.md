# Facescale — Implementation Plan

Headscale + Tailscale UI/UX for managing members & devices, aimed at people who
aren't network specialists. Phase 1 (MVP) focuses on managing members/devices really
well. Phase 2 (once the MVP is stable) adds the Slack approval workflow, an advanced
policy engine, and device lifecycle management.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind — full-stack (UI + API routes)
- Auth: NextAuth.js, configured via `AUTH_METHOD` (see Auth section below)
- DB: SQLite via Prisma (app metadata: department, device assignment, audit log — does
  not cache online/offline status, that's fetched live from the Headscale API)
- Headscale: calls the REST API directly via a custom client wrapper

## Role & access model
3 tiered roles: **Admin → Leader → Member**
- Admin: manages all devices, assigns devices to each Department (each Department has 1 Leader)
- Leader: only sees devices assigned to their Department, assigns them further to Members within the department
- Member: only sees devices the Leader assigned specifically to them

Phase 1 hardcodes 1 Leader/1 Department to keep things simple.

## Auth
- No longer using Google OAuth (changed per request on 2026-09-15). Method is selected
  via a single env var `AUTH_METHOD=password|slack_otp`, **default `password`**:
  - `password`: self-service signup (`/register`, email+password) + login with
    email/password (NextAuth Credentials provider, password hashed with scrypt).
  - `slack_otp`: enter email → a 6-digit code is generated and sent via Slack DM
    (Slack Bot token) → enter the code to log in (separate NextAuth Credentials
    provider, OTP verified against the DB).
  - Both methods share `resolveSignInAccess()` to check domain/access-request —
    the domain-allow / AccessRequest PENDING-approve-one-by-one logic is unchanged
    from the old Google-based design, only the identity source differs.
- Primary domain (`@lixibox.com`) is auto-admitted, default role Member
- Email outside the domain → creates an `AccessRequest` PENDING, blocked from the app,
  waits for Admin to approve individually (Access Requests page)

## Data model (Prisma)
- `User`: email, name, image, passwordHash (nullable), role (ADMIN/LEADER/MEMBER), departmentId
- `LoginOtp`: email, code, expiresAt, consumedAt — one-time OTP code for `slack_otp`
- `Department`: name, leaderId
- `DeviceMeta`: headscaleNodeId, departmentId (nullable), assignedUserId (nullable), notes
- `AccessRequest`: email, status (PENDING/APPROVED/REJECTED), requestedAt, decidedById, decidedAt
- `AuditLog`: actorId, action, target, timestamp

## Phases

- **Phase 0 — Bootstrap project**: Next.js + TS + Tailwind, `.gitignore`, `.env.example`,
  README. No logic yet, just enough for `npm run dev` to work.

- **Phase 0.5 — Headscale dev sandbox**: `docker-compose.yml` running 1 headscale server +
  2 `tailscale/tailscale` containers joined as sample nodes, plus a bootstrap script that
  creates the user/API key/preauthkey. Used for dev/test independent of a real instance.

- **Phase 1 — Data layer**: `prisma/schema.prisma` (the 5 models above), Prisma client,
  first migration, seeded a default admin.

- **Phase 2 — Auth**: check the `@lixibox.com` domain, create an `AccessRequest` for
  emails outside the domain, `/pending` page.
  > Update 2026-09-15: switched from Google OAuth to `AUTH_METHOD=password|slack_otp`
  > (default `password`) — see the Auth section above for details. Verified for real via
  > curl straight against the NextAuth callback endpoints: `/api/auth/callback/credentials`
  > (correct password → session cookie; wrong password → `CredentialsSignin`) and
  > `/api/auth/callback/slack-otp` (correct code → session cookie; reusing an old code →
  > rejected). `sendOtpToSlack()` fails verification clearly with a fake `SLACK_BOT_TOKEN`
  > (`invalid_auth`), no silent swallowing.

- **Phase 3 — Headscale API client**: `src/lib/headscale.ts` — connects using
  `HEADSCALE_URL`/`HEADSCALE_API_KEY`, lists nodes, maps online/offline status.
  Tested against the Phase 0.5 sandbox.
  > Decision: **drop the direct/DERP column in Phase 1**. Verified via the sandbox: the
  > Headscale REST API (`/api/v1/node`) doesn't expose this field — it's data-plane info
  > that only exists client-side (`tailscale status --json` on each node); the Headscale
  > control plane doesn't store/expose it centrally. Getting it back would require adding
  > a "monitor node" (a backend that joins the tailnet itself) — deferred to Phase 2 if needed.

- **Phase 4 — Layout & UI permissions**: main Sidebar/menu, layout, `src/lib/permissions.ts`
  helper to scope data by role.

- **Phase 5 — Devices**: Devices page, Admin assigns Department, Leader assigns Member,
  Member only sees their own.

- **Phase 6 — Members**: user CRUD, set role, set department.

- **Phase 7 — Departments**: department CRUD, set leader.

- **Phase 8 — Access Requests**: Admin approves/rejects emails outside the domain.

- **Phase 9 — Dashboard**: total member/device counts, % online.

- **Phase 10 — Activity (Audit log)**: displays logs, logs written on create/edit/delete/assign
  actions from Phases 5–8.

## Phase 2 (not started)
Slack approval workflow, advanced policy engine, device lifecycle management.

## TODO
- [ ] If using `AUTH_METHOD=slack_otp`: create a real Slack App/Bot (scopes
      `users:read.email`, `chat:write`, `im:write`), fill in a real `SLACK_BOT_TOKEN`
      in `.env` — it's currently a fake value so `sendOtpToSlack()` will fail.
- [ ] Provide the real instance's `HEADSCALE_URL`/`HEADSCALE_API_KEY` when deploying
      (currently pointing at the local sandbox from Phase 0.5).
