import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerExit } from "./actions";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
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
    <div className="max-w-lg space-y-5">
      <div>
        <Link href="/movements" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={14} />
          Histórico
        </Link>
        <h2 className="text-lg font-bold text-slate-900">Saída de estoque</h2>
        <p className="text-sm text-slate-500 mt-0.5">O sistema retira automaticamente do lote mais antigo (FIFO)</p>
      </div>

      {/* FIFO preview */}
      {fifoMap.size > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Info size={13} className="text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Próximo lote por produto (FIFO)</p>
          </div>
          <div className="divide-y divide-slate-100">
            {products.filter((p) => fifoMap.has(p.id)).map((p) => {
              const fifo = fifoMap.get(p.id)!;
              return (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{fifo.lot_number}</span>
                      {" · "}entrada {fifo.entry_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{Number(fifo.balance_boxes)} cx</p>
                    {fifo.expiry_date && (
                      <p className="text-xs text-amber-600 mt-0.5">vence {fifo.expiry_date}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form action={registerExit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Produto / Cor</label>
            <select
              name="product_id"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Selecione o produto...</option>
              {products.map((p) => {
                const fifo = fifoMap.get(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.line}
                    {fifo ? ` (${Number(fifo.balance_boxes)} cx disponíveis)` : " (sem estoque)"}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Caixas a retirar</label>
              <input
                name="boxes"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Kg <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                name="kg"
                type="number"
                step="0.0001"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Data da saída</label>
            <input
              name="movement_date"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Destino / Motivo <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              name="reason"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ex: Obra rua das Flores"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            Registrar saída
          </button>
        </form>
      </div>
    </div>
  );
}
