# Headscaler — Kế hoạch triển khai

Headscale + Tailscale UI/UX quản lý member & device, xác thực Google, dành cho người
không chuyên network. Giai đoạn 1 (MVP) tập trung quản lý member/device thật tốt.
Giai đoạn 2 (sau khi MVP ổn định) mới thêm Slack approval workflow, policy engine
nâng cao, vòng đời thiết bị.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind — full-stack (UI + API routes)
- Auth: NextAuth.js, Google OAuth
- DB: SQLite qua Prisma (metadata app: department, gán device, audit log — không cache
  trạng thái online/offline, lấy live từ Headscale API)
- Headscale: gọi trực tiếp REST API qua client wrapper riêng

## Role & access model
3 role phân cấp: **Admin → Leader → Member**
- Admin: quản lý toàn bộ device, gán device cho từng Department (mỗi Department có 1 Leader)
- Leader: chỉ thấy device đã gán cho Department mình, tự phân tiếp cho Member trong department
- Member: chỉ thấy device được Leader gán riêng cho mình

Phase 1 code cứng 1 Leader/1 Department để giữ đơn giản.

## Auth
- Domain chính (`@lixibox.com`) tự động cho vào, role mặc định Member
- Email ngoài domain → tạo `AccessRequest` PENDING, chặn vào app, chờ Admin duyệt
  từng cái một (trang Access Requests)

## Data model (Prisma)
- `User`: email, name, image, role (ADMIN/LEADER/MEMBER), departmentId
- `Department`: name, leaderId
- `DeviceMeta`: headscaleNodeId, departmentId (nullable), assignedUserId (nullable), notes
- `AccessRequest`: email, status (PENDING/APPROVED/REJECTED), requestedAt, decidedById, decidedAt
- `AuditLog`: actorId, action, target, timestamp

## Phases

- **Phase 0 — Bootstrap project**: Next.js + TS + Tailwind, `.gitignore`, `.env.example`,
  README. Chưa có logic, chỉ để `npm run dev` chạy được.

- **Phase 0.5 — Headscale dev sandbox**: `docker-compose.yml` chạy 1 headscale server +
  2 container `tailscale/tailscale` join vào làm node mẫu, script bootstrap tạo
  user/API key/preauthkey. Dùng để dev/test độc lập với instance thật.

- **Phase 1 — Data layer**: `prisma/schema.prisma` (5 model ở trên), Prisma client,
  migration đầu, seed 1 admin mặc định.

- **Phase 2 — Auth**: NextAuth Google provider, check domain `@lixibox.com`, tạo
  `AccessRequest` cho email ngoài domain, trang `/pending`.

- **Phase 3 — Headscale API client**: `src/lib/headscale.ts` — connect bằng
  `HEADSCALE_URL`/`HEADSCALE_API_KEY`, list nodes, map trạng thái online/offline,
  direct/DERP. Test lên sandbox Phase 0.5.

- **Phase 4 — Layout & phân quyền UI**: Sidebar/menu chính, layout, helper
  `src/lib/permissions.ts` scope dữ liệu theo role.

- **Phase 5 — Devices**: trang Devices, Admin gán Department, Leader gán Member,
  Member chỉ xem của mình.

- **Phase 6 — Members**: CRUD user, set role, set department.

- **Phase 7 — Departments**: CRUD department, set leader.

- **Phase 8 — Access Requests**: Admin duyệt/từ chối email ngoài domain.

- **Phase 9 — Dashboard**: tổng số member/device, % online.

- **Phase 10 — Activity (Audit log)**: hiển thị log, ghi log ở action tạo/sửa/xóa/gán
  từ Phase 5–8.

## Giai đoạn 2 (chưa làm)
Slack approval workflow, policy engine nâng cao, vòng đời thiết bị.
