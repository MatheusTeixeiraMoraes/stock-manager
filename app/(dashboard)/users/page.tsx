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
        <h2 className="text-xl font-bold text-slate-900">Usuários</h2>
        <p className="text-sm text-slate-500 mt-1">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
      </div>

      <InviteUserForm />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Papel</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Desde</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800">{u.full_name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[11px] text-slate-400">(você)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id === currentUser.id ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                        {u.role === "admin" ? "Administrador" : "Operador"}
                      </span>
                    ) : (
                      <RoleSelect userId={u.id} currentRole={u.role} />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
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
        )}
      </div>
    </div>
  );
}
