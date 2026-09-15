import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmForm } from "@/components/ConfirmForm";
import { RoleBadge } from "@/components/Badge";
import { createUserAction, updateUserAction, deleteUserAction } from "./actions";

const ROLES = ["ADMIN", "LEADER", "MEMBER"] as const;
const FIELD = "rounded border border-paper-line px-2 py-1 text-sm";
const PRIMARY_BUTTON = "rounded bg-signal px-2 py-1 text-sm font-medium text-signal-ink";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const admin = isAdmin(session.user);

  const [users, departments] = await Promise.all([
    prisma.user.findMany({ include: { department: true }, orderBy: { email: "asc" } }),
    prisma.department.findMany(),
  ]);

  return (
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-4 text-xl font-semibold text-ink">Members</h1>

      <div className="overflow-x-auto rounded-lg border border-paper-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line text-gray-500">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Department</th>
              {admin && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-paper-line text-ink last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.name ?? "—"}</td>
                <td className="px-4 py-2">
                  {admin ? (
                    <form action={updateUserAction} className="flex gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className={FIELD}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select name="departmentId" defaultValue={u.departmentId ?? ""} className={FIELD}>
                        <option value="">— none —</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className={PRIMARY_BUTTON}>Save</SubmitButton>
                    </form>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}
                </td>
                <td className="px-4 py-2">{u.department?.name ?? "—"}</td>
                {admin && (
                  <td className="px-4 py-2">
                    <ConfirmForm action={deleteUserAction} confirmMessage={`Delete ${u.email}? This cannot be undone.`}>
                      <input type="hidden" name="id" value={u.id} />
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
          <h2 className="mb-2 mt-8 text-lg font-semibold text-ink">Add member</h2>
          <form action={createUserAction} className="flex flex-wrap gap-2">
            <input name="email" type="email" required placeholder="email@lixibox.com" className={FIELD} />
            <input name="name" placeholder="Name (optional)" className={FIELD} />
            <select name="role" defaultValue="MEMBER" className={FIELD}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select name="departmentId" defaultValue="" className={FIELD}>
              <option value="">— none —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <SubmitButton className={PRIMARY_BUTTON} pendingText="Creating…">
              Create
            </SubmitButton>
          </form>
        </>
      )}
    </main>
  );
}
