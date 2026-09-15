import { prisma } from "@/lib/prisma";
import { onboardAction } from "./actions";

export default async function OnboardPage() {
  const adminExists = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminExists > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
        <p>Đã có Admin, không cần onboard nữa.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">Thiết lập tài khoản Admin đầu tiên</h1>
      <form action={onboardAction} className="flex w-full max-w-xs flex-col gap-2">
        <input name="email" type="email" required placeholder="email@lixibox.com" className="rounded border px-3 py-2" />
        <input name="name" placeholder="Tên (tuỳ chọn)" className="rounded border px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (tối thiểu 8 ký tự)"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Tạo tài khoản Admin
        </button>
      </form>
    </main>
  );
}
