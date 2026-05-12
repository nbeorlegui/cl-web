"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createPropertyAction, deletePropertyAction, updatePropertyAction } from "./actions";

export type UserRole = "superadmin" | "admin" | "user";

type PropertyImage = {
  id: string;
  url: string | null;
  is_cover: boolean | null;
  position: number | null;
};

export type Property = {
  id: string;
  code: string | null;
  title: string | null;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  operation: string | null;
  property_type: string | null;
  status: string | null;
  price: number | null;
  currency: string | null;
  expenses: number | null;
  has_expenses: boolean | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  show_address: boolean | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rooms: number | null;
  garages: number | null;
  garage_type: string | null;
  covered_area: number | null;
  total_area: number | null;
  land_area: number | null;
  age_years: number | null;
  floors_count: number | null;
  condition: string | null;
  private_neighborhood: boolean | null;
  apt_credit: boolean | null;
  financing: boolean | null;
  accepts_exchange: boolean | null;
  accepts_pets: boolean | null;
  has_water: boolean | null;
  has_electricity: boolean | null;
  has_gas: boolean | null;
  has_internet: boolean | null;
  energy_efficiency: string | null;
  has_equipped_kitchen: boolean | null;
  has_laundry: boolean | null;
  has_air_conditioning: boolean | null;
  has_fireplace: boolean | null;
  has_sauna: boolean | null;
  heating_type: string | null;
  has_pool: boolean | null;
  has_garden: boolean | null;
  has_bbq: boolean | null;
  published: boolean | null;
  featured: boolean | null;
  is_dalvian: boolean | null;
  owner_name: string | null;
  owner_phone: string | null;
  internal_notes: string | null;
  created_at: string;
  property_images?: PropertyImage[] | null;
};

type Props = {
  properties: Property[];
  errorMessage: string | null;
  successMessage: string | null;
  currentUserRole: UserRole;
};

function formatPrice(value: number | null, currency: string | null) {
  if (!value) return "-";
  return `${currency || "USD"} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function getSortedImages(property: Property) {
  return [...(property.property_images || [])]
    .filter((image) => image.url)
    .sort((a, b) => (a.position || 999) - (b.position || 999));
}

function getCoverImage(property: Property) {
  const images = getSortedImages(property);
  return images.find((image) => image.is_cover && image.url)?.url || images[0]?.url || null;
}

function textValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function CheckField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean | null }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
      <input type="checkbox" name={name} defaultChecked={Boolean(defaultChecked)} className="h-4 w-4 accent-[#D71920]" />
      {label}
    </label>
  );
}

function InputField({ label, name, defaultValue, type = "text", placeholder }: { label: string; name: string; defaultValue?: string | number | null; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={textValue(defaultValue)}
        placeholder={placeholder}
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
      />
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string | null; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function PropertiesDashboardClient({ properties, errorMessage, successMessage, currentUserRole }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<string | null>(null);

  const canManageProperties = currentUserRole === "superadmin" || currentUserRole === "admin";
  const orderedProperties = useMemo(() => properties, [properties]);

  function openCreateModal() {
    setEditingProperty(null);
    setSelectedCoverImageId(null);
    setIsFormOpen(true);
  }

  function openEditModal(property: Property) {
    if (!canManageProperties) return;

    const sortedImages = getSortedImages(property);
    const currentCover =
      sortedImages.find((image) => image.is_cover)?.id || sortedImages[0]?.id || null;

    setSelectedCoverImageId(currentCover);
    setEditingProperty(property);
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setEditingProperty(null);
    setSelectedCoverImageId(null);
    setIsFormOpen(false);
  }

  function openDeleteModal(property: Property) {
    if (!canManageProperties) return;
    setPropertyToDelete(property);
  }

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">Propiedades</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Administrá las propiedades cargadas, su estado y publicación web.</p>
        </div>

        <button type="button" onClick={openCreateModal} className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#D71920] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B9151B]">
          Nueva propiedad
        </button>
      </div>

      {successMessage && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</div>}
      {errorMessage && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-[#D71920]">{errorMessage}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">Listado de propiedades</h2>
          <p className="mt-1 text-sm text-slate-500">{orderedProperties.length} propiedades cargadas</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Propiedad</th>
                <th className="px-4 py-3">Operación</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Web</th>
                {canManageProperties && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orderedProperties.map((property) => {
                const coverImage = getCoverImage(property);

                return (
                  <tr key={property.id} className="align-middle">
                    <td className="px-4 py-3 text-sm font-bold text-slate-600">{property.code || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-20 overflow-hidden rounded-xl bg-slate-100">
                        {coverImage ? <Image src={coverImage} alt={property.title || "Propiedad"} fill className="object-cover" sizes="80px" /> : <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase text-slate-400">Sin img</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[290px] text-sm font-semibold leading-5 text-[#111111]">{property.title || "Sin título"}</p>
                      <p className="mt-1 max-w-[290px] truncate text-xs text-slate-500">{[property.neighborhood, property.city].filter(Boolean).join(", ") || "Sin ubicación"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{property.operation || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{property.property_type || "-"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111111]">{formatPrice(property.price, property.currency)}</td>
                    <td className="px-4 py-3"><span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">{property.status || "Activa"}</span></td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${property.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{property.published ? "Publicada" : "Oculta"}</span></td>
                    {canManageProperties && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditModal(property)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]" title="Editar propiedad">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                          </button>
                          <button type="button" onClick={() => openDeleteModal(property)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#D71920] transition hover:bg-[#D71920] hover:text-white" title="Eliminar propiedad">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!orderedProperties.length && (
                <tr><td colSpan={canManageProperties ? 9 : 8} className="px-4 py-10 text-center text-sm text-slate-500">Todavía no hay propiedades cargadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">{editingProperty ? "Editar propiedad" : "Nueva propiedad"}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">{editingProperty ? editingProperty.title || "Propiedad" : "Crear propiedad"}</h2>
              </div>
              <button type="button" onClick={closeFormModal} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#D71920] hover:text-[#D71920]">×</button>
            </div>

            <form action={editingProperty ? updatePropertyAction : createPropertyAction} className="space-y-5 p-5">
              {editingProperty && (
                <>
                  <input type="hidden" name="id" value={editingProperty.id} />
                  <input type="hidden" name="cover_image_id" value={selectedCoverImageId || ""} />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Código</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{editingProperty.code || "Se genera automáticamente"}</p>
                  </div>
                </>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <InputField label="Título" name="title" defaultValue={editingProperty?.title} placeholder="Ej: Casa moderna en Chacras" />
                <InputField label="Slug" name="slug" defaultValue={editingProperty?.slug} placeholder="Se genera con el título si queda vacío" />
                <SelectField label="Estado" name="status" defaultValue={editingProperty?.status || "activa"} options={[{ label: "Activa", value: "activa" }, { label: "Reservada", value: "reservada" }, { label: "Vendida", value: "vendida" }, { label: "Alquilada", value: "alquilada" }, { label: "Inactiva", value: "inactiva" }]} />
                <SelectField label="Operación" name="operation" defaultValue={editingProperty?.operation || "Venta"} options={[{ label: "Venta", value: "Venta" }, { label: "Alquiler", value: "Alquiler" }]} />
                <SelectField label="Tipo" name="property_type" defaultValue={editingProperty?.property_type || "Casa"} options={[{ label: "Casa", value: "Casa" }, { label: "Departamento", value: "Departamento" }, { label: "Dúplex", value: "Dúplex" }, { label: "Lote", value: "Lote" }, { label: "Terreno", value: "Terreno" }, { label: "Local", value: "Local" }, { label: "Finca", value: "Finca" }]} />
                <SelectField label="Moneda" name="currency" defaultValue={editingProperty?.currency || "USD"} options={[{ label: "USD", value: "USD" }, { label: "ARS", value: "ARS" }]} />
                <InputField label="Precio" name="price" type="number" defaultValue={editingProperty?.price} />
                <InputField label="Expensas" name="expenses" type="number" defaultValue={editingProperty?.expenses} />
                <InputField label="Provincia" name="province" defaultValue={editingProperty?.province || "Mendoza"} />
                <InputField label="Ciudad" name="city" defaultValue={editingProperty?.city} />
                <InputField label="Barrio/Zona" name="neighborhood" defaultValue={editingProperty?.neighborhood} />
                <InputField label="Dirección" name="address" defaultValue={editingProperty?.address} />
                <InputField label="Latitud" name="latitude" type="number" defaultValue={editingProperty?.latitude} />
                <InputField label="Longitud" name="longitude" type="number" defaultValue={editingProperty?.longitude} />
                <InputField label="Dormitorios" name="bedrooms" type="number" defaultValue={editingProperty?.bedrooms} />
                <InputField label="Baños" name="bathrooms" type="number" defaultValue={editingProperty?.bathrooms} />
                <InputField label="Ambientes" name="rooms" type="number" defaultValue={editingProperty?.rooms} />
                <InputField label="Cocheras" name="garages" type="number" defaultValue={editingProperty?.garages} />
                <InputField label="Tipo cochera" name="garage_type" defaultValue={editingProperty?.garage_type} />
                <InputField label="Sup. cubierta" name="covered_area" type="number" defaultValue={editingProperty?.covered_area} />
                <InputField label="Sup. total" name="total_area" type="number" defaultValue={editingProperty?.total_area} />
                <InputField label="Terreno" name="land_area" type="number" defaultValue={editingProperty?.land_area} />
                <InputField label="Antigüedad" name="age_years" type="number" defaultValue={editingProperty?.age_years} />
                <InputField label="Plantas" name="floors_count" type="number" defaultValue={editingProperty?.floors_count} />
                <InputField label="Estado conservación" name="condition" defaultValue={editingProperty?.condition} />
                <InputField label="Eficiencia energética" name="energy_efficiency" defaultValue={editingProperty?.energy_efficiency} />
                <InputField label="Calefacción" name="heating_type" defaultValue={editingProperty?.heating_type} />
                <InputField label="Propietario" name="owner_name" defaultValue={editingProperty?.owner_name} />
                <InputField label="Teléfono propietario" name="owner_phone" defaultValue={editingProperty?.owner_phone} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Descripción corta</span><textarea name="short_description" defaultValue={textValue(editingProperty?.short_description)} rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10" /></label>
                <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Notas internas</span><textarea name="internal_notes" defaultValue={textValue(editingProperty?.internal_notes)} rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10" /></label>
                <label className="md:col-span-2"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Descripción</span><textarea name="description" defaultValue={textValue(editingProperty?.description)} rows={7} className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10" /></label>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Configuración</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <CheckField label="Publicar en web" name="published" defaultChecked={editingProperty?.published} />
                  <CheckField label="Destacada" name="featured" defaultChecked={editingProperty?.featured} />
                  <CheckField label="Dalvian" name="is_dalvian" defaultChecked={editingProperty?.is_dalvian} />
                  <CheckField label="Mostrar dirección" name="show_address" defaultChecked={editingProperty?.show_address} />
                  <CheckField label="Tiene expensas" name="has_expenses" defaultChecked={editingProperty?.has_expenses} />
                  <CheckField label="Barrio privado" name="private_neighborhood" defaultChecked={editingProperty?.private_neighborhood} />
                  <CheckField label="Apto crédito" name="apt_credit" defaultChecked={editingProperty?.apt_credit} />
                  <CheckField label="Financiación" name="financing" defaultChecked={editingProperty?.financing} />
                  <CheckField label="Permuta" name="accepts_exchange" defaultChecked={editingProperty?.accepts_exchange} />
                  <CheckField label="Acepta mascotas" name="accepts_pets" defaultChecked={editingProperty?.accepts_pets} />
                  <CheckField label="Agua" name="has_water" defaultChecked={editingProperty?.has_water} />
                  <CheckField label="Electricidad" name="has_electricity" defaultChecked={editingProperty?.has_electricity} />
                  <CheckField label="Gas" name="has_gas" defaultChecked={editingProperty?.has_gas} />
                  <CheckField label="Internet" name="has_internet" defaultChecked={editingProperty?.has_internet} />
                  <CheckField label="Cocina equipada" name="has_equipped_kitchen" defaultChecked={editingProperty?.has_equipped_kitchen} />
                  <CheckField label="Lavandería" name="has_laundry" defaultChecked={editingProperty?.has_laundry} />
                  <CheckField label="Aire acondicionado" name="has_air_conditioning" defaultChecked={editingProperty?.has_air_conditioning} />
                  <CheckField label="Chimenea" name="has_fireplace" defaultChecked={editingProperty?.has_fireplace} />
                  <CheckField label="Sauna" name="has_sauna" defaultChecked={editingProperty?.has_sauna} />
                  <CheckField label="Piscina" name="has_pool" defaultChecked={editingProperty?.has_pool} />
                  <CheckField label="Jardín" name="has_garden" defaultChecked={editingProperty?.has_garden} />
                  <CheckField label="Churrasquera" name="has_bbq" defaultChecked={editingProperty?.has_bbq} />
                </div>
              </div>

              <div>
                <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Imágenes</span><input name="images" type="file" accept="image/*" multiple className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#D71920] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" /></label>
                {editingProperty?.property_images?.length ? (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Imágenes cargadas
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Elegí cuál imagen será la portada visible en la publicación.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {getSortedImages(editingProperty).map((image) => {
                        const isSelectedCover = selectedCoverImageId === image.id;

                        return (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedCoverImageId(image.id)}
                            className={`group relative h-28 overflow-hidden rounded-2xl border bg-slate-100 text-left transition ${
                              isSelectedCover
                                ? "border-[#D71920] ring-4 ring-[#D71920]/15"
                                : "border-transparent hover:border-[#D71920]/50"
                            }`}
                            title="Usar como portada"
                          >
                            <Image
                              src={image.url || ""}
                              alt="Imagen propiedad"
                              fill
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                              sizes="240px"
                            />

                            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />

                            {isSelectedCover ? (
                              <span className="absolute left-2 top-2 rounded-full bg-[#D71920] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
                                Portada
                              </span>
                            ) : (
                              <span className="absolute left-2 top-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#111111] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
                                Usar portada
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white py-4">
                <button type="button" onClick={closeFormModal} className="h-10 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]">Cancelar</button>
                <button type="submit" className="h-10 rounded-2xl bg-[#D71920] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B9151B]">{editingProperty ? "Guardar cambios" : "Crear propiedad"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">Eliminar propiedad</p>
            <h2 className="mt-3 text-xl font-semibold text-[#111111]">¿Eliminar esta propiedad?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Esta acción quitará la propiedad del panel y del sitio web.</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#111111]">{propertyToDelete.title || "Propiedad sin título"}</p>
              <p className="mt-1 text-xs text-slate-500">{propertyToDelete.code || "Sin código"}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setPropertyToDelete(null)} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]">Cancelar</button>
              <form action={deletePropertyAction}>
                <input type="hidden" name="id" value={propertyToDelete.id} />
                <button type="submit" className="h-10 rounded-2xl bg-[#D71920] px-4 text-sm font-bold text-white transition hover:bg-[#B9151B]">Eliminar</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
