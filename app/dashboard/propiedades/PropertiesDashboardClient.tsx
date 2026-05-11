"use client";

import { useMemo, useState } from "react";
import { createPropertyAction, updatePropertyAction } from "./actions";

type PropertyImage = {
  id?: string | null;
  url: string | null;
  is_cover: boolean | null;
  position: number | null;
};

export type Property = {
  id: string;
  code: string | null;
  title: string | null;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  operation: string | null;
  property_type: string | null;
  is_dalvian: boolean | null;
  status: string | null;
  price: number | null;
  currency: string | null;
  expenses?: number | null;
  has_expenses?: boolean | null;
  province?: string | null;
  city: string | null;
  neighborhood: string | null;
  address?: string | null;
  show_address?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  rooms?: number | null;
  garages?: number | null;
  garage_type?: string | null;
  covered_area?: number | null;
  total_area?: number | null;
  land_area?: number | null;
  age_years?: number | null;
  floors_count?: number | null;
  condition?: string | null;
  private_neighborhood?: boolean | null;
  apt_credit?: boolean | null;
  financing?: boolean | null;
  accepts_exchange?: boolean | null;
  accepts_pets?: boolean | null;
  has_water?: boolean | null;
  has_electricity?: boolean | null;
  has_gas?: boolean | null;
  has_internet?: boolean | null;
  energy_efficiency?: string | null;
  has_equipped_kitchen?: boolean | null;
  has_laundry?: boolean | null;
  has_air_conditioning?: boolean | null;
  has_fireplace?: boolean | null;
  has_sauna?: boolean | null;
  heating_type?: string | null;
  has_pool?: boolean | null;
  has_garden?: boolean | null;
  has_bbq?: boolean | null;
  published: boolean | null;
  featured: boolean | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  internal_notes?: string | null;
  created_at: string;
  property_images?: PropertyImage[] | null;
};

type ModalState =
  | {
      mode: "create";
      property?: null;
    }
  | {
      mode: "edit";
      property: Property;
    }
  | null;

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10";
const textareaClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10";
const checkClass =
  "flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-3 text-xs font-bold ring-1 ring-slate-100";

function getCoverImage(property: Property) {
  const images = property.property_images || [];

  return (
    images.find((image) => image.is_cover)?.url ||
    [...images].sort((a, b) => (a.position || 0) - (b.position || 0))[0]?.url ||
    null
  );
}

function formatPrice(property: Property) {
  if (!property.price) return "Consultar";

  return `${property.currency || "USD"} ${property.price.toLocaleString("es-AR")}`;
}

function label(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6 18 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getMessage(successMessage: string | null, errorMessage: string | null) {
  if (successMessage === "create") return "Propiedad creada correctamente.";
  if (successMessage === "update") return "Propiedad actualizada correctamente.";
  if (errorMessage === "title") return "El título de la propiedad es obligatorio.";
  if (errorMessage === "missing") return "Faltan datos obligatorios.";
  if (errorMessage === "update") return "No se pudo actualizar la propiedad.";
  if (errorMessage === "db") return "No se pudo guardar la propiedad.";
  if (errorMessage) return `Error: ${errorMessage}`;
  return null;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
        {title}
      </h3>
      {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
    </div>
  );
}

function PropertyFormModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const property = state?.mode === "edit" ? state.property : null;
  const mode = state?.mode || "create";
  const sortedImages = useMemo(() => {
    return [...(property?.property_images || [])].sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
  }, [property]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#D71920]">
              Propiedades
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
              {mode === "edit" ? "Editar propiedad" : "Nueva propiedad"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "edit"
                ? "Modificá los datos cargados y guardá los cambios."
                : "Cargá los datos principales, imágenes y configuración de publicación."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form
          action={mode === "edit" ? updatePropertyAction : createPropertyAction}
          className="grid gap-5 p-5"
        >
          {mode === "edit" && property && <input type="hidden" name="id" value={property.id} />}

          <SectionTitle
            title="Datos principales"
            description="Información base para identificar y publicar la propiedad."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Código</FieldLabel>
              <input name="code" className={inputClass} defaultValue={property?.code || ""} placeholder="PROP-002" />
            </div>

            <div>
              <FieldLabel>Título</FieldLabel>
              <input name="title" required className={inputClass} defaultValue={property?.title || ""} placeholder="Casa en Godoy Cruz" />
            </div>

            <div>
              <FieldLabel>Operación</FieldLabel>
              <select name="operation" className={inputClass} defaultValue={property?.operation || "venta"}>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="temporario">Alquiler temporario</option>
              </select>
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select name="property_type" className={inputClass} defaultValue={property?.property_type || "casa"}>
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="lote">Lote</option>
                <option value="local">Local comercial</option>
                <option value="cochera">Cochera</option>
                <option value="oficina">Oficina</option>
                <option value="finca">Finca</option>
                <option value="duplex">Dúplex</option>
              </select>
            </div>

            <div>
              <FieldLabel>Barrio / sección especial</FieldLabel>
              <label className="flex h-10 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-bold ring-1 ring-slate-200">
                <input name="is_dalvian" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.is_dalvian)} />
                Dalvian
              </label>
            </div>

            <div>
              <FieldLabel>Estado interno</FieldLabel>
              <select name="status" defaultValue={property?.status || "activa"} className={inputClass}>
                <option value="activa">Activa</option>
                <option value="borrador">Borrador</option>
                <option value="reservada">Reservada</option>
                <option value="vendida">Vendida</option>
                <option value="alquilada">Alquilada</option>
                <option value="pausada">Pausada</option>
              </select>
            </div>

            <div>
              <FieldLabel>Estado de conservación</FieldLabel>
              <select name="condition" className={inputClass} defaultValue={property?.condition || ""}>
                <option value="">Seleccionar</option>
                <option value="Excelente">Excelente</option>
                <option value="Muy Bueno">Muy Bueno</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="A refaccionar">A refaccionar</option>
              </select>
            </div>
          </div>

          <SectionTitle title="Precio y condiciones" description="Valores comerciales, expensas y condiciones." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Moneda</FieldLabel>
              <select name="currency" className={inputClass} defaultValue={property?.currency || "USD"}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>

            <div>
              <FieldLabel>Precio</FieldLabel>
              <input name="price" type="number" className={inputClass} defaultValue={property?.price ?? ""} placeholder="180000" />
            </div>

            <div>
              <FieldLabel>Valor de expensas</FieldLabel>
              <input name="expenses" type="number" className={inputClass} defaultValue={property?.expenses ?? ""} placeholder="50000" />
            </div>

            <div>
              <FieldLabel>Eficiencia energética</FieldLabel>
              <select name="energy_efficiency" className={inputClass} defaultValue={property?.energy_efficiency || ""}>
                <option value="">Sin informar</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>
          </div>

          <SectionTitle title="Ubicación" description="Datos de ubicación visibles e internos." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Provincia</FieldLabel>
              <input name="province" defaultValue={property?.province || "Mendoza"} className={inputClass} />
            </div>

            <div>
              <FieldLabel>Ciudad</FieldLabel>
              <input name="city" className={inputClass} defaultValue={property?.city || ""} placeholder="Godoy Cruz" />
            </div>

            <div>
              <FieldLabel>Barrio / Zona</FieldLabel>
              <input name="neighborhood" className={inputClass} defaultValue={property?.neighborhood || ""} placeholder="Bombal" />
            </div>

            <div>
              <FieldLabel>Dirección</FieldLabel>
              <input name="address" className={inputClass} defaultValue={property?.address || ""} placeholder="Dirección interna" />
            </div>

            <div>
              <FieldLabel>Latitud</FieldLabel>
              <input name="latitude" type="number" step="any" className={inputClass} defaultValue={property?.latitude ?? ""} placeholder="-32.8895" />
            </div>

            <div>
              <FieldLabel>Longitud</FieldLabel>
              <input name="longitude" type="number" step="any" className={inputClass} defaultValue={property?.longitude ?? ""} placeholder="-68.8458" />
            </div>
          </div>

          <SectionTitle title="Datos de la propiedad" description="Superficies, ambientes, dormitorios, cocheras y antigüedad." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Dormitorios</FieldLabel>
              <input name="bedrooms" type="number" className={inputClass} defaultValue={property?.bedrooms ?? ""} placeholder="3" />
            </div>

            <div>
              <FieldLabel>Baños</FieldLabel>
              <input name="bathrooms" type="number" className={inputClass} defaultValue={property?.bathrooms ?? ""} placeholder="2" />
            </div>

            <div>
              <FieldLabel>Ambientes</FieldLabel>
              <input name="rooms" type="number" className={inputClass} defaultValue={property?.rooms ?? ""} placeholder="5" />
            </div>

            <div>
              <FieldLabel>Cocheras</FieldLabel>
              <input name="garages" type="number" className={inputClass} defaultValue={property?.garages ?? ""} placeholder="2" />
            </div>

            <div>
              <FieldLabel>Tipo de cochera</FieldLabel>
              <input name="garage_type" className={inputClass} defaultValue={property?.garage_type || ""} placeholder="Garage doble / Cochera pasante" />
            </div>

            <div>
              <FieldLabel>Sup. cubierta m²</FieldLabel>
              <input name="covered_area" type="number" className={inputClass} defaultValue={property?.covered_area ?? ""} placeholder="180" />
            </div>

            <div>
              <FieldLabel>Sup. total m²</FieldLabel>
              <input name="total_area" type="number" className={inputClass} defaultValue={property?.total_area ?? ""} placeholder="450" />
            </div>

            <div>
              <FieldLabel>Sup. terreno m²</FieldLabel>
              <input name="land_area" type="number" className={inputClass} defaultValue={property?.land_area ?? ""} placeholder="520" />
            </div>

            <div>
              <FieldLabel>Antigüedad / años</FieldLabel>
              <input name="age_years" type="number" className={inputClass} defaultValue={property?.age_years ?? ""} placeholder="7" />
            </div>

            <div>
              <FieldLabel>Plantas</FieldLabel>
              <input name="floors_count" type="number" className={inputClass} defaultValue={property?.floors_count ?? ""} placeholder="1" />
            </div>
          </div>

          <SectionTitle title="Descripción comercial" description="Textos visibles en la web pública." />

          <div>
            <FieldLabel>Descripción corta</FieldLabel>
            <textarea name="short_description" rows={3} className={textareaClass} defaultValue={property?.short_description || ""} placeholder="Resumen breve para la card o encabezado." />
          </div>

          <div>
            <FieldLabel>Descripción completa</FieldLabel>
            <textarea name="description" rows={5} className={textareaClass} defaultValue={property?.description || ""} placeholder="Descripción comercial de la propiedad." />
          </div>

          <SectionTitle title="Imágenes" description="Subí una o varias imágenes. Al editar, se agregan a las ya existentes." />

          {mode === "edit" && sortedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {sortedImages.map((image, index) => (
                <div key={`${image.url}-${index}`} className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <img src={image.url || ""} alt={`Imagen ${index + 1}`} className="h-20 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div>
            <FieldLabel>Fotos</FieldLabel>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#D71920] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:bg-slate-100"
            />
          </div>

          <SectionTitle title="Publicación" description="Configuración de visibilidad y publicación en la web." />

          <div className="grid gap-3 md:grid-cols-3">
            <label className={checkClass}>
              <input name="published" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.published)} />
              Publicar en web
            </label>

            <label className={checkClass}>
              <input name="featured" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.featured)} />
              Destacada
            </label>

            <label className={checkClass}>
              <input name="show_address" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.show_address)} />
              Mostrar dirección
            </label>
          </div>

          <SectionTitle title="Datos adicionales" description="Condiciones generales, servicios y características principales." />

          <div className="grid gap-3 md:grid-cols-3">
            <label className={checkClass}><input name="private_neighborhood" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.private_neighborhood)} />Barrio privado</label>
            <label className={checkClass}><input name="apt_credit" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.apt_credit)} />Apto crédito</label>
            <label className={checkClass}><input name="has_expenses" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_expenses)} />Tiene expensas</label>
            <label className={checkClass}><input name="financing" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.financing)} />Financiación</label>
            <label className={checkClass}><input name="accepts_exchange" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.accepts_exchange)} />Recibe permuta</label>
            <label className={checkClass}><input name="accepts_pets" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.accepts_pets)} />Acepta mascotas</label>
            <label className={checkClass}><input name="has_water" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_water)} />Agua</label>
            <label className={checkClass}><input name="has_electricity" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_electricity)} />Luz</label>
            <label className={checkClass}><input name="has_gas" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_gas)} />Gas</label>
          </div>

          <SectionTitle title="Detalles interior" description="Amenities y características internas de la propiedad." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Calefacción</FieldLabel>
              <select name="heating_type" className={inputClass} defaultValue={property?.heating_type || ""}>
                <option value="">Sin informar</option>
                <option value="Radiadores">Radiadores</option>
                <option value="Losa radiante">Losa radiante</option>
                <option value="Estufa">Estufa</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={checkClass}><input name="has_equipped_kitchen" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_equipped_kitchen)} />Cocina equipada</label>
            <label className={checkClass}><input name="has_laundry" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_laundry)} />Lavandería</label>
            <label className={checkClass}><input name="has_air_conditioning" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_air_conditioning)} />Aire acondicionado</label>
            <label className={checkClass}><input name="has_fireplace" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_fireplace)} />Chimenea / Hogar</label>
            <label className={checkClass}><input name="has_sauna" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_sauna)} />Sauna</label>
            <label className={checkClass}><input name="has_internet" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_internet)} />Internet</label>
            <label className={checkClass}><input name="has_pool" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_pool)} />Piscina</label>
            <label className={checkClass}><input name="has_garden" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_garden)} />Jardín</label>
            <label className={checkClass}><input name="has_bbq" type="checkbox" className="h-4 w-4" defaultChecked={Boolean(property?.has_bbq)} />Churrasquera / Quincho</label>
          </div>

          <SectionTitle title="Datos internos" description="Información privada para gestión interna." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Nombre propietario</FieldLabel>
              <input name="owner_name" className={inputClass} defaultValue={property?.owner_name || ""} placeholder="Nombre interno" />
            </div>

            <div>
              <FieldLabel>Teléfono propietario</FieldLabel>
              <input name="owner_phone" className={inputClass} defaultValue={property?.owner_phone || ""} placeholder="+54 9 261..." />
            </div>
          </div>

          <div>
            <FieldLabel>Observaciones internas</FieldLabel>
            <textarea name="internal_notes" rows={4} className={textareaClass} defaultValue={property?.internal_notes || ""} placeholder="Notas internas que no se muestran en la web." />
          </div>

          <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#D71920] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#B9151B]"
            >
              {mode === "edit" ? "Guardar cambios" : "Guardar propiedad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PropertiesDashboardClient({
  properties,
  errorMessage,
  successMessage,
}: {
  properties: Property[];
  errorMessage: string | null;
  successMessage: string | null;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const message = getMessage(successMessage, errorMessage);

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">
            Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
            Propiedades
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Administrá las propiedades cargadas, su estado y publicación web.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#D71920] px-4 text-xs font-bold text-white transition hover:bg-[#B9151B]"
        >
          Nueva propiedad
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            errorMessage ? "bg-red-50 text-[#D71920]" : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[#111111]">
            Listado de propiedades
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {properties.length} propiedades cargadas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-[90px] whitespace-nowrap px-3 py-2.5">Código</th>
                <th className="w-[92px] whitespace-nowrap px-3 py-2.5">Imagen</th>
                <th className="whitespace-nowrap px-3 py-2.5">Propiedad</th>
                <th className="w-[110px] whitespace-nowrap px-3 py-2.5">Operación</th>
                <th className="w-[110px] whitespace-nowrap px-3 py-2.5">Tipo</th>
                <th className="w-[130px] whitespace-nowrap px-3 py-2.5">Precio</th>
                <th className="w-[105px] whitespace-nowrap px-3 py-2.5">Estado</th>
                <th className="w-[105px] whitespace-nowrap px-3 py-2.5">Web</th>
                <th className="w-[90px] whitespace-nowrap px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => {
                const coverImage = getCoverImage(property);

                return (
                  <tr key={property.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs font-bold text-slate-600">
                      {property.code || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={property.title || "Propiedad"}
                          className="h-11 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-bold uppercase tracking-wide text-slate-400 ring-1 ring-slate-200">
                          Sin foto
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <p className="max-w-[260px] truncate text-sm font-semibold text-[#111111]">
                        {property.title || "Sin título"}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <p className="max-w-[240px] truncate text-[11px] text-slate-500">
                          {[property.neighborhood, property.city].filter(Boolean).join(", ") ||
                            "Sin ubicación"}
                        </p>

                        {property.is_dalvian && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase text-[#D71920]">
                            Dalvian
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-xs capitalize text-slate-700">
                      {label(property.operation)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-xs capitalize text-slate-700">
                      {label(property.property_type)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-xs font-bold text-[#111111]">
                      {formatPrice(property)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                        {property.status || "borrador"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      {property.published ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
                          Publicada
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-700">
                          Oculta
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <button
                        type="button"
                        title="Editar propiedad"
                        aria-label="Editar propiedad"
                        onClick={() => setModal({ mode: "edit", property })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#D71920] hover:bg-red-50 hover:text-[#D71920]"
                      >
                        <EditIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {properties.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center">
                    <p className="text-base font-semibold text-[#111111]">
                      No hay propiedades cargadas
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Creá la primera propiedad desde el botón superior.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PropertyFormModal state={modal} onClose={() => setModal(null)} />
    </section>
  );
}
