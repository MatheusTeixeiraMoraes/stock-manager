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
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Visão geral do estoque</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tinta nova" value={totalBoxesNova} sub="caixas — reservadas p/ obras" icon={Boxes} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Tinta recuperada" value={totalBoxesRecuperada} sub="caixas — disponíveis p/ venda" icon={ShoppingCart} color="bg-violet-50 text-violet-600" />
        <StatCard label="Produtos ativos" value={products.length} sub="cores/linhas" icon={Package2} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Alertas ativos" value={lowStockItems.length + expiring.length} sub="requerem atenção" icon={AlertTriangle} color={lowStockItems.length + expiring.length > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"} />
      </div>

      {/* Alertas */}
      {(lowStockItems.length > 0 || expiring.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">
                  Estoque baixo de tinta nova ({lowStockItems.length} produto{lowStockItems.length > 1 ? "s" : ""})
                </p>
              </div>
              <ul className="space-y-1.5">
                {lowStockItems.map((p) => (
                  <li key={p.product_id} className="flex justify-between text-sm text-amber-700">
                    <span>{p.product_name}</span>
                    <span className="font-semibold">{Number(p.boxes_nova)} cx</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-red-600" />
                <p className="text-sm font-semibold text-red-800">
                  Vencendo em 30 dias ({expiring.length} lote{expiring.length > 1 ? "s" : ""})
                </p>
              </div>
              <ul className="space-y-1.5">
                {expiring.map((l) => (
                  <li key={l.lot_id} className="flex justify-between text-sm text-red-700">
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Saldo atual por produto</h3>
        </div>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package2 size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Nenhum produto cadastrado</p>
            <p className="text-xs text-slate-400 mt-1">Vá em Produtos para adicionar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Linha</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Nova (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Recuperada (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total (cx)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kg (nova)</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Lotes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{p.product_name}</td>
                  <td className="px-5 py-4 text-slate-500">{p.product_line}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold ${Number(p.boxes_nova) < 10 ? "text-amber-600" : "text-slate-900"}`}>
                      {Number(p.boxes_nova)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-violet-600 font-medium">{Number(p.boxes_recuperada)}</td>
                  <td className="px-5 py-4 text-right text-slate-500">{Number(p.total_boxes)}</td>
                  <td className="px-5 py-4 text-right text-slate-500">{Number(p.kg_nova).toFixed(2)}</td>
                  <td className="px-5 py-4 text-right text-slate-500">{Number(p.lot_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
