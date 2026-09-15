# Headscaler

Headscale + Tailscale UI/UX quản lý member & device cho Lixibox. Xem [PLAN.md](./PLAN.md)
cho roadmap chi tiết theo phase.

## Getting started

```bash
npm install
cp .env.example .env   # điền Headscale URL/API key, Google OAuth credentials
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- NextAuth.js (Google OAuth)
- Prisma + SQLite
- Headscale REST API (client wrapper riêng)
