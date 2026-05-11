import Image from "next/image";
import Link from "next/link";

export type PublicProperty = {
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
  apt_credit: boolean | null;
};

type FeaturedPropertiesProps = {
  properties: PublicProperty[];
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: "featured" | "latest" | "dalvian";
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

function PropertyCard({ property }: { property: PublicProperty }) {
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  const detailUrl = property.slug
    ? `/propiedades/${property.slug}`
    : "/propiedades";

  return (
    <article className="group flex h-full min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="relative h-[235px] overflow-hidden bg-slate-100">
        {property.cover_url ? (
          <Image
            src={property.cover_url}
            alt={property.title || "Propiedad"}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-300">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Sin imagen
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#D71920] shadow-sm">
            {formatOperation(property.operation)}
          </span>
        </div>

        {property.apt_credit && (
          <div className="absolute bottom-4 left-4 z-10">
            <span className="rounded-full bg-[#D71920] px-4 py-2 text-xs font-bold text-white shadow-sm">
              Apto Crédito
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
          {formatPropertyType(property.property_type)}
        </p>

        <h3 className="mt-3 line-clamp-2 min-h-[52px] text-[20px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#111111]">
          {property.title || "Propiedad sin título"}
        </h3>

        <p className="mt-3 min-h-[22px] truncate text-sm font-medium text-slate-500">
          {location || "Ubicación a confirmar"}
        </p>

        <p className="mt-6 text-[27px] font-semibold leading-none tracking-[-0.04em] text-[#111111]">
          {property.currency || "USD"} {formatPrice(property.price)}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <div className="flex h-[56px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {property.bedrooms || "-"}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Dorm.
            </span>
          </div>

          <div className="flex h-[56px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {property.bathrooms || "-"}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Baños
            </span>
          </div>

          <div className="flex h-[56px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
            <strong className="text-sm font-semibold leading-none text-[#111111]">
              {formatArea(property.covered_area)}
            </strong>
            <span className="mt-1 text-[10px] font-semibold text-slate-500">
              Cub.
            </span>
          </div>

          <div className="flex h-[56px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-1">
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
          className="mt-auto flex h-12 items-center justify-center rounded-2xl bg-[#111111] text-sm font-bold text-white transition hover:bg-[#D71920]"
        >
          Ver propiedad
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedProperties({
  properties,
  eyebrow = "Propiedades destacadas",
  title,
  description = "Una selección curada por CL Inmobiliaria con las mejores oportunidades del momento.",
  variant = "featured",
}: FeaturedPropertiesProps) {
  const visibleProperties = properties.slice(0, 4);

  if (!visibleProperties.length) {
    return (
      <section
        id={variant === "latest" ? "ultimas" : "destacadas"}
        className="scroll-mt-28 bg-white px-6 py-16 md:px-10 lg:px-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
              {eyebrow}
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
              Todavía no hay propiedades para mostrar
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Cargá propiedades desde el panel para mostrarlas acá.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={variant === "latest" ? "ultimas" : "destacadas"}
      className="scroll-mt-28 bg-white px-6 py-16 md:px-10 lg:px-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D71920]/20 bg-[#D71920]/5 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#D71920]" />

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
                {eyebrow}
              </p>
            </div>

            {title && (
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                {title}
              </h2>
            )}

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              {description}
            </p>
          </div>

          <Link
            href="/propiedades"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-[#D71920] transition hover:border-[#D71920] hover:bg-[#D71920] hover:text-white"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}