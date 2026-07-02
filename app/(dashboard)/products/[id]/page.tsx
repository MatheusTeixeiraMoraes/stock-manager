import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/(dashboard)/products/actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/products" className="text-sm text-slate-500 hover:text-slate-800">← Produtos</Link>
        <h2 className="text-xl font-semibold text-slate-900">Editar produto</h2>
      </div>

      <Card className="p-6">
        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Cor</label>
            <input
              name="name"
              required
              defaultValue={product.name}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linha / Tipo</label>
            <input
              name="line"
              required
              defaultValue={product.line}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              defaultValue={product.unit_weight}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              name="active"
              defaultValue={product.active ? "true" : "false"}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
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
