import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerExit } from "./actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { FifoNextLot, Product } from "@/types/database";

export default async function StockExitPage() {
  await requireAuth();
  const supabase = await createClient();

  const [productsResult, fifoResult] = await Promise.all([
    supabase.from("products").select("id, name, line").eq("active", true).order("name"),
    supabase.from("v_fifo_next_lot").select("*"),
  ]);

  const products = (productsResult.data ?? []) as Pick<Product, "id" | "name" | "line">[];
  const fifoMap = new Map(
    ((fifoResult.data ?? []) as FifoNextLot[]).map((f) => [f.product_id, f])
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold text-slate-900">Saída de estoque (FIFO)</h2>

      {/* Tabela FIFO informativa */}
      {fifoMap.size > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Próximo lote por produto (FIFO)</p>
          </div>
          <div className="divide-y divide-slate-100">
            {products.filter((p) => fifoMap.has(p.id)).map((p) => {
              const fifo = fifoMap.get(p.id)!;
              return (
                <div key={p.id} className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">Lote {fifo.lot_number} · entrada {fifo.entry_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{Number(fifo.balance_boxes)} cx</p>
                    {fifo.expiry_date && (
                      <Badge variant="warning" className="mt-0.5">{fifo.expiry_date}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <form action={registerExit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Produto / Cor</label>
            <select
              name="product_id"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o produto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.line}
                  {fifoMap.has(p.id) ? ` (${Number(fifoMap.get(p.id)!.balance_boxes)} cx disponíveis)` : " (sem estoque)"}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Caixas a retirar</label>
              <input
                name="boxes"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kg (opcional)</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Data da saída</label>
            <input
              name="movement_date"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destino / Motivo (opcional)</label>
            <input
              name="reason"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Obra rua das Flores"
            />
          </div>
          <p className="text-xs text-slate-400">
            O sistema retirará automaticamente do lote mais antigo (FIFO). Se necessário, distribuirá entre múltiplos lotes.
          </p>
          <Button type="submit" className="w-full justify-center">Registrar saída</Button>
        </form>
      </Card>
    </div>
  );
}
