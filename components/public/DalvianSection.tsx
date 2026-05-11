"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Property = {
  id: string;
  slug: string;
  title: string;
  operation: string | null;
  property_type: string | null;
  price: number | null;
  currency: string | null;
  city: string | null;
  province: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  covered_area: number | null;
  total_area: number | null;
  cover_url: string | null;
};

type DalvianSectionProps = {
  properties: Property[];
};

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Consultar";

  const code = currency === "ARS" ? "ARS" : "USD";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(price);
}

function getLocation(property: Property) {
  return [property.neighborhood, property.city, property.province]
    .filter(Boolean)
    .join(", ");
}

function chunkArray<T>(array: T[], size: number) {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export default function DalvianSection({ properties }: DalvianSectionProps) {
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    return chunkArray(properties, 4);
  }, [properties]);

  const hasCarousel = pages.length > 1;

  function prevPage() {
    setPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  }

  function nextPage() {
    setPage((prev) => (prev === pages.length - 1 ? 0 : prev + 1));
  }

  return (
    <section
      id="dalvian"
      className="relative overflow-hidden bg-[#D71920] py-8 text-white lg:py-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-black/15 blur-3xl" />

        <svg
          viewBox="0 0 1400 500"
          className="absolute inset-0 h-full w-full opacity-20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M40 360C210 260 330 340 500 250C700 145 840 250 1020 170C1180 98 1280 110 1370 65"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="18 22"
          />
          <path
            d="M80 95C230 185 360 145 520 210C710 287 820 375 1030 315C1190 270 1285 315 1360 390"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="16 20"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white">
                Especial Dalvian
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-semibold leading-[0.95] text-white md:text-5xl">
              Propiedades en Dalvian
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {hasCarousel && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={prevPage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-lg font-semibold text-white transition hover:bg-white hover:text-[#D71920]"
                  aria-label="Anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextPage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-lg font-semibold text-white transition hover:bg-white hover:text-[#D71920]"
                  aria-label="Siguiente"
                >
                  →
                </button>
              </div>
            )}

            <Link
              href="/propiedades?zona=dalvian"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#D71920] transition hover:bg-[#111111] hover:text-white"
            >
              Ver Dalvian
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-8 text-center backdrop-blur md:p-12">
            <h3 className="text-2xl font-semibold text-white">
              Todavía no hay propiedades Dalvian
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Marcá el check “Dalvian” al cargar una propiedad para que aparezca
              en esta sección.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden py-2">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {pages.map((group, groupIndex) => (
                  <div key={groupIndex} className="min-w-full">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {group.map((property) => {
                        const location = getLocation(property);

                        return (
                          <article
                            key={property.id}
                            className="group overflow-hidden rounded-[24px] border border-white/25 bg-white text-[#111111] transition duration-300 hover:-translate-y-1"
                          >
                            <div className="relative">
                              <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                                <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#D71920]">
                                  {property.operation || "Venta"}
                                </span>

                                <span className="rounded-full bg-[#D71920] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                  Dalvian
                                </span>
                              </div>

                              <div className="relative h-[170px] overflow-hidden bg-slate-100">
                                {property.cover_url ? (
                                  <Image
                                    src={property.cover_url}
                                    alt={property.title}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                                    Sin imagen
                                  </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D71920]">
                                  {property.property_type || "Propiedad"}
                                </p>

                                <div className="rounded-full bg-[#FFF5F5] px-2.5 py-1 text-[10px] font-bold text-[#D71920]">
                                  Especial
                                </div>
                              </div>

                              <h3 className="line-clamp-2 text-[1.15rem] font-semibold leading-tight text-[#111111]">
                                {property.title}
                              </h3>

                              <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-600">
                                {location || "Dalvian, Mendoza"}
                              </p>

                              <p className="mt-3 text-[1.6rem] font-semibold leading-none text-[#111111]">
                                {formatPrice(property.price, property.currency)}
                              </p>

                              <div className="mt-4 grid grid-cols-4 gap-2">
                                <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                                  <p className="text-sm font-semibold text-[#111111]">
                                    {property.bedrooms ?? "-"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-500">
                                    Dorm.
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                                  <p className="text-sm font-semibold text-[#111111]">
                                    {property.bathrooms ?? "-"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-500">
                                    Baños
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                                  <p className="text-sm font-semibold text-[#111111]">
                                    {property.covered_area ?? "-"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-500">
                                    Cub.
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                                  <p className="text-sm font-semibold text-[#111111]">
                                    {property.total_area ?? "-"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-500">
                                    Total
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Link
                                  href={`/propiedades/${property.slug}`}
                                  className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#D71920]"
                                >
                                  Ver propiedad
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasCarousel && (
              <div className="mt-5 flex items-center justify-center gap-2">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      page === index
                        ? "w-8 bg-white"
                        : "w-2.5 bg-white/35 hover:bg-white/60"
                    }`}
                    aria-label={`Ir a página ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}