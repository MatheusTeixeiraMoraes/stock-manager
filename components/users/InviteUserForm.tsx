"use client";

import { useActionState, useState } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import { createUser, type CreateUserState } from "@/app/(dashboard)/users/actions";

const initialState: CreateUserState = {};

export default function InviteUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!state.success) return;
    await navigator.clipboard.writeText(state.success.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
        <UserPlus size={14} className="text-zinc-400" />
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Novo usuário</p>
      </div>
      <form action={formAction} className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome completo">
            <input name="full_name" required className={inputClass()} placeholder="Ex: João da Silva" />
          </FormField>
          <FormField label="E-mail">
            <input name="email" type="email" required className={inputClass()} placeholder="joao@email.com" />
          </FormField>
        </div>

        <FormField label="Papel">
          <select name="role" defaultValue="operator" className={inputClass()}>
            <option value="operator">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </FormField>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
        )}

        {state.success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-1.5">
            <p className="text-sm text-emerald-800 font-medium">
              Usuário criado! Repasse a senha temporária para {state.success.email}:
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-white border border-emerald-300 text-emerald-700 font-mono text-sm px-3 py-1.5 rounded-lg">
                {state.success.password}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-emerald-600">
              Envie por WhatsApp/e-mail. O usuário pode trocar a senha depois de entrar.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus size={15} />
          {pending ? "Criando..." : "Criar usuário"}
        </button>
      </form>
    </div>
  );
}
