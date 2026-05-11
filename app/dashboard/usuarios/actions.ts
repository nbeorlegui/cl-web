"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type Role = "superadmin" | "admin" | "user";

async function requireSuperadmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>();

  if (!profile || profile.role !== "superadmin") {
    redirect("/dashboard");
  }

  return user;
}

export async function createUserAction(formData: FormData) {
  await requireSuperadmin();

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "user") as Role;

  if (!fullName || !email || !password) {
    redirect("/dashboard/usuarios?error=missing");
  }

  if (!["superadmin", "admin", "user"].includes(role)) {
    redirect("/dashboard/usuarios?error=role");
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error || !data.user) {
    console.error("Error create user:", error);
    redirect("/dashboard/usuarios?error=create");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    email,
    role,
  });

  if (profileError) {
    console.error("Error create profile:", profileError);
    redirect("/dashboard/usuarios?error=profile");
  }

  revalidatePath("/dashboard/usuarios");
  redirect("/dashboard/usuarios?success=create");
}

export async function updateUserAction(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "user") as Role;

  if (!id || !fullName || !email) {
    redirect("/dashboard/usuarios?error=missing");
  }

  if (!["superadmin", "admin", "user"].includes(role)) {
    redirect("/dashboard/usuarios?error=role");
  }

  const admin = createSupabaseAdminClient();

  const authUpdate: {
    email: string;
    password?: string;
    user_metadata: {
      full_name: string;
      role: Role;
    };
  } = {
    email,
    user_metadata: {
      full_name: fullName,
      role,
    },
  };

  if (password) {
    if (password.length < 6) {
      redirect("/dashboard/usuarios?error=password");
    }

    authUpdate.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(
    id,
    authUpdate
  );

  if (authError) {
    console.error("Error update auth user:", authError);
    redirect("/dashboard/usuarios?error=update");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      role,
    })
    .eq("id", id);

  if (profileError) {
    console.error("Error update profile:", profileError);
    redirect("/dashboard/usuarios?error=update");
  }

  revalidatePath("/dashboard/usuarios");
  redirect("/dashboard/usuarios?success=update");
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireSuperadmin();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect("/dashboard/usuarios?error=missing");
  }

  if (id === currentUser.id) {
    redirect("/dashboard/usuarios?error=self_delete");
  }

  const admin = createSupabaseAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    console.error("Error delete profile:", profileError);
    redirect("/dashboard/usuarios?error=delete");
  }

  const { error: authError } = await admin.auth.admin.deleteUser(id);

  if (authError) {
    console.error("Error delete auth user:", authError);
    redirect("/dashboard/usuarios?error=delete");
  }

  revalidatePath("/dashboard/usuarios");
  redirect("/dashboard/usuarios?success=delete");
}