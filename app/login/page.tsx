import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-6">
      <section className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-7 text-center">
          <img
            src="/logo-cl-inmobiliaria.png"
            alt="CL Inmobiliaria"
            className="mx-auto h-14 w-auto object-contain"
          />

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.26em] text-[#D71920]">
            Acceso privado
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
            Ingresar al dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Administrá propiedades, consultas y actividad del sitio.
          </p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <input
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              placeholder="Ingresá tu contraseña"
            />
          </div>

          {hasError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#D71920]">
              Email o contraseña incorrectos.
            </div>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-2xl bg-[#D71920] text-sm font-bold text-white transition hover:bg-[#B9151B]"
          >
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}