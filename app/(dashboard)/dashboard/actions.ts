"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function activateDemoData(): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("seed_demo_data");
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deactivateDemoData(): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("cleanup_demo_data");
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
