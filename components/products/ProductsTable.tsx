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
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou linha..."
          className="w-full border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Palette size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {products.length === 0 ? 'Clique em "Novo produto" para começar' : "Tente outro termo de busca"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome / Cor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Linha</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Peso/cx (kg)</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-4 text-slate-500">{p.line}</td>
                  <td className="px-5 py-4 text-right text-slate-500 tabular-nums">{Number(p.unit_weight).toFixed(4)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/products/${p.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
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
