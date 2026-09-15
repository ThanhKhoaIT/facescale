import Link from "next/link";
import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">Đăng ký tài khoản</h1>
      <form action={registerAction} className="flex w-full max-w-xs flex-col gap-2">
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
          Đăng ký
        </button>
      </form>
      <Link href="/" className="text-sm text-gray-500 underline">
        Đã có tài khoản? Đăng nhập
      </Link>
    </main>
  );
}
