import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClipboardList, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface MovementRow {
  id: string;
  type: "entry" | "exit";
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  lot_number: string;
  product_name: string;
  registered_by_name: string;
}

export default async function MovementsPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase.from("v_movement_history").select("*").limit(200);
  const rows = (data ?? []) as MovementRow[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Histórico de Movimentações</h2>
        <p className="text-sm text-slate-500 mt-0.5">Últimas {rows.length} movimentações</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
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
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    {r.type === "entry" ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <ArrowDownCircle size={11} />
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <ArrowUpCircle size={11} />
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{r.product_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{r.lot_number}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-800">{Number(r.boxes)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-500">{Number(r.kg).toFixed(2)}</td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-500">{r.movement_date}</td>
                  <td className="px-5 py-3.5 text-slate-600">{r.registered_by_name}</td>
                  <td className="px-5 py-3.5 text-slate-400">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
