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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por produto, lote, usuário ou motivo..."
              className="w-full border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
            />
          </div>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
            className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
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

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList size={32} className="text-ink-soft/40 mb-3" />
            <p className="text-sm font-medium text-ink-soft">
              {rows.length === 0 ? "Nenhuma movimentação registrada" : "Nenhuma movimentação encontrada"}
            </p>
            {rows.length > 0 && <p className="text-xs text-ink-soft/70 mt-1">Tente outro termo de busca ou filtro</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-line">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Movimento</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Produto</th>
                <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Lote</th>
                <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Caixas</th>
                <th className="hidden sm:table-cell px-5 py-3 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Kg</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Data</th>
                <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Usuário</th>
                <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-4">
                    {r.type === "entry" ? (
                      <span className="inline-flex items-center gap-1.5 text-moss-ink bg-moss-soft px-2 py-0.5 rounded-md text-xs font-medium">
                        <ArrowDownCircle size={11} />
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-accent bg-accent-soft px-2 py-0.5 rounded-md text-xs font-medium">
                        <ArrowUpCircle size={11} />
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-ink">{r.product_name}</td>
                  <td className="hidden md:table-cell px-5 py-4">
                    <span className="font-mono text-xs bg-surface-alt text-ink-soft px-1.5 py-0.5 rounded">{r.lot_number}</span>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4"><LotTypeBadge type={r.lot_type} /></td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">{Number(r.boxes)}</td>
                  <td className="hidden sm:table-cell px-5 py-4 text-right tabular-nums text-ink-soft">{Number(r.kg).toFixed(2)}</td>
                  <td className="px-5 py-4 tabular-nums text-ink-soft">{r.movement_date}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-ink-soft">{r.registered_by_name}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-ink-soft/70">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
