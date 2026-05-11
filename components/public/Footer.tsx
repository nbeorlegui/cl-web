export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <img src="/logo-cl-inmobiliaria.png" alt="CL Inmobiliaria" className="h-14 w-auto" />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
            Propiedades en Mendoza con atención personalizada, experiencia comercial y
            herramientas digitales para encontrar mejores oportunidades.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[#111111]">Secciones</h3>
          <div className="mt-4 space-y-2 text-sm font-bold text-slate-500">
            <a href="#destacadas" className="block hover:text-[#D71920]">
              Destacadas
            </a>
            <a href="#dalvian" className="block hover:text-[#D71920]">
              Dalvian
            </a>
            <a href="#ultimas" className="block hover:text-[#D71920]">
              Últimas propiedades
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#111111]">Contacto</h3>
          <div className="mt-4 space-y-2 text-sm font-bold text-slate-500">
            <p>Mendoza, Argentina</p>
            <p>WhatsApp: +54 9 261 000 0000</p>
            <p>Instagram: cl.inmobiliaria</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        CL Inmobiliaria · Plataforma digital
      </div>
    </footer>
  );
}
