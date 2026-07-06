import { requireAuth, getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";
import FormField, { inputClass } from "@/components/ui/FormField";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { User } from "lucide-react";
import type { UserProfile } from "@/types/database";

export default async function ProfilePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [role, profileResult] = await Promise.all([
    getUserRole(user.id),
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
  ]);

  const profile = profileResult.data as UserProfile;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
          <User size={18} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink">Meu perfil</h2>
          <p className="text-xs text-ink-soft mt-0.5">Suas informações e preferências de acesso</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Informações da conta</p>
        </div>
        <form action={updateProfile} className="px-6 py-5 space-y-4">
          <FormField label="Nome completo">
            <input name="full_name" required defaultValue={profile.full_name} className={inputClass()} />
          </FormField>

          <FormField label="E-mail" hint="Não pode ser alterado por aqui">
            <input disabled value={user.email ?? ""} className={`${inputClass()} bg-surface-alt text-ink-soft`} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Papel">
              <div className={`${inputClass()} bg-surface-alt text-ink-soft flex items-center`}>
                {role === "admin" ? "Administrador" : "Operador"}
              </div>
            </FormField>
            <FormField label="Membro desde">
              <div className={`${inputClass()} bg-surface-alt text-ink-soft flex items-center`}>
                {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </div>
            </FormField>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-alt">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Segurança — trocar senha</p>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
