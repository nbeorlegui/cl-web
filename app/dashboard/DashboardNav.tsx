"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardNavProps = {
  role: "superadmin" | "admin" | "user";
};

const RED = "#D71920";

function getLinkClass(pathname: string, href: string) {
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  if (isActive) {
    return "block rounded-2xl px-4 py-3 font-bold text-white shadow-sm transition";
  }

  return "block rounded-2xl px-4 py-3 font-bold text-slate-700 transition hover:bg-red-50 hover:text-[#D71920]";
}

export default function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const canSeeAnalytics = role === "superadmin" || role === "admin";

  return (
    <nav className="mt-10 space-y-2">
      <Link
        href="/dashboard"
        className={getLinkClass(pathname, "/dashboard")}
        style={pathname === "/dashboard" ? { backgroundColor: RED } : undefined}
      >
        Inicio
      </Link>

      <Link
        href="/dashboard/propiedades"
        className={getLinkClass(pathname, "/dashboard/propiedades")}
        style={
          pathname === "/dashboard/propiedades" ||
          pathname.startsWith("/dashboard/propiedades/")
            ? { backgroundColor: RED }
            : undefined
        }
      >
        Propiedades
      </Link>

      <Link
        href="/dashboard/leads"
        className={getLinkClass(pathname, "/dashboard/leads")}
        style={
          pathname === "/dashboard/leads" || pathname.startsWith("/dashboard/leads/")
            ? { backgroundColor: RED }
            : undefined
        }
      >
        Leads
      </Link>

      {canSeeAnalytics && (
        <Link
          href="/dashboard/analytics"
          className={getLinkClass(pathname, "/dashboard/analytics")}
          style={
            pathname === "/dashboard/analytics" ||
            pathname.startsWith("/dashboard/analytics/")
              ? { backgroundColor: RED }
              : undefined
          }
        >
          Analytics
        </Link>
      )}

      {role === "superadmin" && (
        <Link
          href="/dashboard/usuarios"
          className={getLinkClass(pathname, "/dashboard/usuarios")}
          style={
            pathname === "/dashboard/usuarios" ||
            pathname.startsWith("/dashboard/usuarios/")
              ? { backgroundColor: RED }
              : undefined
          }
        >
          Usuarios
        </Link>
      )}
    </nav>
  );
}
