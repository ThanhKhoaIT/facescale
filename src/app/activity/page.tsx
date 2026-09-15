import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) return null;

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Activity</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[.08] dark:border-white/[.145]">
            <th className="py-2 pr-4">When</th>
            <th className="py-2 pr-4">Who</th>
            <th className="py-2 pr-4">Action</th>
            <th className="py-2 pr-4">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-black/[.04] dark:border-white/[.08]">
              <td className="py-2 pr-4">{log.createdAt.toLocaleString("vi-VN")}</td>
              <td className="py-2 pr-4">{log.actor?.email ?? "—"}</td>
              <td className="py-2 pr-4">{log.action}</td>
              <td className="py-2 pr-4">{log.target ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
