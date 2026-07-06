"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Boxes, Eye } from "lucide-react";
import LotTypeBadge from "@/components/ui/LotTypeBadge";
import type { LotBalance } from "@/types/database";

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-ink-soft/50">—</span>;
  const today = new Date();
  const expiry = new Date(date);
  const diff = (expiry.getTime() - today.getTime()) / 86400000;

  let cls = "bg-moss-soft text-moss-ink";
  if (diff <= 7) cls = "bg-danger-soft text-danger";
  else if (diff <= 30) cls = "bg-warn-soft text-warn-ink";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {date}
    </span>
  );
}

type TypeFilter = "all" | "nova" | "recuperada";

export default function LotsTable({ lots }: { lots: LotBalance[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lots.filter((l) => {
      const matchesTerm =
        !term ||
        l.product_name.toLowerCase().includes(term) ||
        l.lot_number.toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || l.lot_type === typeFilter;
      return matchesTerm && matchesType;
    });
  }, [lots, search, typeFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou número de lote..."
            className="w-full border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
        >
          <option value="all">Todos os tipos</option>
          <option value="nova">Nova</option>
          <option value="recuperada">Recuperada</option>
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Boxes size={32} className="text-ink-soft/40 mb-3" />
            <p className="text-sm font-medium text-ink-soft">
              {lots.length === 0 ? "Nenhum lote cadastrado" : "Nenhum lote encontrado"}
            </p>
            <p className="text-xs text-ink-soft/70 mt-1">
              {lots.length === 0 ? 'Clique em "Novo lote" para começar' : "Tente outro termo de busca ou filtro"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-line">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Lote</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Entrada</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Validade</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Saldo cx</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Saldo kg</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((l) => (
                <tr key={l.lot_id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-4 font-medium text-ink">{l.product_name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-surface-alt text-ink-soft px-1.5 py-0.5 rounded">
                      {l.lot_number}
                    </span>
                  </td>
                  <td className="px-5 py-4"><LotTypeBadge type={l.lot_type} /></td>
                  <td className="px-5 py-4 text-ink-soft tabular-nums">{l.entry_date}</td>
                  <td className="px-5 py-4"><ExpiryBadge date={l.expiry_date} /></td>
                  <td className="px-5 py-4 text-right font-semibold text-ink tabular-nums">{Number(l.balance_boxes)}</td>
                  <td className="px-5 py-4 text-right text-ink-soft tabular-nums">{Number(l.balance_kg).toFixed(2)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/lots/${l.lot_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft/70 hover:text-accent transition-colors">
                      <Eye size={12} />
                      Ver
                    </Link>
                  </td>
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
