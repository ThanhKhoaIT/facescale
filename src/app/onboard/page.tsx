import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/SubmitButton";
import { AuthShell } from "@/components/AuthShell";
import { AUTH_INPUT, AUTH_BUTTON } from "@/lib/auth-ui";
import { onboardAction } from "./actions";

export default async function OnboardPage() {
  const adminExists = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminExists > 0) {
    return (
      <AuthShell>
        <p className="text-center text-ink">An Admin account already exists, onboarding is no longer needed.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-6 text-xl font-semibold text-ink">Welcome — create your Admin account</h1>
      <form action={onboardAction} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="email@lixibox.com" className={AUTH_INPUT} />
        <input name="name" placeholder="Name (optional)" className={AUTH_INPUT} />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (minimum 8 characters)"
          className={AUTH_INPUT}
        />
        <SubmitButton className={AUTH_BUTTON} pendingText="Creating…">
          Create Admin account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
