import HeroBackground from "./HeroBackground";
import HeroCarousel from "./HeroCarousel";
import SearchSidebar from "./SearchSidebar";

export default function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroCarousel />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-white/38" />

      <div className="pointer-events-none absolute inset-0 z-[2]">
        <HeroBackground />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1500px] items-center px-6 py-5 lg:px-10">
        <div className="relative grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_410px] lg:items-center">
          <div className="relative z-20 flex min-h-[420px] items-center lg:min-h-[440px]">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D71920]">
                CL Inmobiliaria
              </p>

              <h1 className="mt-4 text-4xl font-semibold leading-[0.95] text-[#111111] md:text-6xl xl:text-7xl">
                Propiedades, lotes y desarrollos
              </h1>

              <p className="mt-5 text-lg font-semibold leading-tight text-slate-600 md:text-2xl">
                En los mejores puntos de Mendoza
              </p>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Explorá propiedades destacadas, oportunidades en Dalvian y opciones
                seleccionadas para vivir o invertir.
              </p>
            </div>
          </div>

          <div className="relative z-20 justify-self-end">
            <SearchSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}