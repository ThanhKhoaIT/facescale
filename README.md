# Headscaler

Headscale + Tailscale UI/UX quản lý member & device cho Lixibox. Xem [PLAN.md](./PLAN.md)
cho roadmap chi tiết theo phase.

## Getting started

```bash
npm install
cp .env.example .env   # điền Headscale URL/API key, Google OAuth credentials
npm run dev
```

Mở [http://localhost:3001](http://localhost:3001) (dùng port 3001 mặc định vì 3000
thường bị chiếm bởi project khác, vd Rails app).

## Local Headscale sandbox

Chạy 1 headscale server + 2 node mẫu (container `tailscale/tailscale`) để dev/test
độc lập, không cần instance thật:

```bash
docker compose up -d headscale
./scripts/headscale-bootstrap.sh          # in ra HEADSCALE_API_KEY và TS_PREAUTHKEY
export TS_PREAUTHKEY=<giá trị vừa in ra>
docker compose up -d tailscale-node1 tailscale-node2
docker compose exec headscale headscale nodes list   # xác nhận 2 node đã join
```

Paste `HEADSCALE_API_KEY` vào `.env` (`HEADSCALE_URL` mặc định đã trỏ
`http://localhost:8080`). Đã verify: 2 node sandbox kết nối qua DERP relay (không
direct) — nhưng không sao, vì Phase 1 chỉ hiển thị online/offline, không hiển thị
direct/DERP (xem PLAN.md phần Phase 3 để biết lý do).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- NextAuth.js (Google OAuth)
- Prisma + SQLite
- Headscale REST API (client wrapper riêng)
