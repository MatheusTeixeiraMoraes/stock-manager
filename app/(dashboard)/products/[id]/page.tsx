import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/(dashboard)/products/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Palette } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import type { Product } from "@/types/database";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  if (!data) notFound();

  const product = data as Product;
  const action = updateProduct.bind(null, id);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft/70 hover:text-ink transition-colors mb-4">
          <ArrowLeft size={13} />
          Produtos
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-tan flex items-center justify-center">
            <Palette size={18} className="text-tan-ink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Editar produto</h2>
            <p className="text-xs text-ink-soft mt-0.5">{product.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Informações do produto</p>
        </div>
        <form action={action} className="px-6 py-5 space-y-4">
          <FormField label="Nome / Cor">
            <input name="name" required defaultValue={product.name} className={inputClass()} />
          </FormField>
          <FormField label="Linha / Tipo">
            <input name="line" required defaultValue={product.line} className={inputClass()} />
          </FormField>
          <FormField label="Peso da caixa nova (kg)" hint="Toda tinta nova usa esse peso fixo por caixa. Tinta recuperada tem peso variável, informado manualmente.">
            <input name="unit_weight" type="number" step="0.0001" min="0" required defaultValue={product.unit_weight} className={inputClass()} />
          </FormField>
          <FormField label="Status">
            <select name="active" defaultValue={product.active ? "true" : "false"} className={inputClass()}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </FormField>

          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
              Salvar alterações
            </button>
            <Link href="/products" className="flex-1 text-center border border-line hover:bg-surface-alt text-ink font-medium rounded-lg py-2.5 text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
