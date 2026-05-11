import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardNav from "./DashboardNav";
import DashboardMobileMenu from "./DashboardMobileMenu";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: "superadmin" | "admin" | "user";
};

function getFirstName(profile: Profile) {
  if (profile.full_name) return profile.full_name.split(" ")[0];
  if (profile.email) return profile.email.split("@")[0];
  return "Usuario";
}

function getWelcomeText(firstName: string) {
  const cleanName = firstName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const femaleNames = [
    "agustina",
    "lorena",
    "maria",
    "ana",
    "sofia",
    "valentina",
    "camila",
    "martina",
    "lucia",
    "paula",
    "florencia",
    "carolina",
    "julieta",
    "romina",
  ];

  return femaleNames.includes(cleanName) ? "Bienvenida" : "Bienvenido";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    redirect("/login");
  }

  const firstName = getFirstName(profile);
  const welcomeText = getWelcomeText(firstName);

  async function logoutAction() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] text-[#111111]">
      {/* SIDEBAR DESKTOP */}
      <aside className="fixed left-0 top-0 hidden h-screen w-56 border-r border-slate-200 bg-white p-5 lg:block">
        <div>
          <img
            src="/logo-cl-inmobiliaria.png"
            alt="CL Inmobiliaria"
            className="h-10 w-auto object-contain"
          />
        </div>

        <DashboardNav role={profile.role} />

        <form action={logoutAction} className="absolute bottom-5 left-5 right-5">
          <button
            type="submit"
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <section className="min-h-screen lg:ml-56">
        {/* HEADER MOBILE */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <img
              src="/logo-cl-inmobiliaria.png"
              alt="CL Inmobiliaria"
              className="h-9 w-auto object-contain"
            />

            <DashboardMobileMenu
              role={profile.role}
              logoutAction={logoutAction}
            />
          </div>
        </div>

        {/* HEADER INFO */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-5">
          <div>
            <p className="text-xs text-slate-500">{welcomeText}</p>

            <h1 className="text-xl font-semibold tracking-[-0.03em] text-[#111111] lg:text-2xl">
              {firstName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden h-9 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920] md:inline-flex"
            >
              Sitio web
            </Link>

            <div className="rounded-2xl bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#D71920] lg:px-4 lg:text-sm">
              {profile.role}
            </div>

            <form action={logoutAction} className="hidden md:block">
              <button
                type="submit"
                className="h-9 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <div className="px-4 py-5 lg:px-5">{children}</div>
      </section>
    </main>
  );
}