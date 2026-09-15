import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listHeadscaleNodes, type HeadscaleNode } from "@/lib/headscale";
import { scopeDevicesForUser, canAssignDeviceDepartment } from "@/lib/permissions";
import { assignDeviceDepartmentAction, assignDeviceMemberAction } from "./actions";
import { DeviceTable } from "./DeviceTable";

export default async function DevicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
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

  if (headscaleError) {
    return (
      <main className="bg-paper-muted p-4 sm:p-8">
        <p className="text-red-600">Could not connect to Headscale: {headscaleError}</p>
      </main>
    );
  }

  return (
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-4 text-xl font-semibold text-ink">Devices</h1>
      <DeviceTable
        devices={scopedDevices}
        departments={departments}
        deptMembers={deptMembers}
        user={user}
        assignDeviceDepartmentAction={assignDeviceDepartmentAction}
        assignDeviceMemberAction={assignDeviceMemberAction}
      />
    </main>
  );
}
