import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityTable } from "./ActivityTable";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const entries = logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toLocaleString("vi-VN"),
    actorEmail: log.actor?.email ?? null,
    action: log.action,
    target: log.target,
  }));

  return (
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-4 text-xl font-semibold text-ink">Activity</h1>
      <ActivityTable logs={entries} />
    </main>
  );
}
