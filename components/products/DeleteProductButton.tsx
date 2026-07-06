"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/(dashboard)/products/actions";

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`Excluir o produto ${productName}? Essa ação não pode ser desfeita.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Excluir produto"
        className="text-ink-soft/60 hover:text-danger transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
      {error && <p className="text-[11px] text-danger max-w-[160px] text-right">{error}</p>}
    </div>
  );
}
