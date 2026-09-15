import Link from "next/link";
import type { Role } from "@prisma/client";
import { signOut } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav-items";
import { Icon } from "@/components/Icon";

export function Sidebar({ role }: { role: Role }) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="hidden w-56 shrink-0 flex-col justify-between bg-ink p-4 text-white sm:flex">
      <div>
        <p className="mb-4 px-3 text-sm font-semibold tracking-wide">Facescale</p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <Icon name="logout" />
          Sign out
        </button>
      </form>
    </nav>
  );
}
