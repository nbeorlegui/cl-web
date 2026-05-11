import Link from "next/link";
import type { PublicProperty } from "@/app/page";

type FeaturedPropertiesProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  properties: PublicProperty[];
  variant?: "featured" | "latest";
};

function label(value?: string | null) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrice(property: PublicProperty) {
  if (!property.price) return "Consultar";

  const currency = property.currency || "USD";

  return `${currency} ${new Intl.NumberFormat("es-AR").format(
    property.price
  )}`;
}

function getLocation(property: PublicProperty) {
  return [property.neighborhood, property.city, property.province]
    .filter(Boolean)
    .join(", ");
}

function Metric({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
      <p className="text-base font-semibold leading-none text-[#111111]">
        {value || "-"}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function PropertyCard({ property }: { property: PublicProperty }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300">
      <Link href={`/propiedades/${property.slug}`} className="block">
        <div className="relative h-56 overflow-hidden rounded-t-[1.75rem] bg-slate-100">
          {property.cover_url ? (
            <img
              src={property.cover_url}
              alt={property.title}
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#eef2f7,#d9dee5)] text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Sin imagen
            </div>
          )}

          <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#D71920] shadow-sm">
              {label(property.operation) || "Venta"}
            </span>
          </div>

          {property.apt_credit && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="rounded-full bg-[#D71920] px-4 py-2 text-xs font-semibold text-white shadow-sm">
                Apto Crédito
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D71920]">
              {label(property.property_type) || "Propiedad"}
            </p>

            {property.apt_credit && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-[#D71920]">
                Crédito
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-tight text-[#111111]">
            {property.title}
          </h3>

          <p className="mt-3 line-clamp-1 text-sm leading-6 text-slate-500">
            {getLocation(property) || "Mendoza"}
          </p>

          <p className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
            {formatPrice(property)}
          </p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <Metric value={property.bedrooms} label="Dorm." />
            <Metric value={property.bathrooms} label="Baños" />
            <Metric value={property.covered_area} label="Cub." />
            <Metric value={property.total_area} label="Total" />
          </div>

          <div className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-[#111111] text-sm font-semibold text-white transition hover:bg-[#D71920]">
            Ver propiedad
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function FeaturedProperties({
  eyebrow = "Propiedades destacadas",
  title,
  description = "Una selección curada por CL Inmobiliaria con las mejores oportunidades del momento.",
  properties,
  variant = "featured",
}: FeaturedPropertiesProps) {
  const visibleProperties = properties.slice(0, 4);

  if (!properties.length) {
    return null;
  }

  return (
    <section
      id={variant === "latest" ? "ultimas" : "destacadas"}
      className="mx-auto max-w-7xl px-6 py-14"
    >
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D71920]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#D71920]" />
            {eyebrow}
          </p>

          {title && (
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#111111] md:text-4xl">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              {description}
            </p>
          )}
        </div>

        <Link
          href="/propiedades"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-[#D71920] transition hover:border-[#D71920] hover:bg-red-50"
        >
          Ver todas →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
