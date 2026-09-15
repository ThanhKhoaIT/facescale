import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listHeadscaleNodes, type HeadscaleNode } from "@/lib/headscale";
import { scopeDevicesForUser, canAssignDeviceDepartment, canAssignDeviceMember } from "@/lib/permissions";
import { assignDeviceDepartmentAction, assignDeviceMemberAction } from "./actions";

export default async function DevicesPage() {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user;

  let headscaleNodes: HeadscaleNode[] = [];
  let headscaleError: string | null = null;
  try {
    headscaleNodes = await listHeadscaleNodes();
  } catch (err) {
    headscaleError = err instanceof Error ? err.message : "Failed to reach Headscale";
  }

  const [deviceMetas, departments, deptMembers] = await Promise.all([
    prisma.deviceMeta.findMany({ include: { assignedUser: true } }),
    canAssignDeviceDepartment(user) ? prisma.department.findMany() : Promise.resolve([]),
    user.role === "LEADER"
      ? prisma.user.findMany({ where: { departmentId: user.departmentId, role: "MEMBER" } })
      : Promise.resolve([]),
  ]);

  const metaByNodeId = new Map(deviceMetas.map((m) => [m.headscaleNodeId, m]));

  const devices = headscaleNodes.map((node) => {
    const meta = metaByNodeId.get(node.id);
    return {
      ...node,
      departmentId: meta?.departmentId ?? null,
      assignedUserId: meta?.assignedUserId ?? null,
      assignedUserLabel: meta?.assignedUser?.name ?? meta?.assignedUser?.email ?? null,
    };
  });

  const scopedDevices = scopeDevicesForUser(user, devices);
  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]));

  if (headscaleError) {
    return (
      <main className="p-8">
        <p className="text-red-600">Không kết nối được Headscale: {headscaleError}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Devices</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/[.08] dark:border-white/[.145]">
            <th className="py-2 pr-4">Tên</th>
            <th className="py-2 pr-4">IP</th>
            <th className="py-2 pr-4">Trạng thái</th>
            <th className="py-2 pr-4">Department</th>
            <th className="py-2 pr-4">Member</th>
          </tr>
        </thead>
        <tbody>
          {scopedDevices.map((device) => (
            <tr key={device.id} className="border-b border-black/[.04] dark:border-white/[.08]">
              <td className="py-2 pr-4">{device.givenName || device.name}</td>
              <td className="py-2 pr-4">{device.ipAddresses[0]}</td>
              <td className="py-2 pr-4">
                <span className={device.online ? "text-green-600" : "text-gray-400"}>
                  {device.online ? "Online" : "Offline"}
                </span>
              </td>
              <td className="py-2 pr-4">
                {canAssignDeviceDepartment(user) ? (
                  <form action={assignDeviceDepartmentAction} className="flex gap-2">
                    <input type="hidden" name="headscaleNodeId" value={device.id} />
                    <select name="departmentId" defaultValue={device.departmentId ?? ""} className="rounded border px-2 py-1">
                      <option value="">— chưa gán —</option>
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
                  (device.departmentId && departmentNameById.get(device.departmentId)) ?? "—"
                )}
              </td>
              <td className="py-2 pr-4">
                {canAssignDeviceMember(user, { departmentId: device.departmentId, assignedUserId: device.assignedUserId }) ? (
                  <form action={assignDeviceMemberAction} className="flex gap-2">
                    <input type="hidden" name="headscaleNodeId" value={device.id} />
                    <select name="assignedUserId" defaultValue={device.assignedUserId ?? ""} className="rounded border px-2 py-1">
                      <option value="">— chưa gán —</option>
                      {deptMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name ?? m.email}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded bg-black px-2 py-1 text-white">
                      Lưu
                    </button>
                  </form>
                ) : (
                  device.assignedUserLabel ?? "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
