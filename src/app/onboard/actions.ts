"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { logAction } from "@/lib/audit";

export async function onboardAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = (formData.get("name") as string) || null;

  if (!email || !password) throw new Error("Email and password are required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const adminExists = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminExists > 0) {
    throw new Error("An Admin already exists, cannot onboard again.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hashPassword(password), name, role: "ADMIN" },
    create: { email, name, passwordHash: hashPassword(password), role: "ADMIN" },
  });

  await logAction(user.id, "onboard_admin", user.email);

  redirect("/?registered=1");
}
