import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerExit } from "./actions";
import Link from "next/link";
import { ArrowLeft, ArrowUpCircle, Boxes } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
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
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/movements"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Histórico
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <ArrowUpCircle size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Saída de estoque</h2>
            <p className="text-xs text-zinc-500 mt-0.5">O sistema retira do lote mais antigo automaticamente (FIFO)</p>
          </div>
        </div>
      </div>

      {/* FIFO info */}
      {fifoMap.size > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
            <Boxes size={13} className="text-zinc-400" />
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Próximo lote (FIFO) por produto</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {products.filter((p) => fifoMap.has(p.id)).map((p) => {
              const fifo = fifoMap.get(p.id)!;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{p.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[11px]">
                        {fifo.lot_number}
                      </span>
                      <span>entrada {fifo.entry_date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">{Number(fifo.balance_boxes)} cx</p>
                    {fifo.expiry_date && (
                      <p className="text-[11px] text-amber-600 mt-0.5">vence {fifo.expiry_date}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dados da saída</p>
        </div>
        <form action={registerExit} className="px-6 py-5 space-y-4">
          <FormField label="Produto / Cor">
            <select name="product_id" required className={inputClass()}>
              <option value="">Selecione o produto...</option>
              {products.map((p) => {
                const fifo = fifoMap.get(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.line}
                    {fifo
                      ? ` (${Number(fifo.balance_boxes)} cx disponíveis)`
                      : " (sem estoque)"}
                  </option>
                );
              })}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Caixas a retirar">
              <input name="boxes" type="number" step="0.01" min="0" required defaultValue="0" className={inputClass()} />
            </FormField>
            <FormField label="Kg" optional>
              <input name="kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
            </FormField>
          </div>

          <FormField label="Data da saída">
            <input name="movement_date" type="date" required defaultValue={today} className={inputClass()} />
          </FormField>

          <FormField label="Destino / Motivo" optional>
            <input name="reason" className={inputClass()} placeholder="Ex: Obra rua das Flores" />
          </FormField>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpCircle size={15} />
              Registrar saída
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
