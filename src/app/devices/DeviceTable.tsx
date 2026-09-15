"use client";

import { useMemo, useState } from "react";
import type { Role } from "@prisma/client";
import { canAssignDeviceDepartment, canAssignDeviceMember } from "@/lib/permissions";
import { SubmitButton } from "@/components/SubmitButton";

type Device = {
  id: string;
  givenName: string;
  name: string;
  ipAddresses: string[];
  online: boolean;
  departmentId: string | null;
  assignedUserId: string | null;
  assignedUserLabel: string | null;
};

type SessionUser = { role: Role; id: string; departmentId: string | null };

const FIELD = "rounded border border-paper-line px-2 py-1 text-sm";
const PRIMARY_BUTTON = "rounded bg-signal px-2 py-1 text-sm font-medium text-signal-ink";

export function DeviceTable({
  devices,
  departments,
  deptMembers,
  user,
  assignDeviceDepartmentAction,
  assignDeviceMemberAction,
}: {
  devices: Device[];
  departments: { id: string; name: string }[];
  deptMembers: { id: string; name: string | null; email: string }[];
  user: SessionUser;
  assignDeviceDepartmentAction: (formData: FormData) => void;
  assignDeviceMemberAction: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");
  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter((device) => {
      const name = (device.givenName || device.name).toLowerCase();
      const ip = device.ipAddresses[0]?.toLowerCase() ?? "";
      return name.includes(q) || ip.includes(q);
    });
  }, [devices, query]);

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by device name or IP…"
        className={`mb-4 w-full max-w-xs ${FIELD}`}
      />
      <p className="mb-2 text-xs text-gray-500">
        {filtered.length} of {devices.length} device{devices.length === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto rounded-lg border border-paper-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">IP</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Member</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((device) => (
              <tr key={device.id} className="border-b border-paper-line text-ink last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-2">{device.givenName || device.name}</td>
                <td className="px-4 py-2 font-mono text-xs">{device.ipAddresses[0] ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className={device.online ? "text-green-600" : "text-gray-400"}>
                    {device.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {canAssignDeviceDepartment(user) ? (
                    <form action={assignDeviceDepartmentAction} className="flex gap-2">
                      <input type="hidden" name="headscaleNodeId" value={device.id} />
                      <select name="departmentId" defaultValue={device.departmentId ?? ""} className={FIELD}>
                        <option value="">— unassigned —</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className={PRIMARY_BUTTON}>Save</SubmitButton>
                    </form>
                  ) : (
                    (device.departmentId && departmentNameById.get(device.departmentId)) ?? "—"
                  )}
                </td>
                <td className="px-4 py-2">
                  {canAssignDeviceMember(user, { departmentId: device.departmentId, assignedUserId: device.assignedUserId }) ? (
                    <form action={assignDeviceMemberAction} className="flex gap-2">
                      <input type="hidden" name="headscaleNodeId" value={device.id} />
                      <select name="assignedUserId" defaultValue={device.assignedUserId ?? ""} className={FIELD}>
                        <option value="">— unassigned —</option>
                        {deptMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name ?? m.email}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className={PRIMARY_BUTTON}>Save</SubmitButton>
                    </form>
                  ) : (
                    device.assignedUserLabel ?? "—"
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No devices match &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
