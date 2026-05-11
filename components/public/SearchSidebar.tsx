"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function formatMoney(value: number, currency: "USD" | "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SearchSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [propertyType, setPropertyType] = useState(
    searchParams.get("tipo") || "casa"
  );
  const [operation, setOperation] = useState(
    searchParams.get("operacion") || "venta"
  );
  const [location, setLocation] = useState(searchParams.get("localidad") || "");
  const [currency, setCurrency] = useState<"USD" | "ARS">(
    searchParams.get("moneda") === "ARS" ? "ARS" : "USD"
  );
  const [minPrice, setMinPrice] = useState(
    Number(searchParams.get("precio_desde") || 0)
  );
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("precio_hasta") || 0)
  );

  const limits = useMemo(() => {
    if (currency === "USD") {
      return { min: 0, max: 1000000, step: 10000 };
    }

    return { min: 0, max: 500000000, step: 1000000 };
  }, [currency]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (propertyType) params.set("tipo", propertyType);
    if (operation) params.set("operacion", operation);
    if (location.trim()) params.set("localidad", location.trim());
    if (currency) params.set("moneda", currency);
    if (minPrice > 0) params.set("precio_desde", String(minPrice));
    if (maxPrice > 0) params.set("precio_hasta", String(maxPrice));

    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <aside className="w-full max-w-[410px] rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:max-w-[410px]">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#D71920]">
            Buscar
          </p>

          <h3 className="mt-2 text-[1.75rem] font-semibold leading-[1.05] text-[#111111] md:text-[1.95rem]">
            Encontrá tu próxima propiedad
          </h3>

          <p className="mt-2 text-[13px] leading-5 text-slate-500">
            Filtrá por tipo, operación, localidad y rango de precio.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-bold text-slate-700">
                Tipo
              </label>

              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none transition focus:border-[#D71920]"
              >
                <option value="casa">Casas</option>
                <option value="departamento">Departamentos</option>
                <option value="lote">Lotes</option>
                <option value="local">Locales comerciales</option>
                <option value="oficina">Oficinas</option>
                <option value="finca">Fincas</option>
                <option value="duplex">Dúplex</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-bold text-slate-700">
                Categoría
              </label>

              <select
                value={operation}
                onChange={(event) => setOperation(event.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none transition focus:border-[#D71920]"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="temporario">Alquiler temporario</option>
                <option value="destacadas">Destacadas</option>
                <option value="dalvian">Dalvian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold text-slate-700">
              Localidad
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ej: Chacras de Coria"
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold text-slate-700">
              Moneda
            </label>

            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`h-9 rounded-xl text-sm font-bold transition ${
                  currency === "USD"
                    ? "bg-[#E21B23] text-white shadow"
                    : "text-slate-600"
                }`}
              >
                USD
              </button>

              <button
                type="button"
                onClick={() => setCurrency("ARS")}
                className={`h-9 rounded-xl text-sm font-bold transition ${
                  currency === "ARS"
                    ? "bg-[#E21B23] text-white shadow"
                    : "text-slate-600"
                }`}
              >
                ARS
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
              Precio
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
              <div>
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Desde
                  </p>

                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatMoney(minPrice, currency)}
                  </span>
                </div>

                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={limits.step}
                  value={minPrice}
                  onChange={(event) => setMinPrice(Number(event.target.value))}
                  className="w-full accent-[#E21B23]"
                />
              </div>

              <div className="mt-1.5">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Hasta
                  </p>

                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatMoney(maxPrice, currency)}
                  </span>
                </div>

                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={limits.step}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="w-full accent-[#E21B23]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="h-10 w-full rounded-2xl bg-[#E21B23] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#C5161D]"
          >
            Buscar propiedades
          </button>
        </div>
      </form>
    </aside>
  );
}