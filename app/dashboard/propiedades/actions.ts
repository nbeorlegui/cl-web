"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type UserRole = "superadmin" | "admin" | "user";

type ImageOrderItem = {
  uid: string;
  kind: "existing" | "new";
  id: string | null;
  originalIndex: number | null;
  position: number;
  isCover: boolean;
  url: string | null;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function getNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value === "true") return true;
  if (value === "false") return false;

  return value === "on";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getSlug(formData: FormData) {
  const manualSlug = getString(formData, "slug");
  if (manualSlug) return slugify(manualSlug);

  const title = getString(formData, "title");
  if (title) return slugify(title);

  return null;
}

function getPropertyPayload(formData: FormData) {
  return {
    title: getString(formData, "title"),
    slug: getSlug(formData),
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
    semi_private: getBoolean(formData, "semi_private"),
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
  };
}

async function getAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: UserRole }>();

  return { supabase, user, profile };
}

function canManage(role?: UserRole | null) {
  return role === "superadmin" || role === "admin";
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

function parseImageOrder(formData: FormData): ImageOrderItem[] {
  const raw = String(formData.get("images_order") || "");

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): ImageOrderItem | null => {
        if (!item || typeof item !== "object") return null;
        if (item.kind !== "existing" && item.kind !== "new") return null;

        return {
          uid: String(item.uid || ""),
          kind: item.kind,
          id: item.id ? String(item.id) : null,
          originalIndex:
            item.originalIndex === null || item.originalIndex === undefined
              ? null
              : Number(item.originalIndex),
          position: Number(item.position || 0),
          isCover: Boolean(item.isCover),
          url: item.url ? String(item.url) : null,
        };
      })
      .filter(Boolean) as ImageOrderItem[];
  } catch {
    return [];
  }
}

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const base = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

  return `${base || "imagen"}.${extension}`;
}

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/property-images/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}


async function removeStorageFilesIfUnused(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  urls: string[]
) {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));

  if (!uniqueUrls.length) return;

  const { data: remainingImages } = await supabase
    .from("property_images")
    .select("url")
    .in("url", uniqueUrls);

  const remainingUrls = new Set(
    (remainingImages || [])
      .map((image) => String(image.url || ""))
      .filter(Boolean)
  );

  const paths = uniqueUrls
    .filter((url) => !remainingUrls.has(url))
    .map((url) => getStoragePathFromPublicUrl(url))
    .filter(Boolean) as string[];

  if (paths.length > 0) {
    await supabase.storage.from("property-images").remove(paths);
  }
}

async function deleteImagesFromStorageAndDb(
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

  const urls =
    imagesToDelete
      ?.map((image) => String(image.url || ""))
      .filter(Boolean) || [];

  await supabase
    .from("property_images")
    .delete()
    .eq("property_id", propertyId)
    .in("id", imageIds);

  await removeStorageFilesIfUnused(supabase, urls);
}

async function applyImagesOrder({
  supabase,
  propertyId,
  formData,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  propertyId: string;
  formData: FormData;
}) {
  const imageOrder = parseImageOrder(formData);
  const deletedImageIds = formData.getAll("delete_image_ids").map(String);

  await deleteImagesFromStorageAndDb(supabase, propertyId, deletedImageIds);

  const newImageIdByUid = new Map<string, string>();

  for (const item of imageOrder.filter((entry) => entry.kind === "new")) {
    if (!item.url) continue;

    const { data: insertedImage, error: imageInsertError } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        url: item.url,
        is_cover: false,
        position: item.position,
      })
      .select("id")
      .single<{ id: string }>();

    if (imageInsertError) {
      console.error("Error inserting uploaded property image:", imageInsertError);
      continue;
    }

    if (insertedImage?.id) {
      newImageIdByUid.set(item.uid, insertedImage.id);
    }
  }

  const finalOrder = imageOrder
    .map((item) => {
      if (item.kind === "existing" && item.id) {
        return {
          imageId: item.id,
          position: item.position,
          isCover: item.isCover,
        };
      }

      if (item.kind === "new") {
        const imageId = newImageIdByUid.get(item.uid);
        if (!imageId) return null;

        return {
          imageId,
          position: item.position,
          isCover: item.isCover,
        };
      }

      return null;
    })
    .filter(Boolean) as { imageId: string; position: number; isCover: boolean }[];

  if (!finalOrder.length) return;

  const hasSelectedCover = finalOrder.some((image) => image.isCover);
  const normalizedOrder = finalOrder.map((image, index) => ({
    ...image,
    position: index + 1,
    isCover: hasSelectedCover ? image.isCover : index === 0,
  }));

  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  await Promise.all(
    normalizedOrder.map((image) =>
      supabase
        .from("property_images")
        .update({
          position: image.position,
          is_cover: image.isCover,
        })
        .eq("id", image.imageId)
        .eq("property_id", propertyId)
    )
  );
}

function getDuplicatePayload(source: Record<string, unknown>, formData: FormData) {
  const title = String(source.title || "Propiedad sin título");
  const operation = getString(formData, "operation") || String(source.operation || "Venta");
  const price = getNumber(formData, "price");
  const currency = getString(formData, "currency") || String(source.currency || "USD");

  return {
    title,
    slug: `${slugify(title)}-${Date.now()}`,
    description: source.description ?? null,
    short_description: source.short_description ?? null,
    operation,
    property_type: source.property_type ?? null,
    status: "activa",
    price,
    currency,
    expenses: source.expenses ?? null,
    has_expenses: Boolean(source.has_expenses),
    province: source.province ?? null,
    city: source.city ?? null,
    neighborhood: source.neighborhood ?? null,
    address: source.address ?? null,
    show_address: Boolean(source.show_address),
    latitude: source.latitude ?? null,
    longitude: source.longitude ?? null,
    bedrooms: source.bedrooms ?? null,
    bathrooms: source.bathrooms ?? null,
    rooms: source.rooms ?? null,
    garages: source.garages ?? null,
    garage_type: source.garage_type ?? null,
    covered_area: source.covered_area ?? null,
    total_area: source.total_area ?? null,
    land_area: source.land_area ?? null,
    age_years: source.age_years ?? null,
    floors_count: source.floors_count ?? null,
    condition: source.condition ?? null,
    private_neighborhood: Boolean(source.private_neighborhood),
    semi_private: Boolean(source.semi_private),
    apt_credit: Boolean(source.apt_credit),
    furnished: Boolean(source.furnished),
    financing: Boolean(source.financing),
    accepts_exchange: Boolean(source.accepts_exchange),
    accepts_pets: Boolean(source.accepts_pets),
    has_water: Boolean(source.has_water),
    has_electricity: Boolean(source.has_electricity),
    has_gas: Boolean(source.has_gas),
    has_internet: Boolean(source.has_internet),
    energy_efficiency: source.energy_efficiency ?? null,
    has_equipped_kitchen: Boolean(source.has_equipped_kitchen),
    has_laundry: Boolean(source.has_laundry),
    has_air_conditioning: Boolean(source.has_air_conditioning),
    has_fireplace: Boolean(source.has_fireplace),
    has_sauna: Boolean(source.has_sauna),
    heating_type: source.heating_type ?? null,
    has_pool: Boolean(source.has_pool),
    has_garden: Boolean(source.has_garden),
    has_bbq: Boolean(source.has_bbq),
    published: getBoolean(formData, "published"),
    featured: getBoolean(formData, "featured"),
    is_dalvian: Boolean(source.is_dalvian),
    owner_name: source.owner_name ?? null,
    owner_phone: source.owner_phone ?? null,
    internal_notes: source.internal_notes ?? null,
  };
}

export async function createPropertyAction(formData: FormData) {
  const { supabase } = await getAuthenticatedProfile();
  const payload = getPropertyPayload(formData);

  const { data: property, error } = await supabase
    .from("properties")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error || !property?.id) {
    console.error("Error creating property:", error);
    redirect("/dashboard/propiedades?error=create");
  }

  await applyImagesOrder({ supabase, propertyId: property.id, formData });

  revalidatePath("/");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=create");
}

export async function updatePropertyAction(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile();

  if (!canManage(profile?.role)) {
    redirect("/dashboard/propiedades?error=unauthorized");
  }

  const propertyId = String(formData.get("id") || "");

  if (!propertyId) {
    redirect("/dashboard/propiedades?error=missing-id");
  }

  const payload = getPropertyPayload(formData);

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", propertyId);

  if (error) {
    console.error("Error updating property:", error);
    redirect("/dashboard/propiedades?error=update");
  }

  await applyImagesOrder({ supabase, propertyId, formData });

  revalidatePath("/");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=update");
}


export async function duplicatePropertyAction(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile();

  if (!canManage(profile?.role)) {
    redirect("/dashboard/propiedades?error=unauthorized");
  }

  const sourceId = String(formData.get("source_id") || "");

  if (!sourceId) {
    redirect("/dashboard/propiedades?error=missing-id");
  }

  const { data: sourceProperty, error: sourceError } = await supabase
    .from("properties")
    .select(
      `
      title,
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
      internal_notes
    `
    )
    .eq("id", sourceId)
    .single<Record<string, unknown>>();

  if (sourceError || !sourceProperty) {
    console.error("Error loading source property:", sourceError);
    redirect("/dashboard/propiedades?error=duplicate");
  }

  const payload = getDuplicatePayload(sourceProperty, formData);

  const { data: duplicatedProperty, error: duplicateError } = await supabase
    .from("properties")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (duplicateError || !duplicatedProperty?.id) {
    console.error("Error duplicating property:", duplicateError);
    redirect("/dashboard/propiedades?error=duplicate");
  }

  const { data: sourceImages, error: sourceImagesError } = await supabase
    .from("property_images")
    .select("url, is_cover, position")
    .eq("property_id", sourceId)
    .order("position", { ascending: true });

  if (sourceImagesError) {
    console.error("Error loading source images:", sourceImagesError);
  }

  if (sourceImages?.length) {
    const imageRows = sourceImages
      .filter((image) => image.url)
      .map((image, index) => ({
        property_id: duplicatedProperty.id,
        url: image.url,
        is_cover: Boolean(image.is_cover) || index === 0,
        position: index + 1,
      }));

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase
        .from("property_images")
        .insert(imageRows);

      if (imagesError) {
        console.error("Error duplicating images:", imagesError);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=duplicate");
}

export async function deletePropertyAction(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile();

  if (!canManage(profile?.role)) {
    redirect("/dashboard/propiedades?error=unauthorized");
  }

  const propertyId = String(formData.get("id") || "");

  if (!propertyId) {
    redirect("/dashboard/propiedades?error=missing-id");
  }

  const { data: propertyImages } = await supabase
    .from("property_images")
    .select("id, url")
    .eq("property_id", propertyId);

  const urls =
    propertyImages
      ?.map((image) => String(image.url || ""))
      .filter(Boolean) || [];

  await supabase.from("property_images").delete().eq("property_id", propertyId);
  await supabase.from("properties").delete().eq("id", propertyId);

  await removeStorageFilesIfUnused(supabase, urls);

  revalidatePath("/");
  revalidatePath("/dashboard/propiedades");
  redirect("/dashboard/propiedades?success=delete");
}
