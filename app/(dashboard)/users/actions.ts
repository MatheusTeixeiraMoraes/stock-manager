"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export interface CreateUserState {
  error?: string;
  success?: { email: string; password: string };
}

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim();
  const full_name = (formData.get("full_name") as string)?.trim();
  const role = (formData.get("role") as string) === "admin" ? "admin" : "operator";

  if (!email || !full_name) {
    return { error: "Preencha nome e e-mail." };
  }

  const password = generateTempPassword();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role, must_change_password: true },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  return { success: { email, password } };
}

export async function updateUserRole(userId: string, formData: FormData) {
  const { user } = await requireAdmin();

  if (userId === user.id) {
    throw new Error("Você não pode alterar seu próprio papel.");
  }

  const role = formData.get("role") === "admin" ? "admin" : "operator";
  const supabase = await createClient();

  const { error } = await supabase.from("user_profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/users");
}

export async function deleteUser(userId: string) {
  const { user } = await requireAdmin();

  if (userId === user.id) {
    throw new Error("Você não pode excluir sua própria conta.");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "admin") {
    throw new Error("Não é possível excluir uma conta de administrador por aqui.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/users");
}
