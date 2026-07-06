import { createClient } from "@/lib/supabase/server";
import { requireAuth, getUserRole } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Stock Manager" userName={userName} />
        <main className="flex-1 overflow-y-auto bg-canvas px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
