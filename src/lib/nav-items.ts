import type { Role } from "@prisma/client";

export const NAV_ITEMS: { href: string; label: string; icon: string; roles?: Role[] }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/members", label: "Members", icon: "group" },
  { href: "/departments", label: "Departments", icon: "apartment" },
  { href: "/devices", label: "Devices", icon: "devices" },
  { href: "/activity", label: "Activity", icon: "history" },
  { href: "/access-requests", label: "Access Requests", icon: "how_to_reg", roles: ["ADMIN"] },
];
