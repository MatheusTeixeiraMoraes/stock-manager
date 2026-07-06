"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function createLot(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const product_id = formData.get("product_id") as string;
  const lot_type = (formData.get("lot_type") as string) || "nova";
  const lot_number = formData.get("lot_number") as string;
  const entry_date = formData.get("entry_date") as string;
  const manufacture_date = (formData.get("manufacture_date") as string) || null;
  const expiry_date = (formData.get("expiry_date") as string) || null;
  const initial_boxes = parseFloat(formData.get("initial_boxes") as string) || 0;
  const notes = (formData.get("notes") as string) || null;

  let initial_kg = parseFloat(formData.get("initial_kg") as string) || 0;

  // Tinta nova: peso sempre determinístico (boxes × peso fixo do produto)
  if (lot_type === "nova") {
    const { data: product } = await supabase
      .from("products")
      .select("unit_weight")
      .eq("id", product_id)
      .single();
    initial_kg = initial_boxes * Number(product?.unit_weight ?? 0);
  }

  const { data: lot, error } = await supabase
    .from("lots")
    .insert({
      product_id,
      lot_type,
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

export async function updateLot(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const lot_type = (formData.get("lot_type") as string) === "recuperada" ? "recuperada" : "nova";
  const lot_number = formData.get("lot_number") as string;
  const entry_date = formData.get("entry_date") as string;
  const manufacture_date = (formData.get("manufacture_date") as string) || null;
  const expiry_date = (formData.get("expiry_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const { error } = await supabase
    .from("lots")
    .update({ lot_type, lot_number, entry_date, manufacture_date, expiry_date, notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/lots");
  revalidatePath(`/lots/${id}`);
  redirect(`/lots/${id}`);
}

export async function deleteLot(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("lots").delete().eq("id", id);

  if (error) {
    // Retorna o erro em vez de lançar: em producao, o Next.js apaga a
    // mensagem de qualquer erro "throw" de dentro de uma Server Action
    // (por seguranca) e mostra um texto generico no lugar. Retornar o
    // valor normalmente evita essa redacao.
    if (error.code === "23503") {
      return { error: "Não é possível excluir: este lote já tem movimentações registradas." };
    }
    return { error: error.message };
  }

  // Sem redirect() aqui: essa action é chamada via clique (não <form>),
  // então o redirect seria capturado pelo try/catch do componente cliente
  // em vez de navegar. A navegação fica por conta do DeleteLotButton.
  revalidatePath("/lots");
  return {};
}
