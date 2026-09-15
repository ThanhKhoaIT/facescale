# Facescale — Kế hoạch triển khai

Headscale + Tailscale UI/UX quản lý member & device, dành cho người không chuyên
network. Giai đoạn 1 (MVP) tập trung quản lý member/device thật tốt. Giai đoạn 2
(sau khi MVP ổn định) mới thêm Slack approval workflow, policy engine nâng cao,
vòng đời thiết bị.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind — full-stack (UI + API routes)
- Auth: NextAuth.js, config qua `AUTH_METHOD` (xem phần Auth bên dưới)
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
- Không dùng Google OAuth nữa (đổi theo yêu cầu ngày 2026-09-15). Method chọn qua
  1 biến env `AUTH_METHOD=password|slack_otp`, **default `password`**:
  - `password`: self-service signup (`/register`, email+password) + login bằng
    email/password (NextAuth Credentials provider, password hash bằng scrypt).
  - `slack_otp`: nhập email → sinh mã 6 số, gửi qua Slack DM (Slack Bot token) →
    nhập mã để login (NextAuth Credentials provider riêng, verify OTP trong DB).
  - Cả 2 method đều dùng chung `resolveSignInAccess()` để check domain/access-request
    — logic domain-allow / AccessRequest PENDING-duyệt-từng-cái không đổi so với
    thiết kế Google cũ, chỉ khác nguồn xác thực identity.
- Domain chính (`@lixibox.com`) tự động cho vào, role mặc định Member
- Email ngoài domain → tạo `AccessRequest` PENDING, chặn vào app, chờ Admin duyệt
  từng cái một (trang Access Requests)

## Data model (Prisma)
- `User`: email, name, image, passwordHash (nullable), role (ADMIN/LEADER/MEMBER), departmentId
- `LoginOtp`: email, code, expiresAt, consumedAt — mã OTP một lần cho `slack_otp`
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

- **Phase 2 — Auth**: check domain `@lixibox.com`, tạo `AccessRequest` cho email
  ngoài domain, trang `/pending`.
  > Cập nhật 2026-09-15: đổi từ Google OAuth sang `AUTH_METHOD=password|slack_otp`
  > (default `password`) — xem chi tiết ở mục Auth phía trên. Đã verify thật bằng
  > curl thẳng vào NextAuth callback endpoints: `/api/auth/callback/credentials`
  > (đúng password → session cookie; sai password → `CredentialsSignin`) và
  > `/api/auth/callback/slack-otp` (đúng mã → session cookie; dùng lại mã cũ →
  > từ chối). `sendOtpToSlack()` verify fail rõ ràng với fake `SLACK_BOT_TOKEN`
  > (`invalid_auth`), không silent swallow.

- **Phase 3 — Headscale API client**: `src/lib/headscale.ts` — connect bằng
  `HEADSCALE_URL`/`HEADSCALE_API_KEY`, list nodes, map trạng thái online/offline.
  Test lên sandbox Phase 0.5.
  > Quyết định: **bỏ cột direct/DERP ở Phase 1**. Đã verify bằng sandbox: Headscale
  > REST API (`/api/v1/node`) không có field này — đó là data-plane info chỉ tồn
  > tại phía client (`tailscale status --json` trên từng node), Headscale control
  > plane không lưu/expose lại tập trung. Muốn có lại thì cần thêm 1 "monitor node"
  > (backend tự join tailnet) — để dành cho Giai đoạn 2 nếu cần.

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

## TODO
- [ ] Nếu dùng `AUTH_METHOD=slack_otp`: tạo Slack App/Bot thật (scope
      `users:read.email`, `chat:write`, `im:write`), điền `SLACK_BOT_TOKEN` thật
      vào `.env` — hiện đang là fake value nên `sendOtpToSlack()` sẽ fail.
- [ ] Cung cấp `HEADSCALE_URL`/`HEADSCALE_API_KEY` của instance thật khi deploy
      (hiện đang trỏ vào sandbox local ở Phase 0.5).
