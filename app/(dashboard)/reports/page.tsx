import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { ProductBalance, LotBalance } from "@/types/database";

export default async function ReportsPage() {
  await requireAuth();
  const supabase = await createClient();

  const [productBalance, lotBalance, lowStock, expiryAlert] = await Promise.all([
    supabase.from("v_product_balance").select("*").order("product_name"),
    supabase.from("v_lot_balance").select("*").order("product_name").order("entry_date"),
    supabase.from("v_low_stock").select("*"),
    supabase.from("v_expiry_alert").select("*"),
  ]);

  const products = (productBalance.data ?? []) as ProductBalance[];
  const lots = (lotBalance.data ?? []) as LotBalance[];
  const lowStockItems = (lowStock.data ?? []) as ProductBalance[];
  const expiring = (expiryAlert.data ?? []) as LotBalance[];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Relatórios</h2>

      {/* Saldo por produto */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Saldo por produto</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Produto</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Linha</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Lotes ativos</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Total cxs</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Total kg</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Lote mais antigo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.product_id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{p.product_name}</td>
                <td className="px-5 py-3 text-slate-600">{p.product_line}</td>
                <td className="px-5 py-3 text-right text-slate-600">{Number(p.lot_count)}</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-800">{Number(p.total_boxes)}</td>
                <td className="px-5 py-3 text-right text-slate-600">{Number(p.total_kg).toFixed(2)}</td>
                <td className="px-5 py-3 text-slate-600">
                  {p.oldest_lot_date ? (
                    <Badge variant="warning">{p.oldest_lot_date}</Badge>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Saldo por lote */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Saldo por lote</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Produto</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Lote</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Entrada</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Validade</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Cxs</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Kg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lots.map((l) => (
              <tr key={l.lot_id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{l.product_name}</td>
                <td className="px-5 py-3 text-slate-600">{l.lot_number}</td>
                <td className="px-5 py-3 text-slate-600">{l.entry_date}</td>
                <td className="px-5 py-3 text-slate-600">{l.expiry_date ?? "—"}</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-800">{Number(l.balance_boxes)}</td>
                <td className="px-5 py-3 text-right text-slate-600">{Number(l.balance_kg).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">⚠️ Estoque baixo (&lt;10 cx)</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum produto em situação crítica.</p>
          ) : (
            <ul className="space-y-1">
              {lowStockItems.map((p) => (
                <li key={p.product_id} className="text-sm text-amber-700">
                  {p.product_name} — {Number(p.total_boxes)} cx
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-red-800 mb-3">🚨 Vencimento em 30 dias</h3>
          {expiring.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum lote próximo do vencimento.</p>
          ) : (
            <ul className="space-y-1">
              {expiring.map((l) => (
                <li key={l.lot_id} className="text-sm text-red-700">
                  {l.product_name} — Lote {l.lot_number} — {l.expiry_date}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
