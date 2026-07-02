import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerEntry } from "./actions";
import Link from "next/link";
import { ArrowLeft, ArrowDownCircle } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";

interface LotOption {
  id: string;
  lot_number: string;
  product_name: string;
}

export default async function StockEntryPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("lots")
    .select("id, lot_number, products(name, line)")
    .order("created_at", { ascending: false });

  const lots: LotOption[] = ((data ?? []) as any[]).map((l) => ({
    id: l.id,
    lot_number: l.lot_number,
    product_name: l.products?.name ?? "",
  }));

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/movements"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Histórico
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ArrowDownCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Entrada de estoque</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Registre a chegada de produtos em um lote</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dados da entrada</p>
        </div>
        <form action={registerEntry} className="px-6 py-5 space-y-4">
          <FormField label="Lote">
            <select name="lot_id" required className={inputClass()}>
              <option value="">Selecione o lote...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.product_name} — Lote {l.lot_number}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Caixas" hint="Quantidade de caixas recebidas">
              <input name="boxes" type="number" step="0.01" min="0" defaultValue="0" className={inputClass()} />
            </FormField>
            <FormField label="Kg" hint="Peso total em quilogramas">
              <input name="kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
            </FormField>
          </div>

          <FormField label="Data da entrada">
            <input name="movement_date" type="date" required defaultValue={today} className={inputClass()} />
          </FormField>

          <FormField label="Motivo / Observação" optional>
            <input name="reason" className={inputClass()} placeholder="Ex: Reposição de estoque" />
          </FormField>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
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
