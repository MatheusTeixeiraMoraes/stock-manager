import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Users, ExternalLink } from "lucide-react";
import type { UserProfile } from "@/types/database";

export default async function UsersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("user_profiles").select("*").order("full_name");
  const users = (data ?? []) as UserProfile[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Usuários</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
        </div>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <ExternalLink size={13} />
          Convidar no Supabase
        </a>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        Para convidar novos usuários, acesse <strong>Authentication → Users → Invite</strong> no painel do Supabase.
        Após o convite, altere o papel com: <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">update public.user_profiles set role = &apos;admin&apos; where id = &apos;UUID&apos;;</code>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                      {u.role === "admin" ? "Administrador" : "Operador"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
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
