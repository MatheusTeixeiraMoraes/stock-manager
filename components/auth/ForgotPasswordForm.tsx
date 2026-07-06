"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { requestPasswordReset, type ForgotPasswordState } from "@/app/(auth)/forgot-password/actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
        Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.
        Confira também a caixa de spam.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-800">E-mail</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            name="email"
            type="email"
            required
            className="w-full border border-zinc-300 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
      >
        {pending ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
