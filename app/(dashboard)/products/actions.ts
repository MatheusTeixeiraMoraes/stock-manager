"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const line = formData.get("line") as string;
  const unit_weight = parseFloat(formData.get("unit_weight") as string);

  const { error } = await supabase.from("products").insert({ name, line, unit_weight });
  if (error) throw new Error(error.message);

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "Não é possível excluir: este produto tem lotes cadastrados." };
    }
    return { error: error.message };
  }

  revalidatePath("/products");
  return {};
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const line = formData.get("line") as string;
  const unit_weight = parseFloat(formData.get("unit_weight") as string);
  const active = formData.get("active") === "true";

  const { error } = await supabase
    .from("products")
    .update({ name, line, unit_weight, active })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/products");
  redirect("/products");
}
