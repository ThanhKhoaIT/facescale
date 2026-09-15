import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { AuthShell } from "@/components/AuthShell";
import { AUTH_INPUT, AUTH_BUTTON } from "@/lib/auth-ui";
import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <AuthShell>
      <h1 className="mb-6 text-xl font-semibold text-ink">Create account</h1>
      <form action={registerAction} className="flex flex-col gap-3">
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
        <SubmitButton className={AUTH_BUTTON} pendingText="Registering…">
          Register
        </SubmitButton>
      </form>
      <Link href="/" className="mt-4 block text-center text-sm text-gray-500 underline dark:text-gray-400">
        Already have an account? Sign in
      </Link>
    </AuthShell>
  );
}
