import { createSupabaseServerClient } from "@/lib/supabase-server";
import PropertiesDashboardClient, { type Property, type UserRole } from "./PropertiesDashboardClient";

export const dynamic = "force-dynamic";

function getSuccessMessage(value?: string) {
  if (value === "create") return "Propiedad creada correctamente.";
  if (value === "update") return "Propiedad actualizada correctamente.";
  if (value === "delete") return "Propiedad eliminada correctamente.";
  return null;
}

function getErrorMessage(value?: string) {
  if (value === "unauthorized") return "No tenés permisos para realizar esta acción.";
  if (value === "missing-id") return "No se encontró la propiedad solicitada.";
  if (value === "save") return "No se pudo guardar la propiedad.";
  if (value === "delete") return "No se pudo eliminar la propiedad.";
  return null;
}

export default async function DashboardPropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single<{ role: UserRole }>()
    : { data: null };

  const { data: properties, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      code,
      title,
      slug,
      description,
      short_description,
      operation,
      property_type,
      status,
      price,
      currency,
      expenses,
      has_expenses,
      province,
      city,
      neighborhood,
      address,
      show_address,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      rooms,
      garages,
      garage_type,
      covered_area,
      total_area,
      land_area,
      age_years,
      floors_count,
      condition,
      private_neighborhood,
      semi_private,
      apt_credit,
      furnished,
      financing,
      accepts_exchange,
      accepts_pets,
      has_water,
      has_electricity,
      has_gas,
      has_internet,
      energy_efficiency,
      has_equipped_kitchen,
      has_laundry,
      has_air_conditioning,
      has_fireplace,
      has_sauna,
      heating_type,
      has_pool,
      has_garden,
      has_bbq,
      published,
      featured,
      is_dalvian,
      owner_name,
      owner_phone,
      internal_notes,
      created_at,
      property_images (
        id,
        url,
        is_cover,
        position
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <PropertiesDashboardClient
      properties={(properties || []) as Property[]}
      errorMessage={error?.message || getErrorMessage(params.error)}
      successMessage={getSuccessMessage(params.success)}
      currentUserRole={profile?.role || "user"}
    />
  );
}
