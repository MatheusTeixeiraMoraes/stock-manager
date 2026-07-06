"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/(dashboard)/users/actions";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`Excluir a conta de ${userName}? Essa ação não pode ser desfeita.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Excluir usuário"
        className="text-ink-soft/60 hover:text-danger transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
      {error && <p className="text-[11px] text-danger max-w-[140px] text-right">{error}</p>}
    </div>
  );
}
