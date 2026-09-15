import Link from "next/link";
import type { Role } from "@prisma/client";
import { signOut } from "@/lib/auth";

const NAV_ITEMS: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/departments", label: "Departments" },
  { href: "/devices", label: "Devices" },
  { href: "/activity", label: "Activity" },
  { href: "/access-requests", label: "Access Requests", roles: ["ADMIN"] },
];

export function Sidebar({ role }: { role: Role }) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex w-56 shrink-0 flex-col justify-between border-r border-black/[.08] p-4 dark:border-white/[.145]">
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded px-3 py-2 text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="w-full rounded px-3 py-2 text-left text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08]"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
