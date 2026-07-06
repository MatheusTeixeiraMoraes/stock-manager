import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerEntry } from "./actions";
import Link from "next/link";
import { ArrowLeft, ArrowDownCircle } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import EntryFields from "@/components/stock/EntryFields";

interface LotOption {
  id: string;
  lot_number: string;
  lot_type: "nova" | "recuperada";
  product_name: string;
  unit_weight: number;
}

export default async function StockEntryPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("lots")
    .select("id, lot_number, lot_type, products(name, line, unit_weight)")
    .order("created_at", { ascending: false });

  const lots: LotOption[] = ((data ?? []) as any[]).map((l) => ({
    id: l.id,
    lot_number: l.lot_number,
    lot_type: l.lot_type,
    product_name: l.products?.name ?? "",
    unit_weight: Number(l.products?.unit_weight ?? 0),
  }));

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/movements"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft/70 hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Histórico
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-moss-soft flex items-center justify-center">
            <ArrowDownCircle size={18} className="text-moss-ink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Entrada de estoque</h2>
            <p className="text-xs text-ink-soft mt-0.5">Registre a chegada de produtos em um lote</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Dados da entrada</p>
        </div>
        <form action={registerEntry} className="px-6 py-5 space-y-4">
          <EntryFields lots={lots} />

          <FormField label="Data da entrada">
            <input name="movement_date" type="date" required defaultValue={today} className={inputClass()} />
          </FormField>

          <FormField label="Motivo / Observação" optional>
            <input name="reason" className={inputClass()} placeholder="Ex: Reposição de estoque" />
          </FormField>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-moss hover:bg-moss-hover text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownCircle size={15} />
              Registrar entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
