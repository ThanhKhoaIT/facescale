import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { createUserAction, updateUserAction, deleteUserAction } from "./actions";

const ROLES = ["ADMIN", "LEADER", "MEMBER"] as const;

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = isAdmin(session.user);

  const [users, departments] = await Promise.all([
    prisma.user.findMany({ include: { department: true }, orderBy: { email: "asc" } }),
    prisma.department.findMany(),
  ]);

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Members</h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[.08] dark:border-white/[.145]">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Tên</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Department</th>
            {admin && <th className="py-2 pr-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-black/[.04] dark:border-white/[.08]">
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">{u.name ?? "—"}</td>
              <td className="py-2 pr-4">
                {admin ? (
                  <form action={updateUserAction} className="flex gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="rounded border px-2 py-1">
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <select name="departmentId" defaultValue={u.departmentId ?? ""} className="rounded border px-2 py-1">
                      <option value="">— none —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded bg-black px-2 py-1 text-white">
                      Lưu
                    </button>
                  </form>
                ) : (
                  u.role
                )}
              </td>
              <td className="py-2 pr-4">{u.department?.name ?? "—"}</td>
              {admin && (
                <td className="py-2 pr-4">
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="rounded border border-red-600 px-2 py-1 text-red-600">
                      Xoá
                    </button>
                  </form>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {admin && (
        <>
          <h2 className="mb-2 mt-8 text-lg font-semibold">Thêm member</h2>
          <form action={createUserAction} className="flex flex-wrap gap-2">
            <input name="email" type="email" required placeholder="email@lixibox.com" className="rounded border px-2 py-1" />
            <input name="name" placeholder="Tên (tuỳ chọn)" className="rounded border px-2 py-1" />
            <select name="role" defaultValue="MEMBER" className="rounded border px-2 py-1">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select name="departmentId" defaultValue="" className="rounded border px-2 py-1">
              <option value="">— none —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded bg-black px-3 py-1 text-white">
              Tạo
            </button>
          </form>
        </>
      )}
    </main>
  );
}
