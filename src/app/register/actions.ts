"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveSignInAccess } from "@/lib/access-control";
import { hashPassword } from "@/lib/password";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = (formData.get("name") as string) || null;

  if (!email || !password) throw new Error("Email và password là bắt buộc");
  if (password.length < 8) throw new Error("Password phải từ 8 ký tự trở lên");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    throw new Error("Email này đã có tài khoản, vui lòng đăng nhập.");
  }

  const decision = await resolveSignInAccess(email, { name });
  if (!decision.allow) {
    redirect(decision.redirectTo);
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hashPassword(password), name },
  });

  redirect("/?registered=1");
}
