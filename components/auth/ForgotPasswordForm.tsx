"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { requestPasswordReset, type ForgotPasswordState } from "@/app/(auth)/forgot-password/actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="bg-moss-soft border border-moss/20 rounded-lg px-4 py-3 text-sm text-moss-ink">
        Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.
        Confira também a caixa de spam.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-ink">E-mail</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
          <input
            name="email"
            type="email"
            required
            className="w-full border border-line rounded-lg pl-10 pr-4 py-3 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition-colors"
      >
        {pending ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
