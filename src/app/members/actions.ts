"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import type { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    throw new Error("Forbidden");
  }
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) throw new Error("Email is required");

  const name = (formData.get("name") as string) || null;
  const role = (formData.get("role") as Role) || "MEMBER";
  const departmentId = (formData.get("departmentId") as string) || null;

  await prisma.user.create({ data: { email, name, role, departmentId } });

  revalidatePath("/members");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const role = formData.get("role") as Role;
  const departmentId = (formData.get("departmentId") as string) || null;

  await prisma.user.update({ where: { id }, data: { role, departmentId } });

  revalidatePath("/members");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));

  const user = await prisma.user.findUnique({
    where: { id },
    include: { ledDepartment: true, assignedDevices: true },
  });

  if (user?.ledDepartment) {
    throw new Error(`Cannot delete: still leading department "${user.ledDepartment.name}". Reassign it first.`);
  }
  if (user && user.assignedDevices.length > 0) {
    throw new Error("Cannot delete: still has devices assigned. Unassign them first.");
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/members");
}
