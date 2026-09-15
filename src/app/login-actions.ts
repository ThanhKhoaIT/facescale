"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { resolveSignInAccess } from "@/lib/access-control";
import { issueOtp } from "@/lib/otp";

export async function passwordSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/?error=1");
    }
    throw error;
  }
}

export async function requestOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/?error=1");

  const decision = await resolveSignInAccess(email, {});
  if (!decision.allow) {
    redirect(decision.redirectTo);
  }

  await issueOtp(email);

  redirect(`/?step=code&email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "");

  try {
    await signIn("slack-otp", { email, code, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/?step=code&email=${encodeURIComponent(email)}&error=1`);
    }
    throw error;
  }
}
