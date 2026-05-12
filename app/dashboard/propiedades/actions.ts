"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type UserRole = "superadmin" | "admin" | "user";
const IMAGE_BUCKET = "property-images";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length ? clean : null;
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getPropertyPayload(formData: FormData) {
  const title = getString(formData, "title") || "Propiedad sin título";

  return {
    // No enviamos code. Supabase lo genera automáticamente con trigger/sequence.
    title,
    slug: getString(formData, "slug") || slugify(title),
    description: getString(formData, "description"),
    short_description: getString(formData, "short_description"),
    operation: getString(formData, "operation"),
    property_type: getString(formData, "property_type"),
    status: getString(formData, "status") || "activa",
    price: getNumber(formData, "price"),
    currency: getString(formData, "currency") || "USD",
    expenses: getNumber(formData, "expenses"),
    has_expenses: getBoolean(formData, "has_expenses"),
    province: getString(formData, "province"),
    city: getString(formData, "city"),
    neighborhood: getString(formData, "neighborhood"),
    address: getString(formData, "address"),
    show_address: getBoolean(formData, "show_address"),
    latitude: getNumber(formData, "latitude"),
    longitude: getNumber(formData, "longitude"),
    bedrooms: getNumber(formData, "bedrooms"),
    bathrooms: getNumber(formData, "bathrooms"),
    rooms: getNumber(formData, "rooms"),
    garages: getNumber(formData, "garages"),
    garage_type: getString(formData, "garage_type"),
    covered_area: getNumber(formData, "covered_area"),
    total_area: getNumber(formData, "total_area"),
    land_area: getNumber(formData, "land_area"),
    age_years: getNumber(formData, "age_years"),
    floors_count: getNumber(formData, "floors_count"),
    condition: getString(formData, "condition"),
    private_neighborhood: getBoolean(formData, "private_neighborhood"),
    apt_credit: getBoolean(formData, "apt_credit"),
    furnished: getBoolean(formData, "furnished"),
    financing: getBoolean(formData, "financing"),
    accepts_exchange: getBoolean(formData, "accepts_exchange"),
    accepts_pets: getBoolean(formData, "accepts_pets"),
    has_water: getBoolean(formData, "has_water"),
    has_electricity: getBoolean(formData, "has_electricity"),
    has_gas: getBoolean(formData, "has_gas"),
    has_internet: getBoolean(formData, "has_internet"),
    energy_efficiency: getString(formData, "energy_efficiency"),
    has_equipped_kitchen: getBoolean(formData, "has_equipped_kitchen"),
    has_laundry: getBoolean(formData, "has_laundry"),
    has_air_conditioning: getBoolean(formData, "has_air_conditioning"),
    has_fireplace: getBoolean(formData, "has_fireplace"),
    has_sauna: getBoolean(formData, "has_sauna"),
    heating_type: getString(formData, "heating_type"),
    has_pool: getBoolean(formData, "has_pool"),
    has_garden: getBoolean(formData, "has_garden"),
    has_bbq: getBoolean(formData, "has_bbq"),
    published: getBoolean(formData, "published"),
    featured: getBoolean(formData, "featured"),
    is_dalvian: getBoolean(formData, "is_dalvian"),
    owner_name: getString(formData, "owner_name"),
    owner_phone: getString(formData, "owner_phone"),
    internal_notes: getString(formData, "internal_notes"),
    updated_at: new Date().toISOString(),
  };
}

async function getCurrentUserRole() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: UserRole }>();

  return { supabase, role: profile?.role || "user" };
}

function canManageProperties(role: UserRole) {
  return role === "superadmin" || role === "admin";
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName !== file.name) return fromName.toLowerCase();
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}


function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

async function getNextImagePosition(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string
) {
  const { data } = await supabase
    .from("property_images")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.position || 0) + 1;
}

async function propertyHasCover(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string
) {
  const { data } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId)
    .eq("is_cover", true)
    .limit(1)
    .maybeSingle();

  return Boolean(data?.id);
}

async function ensureOneCover(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string
) {
  const hasCover = await propertyHasCover(supabase, propertyId);

  if (hasCover) return;

  const { data: firstImage } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstImage?.id) {
    await supabase
      .from("property_images")
      .update({ is_cover: true })
      .eq("id", firstImage.id)
      .eq("property_id", propertyId);
  }
}

async function deletePropertyImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string,
  imageIds: string[]
) {
  if (!imageIds.length) return;

  const { data: imagesToDelete } = await supabase
    .from("property_images")
    .select("id, url")
    .eq("property_id", propertyId)
    .in("id", imageIds);

  const storagePaths =
    imagesToDelete
      ?.map((image: { url: string | null }) => storagePathFromPublicUrl(image.url))
      .filter((path): path is string => Boolean(path)) || [];

  if (storagePaths.length) {
    await supabase.storage.from(IMAGE_BUCKET).remove(storagePaths);
  }

  await supabase
    .from("property_images")
    .delete()
    .eq("property_id", propertyId)
    .in("id", imageIds);
}

async function setExistingCover(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string,
  imageId: string
) {
  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("property_id", propertyId);
}

async function uploadPropertyImages({
  supabase,
  propertyId,
  files,
  newCoverIndex,
  forceNewCover,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  propertyId: string;
  files: File[];
  newCoverIndex: number | null;
  forceNewCover: boolean;
}) {
  if (!files.length) return;

  if (forceNewCover || newCoverIndex !== null) {
    await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", propertyId);
  }

  const hasCoverBeforeUpload = await propertyHasCover(supabase, propertyId);
  let position = await getNextImagePosition(supabase, propertyId);
  const rows = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const extension = getFileExtension(file);
    const safeName = file.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const filePath = `${propertyId}/${Date.now()}-${index}-${safeName || `imagen.${extension}`}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || `image/${extension}`,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

    rows.push({
      property_id: propertyId,
      url: data.publicUrl,
      is_cover:
        newCoverIndex !== null
          ? newCoverIndex === index
          : !hasCoverBeforeUpload && index === 0,
      position,
    });

    position += 1;
  }

  if (rows.length) {
    const { error } = await supabase.from("property_images").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function createPropertyAction(formData: FormData) {
  const { supabase } = await getCurrentUserRole();

  const { data: property, error } = await supabase
    .from("properties")
    .insert({ ...getPropertyPayload(formData), created_at: new Date().toISOString() })
    .select("id")
    .single<{ id: string }>();

  if (error || !property) {
    redirect(`/dashboard/propiedades?error=${encodeURIComponent(error?.message || "create-error")}`);
  }

  const files = getImageFiles(formData);
  const newCoverIndexRaw = getString(formData, "new_cover_index");
  const newCoverIndex =
    newCoverIndexRaw !== null && Number.isFinite(Number(newCoverIndexRaw))
      ? Number(newCoverIndexRaw)
      : null;

  await uploadPropertyImages({
    supabase,
    propertyId: property.id,
    files,
    newCoverIndex,
    forceNewCover: true,
  });

  await ensureOneCover(supabase, property.id);

  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=create");
}

export async function updatePropertyAction(formData: FormData) {
  const { supabase, role } = await getCurrentUserRole();
  if (!canManageProperties(role)) redirect("/dashboard/propiedades?error=unauthorized");

  const id = getString(formData, "id");
  if (!id) redirect("/dashboard/propiedades?error=missing-id");

  const payload = getPropertyPayload(formData);
  const { error } = await supabase.from("properties").update(payload).eq("id", id);
  if (error) redirect(`/dashboard/propiedades?error=${encodeURIComponent(error.message)}`);

  const coverImageId = getString(formData, "cover_image_id");
  const deleteImageIds = formData.getAll("delete_image_ids").map(String);
  const newCoverIndexRaw = getString(formData, "new_cover_index");
  const newCoverIndex =
    newCoverIndexRaw !== null && Number.isFinite(Number(newCoverIndexRaw))
      ? Number(newCoverIndexRaw)
      : null;

  await deletePropertyImages(supabase, id, deleteImageIds);

  if (coverImageId && !deleteImageIds.includes(coverImageId)) {
    await setExistingCover(supabase, id, coverImageId);
  }

  await uploadPropertyImages({
    supabase,
    propertyId: id,
    files: getImageFiles(formData),
    newCoverIndex,
    forceNewCover: newCoverIndex !== null,
  });

  await ensureOneCover(supabase, id);

  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${payload.slug}`);
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=update");
}

export async function deletePropertyAction(formData: FormData) {
  const { supabase, role } = await getCurrentUserRole();
  if (!canManageProperties(role)) redirect("/dashboard/propiedades?error=unauthorized");

  const id = getString(formData, "id");
  if (!id) redirect("/dashboard/propiedades?error=missing-id");

  const { data: propertyImages } = await supabase
    .from("property_images")
    .select("url")
    .eq("property_id", id);

  const storagePaths =
    propertyImages
      ?.map((image: { url: string | null }) => storagePathFromPublicUrl(image.url))
      .filter((path): path is string => Boolean(path)) || [];

  if (storagePaths.length) {
    await supabase.storage.from(IMAGE_BUCKET).remove(storagePaths);
  }

  await supabase.from("property_images").delete().eq("property_id", id);
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) redirect(`/dashboard/propiedades?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=delete");
}
