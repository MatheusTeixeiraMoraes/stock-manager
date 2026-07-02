import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createLot } from "@/app/(dashboard)/lots/actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import type { Product } from "@/types/database";

export default async function NewLotPage() {
  await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, name, line").eq("active", true).order("name");
  const products = (data ?? []) as Pick<Product, "id" | "name" | "line">[];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/lots" className="text-sm text-slate-500 hover:text-slate-800">← Lotes</Link>
        <h2 className="text-xl font-semibold text-slate-900">Novo lote</h2>
      </div>

      <Card className="p-6">
        <form action={createLot} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Produto / Cor</label>
            <select
              name="product_id"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.line}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número do lote</label>
            <input
              name="lot_number"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: LOT-2024-001"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de entrada</label>
              <input
                name="entry_date"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de fabricação</label>
              <input
                name="manufacture_date"
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de validade (opcional)</label>
            <input
              name="expiry_date"
              type="date"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. inicial (caixas)</label>
              <input
                name="initial_boxes"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. inicial (kg)</label>
              <input
                name="initial_kg"
                type="number"
                step="0.0001"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações (opcional)</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Salvar lote</Button>
            <Link href="/lots">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
