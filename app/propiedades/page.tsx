import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import Footer from "@/components/public/Footer";
import SearchSidebar from "@/components/public/SearchSidebar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type PropertyImage = {
  url: string | null;
  is_cover: boolean | null;
  position: number | null;
};

type PropertyRow = {
  id: string;
  title: string | null;
  slug: string | null;
  city: string | null;
  province: string | null;
  neighborhood: string | null;
  price: number | null;
  currency: string | null;
  operation: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  covered_area: number | null;
  total_area: number | null;
  published: boolean | null;
  featured: boolean | null;
  is_dalvian: boolean | null;
  property_images?: PropertyImage[] | null;
};

type PublicProperty = {
  id: string;
  title: string;
  slug: string;
  city: string | null;
  province: string | null;
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
};

type SearchParams = Promise<{
  tipo?: string;
  operacion?: string;
  localidad?: string;
  moneda?: string;
  precio_desde?: string;
  precio_hasta?: string;
}>;

function normalizeText(value: string) {
  return value.trim().replaceAll(",", " ").replaceAll("%", "");
}

function normalizeProperty(property: PropertyRow): PublicProperty {
  const images = property.property_images || [];

  const cover =
    images.find((image) => image.is_cover)?.url ||
    [...images].sort((a, b) => (a.position || 0) - (b.position || 0))[0]?.url ||
    null;

  return {
    id: property.id,
    title: property.title || "Propiedad sin título",
    slug: property.slug || property.id,
    city: property.city,
    province: property.province,
    neighborhood: property.neighborhood,
    price: property.price,
    currency: property.currency,
    operation: property.operation,
    property_type: property.property_type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    covered_area: property.covered_area,
    total_area: property.total_area,
    cover_url: cover,
  };
}

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Consultar";

  const code = currency === "ARS" ? "ARS" : "USD";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(price);
}

function getLocation(property: PublicProperty) {
  return [property.neighborhood, property.city, property.province]
    .filter(Boolean)
    .join(", ");
}

async function getFilteredProperties(params: Awaited<SearchParams>) {
  const supabase = await createSupabaseServerClient();

  const selectFields = `
    id,
    title,
    slug,
    city,
    province,
    neighborhood,
    price,
    currency,
    operation,
    property_type,
    bedrooms,
    bathrooms,
    covered_area,
    total_area,
    published,
    featured,
    is_dalvian,
    property_images (
      url,
      is_cover,
      position
    )
  `;

  let query = supabase
    .from("properties")
    .select(selectFields)
    .eq("published", true)
    .order("created_at", { ascending: false });

  const tipo = params.tipo;
  const operacion = params.operacion;
  const localidad = params.localidad ? normalizeText(params.localidad) : "";
  const moneda = params.moneda;
  const precioDesde = Number(params.precio_desde || 0);
  const precioHasta = Number(params.precio_hasta || 0);

  if (tipo) {
    query = query.eq("property_type", tipo);
  }

  if (operacion === "destacadas") {
    query = query.eq("featured", true);
  } else if (operacion === "dalvian") {
    query = query.eq("is_dalvian", true);
  } else if (operacion) {
    query = query.eq("operation", operacion);
  }

  if (moneda === "USD" || moneda === "ARS") {
    query = query.eq("currency", moneda);
  }

  if (precioDesde > 0) {
    query = query.gte("price", precioDesde);
  }

  if (precioHasta > 0) {
    query = query.lte("price", precioHasta);
  }

  if (localidad) {
    query = query.or(
      `city.ilike.%${localidad}%,province.ilike.%${localidad}%,neighborhood.ilike.%${localidad}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error buscando propiedades:", error);
    return [];
  }

  return ((data || []) as PropertyRow[]).map(normalizeProperty);
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const properties = await getFilteredProperties(params);

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <PublicHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D71920]">
            Propiedades
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Resultados de búsqueda
              </h1>

              <p className="mt-3 text-slate-600">
                {properties.length === 1
                  ? "1 propiedad encontrada"
                  : `${properties.length} propiedades encontradas`}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-8 px-6 py-8 lg:grid-cols-[410px_1fr] lg:px-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SearchSidebar />
        </div>

        <div>
          {properties.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center">
              <h2 className="text-2xl font-semibold">
                No encontramos propiedades con esos filtros
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Probá cambiando la localidad, moneda o rango de precios.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => {
                const location = getLocation(property);

                return (
                  <article
                    key={property.id}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#D71920]/35"
                  >
                    <div className="relative h-[190px] overflow-hidden bg-slate-100">
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

                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#D71920]">
                        {property.operation || "Venta"}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D71920]">
                        {property.property_type || "Propiedad"}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-[1.2rem] font-semibold leading-tight">
                        {property.title}
                      </h3>

                      <p className="mt-2 min-h-[40px] text-sm leading-5 text-slate-600">
                        {location || "Mendoza"}
                      </p>

                      <p className="mt-3 text-[1.6rem] font-semibold leading-none">
                        {formatPrice(property.price, property.currency)}
                      </p>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                          <p className="text-sm font-semibold">
                            {property.bedrooms ?? "-"}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Dorm.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                          <p className="text-sm font-semibold">
                            {property.bathrooms ?? "-"}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Baños
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                          <p className="text-sm font-semibold">
                            {property.covered_area ?? "-"}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Cub.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
                          <p className="text-sm font-semibold">
                            {property.total_area ?? "-"}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Total
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/propiedades/${property.slug}`}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#D71920]"
                      >
                        Ver propiedad
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}