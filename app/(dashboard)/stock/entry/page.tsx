import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerEntry } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-lg space-y-5">
      <div>
        <Link href="/movements" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={14} />
          Histórico
        </Link>
        <h2 className="text-lg font-bold text-slate-900">Entrada de estoque</h2>
        <p className="text-sm text-slate-500 mt-0.5">Registre a chegada de produtos em um lote</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form action={registerEntry} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lote</label>
            <select
              name="lot_id"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Selecione o lote...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.product_name} — Lote {l.lot_number}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Caixas</label>
              <input
                name="boxes"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kg</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Data da entrada</label>
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
              Motivo / Observação <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              name="reason"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ex: Reposição de estoque"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            Registrar entrada
          </button>
        </form>
      </div>
    </div>
  );
}
