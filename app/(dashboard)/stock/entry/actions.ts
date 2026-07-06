"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface RegisterEntryState {
  error?: string;
}

export async function registerEntry(
  _prevState: RegisterEntryState,
  formData: FormData
): Promise<RegisterEntryState> {
  const user = await requireAuth();
  const supabase = await createClient();

  const lot_id = formData.get("lot_id") as string;
  const boxes = parseFloat(formData.get("boxes") as string) || 0;
  let kg = parseFloat(formData.get("kg") as string) || 0;
  const movement_date = formData.get("movement_date") as string;
  const reason = (formData.get("reason") as string) || null;

  if (boxes <= 0 && kg <= 0) {
    return { error: "Informe ao menos caixas ou kg." };
  }

  // Tinta nova: peso sempre determinístico (boxes × peso fixo do produto)
  const { data: lotRow } = await supabase
    .from("lots")
    .select("lot_type, products(unit_weight)")
    .eq("id", lot_id)
    .single();

  const lotType = (lotRow as { lot_type?: string } | null)?.lot_type;
  const unitWeight = (lotRow as { products?: { unit_weight?: number } } | null)?.products?.unit_weight;

  if (lotType === "nova") {
    kg = boxes * Number(unitWeight ?? 0);
  }

  const { error } = await supabase.from("movements").insert({
    lot_id,
    type: "entry",
    boxes,
    kg,
    movement_date,
    reason,
    registered_by: user.id,
  });

  if (error) {
    // Retorna em vez de lancar: em producao o Next.js apaga a mensagem
    // de qualquer erro "throw" de uma Server Action e mostra um texto
    // generico no lugar. Retornar o valor evita essa redacao.
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/lots");
  revalidatePath("/movements");
  redirect("/movements");
}
