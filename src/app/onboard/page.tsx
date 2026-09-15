import { prisma } from "@/lib/prisma";
import { onboardAction } from "./actions";

export default async function OnboardPage() {
  const adminExists = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminExists > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
        <p>An Admin account already exists, onboarding is no longer needed.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">Set up the first Admin account</h1>
      <form action={onboardAction} className="flex w-full max-w-xs flex-col gap-2">
        <input name="email" type="email" required placeholder="email@lixibox.com" className="rounded border px-3 py-2" />
        <input name="name" placeholder="Name (optional)" className="rounded border px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (minimum 8 characters)"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Create Admin account
        </button>
      </form>
    </main>
  );
}
