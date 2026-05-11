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

type FeaturedPropertiesProps = {
  properties: Property[];
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: "featured" | "latest" | string;
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

export default function FeaturedProperties({
  properties,
  eyebrow = "Propiedades destacadas",
  description = "Una selección curada por CL Inmobiliaria con las mejores oportunidades del momento.",
  variant = "featured",
}: FeaturedPropertiesProps) {
  const [page, setPage] = useState(0);

  const isLatest = variant === "latest";

  const pages = useMemo(() => {
    return chunkArray(properties, 4);
  }, [properties]);

  if (properties.length === 0) return null;

  const hasCarousel = pages.length > 1;

  function prevPage() {
    setPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  }

  function nextPage() {
    setPage((prev) => (prev === pages.length - 1 ? 0 : prev + 1));
  }

  return (
    <section
      id={isLatest ? "ultimas" : "destacadas"}
      className="relative overflow-hidden bg-white py-6 lg:py-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(215,25,32,0.05),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.03),transparent_24%)]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 lg:px-10">
        <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D0D2] bg-[#FFF7F7] px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D71920]" />

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D71920]">
                {eyebrow}
              </p>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasCarousel && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={prevPage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                  aria-label="Anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextPage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                  aria-label="Siguiente"
                >
                  →
                </button>
              </div>
            )}

            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#D71920] transition hover:border-[#D71920] hover:bg-[#FFF5F5]"
            >
              Ver todas
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden py-2">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((group, groupIndex) => (
              <div key={groupIndex} className="min-w-full">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {group.map((property, index) => {
                    const location = getLocation(property);

                    return (
                      <article
                        key={property.id}
                        className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#D71920]/35"
                      >
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#D71920] via-[#F46A6E] to-[#111111]" />

                        <div className="relative">
                          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#D71920]">
                              {property.operation || "Venta"}
                            </span>

                            {!isLatest && (
                              <span className="rounded-full bg-[#111111]/85 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                #{groupIndex * 4 + index + 1}
                              </span>
                            )}
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
                              {isLatest ? "Nueva" : "Destacada"}
                            </div>
                          </div>

                          <h3 className="line-clamp-2 text-[1.15rem] font-semibold leading-tight text-[#111111]">
                            {property.title}
                          </h3>

                          <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-600">
                            {location || "Mendoza"}
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
                    ? "w-8 bg-[#D71920]"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}