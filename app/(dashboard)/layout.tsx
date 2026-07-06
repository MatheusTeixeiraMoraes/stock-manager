import { createClient } from "@/lib/supabase/server";
import { requireAuth, getUserRole } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  const [role, profileResult] = await Promise.all([
    getUserRole(user.id),
    supabase.from("user_profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const userName = profileResult.data?.full_name ?? user.email ?? "Usuário";

  return (
    <DashboardShell role={role} userName={userName}>
      {children}
    </DashboardShell>
  );
}
