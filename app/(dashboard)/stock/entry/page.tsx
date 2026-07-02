import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerEntry } from "./actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface LotOption {
  id: string;
  lot_number: string;
  product_name: string;
  product_line: string;
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
    product_line: l.products?.line ?? "",
  }));

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold text-slate-900">Entrada de estoque</h2>

      <Card className="p-6">
        <form action={registerEntry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lote</label>
            <select
              name="lot_id"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o lote...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.product_name} — Lote {l.lot_number}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Caixas</label>
              <input
                name="boxes"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kg</label>
              <input
                name="kg"
                type="number"
                step="0.0001"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data da entrada</label>
            <input
              name="movement_date"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observação (opcional)</label>
            <input
              name="reason"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Reposição de estoque"
            />
          </div>
          <Button type="submit" className="w-full justify-center">Registrar entrada</Button>
        </form>
      </Card>
    </div>
  );
}
