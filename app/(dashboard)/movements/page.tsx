import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface MovementRow {
  id: string;
  type: "entry" | "exit";
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  lot_number: string;
  product_name: string;
  product_line: string;
  registered_by_name: string;
  created_at: string;
}

export default async function MovementsPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_movement_history")
    .select("*")
    .limit(200);

  const rows = (data ?? []) as MovementRow[];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Histórico de Movimentações</h2>

      <Card>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">Nenhuma movimentação registrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Lote</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Caixas</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kg</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuário</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Badge variant={r.type === "entry" ? "success" : "info"}>
                      {r.type === "entry" ? "Entrada" : "Saída"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{r.product_name}</td>
                  <td className="px-5 py-3 text-slate-600">{r.lot_number}</td>
                  <td className="px-5 py-3 text-right text-slate-800">{Number(r.boxes)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{Number(r.kg).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-600">{r.movement_date}</td>
                  <td className="px-5 py-3 text-slate-600">{r.registered_by_name}</td>
                  <td className="px-5 py-3 text-slate-400">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
