"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import { changePassword, type ChangePasswordState } from "@/app/(auth)/change-password/actions";

const initialState: ChangePasswordState = {};

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Nova senha">
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className={inputClass()}
          placeholder="Mínimo 6 caracteres"
        />
      </FormField>

      <FormField label="Confirmar nova senha">
        <input
          name="confirm"
          type="password"
          required
          minLength={6}
          className={inputClass()}
          placeholder="Repita a senha"
        />
      </FormField>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Lock size={15} />
        {pending ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
