import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import Footer from "@/components/public/Footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type PropertyImage = {
  id?: string | null;
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
  address?: string | null;
  price: number | null;
  currency: string | null;
  operation: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  covered_area: number | null;
  total_area: number | null;
  description?: string | null;
  short_description?: string | null;
  published?: boolean | null;
  featured?: boolean | null;
  is_dalvian?: boolean | null;

  antiquity?: number | null;
  floors?: number | null;
  rooms?: number | null;
  garages?: number | string | null;
  expenses?: number | null;
  has_expenses?: boolean | null;
  private_neighborhood?: boolean | null;
  mortgage_credit?: boolean | null;
  financing?: boolean | null;
  conservation_state?: string | null;

  water?: boolean | null;
  electricity?: boolean | null;
  gas?: boolean | null;
  internet?: boolean | null;
  heating?: string | null;

  equipped_kitchen?: boolean | null;
  laundry?: boolean | null;
  fireplace?: boolean | null;
  air_conditioning?: boolean | null;
  sauna?: boolean | null;

  property_images?: PropertyImage[] | null;

  [key: string]: unknown;
};

type PageParams = Promise<{
  slug: string;
}>;

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function label(value: string | number | null | undefined) {
  if (!hasValue(value)) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

function getLocation(property: PropertyRow) {
  return [property.neighborhood, property.city, property.province]
    .filter(Boolean)
    .join(", ");
}

function getImages(property: PropertyRow) {
  const images = property.property_images || [];

  return [...images]
    .filter((image) => Boolean(image.url))
    .sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      return (a.position || 0) - (b.position || 0);
    });
}

function getWhatsAppUrl(property: PropertyRow) {
  const phone = "5492610000000";
  const message = encodeURIComponent(
    `Hola, quiero consultar por la propiedad: ${property.title || "Propiedad"}`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

function MetricItem({
  icon,
  value,
  text,
}: {
  icon: ReactNode;
  value: string | number | null | undefined;
  text: string;
}) {
  if (!hasValue(value)) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400">
        {icon}
      </div>

      <div className="leading-none">
        <p className="text-base font-bold text-slate-600">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  name,
  value,
  shaded = false,
}: {
  name: string;
  value: string | number | null | undefined;
  shaded?: boolean;
}) {
  if (!hasValue(value)) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3 ${
        shaded ? "bg-slate-50" : "bg-white"
      }`}
    >
      <span className="text-sm text-slate-600">{name}</span>
      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function DetailCheckRow({
  name,
  active,
  shaded = false,
}: {
  name: string;
  active?: boolean | null;
  shaded?: boolean;
}) {
  if (active === undefined || active === null) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3 ${
        shaded ? "bg-slate-50" : "bg-white"
      }`}
    >
      <span className="text-sm text-slate-600">{name}</span>
      <span
        className={`text-sm font-semibold ${
          active ? "text-[#D71920]" : "text-slate-400"
        }`}
      >
        {active ? "Sí" : "No"}
      </span>
    </div>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M4 10V6M4 14h16M20 14v4M4 14v4M6 10h5c1.4 0 2.5 1.1 2.5 2.5V14H4v-2a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 10H18a2 2 0 0 1 2 2v2h-6.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M7 11V7a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14v2a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 20l-1 2M16 20l1 2M13 7h3"
        stroke="#D71920"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GarageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M4 11l8-6 8 6M6 10v9M18 10v9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15h8l1 2v2H7v-2l1-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 17h.01M15 17h.01"
        stroke="#D71920"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AreaCoveredIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 12h7v7h-7v-7Z" stroke="#D71920" strokeWidth="1.5" />
      <path
        d="M13 18l5-5M13 15l2-2M16 19l3-3"
        stroke="#D71920"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function AreaTotalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M5 5h14v14H5V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeDasharray="2 2"
      />
      <path
        d="M3 5h1M3 19h1M5 3v1M19 3v1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

async function getProperty(slug: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_images (
        id,
        url,
        is_cover,
        position
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;

  return data as PropertyRow;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) notFound();

  const images = getImages(property);
  const cover = images[0]?.url || null;
  const gallery = images.slice(1, 5);
  const location = getLocation(property);

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <PublicHeader />

      <section className="mx-auto max-w-[1360px] px-4 py-8 lg:px-6">
        {/* BREADCRUMB */}
        <div className="mb-6 text-sm font-semibold text-slate-500">
          <Link href="/" className="text-[#D71920] hover:underline">
            Inicio
          </Link>
          <span className="mx-1">›</span>
          <Link href="/propiedades" className="text-[#D71920] hover:underline">
            Propiedades
          </Link>
          <span className="mx-1">›</span>
          <span>{property.title || "Detalle"}</span>
        </div>

        {/* CHIPS */}
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-[#FFF5F5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#D71920]">
            {label(property.operation || "Venta")}
          </span>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            {label(property.property_type || "Propiedad")}
          </span>

          {property.featured && (
            <span className="rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Destacada
            </span>
          )}

          {property.is_dalvian && (
            <span className="rounded-full bg-[#D71920] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Dalvian
            </span>
          )}
        </div>

        {/* HEADER */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight md:text-4xl">
                {property.title || "Propiedad sin título"}
              </h1>

              <p className="mt-4 text-xl font-semibold text-slate-600">
                {location || "Mendoza"}
              </p>

              {property.address && (
                <p className="mt-2 text-sm text-slate-500">{property.address}</p>
              )}
            </div>

            <div className="shrink-0 lg:w-[280px] lg:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Precio
              </p>

              <p className="mt-1 text-3xl font-semibold leading-none text-[#D71920]">
                {formatPrice(property.price, property.currency)}
              </p>

              <a
                href={getWhatsAppUrl(property)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#D71920] px-5 text-sm font-semibold text-white transition hover:bg-[#B9151B]"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* GALERÍA */}
        <div className="mt-5 grid gap-2 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-l-[18px] bg-slate-100 lg:h-[450px]">
            {cover ? (
              <img
                src={cover}
                alt={property.title || "Propiedad"}
                className="h-[300px] w-full object-cover lg:h-full"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 lg:h-full">
                Sin imagen
              </div>
            )}

            <button
              type="button"
              className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm"
              aria-label="Compartir"
            >
              ↗
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:h-[450px]">
            {[0, 1, 2, 3].map((index) => {
              const image = gallery[index];

              return (
                <div
                  key={index}
                  className={`relative overflow-hidden bg-slate-100 ${
                    index === 1 ? "rounded-tr-[18px]" : ""
                  } ${index === 3 ? "rounded-br-[18px]" : ""}`}
                >
                  {image?.url ? (
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 2}`}
                      className="h-[150px] w-full object-cover lg:h-full"
                    />
                  ) : (
                    <div className="flex h-[150px] items-center justify-center border border-dashed border-slate-300 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400 lg:h-full">
                      {index === 0 ? "Galería" : "Más imágenes"}
                    </div>
                  )}

                  {index === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <button
                        type="button"
                        className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#111111]"
                      >
                        Ver todas las fotos
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-b border-slate-200 pb-6">
          <MetricItem
            icon={<BedIcon />}
            value={property.bedrooms}
            text="Dorm."
          />

          <MetricItem
            icon={<BathIcon />}
            value={property.bathrooms}
            text="Baños"
          />

          <MetricItem
            icon={<GarageIcon />}
            value={property.garages}
            text="Garage"
          />

          <MetricItem
            icon={<AreaCoveredIcon />}
            value={
              hasValue(property.covered_area)
                ? `${property.covered_area} m²`
                : null
            }
            text="Cub."
          />

          <MetricItem
            icon={<AreaTotalIcon />}
            value={
              hasValue(property.total_area)
                ? `${property.total_area} m²`
                : null
            }
            text="Total"
          />
        </div>

        {/* CONTENIDO EN 2 COLUMNAS */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* IZQUIERDA */}
          <div className="min-w-0">
            {/* DESCRIPCIÓN */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-[#111111]">
                Descripción
              </h2>

              <div className="mt-4 max-w-4xl whitespace-pre-line text-[15px] leading-8 text-slate-600">
                {property.description ||
                  property.short_description ||
                  "Sin descripción disponible."}
              </div>
            </section>

            {/* TABLAS IZQUIERDA */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-[#111111]">
                  Datos de la propiedad
                </h2>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <DetailRow
                    name="Tipo de construcción"
                    value={label(property.property_type)}
                    shaded
                  />
                  <DetailRow
                    name="Condición"
                    value={label(property.operation)}
                  />
                  <DetailRow
                    name="Dormitorios"
                    value={property.bedrooms}
                    shaded
                  />
                  <DetailRow name="Baños" value={property.bathrooms} />
                  <DetailRow
                    name="Cochera"
                    value={property.garages}
                    shaded
                  />
                  <DetailRow
                    name="Superficie cubierta"
                    value={
                      hasValue(property.covered_area)
                        ? `${property.covered_area} m²`
                        : null
                    }
                  />
                  <DetailRow
                    name="Superficie total"
                    value={
                      hasValue(property.total_area)
                        ? `${property.total_area} m²`
                        : null
                    }
                    shaded
                  />
                  <DetailRow name="Ambientes" value={property.rooms} />
                  <DetailRow
                    name="Plantas"
                    value={property.floors}
                    shaded
                  />
                  <DetailRow
                    name="Antigüedad"
                    value={
                      hasValue(property.antiquity)
                        ? `${property.antiquity} años`
                        : null
                    }
                  />
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#111111]">
                  Detalles interiores
                </h2>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <DetailCheckRow
                    name="Cocina equipada"
                    active={property.equipped_kitchen}
                    shaded
                  />
                  <DetailCheckRow
                    name="Lavandería"
                    active={property.laundry}
                  />
                  <DetailCheckRow
                    name="Chimenea / hogar"
                    active={property.fireplace}
                    shaded
                  />
                  <DetailCheckRow
                    name="Aire acondicionado"
                    active={property.air_conditioning}
                  />
                  <DetailCheckRow
                    name="Sauna"
                    active={property.sauna}
                    shaded
                  />
                  <DetailRow name="Calefacción" value={property.heating} />
                  <DetailCheckRow
                    name="Internet"
                    active={property.internet}
                    shaded
                  />
                  <DetailCheckRow name="Agua" active={property.water} />
                  <DetailCheckRow
                    name="Luz"
                    active={property.electricity}
                    shaded
                  />
                  <DetailCheckRow name="Gas" active={property.gas} />
                  <DetailCheckRow
                    name="Tiene expensas"
                    active={property.has_expenses}
                    shaded
                  />
                  <DetailRow
                    name="Valor de expensas"
                    value={
                      hasValue(property.expenses)
                        ? formatPrice(Number(property.expenses), property.currency)
                        : null
                    }
                  />
                  <DetailCheckRow
                    name="Barrio privado"
                    active={property.private_neighborhood}
                    shaded
                  />
                  <DetailCheckRow
                    name="Apto crédito hipotecario"
                    active={property.mortgage_credit}
                  />
                  <DetailCheckRow
                    name="Financiación"
                    active={property.financing}
                    shaded
                  />
                  <DetailRow
                    name="Estado de conservación"
                    value={property.conservation_state}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* DERECHA */}
          <aside className="min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-28">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Contacto
              </p>

              <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#111111]">
                ¿Te interesa esta propiedad?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Recibí más información o coordiná una visita.
              </p>

              <div className="mt-5 grid gap-3">
                <a
                  href={getWhatsAppUrl(property)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#D71920] px-4 text-sm font-semibold text-white transition hover:bg-[#B9151B]"
                >
                  WhatsApp
                </a>

                <Link
                  href="/#contacto"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                >
                  Ir al contacto
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}