import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LotTypeBadge from "@/components/ui/LotTypeBadge";
import ExportCsvButton from "@/components/reports/ExportCsvButton";
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
      <h2 className="text-xl font-semibold text-ink">Relatórios</h2>

      {/* Saldo por produto */}
      <Card>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">Saldo por produto</h3>
          <ExportCsvButton
            filename="saldo-por-produto.csv"
            headers={["Produto", "Linha", "Lotes ativos", "Nova (cx)", "Recuperada (cx)", "Total (cx)", "Kg (nova)", "Lote mais antigo"]}
            rows={products.map((p) => [
              p.product_name,
              p.product_line,
              Number(p.lot_count),
              Number(p.boxes_nova),
              Number(p.boxes_recuperada),
              Number(p.total_boxes),
              Number(p.kg_nova).toFixed(2),
              p.oldest_lot_date ?? "",
            ])}
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Produto</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Linha</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Lotes ativos</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Nova (cx)</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Recuperada (cx)</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Total (cx)</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Kg (nova)</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Lote mais antigo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.product_id} className="hover:bg-surface-alt">
                <td className="px-5 py-3 font-medium text-ink">{p.product_name}</td>
                <td className="px-5 py-3 text-ink-soft">{p.product_line}</td>
                <td className="px-5 py-3 text-right text-ink-soft">{Number(p.lot_count)}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink">{Number(p.boxes_nova)}</td>
                <td className="px-5 py-3 text-right font-medium text-accent">{Number(p.boxes_recuperada)}</td>
                <td className="px-5 py-3 text-right text-ink-soft">{Number(p.total_boxes)}</td>
                <td className="px-5 py-3 text-right text-ink-soft">{Number(p.kg_nova).toFixed(2)}</td>
                <td className="px-5 py-3 text-ink-soft">
                  {p.oldest_lot_date ? (
                    <Badge variant="warning">{p.oldest_lot_date}</Badge>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Saldo por lote */}
      <Card>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">Saldo por lote</h3>
          <ExportCsvButton
            filename="saldo-por-lote.csv"
            headers={["Produto", "Lote", "Tipo", "Entrada", "Validade", "Caixas", "Kg"]}
            rows={lots.map((l) => [
              l.product_name,
              l.lot_number,
              l.lot_type,
              l.entry_date,
              l.expiry_date ?? "",
              Number(l.balance_boxes),
              Number(l.balance_kg).toFixed(2),
            ])}
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Produto</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Lote</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Tipo</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Entrada</th>
              <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Validade</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Cxs</th>
              <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Kg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lots.map((l) => (
              <tr key={l.lot_id} className="hover:bg-surface-alt">
                <td className="px-5 py-3 font-medium text-ink">{l.product_name}</td>
                <td className="px-5 py-3 text-ink-soft">{l.lot_number}</td>
                <td className="px-5 py-3"><LotTypeBadge type={l.lot_type} /></td>
                <td className="px-5 py-3 text-ink-soft">{l.entry_date}</td>
                <td className="px-5 py-3 text-ink-soft">{l.expiry_date ?? "—"}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink">{Number(l.balance_boxes)}</td>
                <td className="px-5 py-3 text-right text-ink-soft">{Number(l.balance_kg).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-warn-ink mb-3">⚠️ Estoque baixo de tinta nova (&lt;10 cx)</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-ink-soft/70">Nenhum produto em situação crítica.</p>
          ) : (
            <ul className="space-y-1">
              {lowStockItems.map((p) => (
                <li key={p.product_id} className="text-sm text-warn-ink">
                  {p.product_name} — {Number(p.boxes_nova)} cx
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-danger mb-3">🚨 Vencimento em 30 dias</h3>
          {expiring.length === 0 ? (
            <p className="text-sm text-ink-soft/70">Nenhum lote próximo do vencimento.</p>
          ) : (
            <ul className="space-y-1">
              {expiring.map((l) => (
                <li key={l.lot_id} className="text-sm text-danger">
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
