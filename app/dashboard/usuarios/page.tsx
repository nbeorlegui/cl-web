import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createUserAction } from "./actions";
import UsersTableClient from "./usersTableClient";
export const dynamic = "force-dynamic";

type Role = "superadmin" | "admin" | "user";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at?: string | null;
};

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "create") return "Usuario creado correctamente.";
  if (success === "update") return "Usuario actualizado correctamente.";
  if (success === "delete") return "Usuario eliminado correctamente.";

  if (error === "missing") return "Completá todos los campos obligatorios.";
  if (error === "role") return "El rol seleccionado no es válido.";
  if (error === "password") return "La contraseña debe tener al menos 6 caracteres.";
  if (error === "create") return "No se pudo crear el usuario.";
  if (error === "profile") return "El usuario se creó, pero falló el perfil.";
  if (error === "update") return "No se pudo actualizar el usuario.";
  if (error === "delete") return "No se pudo eliminar el usuario.";
  if (error === "self_delete") return "No podés eliminar tu propio usuario.";

  return null;
}

export default async function DashboardUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>();

  if (!currentProfile || currentProfile.role !== "superadmin") {
    redirect("/dashboard");
  }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  const message = getMessage(params.error, params.success);

  return (
    <section className="w-full">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D71920]">
            Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111111]">
            Usuarios
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Administrá los accesos al panel interno de CL Inmobiliaria.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
            params.error
              ? "bg-red-50 text-[#D71920]"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#D71920]">
          Error al cargar usuarios: {error.message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
            Nuevo usuario
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Creá un acceso nuevo para administrar el sistema.
          </p>

          <form action={createUserAction} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Nombre completo
              </label>

              <input
                name="full_name"
                required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                placeholder="Ej: Agustina Pérez"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Contraseña inicial
              </label>

              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Rol
              </label>

              <select
                name="role"
                defaultValue="user"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-10 w-full rounded-xl bg-[#D71920] px-4 text-sm font-bold text-white transition hover:bg-[#B9151B]"
            >
              Crear usuario
            </button>
          </form>
        </section>

        <UsersTableClient
          users={(users || []) as Profile[]}
          currentUserId={user.id}
        />
      </div>
    </section>
  );
}