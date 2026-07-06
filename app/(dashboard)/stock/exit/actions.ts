"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function registerExit(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const product_id = formData.get("product_id") as string;
  const lot_type = (formData.get("lot_type") as string) || "nova";
  const boxes = parseFloat(formData.get("boxes") as string) || 0;
  const kg = parseFloat(formData.get("kg") as string) || 0;
  const movement_date = formData.get("movement_date") as string;
  const reason = (formData.get("reason") as string) || null;

  if (boxes <= 0) {
    throw new Error("Informe ao menos a quantidade em caixas.");
  }

  const { error } = await supabase.rpc("register_exit", {
    p_product_id: product_id,
    p_lot_type: lot_type,
    p_boxes: boxes,
    p_kg: kg,
    p_date: movement_date,
    p_reason: reason,
    p_user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/lots");
  revalidatePath("/movements");
  redirect("/movements");
}
