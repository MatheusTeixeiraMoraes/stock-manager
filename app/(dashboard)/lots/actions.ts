"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function createLot(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const product_id = formData.get("product_id") as string;
  const lot_number = formData.get("lot_number") as string;
  const entry_date = formData.get("entry_date") as string;
  const manufacture_date = (formData.get("manufacture_date") as string) || null;
  const expiry_date = (formData.get("expiry_date") as string) || null;
  const initial_boxes = parseFloat(formData.get("initial_boxes") as string) || 0;
  const initial_kg = parseFloat(formData.get("initial_kg") as string) || 0;
  const notes = (formData.get("notes") as string) || null;

  const { data: lot, error } = await supabase
    .from("lots")
    .insert({
      product_id,
      lot_number,
      entry_date,
      manufacture_date,
      expiry_date,
      initial_boxes,
      initial_kg,
      notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Registra a entrada inicial se houver quantidade
  if (initial_boxes > 0 || initial_kg > 0) {
    await supabase.from("movements").insert({
      lot_id: lot.id,
      type: "entry",
      boxes: initial_boxes,
      kg: initial_kg,
      movement_date: entry_date,
      reason: "Entrada inicial do lote",
      registered_by: user.id,
    });
  }

  revalidatePath("/lots");
  redirect("/lots");
}
