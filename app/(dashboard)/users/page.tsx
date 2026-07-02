import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { UserProfile } from "@/types/database";

export default async function UsersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .order("full_name");

  const users = (data ?? []) as UserProfile[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Usuários</h2>
        <p className="text-sm text-slate-500">
          Para convidar novos usuários, use o painel do Supabase → Authentication.
        </p>
      </div>

      <Card>
        {users.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">Nenhum usuário encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Papel</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.full_name}</td>
                  <td className="px-5 py-3">
                    <Badge variant={u.role === "admin" ? "info" : "default"}>
                      {u.role === "admin" ? "Administrador" : "Operador"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
