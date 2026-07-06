import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createLot } from "@/app/(dashboard)/lots/actions";
import Link from "next/link";
import { ArrowLeft, Boxes } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import LotFormFields from "@/components/lots/LotFormFields";
import type { Product } from "@/types/database";

export default async function NewLotPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, name, line, unit_weight").eq("active", true).order("name");
  const products = (data ?? []) as Pick<Product, "id" | "name" | "line" | "unit_weight">[];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/lots" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft/70 hover:text-ink transition-colors mb-4">
          <ArrowLeft size={13} />
          Lotes
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-tan flex items-center justify-center">
            <Boxes size={18} className="text-tan-ink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Novo lote</h2>
            <p className="text-xs text-ink-soft mt-0.5">Cadastre um novo lote vinculado a um produto</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Identificação</p>
        </div>
        <form action={createLot} className="px-6 py-5 space-y-4">
          <LotFormFields products={products} />

          <FormField label="Número do lote">
            <input name="lot_number" required className={inputClass()} placeholder="Ex: LOT-2024-001" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data de entrada">
              <input name="entry_date" type="date" required defaultValue={today} className={inputClass()} />
            </FormField>
            <FormField label="Data de fabricação" optional>
              <input name="manufacture_date" type="date" className={inputClass()} />
            </FormField>
          </div>

          <FormField label="Data de validade" optional>
            <input name="expiry_date" type="date" className={inputClass()} />
          </FormField>

          <FormField label="Observações" optional>
            <textarea name="notes" rows={2} className={inputClass()} />
          </FormField>

          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
              Salvar lote
            </button>
            <Link href="/lots" className="flex-1 text-center border border-line hover:bg-surface-alt text-ink font-medium rounded-lg py-2.5 text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
