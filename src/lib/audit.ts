import { prisma } from "@/lib/prisma";

export async function logAction(actorId: string, action: string, target?: string) {
  await prisma.auditLog.create({ data: { actorId, action, target } });
}
