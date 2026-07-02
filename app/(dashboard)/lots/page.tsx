import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Plus, Boxes, Eye } from "lucide-react";
import type { LotBalance } from "@/types/database";

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-slate-400">—</span>;
  const today = new Date();
  const expiry = new Date(date);
  const diff = (expiry.getTime() - today.getTime()) / 86400000;

  let cls = "bg-emerald-50 text-emerald-700";
  if (diff <= 7) cls = "bg-red-50 text-red-700";
  else if (diff <= 30) cls = "bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {date}
    </span>
  );
}

export default async function LotsPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_lot_balance")
    .select("*")
    .order("product_name")
    .order("entry_date");

  const lots = (data ?? []) as LotBalance[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lotes</h2>
          <p className="text-sm text-slate-500 mt-0.5">{lots.length} lote{lots.length !== 1 ? "s" : ""} registrado{lots.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/lots/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} />
          Novo lote
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {lots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Boxes size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Nenhum lote cadastrado</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Novo lote" para começar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Lote</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Entrada</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Validade</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo cx</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo kg</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map((l) => (
                <tr key={l.lot_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{l.product_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {l.lot_number}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 tabular-nums">{l.entry_date}</td>
                  <td className="px-5 py-3.5"><ExpiryBadge date={l.expiry_date} /></td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800 tabular-nums">{Number(l.balance_boxes)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-500 tabular-nums">{Number(l.balance_kg).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/lots/${l.lot_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
                      <Eye size={12} />
                      Ver
                    </Link>
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
