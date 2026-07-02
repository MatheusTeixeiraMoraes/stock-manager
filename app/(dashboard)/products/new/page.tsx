import { requireAdmin } from "@/lib/auth";
import { createProduct } from "@/app/(dashboard)/products/actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/products" className="text-sm text-slate-500 hover:text-slate-800">← Produtos</Link>
        <h2 className="text-xl font-semibold text-slate-900">Novo produto</h2>
      </div>

      <Card className="p-6">
        <form action={createProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Cor</label>
            <input
              name="name"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Azul Royal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linha / Tipo</label>
            <input
              name="line"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Esmalte Sintético"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Peso por caixa (kg)</label>
            <input
              name="unit_weight"
              type="number"
              step="0.0001"
              min="0"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 18.0000"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Salvar</Button>
            <Link href="/products">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
