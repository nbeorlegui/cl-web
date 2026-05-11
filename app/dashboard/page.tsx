import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold leading-5 text-slate-500">{label}</p>

      <strong className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
        {value ?? 0}
      </strong>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: propertiesCount },
    { count: leadsCount },
    { count: visitsCount },
    { count: whatsappCount },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("published", true),

    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "nuevo"),

    supabase
      .from("tracking_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "property_view"),

    supabase
      .from("tracking_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "whatsapp_click"),
  ]);

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111111]">
          Inicio
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Resumen general de propiedades, consultas y actividad del sitio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Propiedades publicadas" value={propertiesCount} />
        <KpiCard label="Consultas nuevas" value={leadsCount} />
        <KpiCard label="Visitas a propiedades" value={visitsCount} />
        <KpiCard label="Clicks WhatsApp" value={whatsappCount} />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
          Panel inicial
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Desde acá vamos a administrar propiedades, leads y estadísticas.
        </p>
      </div>
    </section>
  );
}