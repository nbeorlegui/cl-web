import { createSupabaseServerClient } from "@/lib/supabase-server";
import FeaturedProperties from "@/components/public/FeaturedProperties";
import DalvianSection from "@/components/public/DalvianSection";
import Footer from "@/components/public/Footer";
import HomeHero from "@/components/public/HomeHero";
import PublicHeader from "@/components/public/PublicHeader";

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
  total_area: number | null;
  covered_area: number | null;
  featured: boolean | null;
  is_dalvian: boolean | null;
  apt_credit: boolean | null;
  property_images?: PropertyImage[] | null;
};

export type PublicProperty = {
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
  total_area: number | null;
  covered_area: number | null;
  cover_url: string | null;
  apt_credit: boolean | null;
};

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
    total_area: property.total_area,
    covered_area: property.covered_area,
    cover_url: cover,
    apt_credit: property.apt_credit,
  };
}

async function getPublicHomeData() {
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
    total_area,
    covered_area,
    featured,
    is_dalvian,
    apt_credit,
    property_images (
      url,
      is_cover,
      position
    )
  `;

  const [featuredResult, dalvianResult, latestResult] = await Promise.all([
    supabase
      .from("properties")
      .select(selectFields)
      .eq("published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("properties")
      .select(selectFields)
      .eq("published", true)
      .eq("is_dalvian", true)
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("properties")
      .select(selectFields)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(9),
  ]);

  if (featuredResult.error) {
    console.error("Error loading featured properties:", featuredResult.error);
  }

  if (dalvianResult.error) {
    console.error("Error loading Dalvian properties:", dalvianResult.error);
  }

  if (latestResult.error) {
    console.error("Error loading latest properties:", latestResult.error);
  }

  return {
    featured: ((featuredResult.data || []) as PropertyRow[]).map(
      normalizeProperty
    ),
    dalvian: ((dalvianResult.data || []) as PropertyRow[]).map(
      normalizeProperty
    ),
    latest: ((latestResult.data || []) as PropertyRow[]).map(normalizeProperty),
  };
}

export default async function HomePage() {
  const { featured, dalvian, latest } = await getPublicHomeData();

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <PublicHeader />

      <HomeHero />

      <FeaturedProperties properties={featured} />

      <DalvianSection properties={dalvian} />

      <FeaturedProperties
        eyebrow="Últimas publicaciones"
        title="Nuevas oportunidades"
        description="Propiedades recientemente cargadas en nuestra cartera."
        properties={latest}
        variant="latest"
      />

      <section id="contacto" className="mx-auto max-w-6xl px-6 py-16">
        <div className="overflow-hidden rounded-[2rem] bg-[#111111] p-8 text-white shadow-xl md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D71920]">
                Contacto directo
              </p>

              <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                ¿Querés coordinar una visita o tasar tu propiedad?
              </h2>

              <p className="mt-4 max-w-2xl text-white/70">
                Escribinos y te ayudamos a encontrar la mejor opción según tu
                presupuesto, zona y objetivo de inversión.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <a
                href="https://wa.me/5492610000000"
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-2xl bg-[#D71920] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#B9151B] md:w-auto"
              >
                Contactar por WhatsApp
              </a>

              <a
                href="/dashboard"
                className="w-full rounded-2xl border border-white/15 px-6 py-4 text-center font-bold text-white/85 transition hover:bg-white/10 md:w-auto"
              >
                Acceso dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
