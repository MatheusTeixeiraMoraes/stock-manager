import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LotBalance } from "@/types/database";

interface Movement {
  id: string;
  type: "entry" | "exit";
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  registered_by_name: string;
}

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  const [lotResult, movementsResult] = await Promise.all([
    supabase.from("v_lot_balance").select("*").eq("lot_id", id).single(),
    supabase
      .from("v_movement_history")
      .select("id, type, boxes, kg, movement_date, reason, registered_by_name")
      .eq("lot_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!lotResult.data) notFound();

  const lot = lotResult.data as LotBalance;
  const movements = (movementsResult.data ?? []) as Movement[];

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/lots" className="text-sm text-slate-500 hover:text-slate-800">← Lotes</Link>
        <h2 className="text-xl font-semibold text-slate-900">Lote {lot.lot_number}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Produto", value: lot.product_name },
          { label: "Linha", value: lot.product_line },
          { label: "Saldo caixas", value: String(Number(lot.balance_boxes)) },
          { label: "Saldo kg", value: Number(lot.balance_kg).toFixed(2) },
          { label: "Entrada", value: lot.entry_date },
          { label: "Fabricação", value: lot.manufacture_date ?? "—" },
          { label: "Validade", value: lot.expiry_date ?? "—" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-slate-800">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Histórico de movimentações</h3>
        </div>
        {movements.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">Nenhuma movimentação registrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Cxs</th>
                <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Kg</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Data</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Usuário</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3">
                    <Badge variant={m.type === "entry" ? "success" : "info"}>
                      {m.type === "entry" ? "Entrada" : "Saída"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">{Number(m.boxes)}</td>
                  <td className="px-5 py-3 text-right">{Number(m.kg).toFixed(2)}</td>
                  <td className="px-5 py-3">{m.movement_date}</td>
                  <td className="px-5 py-3">{m.registered_by_name}</td>
                  <td className="px-5 py-3 text-slate-400">{m.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
