"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function activateDemoData() {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("seed_demo_data");
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function deactivateDemoData() {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("cleanup_demo_data");
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
