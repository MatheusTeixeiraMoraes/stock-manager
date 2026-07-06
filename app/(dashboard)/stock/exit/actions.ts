"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface RegisterExitState {
  error?: string;
}

export async function registerExit(
  _prevState: RegisterExitState,
  formData: FormData
): Promise<RegisterExitState> {
  const user = await requireAuth();
  const supabase = await createClient();

  const product_id = formData.get("product_id") as string;
  const lot_type = (formData.get("lot_type") as string) || "nova";
  const boxes = parseFloat(formData.get("boxes") as string) || 0;
  const kg = parseFloat(formData.get("kg") as string) || 0;
  const movement_date = formData.get("movement_date") as string;
  const reason = (formData.get("reason") as string) || null;

  if (boxes <= 0) {
    return { error: "Informe ao menos a quantidade em caixas." };
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

  if (error) {
    // Retorna em vez de lancar: em producao o Next.js apaga a mensagem
    // de qualquer erro "throw" de uma Server Action (ex: "Estoque
    // insuficiente...", vindo direto do banco) e mostra um texto
    // generico no lugar. Retornar o valor evita essa redacao.
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/lots");
  revalidatePath("/movements");
  redirect("/movements");
}
