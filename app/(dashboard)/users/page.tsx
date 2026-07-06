import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import InviteUserForm from "@/components/users/InviteUserForm";
import RoleSelect from "@/components/users/RoleSelect";
import DeleteUserButton from "@/components/users/DeleteUserButton";
import type { UserProfile } from "@/types/database";

export default async function UsersPage() {
  const { user: currentUser } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("user_profiles").select("*").order("full_name");
  const users = (data ?? []) as UserProfile[];

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-ink">Usuários</h2>
        <p className="text-sm text-ink-soft mt-1">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
      </div>

      <InviteUserForm />

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={32} className="text-ink-soft/40 mb-3" />
            <p className="text-sm font-medium text-ink-soft">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-line">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Papel</th>
                <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Desde</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-accent">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-ink">{u.full_name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[11px] text-ink-soft/60">(você)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id === currentUser.id ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${u.role === "admin" ? "bg-accent-soft text-accent" : "bg-surface-alt text-ink-soft"}`}>
                        {u.role === "admin" ? "Administrador" : "Operador"}
                      </span>
                    ) : (
                      <RoleSelect userId={u.id} currentRole={u.role} />
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5 text-ink-soft">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.id !== currentUser.id && u.role === "operator" && (
                      <DeleteUserButton userId={u.id} userName={u.full_name} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
