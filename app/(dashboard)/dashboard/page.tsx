import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { AlertTriangle, Boxes, ShoppingCart, Package2, Clock } from "lucide-react";
import type { ProductBalance, LotBalance } from "@/types/database";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  topBorder,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  topBorder: string;
}) {
  return (
    <div className={`bg-surface rounded-xl border border-line border-t-[3px] ${topBorder} p-6 flex items-start gap-5`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-soft mb-1">{label}</p>
        <p className="text-3xl font-bold text-ink leading-none">{value}</p>
        {sub && <p className="text-xs text-ink-soft/80 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

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

  const totalBoxesNova = products.reduce((s, p) => s + Number(p.boxes_nova), 0);
  const totalBoxesRecuperada = products.reduce((s, p) => s + Number(p.boxes_recuperada), 0);
  const hasAlerts = lowStockItems.length + expiring.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Dashboard</h2>
        <p className="text-sm text-ink-soft mt-1">Visão geral do estoque</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tinta nova" value={totalBoxesNova} sub="caixas — reservadas p/ obras" icon={Boxes} color="bg-tan text-tan-ink" topBorder="border-t-ochre" />
        <StatCard label="Tinta recuperada" value={totalBoxesRecuperada} sub="caixas — disponíveis p/ venda" icon={ShoppingCart} color="bg-accent-soft text-accent" topBorder="border-t-accent" />
        <StatCard label="Produtos ativos" value={products.length} sub="cores/linhas" icon={Package2} color="bg-moss-soft text-moss-ink" topBorder="border-t-moss" />
        <StatCard
          label="Alertas ativos"
          value={lowStockItems.length + expiring.length}
          sub="requerem atenção"
          icon={AlertTriangle}
          color={hasAlerts ? "bg-danger-soft text-danger" : "bg-surface-alt text-ink-soft"}
          topBorder={hasAlerts ? "border-t-danger" : "border-t-line"}
        />
      </div>

      {/* Alertas */}
      {hasAlerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="bg-warn-soft border border-warn-ink/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-warn-ink" />
                <p className="text-sm font-semibold text-warn-ink">
                  Estoque baixo de tinta nova ({lowStockItems.length} produto{lowStockItems.length > 1 ? "s" : ""})
                </p>
              </div>
              <ul className="space-y-1.5">
                {lowStockItems.map((p) => (
                  <li key={p.product_id} className="flex justify-between text-sm text-warn-ink">
                    <span>{p.product_name}</span>
                    <span className="font-semibold">{Number(p.boxes_nova)} cx</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="bg-danger-soft border border-danger/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-danger" />
                <p className="text-sm font-semibold text-danger">
                  Vencendo em 30 dias ({expiring.length} lote{expiring.length > 1 ? "s" : ""})
                </p>
              </div>
              <ul className="space-y-1.5">
                {expiring.map((l) => (
                  <li key={l.lot_id} className="flex justify-between text-sm text-danger">
                    <span>{l.product_name} — Lote {l.lot_number}</span>
                    <span className="font-semibold">{l.expiry_date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Saldo por produto */}
      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h3 className="text-sm font-semibold text-ink">Saldo atual por produto</h3>
        </div>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package2 size={32} className="text-ink-soft/40 mb-3" />
            <p className="text-sm font-medium text-ink-soft">Nenhum produto cadastrado</p>
            <p className="text-xs text-ink-soft/70 mt-1">Vá em Produtos para adicionar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-line">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Produto</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Linha</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Nova (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Recuperada (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Total (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Kg (nova)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Lotes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-4 font-medium text-ink">{p.product_name}</td>
                  <td className="px-5 py-4 text-ink-soft">{p.product_line}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold ${Number(p.boxes_nova) < 10 ? "text-warn-ink" : "text-ink"}`}>
                      {Number(p.boxes_nova)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-accent font-medium">{Number(p.boxes_recuperada)}</td>
                  <td className="px-5 py-4 text-right text-ink-soft">{Number(p.total_boxes)}</td>
                  <td className="px-5 py-4 text-right text-ink-soft">{Number(p.kg_nova).toFixed(2)}</td>
                  <td className="px-5 py-4 text-right text-ink-soft">{Number(p.lot_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
