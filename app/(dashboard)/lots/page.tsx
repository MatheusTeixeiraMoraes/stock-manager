import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { LotBalance } from "@/types/database";

export default async function LotsPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_lot_balance")
    .select("*")
    .order("product_name")
    .order("entry_date");

  const lots = (data ?? []) as LotBalance[];
  const today = new Date().toISOString().split("T")[0];

  function expiryVariant(date: string | null) {
    if (!date) return "default" as const;
    const diff = (new Date(date).getTime() - new Date(today).getTime()) / 86400000;
    if (diff <= 7) return "danger" as const;
    if (diff <= 30) return "warning" as const;
    return "success" as const;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Lotes</h2>
        <Link href="/lots/new">
          <Button>+ Novo lote</Button>
        </Link>
      </div>

      <Card>
        {lots.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">Nenhum lote cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Lote</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Entrada</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Validade</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo cxs</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo kg</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map((l) => (
                <tr key={l.lot_id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{l.product_name}</td>
                  <td className="px-5 py-3 text-slate-600">{l.lot_number}</td>
                  <td className="px-5 py-3 text-slate-600">{l.entry_date}</td>
                  <td className="px-5 py-3">
                    {l.expiry_date ? (
                      <Badge variant={expiryVariant(l.expiry_date)}>{l.expiry_date}</Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800">{Number(l.balance_boxes)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{Number(l.balance_kg).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/lots/${l.lot_id}`} className="text-blue-600 hover:underline text-xs">
                      Ver
                    </Link>
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
