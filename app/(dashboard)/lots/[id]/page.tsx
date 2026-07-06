import { requireAuth, getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LotTypeBadge from "@/components/ui/LotTypeBadge";
import DeleteLotButton from "@/components/lots/DeleteLotButton";
import Link from "next/link";
import { Pencil } from "lucide-react";
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
  const user = await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  const [role, lotResult, movementsResult] = await Promise.all([
    getUserRole(user.id),
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/lots" className="text-sm text-ink-soft hover:text-ink flex-shrink-0">← Lotes</Link>
          <h2 className="text-xl font-semibold text-ink truncate">Lote {lot.lot_number}</h2>
        </div>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <Link
              href={`/lots/${lot.lot_id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-accent border border-line hover:border-accent/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Pencil size={12} />
              Editar
            </Link>
            <DeleteLotButton lotId={lot.lot_id} lotNumber={lot.lot_number} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-ink-soft mb-1">Tipo</p>
          <LotTypeBadge type={lot.lot_type} />
        </Card>
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
            <p className="text-xs text-ink-soft mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-ink">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-line">
          <h3 className="text-sm font-semibold text-ink">Histórico de movimentações</h3>
        </div>
        {movements.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-soft/70 text-center">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Tipo</th>
                <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Cxs</th>
                <th className="px-5 py-2 text-right text-xs font-semibold text-ink-soft uppercase">Kg</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Data</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Usuário</th>
                <th className="px-5 py-2 text-left text-xs font-semibold text-ink-soft uppercase">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
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
                  <td className="px-5 py-3 text-ink-soft/70">{m.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
