import Image from "next/image";
import Link from "next/link";
import type { PublicProperty } from "@/app/page";

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Consultar";

  return `${currency || "USD"} ${price.toLocaleString("es-AR")}`;
}

function formatLocation(property: PublicProperty) {
  return [property.neighborhood, property.city, property.province]
    .filter(Boolean)
    .join(", ");
}

export default function PropertyCard({ property }: { property: PublicProperty }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <Link href={`/propiedades/${property.slug}`} className="block">
        <div className="relative h-60 overflow-hidden bg-slate-100">
          {property.cover_url ? (
            <Image
              src={property.cover_url}
              alt={property.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f1f5f9,#e5e7eb)]">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Sin imagen
              </span>
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-[#D71920] shadow-sm backdrop-blur">
            {property.operation || "propiedad"}
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D71920]">
            {property.property_type || "propiedad"}
          </p>

          <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-xl font-semibold leading-tight text-[#111111]">
            {property.title}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {formatLocation(property) || "Mendoza"}
          </p>

          <p className="mt-4 text-2xl font-semibold text-[#111111]">
            {formatPrice(property.price, property.currency)}
          </p>

          <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs text-slate-500">
            <div className="rounded-2xl bg-slate-50 p-3">
              <strong className="block text-base text-[#111111]">
                {property.bedrooms ?? "-"}
              </strong>
              Dorm.
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <strong className="block text-base text-[#111111]">
                {property.bathrooms ?? "-"}
              </strong>
              Baños
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <strong className="block text-base text-[#111111]">
                {property.covered_area ?? "-"}
              </strong>
              Cub.
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <strong className="block text-base text-[#111111]">
                {property.total_area ?? "-"}
              </strong>
              Total
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
