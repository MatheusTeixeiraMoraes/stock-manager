"use client";

import { useState, useTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { activateDemoData, deactivateDemoData } from "@/app/(dashboard)/dashboard/actions";

export default function DemoDataButton({ active }: { active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (active && !confirm("Remover todos os dados de demonstração? Essa ação não pode ser desfeita.")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        if (active) {
          await deactivateDemoData();
        } else {
          await activateDemoData();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao processar dados de demonstração.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors disabled:opacity-50 ${
          active
            ? "text-danger border-danger/25 hover:border-danger/40"
            : "text-accent border-accent/30 hover:border-accent/50"
        }`}
      >
        {active ? <Trash2 size={12} /> : <Sparkles size={12} />}
        {isPending
          ? "Processando..."
          : active
          ? "Remover dados de demonstração"
          : "Ativar dados de demonstração"}
      </button>
      {error && <p className="text-xs text-danger max-w-[220px] text-right">{error}</p>}
    </div>
  );
}
