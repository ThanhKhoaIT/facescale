"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Role } from "@prisma/client";
import { NAV_ITEMS } from "@/lib/nav-items";
import { Icon } from "@/components/Icon";

export function MobileNav({ role, onSignOut }: { role: Role; onSignOut: (formData: FormData) => void }) {
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="sticky top-0 z-20 bg-ink text-white sm:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Image src="/facescale.png" alt="" width={22} height={22} />
          Facescale
        </span>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-2 pb-3">
          <ul className="flex flex-col gap-1 pt-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <form action={onSignOut} className="mt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon name="logout" />
              Sign out
            </button>
          </form>
        </nav>
      )}
    </div>
  );
}
