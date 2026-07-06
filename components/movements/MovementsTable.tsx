"use client";

import { useMemo, useState } from "react";
import { Search, ClipboardList, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import LotTypeBadge from "@/components/ui/LotTypeBadge";
import ExportCsvButton from "@/components/reports/ExportCsvButton";
import type { LotType } from "@/types/database";

interface MovementRow {
  id: string;
  type: "entry" | "exit";
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  lot_number: string;
  lot_type: LotType;
  product_name: string;
  registered_by_name: string;
}

type MovementFilter = "all" | "entry" | "exit";

export default function MovementsTable({ rows }: { rows: MovementRow[] }) {
  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesTerm =
        !term ||
        r.product_name.toLowerCase().includes(term) ||
        r.lot_number.toLowerCase().includes(term) ||
        r.registered_by_name.toLowerCase().includes(term) ||
        (r.reason ?? "").toLowerCase().includes(term);
      const matchesType = movementFilter === "all" || r.type === movementFilter;
      return matchesTerm && matchesType;
    });
  }, [rows, search, movementFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5 justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative max-w-xs flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por produto, lote, usuário ou motivo..."
              className="w-full border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="all">Todos os movimentos</option>
            <option value="entry">Entrada</option>
            <option value="exit">Saída</option>
          </select>
        </div>

        <ExportCsvButton
          filename="historico-movimentacoes.csv"
          headers={["Movimento", "Produto", "Lote", "Tipo", "Caixas", "Kg", "Data", "Usuário", "Motivo"]}
          rows={filtered.map((r) => [
            r.type === "entry" ? "Entrada" : "Saída",
            r.product_name,
            r.lot_number,
            r.lot_type,
            Number(r.boxes),
            Number(r.kg).toFixed(2),
            r.movement_date,
            r.registered_by_name,
            r.reason ?? "",
          ])}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              {rows.length === 0 ? "Nenhuma movimentação registrada" : "Nenhuma movimentação encontrada"}
            </p>
            {rows.length > 0 && <p className="text-xs text-slate-400 mt-1">Tente outro termo de busca ou filtro</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Movimento</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Lote</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Caixas</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kg</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuário</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    {r.type === "entry" ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <ArrowDownCircle size={11} />
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <ArrowUpCircle size={11} />
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800">{r.product_name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{r.lot_number}</span>
                  </td>
                  <td className="px-5 py-4"><LotTypeBadge type={r.lot_type} /></td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-800">{Number(r.boxes)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-slate-500">{Number(r.kg).toFixed(2)}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-500">{r.movement_date}</td>
                  <td className="px-5 py-4 text-slate-600">{r.registered_by_name}</td>
                  <td className="px-5 py-4 text-slate-400">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
