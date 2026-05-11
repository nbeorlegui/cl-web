"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Role = "superadmin" | "admin" | "user";

type DashboardMobileMenuProps = {
  role: Role;
  logoutAction: () => Promise<void>;
};

const navItems = [
  {
    label: "Inicio",
    href: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    label: "Propiedades",
    href: "/dashboard/propiedades",
    roles: ["superadmin", "admin", "user"],
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    roles: ["superadmin", "admin", "user"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Usuarios",
    href: "/dashboard/usuarios",
    roles: ["superadmin", "admin"],
  },
];

export default function DashboardMobileMenu({
  role,
  logoutAction,
}: DashboardMobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-2xl bg-[#D71920] px-4 py-2 text-xs font-bold text-white"
      >
        {open ? "Cerrar" : "Menú"}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#D71920] text-white shadow-sm"
                        : "text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <form
              action={logoutAction}
              className="mt-3 border-t border-slate-100 pt-3"
            >
              <button
                type="submit"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}