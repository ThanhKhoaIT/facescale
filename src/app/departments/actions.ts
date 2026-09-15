"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function createDepartmentAction(formData: FormData) {
  const admin = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await prisma.department.create({ data: { name } });
  await logAction(admin.id, "department.create", name);

  revalidatePath("/departments");
}

export async function setDepartmentLeaderAction(formData: FormData) {
  const admin = await requireAdmin();

  const departmentId = String(formData.get("departmentId"));
  const leaderId = (formData.get("leaderId") as string) || null;

  if (!leaderId) {
    await prisma.department.update({ where: { id: departmentId }, data: { leaderId: null } });
    await logAction(admin.id, "department.unset_leader", departmentId);
    revalidatePath("/departments");
    return;
  }

  const candidate = await prisma.user.findUnique({ where: { id: leaderId }, include: { ledDepartment: true } });
  if (!candidate) throw new Error("User not found");
  if (candidate.ledDepartment && candidate.ledDepartment.id !== departmentId) {
    throw new Error(`${candidate.email} is already leading "${candidate.ledDepartment.name}"`);
  }

  await prisma.$transaction([
    prisma.department.update({ where: { id: departmentId }, data: { leaderId } }),
    prisma.user.update({ where: { id: leaderId }, data: { role: "LEADER", departmentId } }),
  ]);
  await logAction(admin.id, "department.set_leader", `${departmentId} -> ${candidate.email}`);

  revalidatePath("/departments");
}

export async function deleteDepartmentAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id"));

  const [memberCount, deviceCount] = await Promise.all([
    prisma.user.count({ where: { departmentId: id } }),
    prisma.deviceMeta.count({ where: { departmentId: id } }),
  ]);

  if (memberCount > 0 || deviceCount > 0) {
    throw new Error("Cannot delete: department still has members or devices assigned. Reassign them first.");
  }

  const department = await prisma.department.delete({ where: { id } });
  await logAction(admin.id, "department.delete", department.name);

  revalidatePath("/departments");
}
