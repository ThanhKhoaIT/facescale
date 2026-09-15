import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmForm } from "@/components/ConfirmForm";
import { createDepartmentAction, setDepartmentLeaderAction, deleteDepartmentAction } from "./actions";

const FIELD = "rounded border border-paper-line px-2 py-1 text-sm";
const PRIMARY_BUTTON = "rounded bg-signal px-2 py-1 text-sm font-medium text-signal-ink";

export default async function DepartmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const admin = isAdmin(session.user);

  const [departments, users] = await Promise.all([
    prisma.department.findMany({
      include: { leader: true, _count: { select: { members: true, devices: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ orderBy: { email: "asc" } }),
  ]);

  return (
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-4 text-xl font-semibold text-ink">Departments</h1>

      <div className="overflow-x-auto rounded-lg border border-paper-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Leader</th>
              <th className="px-4 py-2">Members</th>
              <th className="px-4 py-2">Devices</th>
              {admin && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b border-paper-line text-ink last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">
                  {admin ? (
                    <form action={setDepartmentLeaderAction} className="flex gap-2">
                      <input type="hidden" name="departmentId" value={d.id} />
                      <select name="leaderId" defaultValue={d.leaderId ?? ""} className={FIELD}>
                        <option value="">— none —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className={PRIMARY_BUTTON}>Save</SubmitButton>
                    </form>
                  ) : (
                    (d.leader?.name ?? d.leader?.email) ?? "—"
                  )}
                </td>
                <td className="px-4 py-2">{d._count.members}</td>
                <td className="px-4 py-2">{d._count.devices}</td>
                {admin && (
                  <td className="px-4 py-2">
                    <ConfirmForm action={deleteDepartmentAction} confirmMessage={`Delete department "${d.name}"? This cannot be undone.`}>
                      <input type="hidden" name="id" value={d.id} />
                      <SubmitButton className="rounded border border-red-600 px-2 py-1 text-sm text-red-600" pendingText="Deleting…">
                        Delete
                      </SubmitButton>
                    </ConfirmForm>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {admin && (
        <>
          <h2 className="mb-2 mt-8 text-lg font-semibold text-ink">Add department</h2>
          <form action={createDepartmentAction} className="flex gap-2">
            <input name="name" required placeholder="Department name" className={FIELD} />
            <SubmitButton className={PRIMARY_BUTTON} pendingText="Creating…">
              Create
            </SubmitButton>
          </form>
        </>
      )}
    </main>
  );
}
