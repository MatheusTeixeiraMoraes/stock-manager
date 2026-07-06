"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteLot } from "@/app/(dashboard)/lots/actions";

export default function DeleteLotButton({ lotId, lotNumber }: { lotId: string; lotNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`Excluir o lote ${lotNumber}? Essa ação não pode ser desfeita.`)) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteLot(lotId);
        router.push("/lots");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir lote.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:text-danger-hover border border-danger/25 hover:border-danger/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
      >
        <Trash2 size={12} />
        Excluir
      </button>
      {error && <p className="text-xs text-danger mt-1.5 max-w-[220px]">{error}</p>}
    </div>
  );
}
