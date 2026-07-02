import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Product } from "@/types/database";

export default async function ProductsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Produtos / Cores</h2>
        <Link href="/products/new">
          <Button>+ Novo produto</Button>
        </Link>
      </div>

      <Card>
        {products.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">
            Nenhum produto cadastrado.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Linha</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Peso/cx (kg)</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600">{p.line}</td>
                  <td className="px-5 py-3 text-slate-600">{Number(p.unit_weight).toFixed(4)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={p.active ? "success" : "default"}>
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/products/${p.id}`} className="text-blue-600 hover:underline text-xs">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
