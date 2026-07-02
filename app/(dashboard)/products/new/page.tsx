import { requireAdmin } from "@/lib/auth";
import { createProduct } from "@/app/(dashboard)/products/actions";
import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-4">
          <ArrowLeft size={13} />
          Produtos
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <Palette size={18} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Novo produto</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Cadastre uma nova cor ou linha de produto</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Informações do produto</p>
        </div>
        <form action={createProduct} className="px-6 py-5 space-y-4">
          <FormField label="Nome / Cor">
            <input name="name" required className={inputClass()} placeholder="Ex: Azul Royal" />
          </FormField>
          <FormField label="Linha / Tipo">
            <input name="line" required className={inputClass()} placeholder="Ex: Esmalte Sintético" />
          </FormField>
          <FormField label="Peso por caixa (kg)" hint="Usado para converter caixas em kg automaticamente">
            <input name="unit_weight" type="number" step="0.0001" min="0" required className={inputClass()} placeholder="Ex: 18.0000" />
          </FormField>

          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
              Salvar produto
            </button>
            <Link href="/products" className="flex-1 text-center border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-xl py-2.5 text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
