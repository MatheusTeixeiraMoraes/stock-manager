"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Palette, Pencil } from "lucide-react";
import type { Product } from "@/types/database";

export default function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.line.toLowerCase().includes(term)
    );
  }, [products, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou linha..."
          className="w-full border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
        />
      </div>

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Palette size={32} className="text-ink-soft/40 mb-3" />
            <p className="text-sm font-medium text-ink-soft">
              {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
            </p>
            <p className="text-xs text-ink-soft/70 mt-1">
              {products.length === 0 ? 'Clique em "Novo produto" para começar' : "Tente outro termo de busca"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-line">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Nome / Cor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">Linha</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-soft uppercase tracking-wide">Peso/cx (kg)</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-soft uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-4 font-medium text-ink">{p.name}</td>
                  <td className="px-5 py-4 text-ink-soft">{p.line}</td>
                  <td className="px-5 py-4 text-right text-ink-soft tabular-nums">{Number(p.unit_weight).toFixed(4)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${p.active ? "bg-moss-soft text-moss-ink" : "bg-surface-alt text-ink-soft"}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/products/${p.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft/70 hover:text-accent transition-colors">
                      <Pencil size={12} />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
