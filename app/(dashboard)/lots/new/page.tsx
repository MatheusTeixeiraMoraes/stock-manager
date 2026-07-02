import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createLot } from "@/app/(dashboard)/lots/actions";
import Link from "next/link";
import { ArrowLeft, Boxes } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import type { Product } from "@/types/database";

export default async function NewLotPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, name, line").eq("active", true).order("name");
  const products = (data ?? []) as Pick<Product, "id" | "name" | "line">[];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/lots" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-4">
          <ArrowLeft size={13} />
          Lotes
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <Boxes size={18} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Novo lote</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Cadastre um novo lote vinculado a um produto</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Identificação</p>
        </div>
        <form action={createLot} className="px-6 py-5 space-y-4">
          <FormField label="Produto / Cor">
            <select name="product_id" required className={inputClass()}>
              <option value="">Selecione...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.line}</option>
              ))}
            </select>
          </FormField>

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

          <div className="border-t border-zinc-100 pt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quantidade inicial</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Caixas" hint="Deixe 0 para registrar depois">
                <input name="initial_boxes" type="number" step="0.01" min="0" defaultValue="0" className={inputClass()} />
              </FormField>
              <FormField label="Kg" hint="Deixe 0 para registrar depois">
                <input name="initial_kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
              </FormField>
            </div>
          </div>

          <FormField label="Observações" optional>
            <textarea name="notes" rows={2} className={inputClass()} />
          </FormField>

          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
              Salvar lote
            </button>
            <Link href="/lots" className="flex-1 text-center border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-xl py-2.5 text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
