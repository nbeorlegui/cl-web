import Link from "next/link";
import { createPropertyAction } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10";
const textareaClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10";
const checkClass =
  "flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold ring-1 ring-slate-100";

export default async function NewPropertyPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/dashboard/propiedades"
          className="mb-5 inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          ← Volver a propiedades
        </Link>

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#D71920]">
          Propiedades
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[#111111]">
          Nueva propiedad
        </h1>

        <p className="mt-2 text-slate-500">
          Cargá los datos principales de la propiedad, imágenes, detalles y
          configuración de publicación.
        </p>
      </div>

      <form
        action={createPropertyAction}
        encType="multipart/form-data"
        className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <div>
          <h2 className="text-xl font-semibold text-[#111111]">Datos principales</h2>
          <p className="mt-1 text-sm text-slate-500">
            Información base para identificar y publicar la propiedad.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          
          <div>
            <label className="mb-2 block text-sm font-bold">Título</label>
            <input
              name="title"
              required
              className={inputClass}
              placeholder="Casa en Godoy Cruz"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Operación</label>
            <select name="operation" className={inputClass}>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="temporario">Alquiler temporario</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Tipo</label>
            <select name="property_type" className={inputClass}>
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
            <label className="mb-2 block text-sm font-bold">
              Barrio / sección especial
            </label>
            <label className="flex h-12 items-center gap-3 rounded-2xl bg-slate-50 px-4 font-bold ring-1 ring-slate-200">
              <input name="is_dalvian" type="checkbox" className="h-5 w-5" />
              Dalvian
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Estado interno</label>
            <select name="status" defaultValue="activa" className={inputClass}>
              <option value="activa">Activa</option>
              <option value="borrador">Borrador</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
              <option value="pausada">Pausada</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Estado de conservación
            </label>
            <select name="condition" className={inputClass}>
              <option value="">Seleccionar</option>
              <option value="Excelente">Excelente</option>
              <option value="Muy Bueno">Muy Bueno</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="A refaccionar">A refaccionar</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">
            Precio y condiciones
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Valores comerciales, expensas y condiciones de financiación.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">Moneda</label>
            <select name="currency" className={inputClass}>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Precio</label>
            <input
              name="price"
              type="number"
              className={inputClass}
              placeholder="180000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Valor de expensas
            </label>
            <input
              name="expenses"
              type="number"
              className={inputClass}
              placeholder="50000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Eficiencia energética
            </label>
            <select name="energy_efficiency" className={inputClass}>
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

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Ubicación</h2>
          <p className="mt-1 text-sm text-slate-500">
            Datos de ubicación visibles e internos de la propiedad.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">Provincia</label>
            <input name="province" defaultValue="Mendoza" className={inputClass} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Ciudad</label>
            <input name="city" className={inputClass} placeholder="Godoy Cruz" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Barrio / Zona</label>
            <input name="neighborhood" className={inputClass} placeholder="Bombal" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Dirección</label>
            <input
              name="address"
              className={inputClass}
              placeholder="Dirección interna"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Latitud</label>
            <input
              name="latitude"
              type="number"
              step="any"
              className={inputClass}
              placeholder="-32.8895"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Longitud</label>
            <input
              name="longitude"
              type="number"
              step="any"
              className={inputClass}
              placeholder="-68.8458"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">
            Datos de la propiedad
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Superficies, ambientes, dormitorios, cocheras y antigüedad.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">Dormitorios</label>
            <input name="bedrooms" type="number" className={inputClass} placeholder="3" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Baños</label>
            <input name="bathrooms" type="number" className={inputClass} placeholder="2" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Ambientes</label>
            <input name="rooms" type="number" className={inputClass} placeholder="5" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Cocheras</label>
            <input name="garages" type="number" className={inputClass} placeholder="2" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Tipo de cochera</label>
            <input
              name="garage_type"
              className={inputClass}
              placeholder="Garage doble / Cochera pasante"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Sup. cubierta m²</label>
            <input name="covered_area" type="number" className={inputClass} placeholder="180" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Sup. total m²</label>
            <input name="total_area" type="number" className={inputClass} placeholder="450" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Sup. terreno m²</label>
            <input name="land_area" type="number" className={inputClass} placeholder="520" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Antigüedad / años</label>
            <input name="age_years" type="number" className={inputClass} placeholder="7" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Plantas</label>
            <input name="floors_count" type="number" className={inputClass} placeholder="1" />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">
            Descripción comercial
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Textos visibles en la web pública.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Descripción corta</label>
          <textarea
            name="short_description"
            rows={3}
            className={textareaClass}
            placeholder="Resumen breve para la card o encabezado."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Descripción completa</label>
          <textarea
            name="description"
            rows={6}
            className={textareaClass}
            placeholder="Descripción comercial de la propiedad."
          />
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Imágenes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Subí una o varias imágenes. La primera imagen será tomada como
            principal.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Fotos</label>
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[#D71920] file:px-4 file:py-2 file:font-bold file:text-white hover:bg-slate-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            Formatos recomendados: JPG, PNG o WEBP. Ideal subir imágenes
            horizontales y livianas.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Publicación</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configuración de visibilidad y publicación en la web.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className={checkClass}>
            <input name="published" type="checkbox" className="h-5 w-5" />
            Publicar en web
          </label>

          <label className={checkClass}>
            <input name="featured" type="checkbox" className="h-5 w-5" />
            Destacada
          </label>

          <label className={checkClass}>
            <input name="show_address" type="checkbox" className="h-5 w-5" />
            Mostrar dirección
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Datos adicionales</h2>
          <p className="mt-1 text-sm text-slate-500">
            Condiciones generales, servicios y características principales.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className={checkClass}>
            <input name="private_neighborhood" type="checkbox" className="h-5 w-5" />
            Barrio privado
          </label>

          <label className={checkClass}>
            <input name="apt_credit" type="checkbox" className="h-5 w-5" />
            Apto crédito hipotecario
          </label>

          <label className={checkClass}>
            <input name="has_expenses" type="checkbox" className="h-5 w-5" />
            Tiene expensas
          </label>

          <label className={checkClass}>
            <input name="financing" type="checkbox" className="h-5 w-5" />
            Financiación
          </label>

          <label className={checkClass}>
            <input name="accepts_exchange" type="checkbox" className="h-5 w-5" />
            Recibe permuta
          </label>

          <label className={checkClass}>
            <input name="accepts_pets" type="checkbox" className="h-5 w-5" />
            Acepta mascotas
          </label>

          <label className={checkClass}>
            <input name="has_water" type="checkbox" className="h-5 w-5" />
            Agua
          </label>

          <label className={checkClass}>
            <input name="has_electricity" type="checkbox" className="h-5 w-5" />
            Luz
          </label>

          <label className={checkClass}>
            <input name="has_gas" type="checkbox" className="h-5 w-5" />
            Gas
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Detalles interior</h2>
          <p className="mt-1 text-sm text-slate-500">
            Amenities y características internas de la propiedad.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">Calefacción</label>
            <select name="heating_type" className={inputClass}>
              <option value="">Sin informar</option>
              <option value="Radiadores">Radiadores</option>
              <option value="Losa radiante">Losa radiante</option>
              <option value="Estufa">Estufa</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className={checkClass}>
            <input name="has_equipped_kitchen" type="checkbox" className="h-5 w-5" />
            Cocina equipada
          </label>

          <label className={checkClass}>
            <input name="has_laundry" type="checkbox" className="h-5 w-5" />
            Lavandería
          </label>

          <label className={checkClass}>
            <input name="has_air_conditioning" type="checkbox" className="h-5 w-5" />
            Aire acondicionado
          </label>

          <label className={checkClass}>
            <input name="has_fireplace" type="checkbox" className="h-5 w-5" />
            Chimenea / Hogar
          </label>

          <label className={checkClass}>
            <input name="has_sauna" type="checkbox" className="h-5 w-5" />
            Sauna
          </label>

          <label className={checkClass}>
            <input name="has_internet" type="checkbox" className="h-5 w-5" />
            Internet
          </label>

          <label className={checkClass}>
            <input name="has_pool" type="checkbox" className="h-5 w-5" />
            Piscina
          </label>

          <label className={checkClass}>
            <input name="has_garden" type="checkbox" className="h-5 w-5" />
            Jardín
          </label>

          <label className={checkClass}>
            <input name="has_bbq" type="checkbox" className="h-5 w-5" />
            Churrasquera / Quincho
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-[#111111]">Datos internos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Información privada para gestión interna.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">Nombre propietario</label>
            <input name="owner_name" className={inputClass} placeholder="Nombre interno" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Teléfono propietario</label>
            <input name="owner_phone" className={inputClass} placeholder="+54 9 261..." />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Observaciones internas</label>
          <textarea
            name="internal_notes"
            rows={4}
            className={textareaClass}
            placeholder="Notas internas que no se muestran en la web."
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:justify-end">
          <Link
            href="/dashboard/propiedades"
            className="rounded-2xl border border-slate-200 px-6 py-3 text-center font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-2xl bg-[#D71920] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#B9151B]"
          >
            Guardar propiedad
          </button>
        </div>
      </form>
    </section>
  );
}
