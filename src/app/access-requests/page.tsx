import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { approveAccessRequestAction, rejectAccessRequestAction } from "./actions";

export default async function AccessRequestsPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return (
      <main className="p-8">
        <p>Only Admins can view this page.</p>
      </main>
    );
  }

  const requests = await prisma.accessRequest.findMany({
    include: { decidedBy: true },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Access Requests</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[.08] dark:border-white/[.145]">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Requested at</th>
            <th className="py-2 pr-4">Decided by</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-black/[.04] dark:border-white/[.08]">
              <td className="py-2 pr-4">{r.email}</td>
              <td className="py-2 pr-4">{r.status}</td>
              <td className="py-2 pr-4">{r.requestedAt.toLocaleString("vi-VN")}</td>
              <td className="py-2 pr-4">{r.decidedBy?.email ?? "—"}</td>
              <td className="py-2 pr-4">
                {r.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <form action={approveAccessRequestAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="rounded bg-green-700 px-2 py-1 text-white">
                        Approve
                      </button>
                    </form>
                    <form action={rejectAccessRequestAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="rounded border border-red-600 px-2 py-1 text-red-600">
                        Reject
                      </button>
                    </form>
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
