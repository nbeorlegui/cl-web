"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function toNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const safeName = slugify(nameWithoutExtension) || "imagen";
  return `${safeName}.${extension}`;
}

export async function createPropertyAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") || "").trim();

  if (!title) {
    redirect("/dashboard/propiedades/nueva?error=title");
  }

  const slugBase = slugify(title);
  const slug = `${slugBase}-${Date.now()}`;

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      code: String(formData.get("code") || "").trim() || null,
      title,
      slug,

      description: String(formData.get("description") || "").trim() || null,
      short_description:
        String(formData.get("short_description") || "").trim() || null,

      operation: String(formData.get("operation") || "venta"),
      property_type: String(formData.get("property_type") || "casa"),
      is_dalvian: formData.get("is_dalvian") === "on",
      status: String(formData.get("status") || "activa"),

      price: toNumber(formData.get("price")),
      currency: String(formData.get("currency") || "USD"),
      expenses: toNumber(formData.get("expenses")),
      has_expenses: formData.get("has_expenses") === "on",

      province: String(formData.get("province") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      neighborhood: String(formData.get("neighborhood") || "").trim() || null,
      address: String(formData.get("address") || "").trim() || null,
      show_address: formData.get("show_address") === "on",
      latitude: toNumber(formData.get("latitude")),
      longitude: toNumber(formData.get("longitude")),

      bedrooms: toNumber(formData.get("bedrooms")),
      bathrooms: toNumber(formData.get("bathrooms")),
      rooms: toNumber(formData.get("rooms")),
      garages: toNumber(formData.get("garages")),
      garage_type: String(formData.get("garage_type") || "").trim() || null,

      covered_area: toNumber(formData.get("covered_area")),
      total_area: toNumber(formData.get("total_area")),
      land_area: toNumber(formData.get("land_area")),

      age_years: toNumber(formData.get("age_years")),
      floors_count: toNumber(formData.get("floors_count")),
      condition: String(formData.get("condition") || "").trim() || null,

      private_neighborhood: formData.get("private_neighborhood") === "on",
      apt_credit: formData.get("apt_credit") === "on",
      financing: formData.get("financing") === "on",
      accepts_exchange: formData.get("accepts_exchange") === "on",
      accepts_pets: formData.get("accepts_pets") === "on",

      has_water: formData.get("has_water") === "on",
      has_electricity: formData.get("has_electricity") === "on",
      has_gas: formData.get("has_gas") === "on",
      has_internet: formData.get("has_internet") === "on",

      energy_efficiency:
        String(formData.get("energy_efficiency") || "").trim() || null,

      has_equipped_kitchen: formData.get("has_equipped_kitchen") === "on",
      has_laundry: formData.get("has_laundry") === "on",
      has_air_conditioning: formData.get("has_air_conditioning") === "on",
      has_fireplace: formData.get("has_fireplace") === "on",
      has_sauna: formData.get("has_sauna") === "on",
      heating_type: String(formData.get("heating_type") || "").trim() || null,

      has_pool: formData.get("has_pool") === "on",
      has_garden: formData.get("has_garden") === "on",
      has_bbq: formData.get("has_bbq") === "on",

      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",

      owner_name: String(formData.get("owner_name") || "").trim() || null,
      owner_phone: String(formData.get("owner_phone") || "").trim() || null,
      internal_notes: String(formData.get("internal_notes") || "").trim() || null,

      created_by: user.id,
      assigned_to: user.id,
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    console.error("Error creating property:", propertyError);
    redirect("/dashboard/propiedades/nueva?error=db");
  }

  const imageFiles = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const imageRows = [];

  for (let index = 0; index < imageFiles.length; index++) {
    const file = imageFiles[index];

    if (!file.type.startsWith("image/")) {
      continue;
    }

    const safeFileName = sanitizeFileName(file.name);
    const filePath = `${property.id}/${Date.now()}-${index}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(filePath);

    imageRows.push({
      property_id: property.id,
      url: publicUrlData.publicUrl,
      path: filePath,
      alt: title,
      position: index,
      is_cover: index === 0,
    });
  }

  if (imageRows.length > 0) {
    const { error: imagesError } = await supabase
      .from("property_images")
      .insert(imageRows);

    if (imagesError) {
      console.error("Error saving property images:", imagesError);
    }
  }

  redirect("/dashboard/propiedades");
}
