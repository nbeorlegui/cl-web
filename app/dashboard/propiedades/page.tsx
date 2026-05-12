import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PropertiesDashboardClient, { type Property, type UserRole } from "./PropertiesDashboardClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

type Profile = { role: UserRole };

export default async function DashboardPropertiesPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Profile>();

  const { data: properties, error } = await supabase
    .from("properties")
    .select(`
      id, code, title, slug, description, short_description,
      operation, property_type, status, price, currency, expenses, has_expenses,
      province, city, neighborhood, address, show_address, latitude, longitude,
      bedrooms, bathrooms, rooms, garages, garage_type,
      covered_area, total_area, land_area, age_years, floors_count, condition,
      private_neighborhood, apt_credit, financing, accepts_exchange, accepts_pets,
      has_water, has_electricity, has_gas, has_internet, energy_efficiency,
      has_equipped_kitchen, has_laundry, has_air_conditioning, has_fireplace,
      has_sauna, heating_type, has_pool, has_garden, has_bbq,
      published, featured, is_dalvian,
      owner_name, owner_phone, internal_notes, created_at,
      property_images (id, url, is_cover, position)
    `)
    .order("created_at", { ascending: false });

  const successMessage =
    params?.success === "create"
      ? "Propiedad creada correctamente."
      : params?.success === "update"
      ? "Propiedad actualizada correctamente."
      : params?.success === "delete"
      ? "Propiedad eliminada correctamente."
      : null;

  const actionErrorMessage =
    params?.error === "unauthorized"
      ? "No tenés permisos para realizar esta acción."
      : params?.error === "missing-id"
      ? "No se encontró la propiedad seleccionada."
      : params?.error
      ? decodeURIComponent(params.error)
      : null;

  return (
    <PropertiesDashboardClient
      properties={(properties || []) as Property[]}
      errorMessage={error?.message || actionErrorMessage}
      successMessage={successMessage}
      currentUserRole={profile?.role || "user"}
    />
  );
}
