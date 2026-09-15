"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAssignDeviceDepartment, canAssignDeviceMember } from "@/lib/permissions";

export async function assignDeviceDepartmentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canAssignDeviceDepartment(session.user)) {
    throw new Error("Forbidden");
  }

  const headscaleNodeId = String(formData.get("headscaleNodeId"));
  const departmentId = (formData.get("departmentId") as string) || null;

  await prisma.deviceMeta.upsert({
    where: { headscaleNodeId },
    update: { departmentId, assignedUserId: null },
    create: { headscaleNodeId, departmentId },
  });

  revalidatePath("/devices");
}

export async function assignDeviceMemberAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Forbidden");

  const headscaleNodeId = String(formData.get("headscaleNodeId"));
  const assignedUserId = (formData.get("assignedUserId") as string) || null;

  const device = await prisma.deviceMeta.findUnique({ where: { headscaleNodeId } });
  const deviceDepartmentId = device?.departmentId ?? null;

  if (!canAssignDeviceMember(session.user, { departmentId: deviceDepartmentId, assignedUserId: null })) {
    throw new Error("Forbidden");
  }

  if (assignedUserId) {
    const target = await prisma.user.findUnique({ where: { id: assignedUserId } });
    if (!target || target.departmentId !== session.user.departmentId) {
      throw new Error("Invalid assignee: must be a member of your department");
    }
  }

  await prisma.deviceMeta.upsert({
    where: { headscaleNodeId },
    update: { assignedUserId },
    create: { headscaleNodeId, departmentId: deviceDepartmentId, assignedUserId },
  });

  revalidatePath("/devices");
}
