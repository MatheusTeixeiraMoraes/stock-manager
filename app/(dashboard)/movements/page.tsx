import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MovementsTable from "@/components/movements/MovementsTable";
import type { LotType } from "@/types/database";

interface MovementRow {
  id: string;
  type: "entry" | "exit";
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  lot_number: string;
  lot_type: LotType;
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
        <h2 className="text-xl font-bold text-ink">Histórico de Movimentações</h2>
        <p className="text-sm text-ink-soft mt-1">Últimas {rows.length} movimentações</p>
      </div>

      <MovementsTable rows={rows} />
    </div>
  );
}
