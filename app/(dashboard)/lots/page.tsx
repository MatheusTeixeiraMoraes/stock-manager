import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import LotsTable from "@/components/lots/LotsTable";
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Lotes</h2>
          <p className="text-sm text-ink-soft mt-1">{lots.length} lote{lots.length !== 1 ? "s" : ""} registrado{lots.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/lots/new"
          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} />
          Novo lote
        </Link>
      </div>

      <LotsTable lots={lots} />
    </div>
  );
}
