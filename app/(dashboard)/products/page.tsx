import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import type { Product } from "@/types/database";

export default async function ProductsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Produtos / Cores</h2>
          <p className="text-sm text-ink-soft mt-1">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} />
          Novo produto
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
