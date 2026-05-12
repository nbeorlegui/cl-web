"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type PublicProperty = {
  id: string;
  title: string;
  slug: string;
  city: string | null;
  province?: string | null;
  neighborhood: string | null;
  price: number | null;
  currency: string | null;
  operation: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  covered_area: number | null;
  total_area: number | null;
  cover_url: string | null;
  apt_credit?: boolean | null;
};

type DalvianSectionProps = {
  properties: PublicProperty[];
};

function formatPrice(value: number | null) {
  if (!value) return "-";

  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOperation(value: string | null) {
  if (!value) return "Venta";

  const clean = value.toLowerCase();

  if (clean === "venta") return "Venta";
  if (clean === "alquiler") return "Alquiler";

  return value;
}

function formatPropertyType(value: string | null) {
  if (!value) return "Casa";

  const clean = value.toLowerCase();

  if (clean === "casa") return "Casa";
  if (clean === "departamento") return "Departamento";
  if (clean === "duplex") return "Dúplex";
  if (clean === "lote") return "Lote";
  if (clean === "terreno") return "Terreno";
  if (clean === "local") return "Local";
  if (clean === "finca") return "Finca";

  return value;
}

function formatArea(value: number | null) {
  if (!value) return "-";
  return String(value);
}

function DalvianPropertyCard({ property }: { property: PublicProperty }) {
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  const detailUrl = property.slug
    ? `/propiedades/${property.slug}`
    : "/propiedades";

  return (
    <article className="group flex h-full min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[220px] overflow-hidden bg-white/20">
        {property.cover_url ? (
          <Image
            src={property.cover_url}
            alt={property.title || "Propiedad en Dalvian"}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/10">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Sin imagen
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#D71920] shadow-sm">
            {formatOperation(property.operation)}
          </span>

          <span className="rounded-full bg-[#D71920] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            Dalvian
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
            {formatPropertyType(property.property_type)}
          </p>

          <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-[#D71920]">
            Especial
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[50px] text-[20px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111]">
          {property.title || "Propiedad sin título"}
        </h3>

        <p className="mt-2 min-h-[22px] truncate text-sm font-medium text-slate-500">
          {location || "Dalvian, Mendoza"}
        </p>

        <p className="mt-5 text-[23px] font-semibold leading-none tracking-[-0.04em] text-[#D71920]">
          {property.currency || "USD"} {formatPrice(property.price)}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <div className="flex h-[54px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {property.bedrooms || "-"}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Dorm.
            </span>
          </div>

          <div className="flex h-[54px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {property.bathrooms || "-"}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Baños
            </span>
          </div>

          <div className="flex h-[54px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {formatArea(property.covered_area)}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Cub.
            </span>
          </div>

          <div className="flex h-[54px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {formatArea(property.total_area)}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Total
            </span>
          </div>
        </div>

        <Link
          href={detailUrl}
          className="mt-5 flex h-11 items-center justify-center rounded-2xl bg-[#111111] text-sm font-bold text-white transition hover:bg-[#D71920]"
        >
          Ver propiedad
        </Link>
      </div>
    </article>
  );
}

export default function DalvianSection({ properties }: DalvianSectionProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const pageSize = 3;

  const visibleProperties = useMemo(() => {
    return properties.slice(carouselIndex, carouselIndex + pageSize);
  }, [properties, carouselIndex]);

  function nextSlide() {
    if (properties.length <= pageSize) return;

    setCarouselIndex((current) => {
      const next = current + pageSize;
      return next >= properties.length ? 0 : next;
    });
  }

  function prevSlide() {
    if (properties.length <= pageSize) return;

    setCarouselIndex((current) => {
      const prev = current - pageSize;

      if (prev < 0) {
        return Math.floor((properties.length - 1) / pageSize) * pageSize;
      }

      return prev;
    });
  }

  if (!properties.length) return null;

  const canShowCarousel = properties.length > pageSize;

  return (
    <section
      id="dalvian"
      className="relative overflow-hidden bg-[#D71920] px-6 py-16 text-white md:px-10 lg:px-14"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-[12%] top-[38%] h-[2px] w-[1200px] rotate-12 border-t-2 border-dashed border-white" />
        <div className="absolute left-[38%] top-[60%] h-[2px] w-[900px] -rotate-6 border-t-2 border-dashed border-white" />
      </div>

      <div className="relative mx-auto max-w-[1450px]">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-white" />

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">
                Especial Dalvian
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
              Propiedades en Dalvian
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {canShowCarousel && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-bold text-white transition hover:bg-white hover:text-[#D71920]"
                  aria-label="Anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-bold text-white transition hover:bg-white hover:text-[#D71920]"
                  aria-label="Siguiente"
                >
                  →
                </button>
              </div>
            )}

            <Link
              href="/propiedades?zona=dalvian"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold text-[#D71920] transition hover:bg-[#111111] hover:text-white"
            >
              Ver Dalvian →
            </Link>
          </div>
        </div>

        <div className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">
          {visibleProperties.map((property) => (
            <DalvianPropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}