import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmForm } from "@/components/ConfirmForm";
import { StatusBadge } from "@/components/Badge";
import { approveAccessRequestAction, rejectAccessRequestAction } from "./actions";

export default async function AccessRequestsPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return (
      <main className="bg-paper-muted p-4 sm:p-8">
        <p className="text-ink">Only Admins can view this page.</p>
      </main>
    );
  }

  const requests = await prisma.accessRequest.findMany({
    include: { decidedBy: true },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-4 text-xl font-semibold text-ink">Access Requests</h1>
      <div className="overflow-x-auto rounded-lg border border-paper-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line text-gray-500">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Requested at</th>
              <th className="px-4 py-2">Decided by</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-paper-line text-ink last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-2">{r.requestedAt.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-2">{r.decidedBy?.email ?? "—"}</td>
                <td className="px-4 py-2">
                  {r.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <form action={approveAccessRequestAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <SubmitButton className="rounded bg-green-700 px-2 py-1 text-sm text-white" pendingText="Approving…">
                          Approve
                        </SubmitButton>
                      </form>
                      <ConfirmForm action={rejectAccessRequestAction} confirmMessage={`Reject access request from ${r.email}?`}>
                        <input type="hidden" name="id" value={r.id} />
                        <SubmitButton className="rounded border border-red-600 px-2 py-1 text-sm text-red-600" pendingText="Rejecting…">
                          Reject
                        </SubmitButton>
                      </ConfirmForm>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
