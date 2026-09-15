"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    throw new Error("Forbidden");
  }
}

export async function createDepartmentAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await prisma.department.create({ data: { name } });

  revalidatePath("/departments");
}

export async function setDepartmentLeaderAction(formData: FormData) {
  await requireAdmin();

  const departmentId = String(formData.get("departmentId"));
  const leaderId = (formData.get("leaderId") as string) || null;

  if (!leaderId) {
    await prisma.department.update({ where: { id: departmentId }, data: { leaderId: null } });
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

  revalidatePath("/departments");
}

export async function deleteDepartmentAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));

  const [memberCount, deviceCount] = await Promise.all([
    prisma.user.count({ where: { departmentId: id } }),
    prisma.deviceMeta.count({ where: { departmentId: id } }),
  ]);

  if (memberCount > 0 || deviceCount > 0) {
    throw new Error("Cannot delete: department still has members or devices assigned. Reassign them first.");
  }

  await prisma.department.delete({ where: { id } });

  revalidatePath("/departments");
}
