import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { createDepartmentAction, setDepartmentLeaderAction, deleteDepartmentAction } from "./actions";

export default async function DepartmentsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = isAdmin(session.user);

  const [departments, users] = await Promise.all([
    prisma.department.findMany({
      include: { leader: true, _count: { select: { members: true, devices: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ orderBy: { email: "asc" } }),
  ]);

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Departments</h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[.08] dark:border-white/[.145]">
            <th className="py-2 pr-4">Tên</th>
            <th className="py-2 pr-4">Leader</th>
            <th className="py-2 pr-4">Members</th>
            <th className="py-2 pr-4">Devices</th>
            {admin && <th className="py-2 pr-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id} className="border-b border-black/[.04] dark:border-white/[.08]">
              <td className="py-2 pr-4">{d.name}</td>
              <td className="py-2 pr-4">
                {admin ? (
                  <form action={setDepartmentLeaderAction} className="flex gap-2">
                    <input type="hidden" name="departmentId" value={d.id} />
                    <select name="leaderId" defaultValue={d.leaderId ?? ""} className="rounded border px-2 py-1">
                      <option value="">— chưa có —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded bg-black px-2 py-1 text-white">
                      Lưu
                    </button>
                  </form>
                ) : (
                  (d.leader?.name ?? d.leader?.email) ?? "—"
                )}
              </td>
              <td className="py-2 pr-4">{d._count.members}</td>
              <td className="py-2 pr-4">{d._count.devices}</td>
              {admin && (
                <td className="py-2 pr-4">
                  <form action={deleteDepartmentAction}>
                    <input type="hidden" name="id" value={d.id} />
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
          <h2 className="mb-2 mt-8 text-lg font-semibold">Thêm department</h2>
          <form action={createDepartmentAction} className="flex gap-2">
            <input name="name" required placeholder="Tên department" className="rounded border px-2 py-1" />
            <button type="submit" className="rounded bg-black px-3 py-1 text-white">
              Tạo
            </button>
          </form>
        </>
      )}
    </main>
  );
}
