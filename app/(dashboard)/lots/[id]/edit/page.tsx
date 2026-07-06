import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateLot } from "@/app/(dashboard)/lots/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import type { Lot } from "@/types/database";

export default async function EditLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("lots")
    .select("*, products(name, line)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const lot = data as Lot & { products: { name: string; line: string } };
  const action = updateLot.bind(null, id);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href={`/lots/${id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft/70 hover:text-ink transition-colors mb-4">
          <ArrowLeft size={13} />
          Lote {lot.lot_number}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-tan flex items-center justify-center">
            <Boxes size={18} className="text-tan-ink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Editar lote</h2>
            <p className="text-xs text-ink-soft mt-0.5">{lot.products.name} — {lot.products.line}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Identificação</p>
        </div>
        <form action={action} className="px-6 py-5 space-y-4">
          <FormField label="Tipo de lote" hint="Cuidado: alterar o tipo afeta o FIFO de saída (nova/recuperada rodam em pools separados)">
            <select name="lot_type" defaultValue={lot.lot_type} className={inputClass()}>
              <option value="nova">Nova</option>
              <option value="recuperada">Recuperada</option>
            </select>
          </FormField>

          <FormField label="Número do lote">
            <input name="lot_number" required defaultValue={lot.lot_number} className={inputClass()} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Data de entrada">
              <input name="entry_date" type="date" required defaultValue={lot.entry_date} className={inputClass()} />
            </FormField>
            <FormField label="Data de fabricação" optional>
              <input name="manufacture_date" type="date" defaultValue={lot.manufacture_date ?? ""} className={inputClass()} />
            </FormField>
          </div>

          <FormField label="Data de validade" optional>
            <input name="expiry_date" type="date" defaultValue={lot.expiry_date ?? ""} className={inputClass()} />
          </FormField>

          <FormField label="Observações" optional>
            <textarea name="notes" rows={2} defaultValue={lot.notes ?? ""} className={inputClass()} />
          </FormField>

          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
              Salvar alterações
            </button>
            <Link href={`/lots/${id}`} className="flex-1 text-center border border-line hover:bg-surface-alt text-ink font-medium rounded-lg py-2.5 text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
