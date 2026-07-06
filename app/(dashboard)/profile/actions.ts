"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  await requireAuth();

  const full_name = (formData.get("full_name") as string)?.trim();
  if (!full_name) throw new Error("Informe seu nome.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_own_name", { new_name: full_name });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
