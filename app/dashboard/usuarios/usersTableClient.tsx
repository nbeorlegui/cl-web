"use client";

import { useState } from "react";
import { deleteUserAction, updateUserAction } from "./actions";

type Role = "superadmin" | "admin" | "user";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at?: string | null;
};

function roleLabel(role: Role) {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "Usuario";
}

function roleChipClass(role: Role) {
  if (role === "superadmin") return "bg-red-50 text-[#D71920]";
  if (role === "admin") return "bg-slate-100 text-slate-700";
  return "bg-blue-50 text-blue-700";
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 7l1 13h10l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UsersTableClient({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
            Listado de usuarios
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {users.length} usuarios cargados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-[220px] whitespace-nowrap px-4 py-3">Usuario</th>
                <th className="whitespace-nowrap px-4 py-3">Rol</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <td className="w-[220px] px-4 py-3">
                    <div className="max-w-[190px]">
                      <p className="truncate text-sm font-semibold text-[#111111]">
                        {profile.full_name || "Sin nombre"}
                      </p>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${roleChipClass(
                        profile.role
                      )}`}
                    >
                      {roleLabel(profile.role)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Editar usuario"
                        aria-label="Editar usuario"
                        onClick={() => setEditingUser(profile)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#D71920] hover:bg-red-50 hover:text-[#D71920]"
                      >
                        <EditIcon />
                      </button>

                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={profile.id} />

                        <button
                          type="submit"
                          title={
                            profile.id === currentUserId
                              ? "No podés eliminar tu propio usuario"
                              : "Eliminar usuario"
                          }
                          aria-label="Eliminar usuario"
                          disabled={profile.id === currentUserId}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#D71920] transition hover:bg-[#D71920] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <TrashIcon />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center">
                    <p className="text-base font-semibold text-[#111111]">
                      No hay usuarios cargados
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Creá el primer usuario desde el formulario lateral.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-[460px] rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D71920]">
                  Editar usuario
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#111111]">
                  {editingUser.full_name || "Usuario"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Modificá nombre, email, rol o contraseña.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form action={updateUserAction} className="space-y-4">
              <input type="hidden" name="id" value={editingUser.id} />

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nombre completo
                </label>

                <input
                  name="full_name"
                  required
                  defaultValue={editingUser.full_name || ""}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
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
                  defaultValue={editingUser.email || ""}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Rol
                </label>

                <select
                  name="role"
                  defaultValue={editingUser.role}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nueva contraseña
                </label>

                <input
                  name="password"
                  type="password"
                  minLength={6}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-xl bg-[#D71920] px-5 text-sm font-bold text-white transition hover:bg-[#B9151B]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}