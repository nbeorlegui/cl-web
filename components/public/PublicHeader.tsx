"use client";

import Link from "next/link";
import Image from "next/image";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-cl-inmobiliaria.png"
            alt="CL Inmobiliaria"
            width={190}
            height={52}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/" className="text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:text-[#D71920]">
            Inicio
          </a>
          <a href="#destacadas" className="text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:text-[#D71920]">
            Destacadas
          </a>
          <a href="#dalvian" className="text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:text-[#D71920]">
            Dalvian
          </a>
          <a href="#ultimas" className="text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:text-[#D71920]">
            Últimas
          </a>
          <a href="#contacto" className="text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:text-[#D71920]">
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}
