"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import type { AccessRequestStatus } from "@prisma/client";

async function decide(formData: FormData, status: AccessRequestStatus) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const id = String(formData.get("id"));

  await prisma.accessRequest.update({
    where: { id },
    data: { status, decidedById: session.user.id, decidedAt: new Date() },
  });

  revalidatePath("/access-requests");
}

export async function approveAccessRequestAction(formData: FormData) {
  await decide(formData, "APPROVED");
}

export async function rejectAccessRequestAction(formData: FormData) {
  await decide(formData, "REJECTED");
}
