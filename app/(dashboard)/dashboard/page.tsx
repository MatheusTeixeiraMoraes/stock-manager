import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { ProductBalance, LotBalance } from "@/types/database";

export default async function DashboardPage() {
  await requireAuth();
  const supabase = await createClient();

  const [productBalance, lowStock, expiryAlert] = await Promise.all([
    supabase.from("v_product_balance").select("*"),
    supabase.from("v_low_stock").select("*"),
    supabase.from("v_expiry_alert").select("*"),
  ]);

  const products = (productBalance.data ?? []) as ProductBalance[];
  const lowStockItems = (lowStock.data ?? []) as ProductBalance[];
  const expiring = (expiryAlert.data ?? []) as LotBalance[];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Visão Geral</h2>

      {/* Alertas */}
      {(lowStockItems.length > 0 || expiring.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                ⚠️ Estoque baixo ({lowStockItems.length} produto{lowStockItems.length > 1 ? "s" : ""})
              </p>
              <ul className="space-y-1">
                {lowStockItems.map((p) => (
                  <li key={p.product_id} className="text-sm text-amber-700">
                    {p.product_name} — {Number(p.total_boxes)} cx
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {expiring.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <p className="text-sm font-semibold text-red-800 mb-2">
                🚨 Próximos do vencimento ({expiring.length} lote{expiring.length > 1 ? "s" : ""})
              </p>
              <ul className="space-y-1">
                {expiring.map((l) => (
                  <li key={l.lot_id} className="text-sm text-red-700">
                    {l.product_name} — Lote {l.lot_number} — vence {l.expiry_date}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Saldo por produto */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Saldo atual por produto</h3>
        </div>
        {products.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((p) => (
              <div key={p.product_id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.product_name}</p>
                  <p className="text-xs text-slate-400">{p.product_line} · {p.lot_count} lote{Number(p.lot_count) > 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{Number(p.total_boxes)} caixas</p>
                  <p className="text-xs text-slate-400">{Number(p.total_kg).toFixed(2)} kg</p>
                </div>
                {Number(p.total_boxes) < 10 && (
                  <Badge variant="warning" className="ml-3">Baixo</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
