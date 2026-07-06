import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registerExit } from "./actions";
import Link from "next/link";
import { ArrowLeft, ArrowUpCircle } from "lucide-react";
import ExitFields from "@/components/stock/ExitFields";
import type { FifoNextLot, Product } from "@/types/database";

export default async function StockExitPage() {
  await requireAuth();
  const supabase = await createClient();

  const [productsResult, fifoResult] = await Promise.all([
    supabase.from("products").select("id, name, line, unit_weight").eq("active", true).order("name"),
    supabase.from("v_fifo_next_lot").select("*"),
  ]);

  const products = (productsResult.data ?? []) as Pick<Product, "id" | "name" | "line" | "unit_weight">[];
  const fifoRows = (fifoResult.data ?? []) as FifoNextLot[];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/movements"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft/70 hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Histórico
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
            <ArrowUpCircle size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Saída de estoque</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Nova = uso em obra · Recuperada = venda. O sistema retira do lote mais antigo automaticamente (FIFO).
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Dados da saída</p>
        </div>
        <form action={registerExit} className="px-6 py-5 space-y-4">
          <ExitFields products={products} fifoRows={fifoRows} today={today} />
        </form>
      </div>
    </div>
  );
}
