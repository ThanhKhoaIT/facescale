import type { Role } from "@prisma/client";

type ScopedUser = { role: Role; id: string; departmentId: string | null };
type ScopedDevice = { departmentId: string | null; assignedUserId: string | null };

/** Admin sees everything; Leader sees their department's devices; Member sees only what's assigned to them. */
export function scopeDevicesForUser<T extends ScopedDevice>(user: ScopedUser, devices: T[]): T[] {
  if (user.role === "ADMIN") return devices;
  if (user.role === "LEADER") return devices.filter((d) => d.departmentId === user.departmentId);
  return devices.filter((d) => d.assignedUserId === user.id);
}

export function canAssignDeviceDepartment(user: { role: Role }): boolean {
  return user.role === "ADMIN";
}

export function canAssignDeviceMember(user: ScopedUser, device: ScopedDevice): boolean {
  return user.role === "LEADER" && device.departmentId === user.departmentId;
}

export function isAdmin(user: { role: Role }): boolean {
  return user.role === "ADMIN";
}
