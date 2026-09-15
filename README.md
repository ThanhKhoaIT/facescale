# Facescale

Headscale + Tailscale UI/UX for managing members & devices at Lixibox. See [PLAN.md](./PLAN.md)
for the detailed phase-by-phase roadmap.

## Getting started

```bash
npm install
cp .env.example .env   # fill in Headscale URL/API key; AUTH_METHOD=password (default) works right away, no keys needed
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (uses port 3001 by default since 3000
is often taken by another project, e.g. a Rails app).

## Local Headscale sandbox

Run 1 headscale server + 2 sample nodes (`tailscale/tailscale` container) for isolated
dev/test, no real instance needed:

```bash
docker compose up -d headscale
./scripts/headscale-bootstrap.sh          # prints HEADSCALE_API_KEY and TS_PREAUTHKEY
export TS_PREAUTHKEY=<value just printed>
docker compose up -d tailscale-node1 tailscale-node2
docker compose exec headscale headscale nodes list   # confirm both nodes have joined
```

Paste `HEADSCALE_API_KEY` into `.env` (`HEADSCALE_URL` already defaults to
`http://localhost:8080`). Verified: the 2 sandbox nodes connect via DERP relay (not
direct) — that's fine, since Phase 1 only shows online/offline, not
direct/DERP (see PLAN.md Phase 3 section for why).

## Auth

`AUTH_METHOD` in `.env` selects the sign-in method (see PLAN.md Auth section):
- `password` (default): self-register at `/register` (email+password), then sign in
  normally.
- `slack_otp`: enter email, receive a 6-digit code via Slack DM, enter the code to sign in.
  Requires a real `SLACK_BOT_TOKEN` (see TODO in PLAN.md).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- NextAuth.js (Credentials — password or Slack OTP, configured via `AUTH_METHOD`)
- Prisma + SQLite
- Headscale REST API (custom client wrapper)
