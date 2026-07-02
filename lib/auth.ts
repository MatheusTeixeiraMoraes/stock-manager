import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "operator";

export const requireAuth = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user;
});

export const getUserRole = cache(async (userId: string): Promise<UserRole> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return (data?.role as UserRole) ?? "operator";
});

export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole(user.id);
  if (role !== "admin") redirect("/dashboard");
  return { user, role };
}
