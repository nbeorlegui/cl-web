"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "property-images";

type UserRole = "superadmin" | "admin" | "user";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function getNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;

  const number = Number(value);
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

function getPropertyPayload(formData: FormData) {
  const title = getString(formData, "title");
  const manualSlug = getString(formData, "slug");

  return {
    title,
    slug: manualSlug || (title ? slugify(title) : null),
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

async function getCurrentRole() {
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

  return profile?.role || "user";
}

function canManage(role: UserRole) {
  return role === "superadmin" || role === "admin";
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getStoragePathFromUrl(url: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const path = url.slice(markerIndex + marker.length);
  return decodeURIComponent(path.split("?")[0] || "");
}

async function uploadImagesForProperty({
  supabase,
  propertyId,
  formData,
  forceNewCover,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  propertyId: string;
  formData: FormData;
  forceNewCover: boolean;
}) {
  const files = getImageFiles(formData);
  const skippedIndexes = formData.getAll("skip_new_image_indexes").map(String);
  const newCoverIndexRaw = String(formData.get("new_cover_index") || "");
  const newCoverIndex = newCoverIndexRaw !== "" ? Number(newCoverIndexRaw) : null;

  if (!files.length) return;

  const { data: existingImages } = await supabase
    .from("property_images")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1);

  let nextPosition = Number(existingImages?.[0]?.position || 0) + 1;

  if (forceNewCover || newCoverIndex !== null) {
    await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", propertyId);
  }

  for (const [index, file] of files.entries()) {
    if (skippedIndexes.includes(String(index))) continue;

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${index}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;
    const filePath = `${propertyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const isCover = newCoverIndex === index || (forceNewCover && index === 0);

    const { error: imageError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      url: publicUrlData.publicUrl,
      is_cover: isCover,
      position: nextPosition,
    });

    if (imageError) {
      throw imageError;
    }

    nextPosition += 1;
  }
}

export async function createPropertyAction(formData: FormData) {
  const role = await getCurrentRole();
  const supabase = await createSupabaseServerClient();

  try {
    const payload = getPropertyPayload(formData);

    const { data: property, error } = await supabase
      .from("properties")
      .insert(payload)
      .select("id")
      .single<{ id: string }>();

    if (error || !property) {
      throw error || new Error("No se pudo crear la propiedad.");
    }

    await uploadImagesForProperty({
      supabase,
      propertyId: property.id,
      formData,
      forceNewCover: true,
    });

    redirect("/dashboard/propiedades?success=create");
  } catch (error) {
    console.error("createPropertyAction error:", error);
    redirect("/dashboard/propiedades?error=save");
  }
}

export async function updatePropertyAction(formData: FormData) {
  const role = await getCurrentRole();

  if (!canManage(role)) {
    redirect("/dashboard/propiedades?error=unauthorized");
  }

  const supabase = await createSupabaseServerClient();
  const propertyId = String(formData.get("id") || "");

  if (!propertyId) {
    redirect("/dashboard/propiedades?error=missing-id");
  }

  try {
    const payload = getPropertyPayload(formData);

    const { error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", propertyId);

    if (error) throw error;

    const deleteImageIds = formData.getAll("delete_image_ids").map(String);

    if (deleteImageIds.length > 0) {
      const { data: imagesToDelete } = await supabase
        .from("property_images")
        .select("id, url")
        .eq("property_id", propertyId)
        .in("id", deleteImageIds);

      const storagePaths =
        imagesToDelete
          ?.map((image) => getStoragePathFromUrl(image.url))
          .filter((value): value is string => Boolean(value)) || [];

      if (storagePaths.length > 0) {
        await supabase.storage.from(BUCKET).remove(storagePaths);
      }

      const { error: deleteImagesError } = await supabase
        .from("property_images")
        .delete()
        .eq("property_id", propertyId)
        .in("id", deleteImageIds);

      if (deleteImagesError) throw deleteImagesError;
    }

    const coverImageId = String(formData.get("cover_image_id") || "");
    const newCoverIndexRaw = String(formData.get("new_cover_index") || "");
    const hasNewCover = newCoverIndexRaw !== "";

    if (coverImageId) {
      await supabase
        .from("property_images")
        .update({ is_cover: false })
        .eq("property_id", propertyId);

      await supabase
        .from("property_images")
        .update({ is_cover: true })
        .eq("id", coverImageId)
        .eq("property_id", propertyId);
    }

    await uploadImagesForProperty({
      supabase,
      propertyId,
      formData,
      forceNewCover: hasNewCover,
    });

    // Si se eliminó la portada y no se eligió otra, dejamos la primera disponible como portada.
    if (!coverImageId && !hasNewCover) {
      const { data: currentCover } = await supabase
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .eq("is_cover", true)
        .maybeSingle<{ id: string }>();

      if (!currentCover) {
        const { data: firstImage } = await supabase
          .from("property_images")
          .select("id")
          .eq("property_id", propertyId)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle<{ id: string }>();

        if (firstImage) {
          await supabase
            .from("property_images")
            .update({ is_cover: true })
            .eq("id", firstImage.id)
            .eq("property_id", propertyId);
        }
      }
    }

    redirect("/dashboard/propiedades?success=update");
  } catch (error) {
    console.error("updatePropertyAction error:", error);
    redirect("/dashboard/propiedades?error=save");
  }
}

export async function deletePropertyAction(formData: FormData) {
  const role = await getCurrentRole();

  if (!canManage(role)) {
    redirect("/dashboard/propiedades?error=unauthorized");
  }

  const supabase = await createSupabaseServerClient();
  const propertyId = String(formData.get("id") || "");

  if (!propertyId) {
    redirect("/dashboard/propiedades?error=missing-id");
  }

  try {
    const { data: images } = await supabase
      .from("property_images")
      .select("url")
      .eq("property_id", propertyId);

    const storagePaths =
      images
        ?.map((image) => getStoragePathFromUrl(image.url))
        .filter((value): value is string => Boolean(value)) || [];

    if (storagePaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(storagePaths);
    }

    await supabase.from("property_images").delete().eq("property_id", propertyId);

    const { error } = await supabase.from("properties").delete().eq("id", propertyId);

    if (error) throw error;

    redirect("/dashboard/propiedades?success=delete");
  } catch (error) {
    console.error("deletePropertyAction error:", error);
    redirect("/dashboard/propiedades?error=delete");
  }
}
