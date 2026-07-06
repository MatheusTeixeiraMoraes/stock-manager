import { requireAuth } from "@/lib/auth";
import { Lock } from "lucide-react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default async function ChangePasswordPage() {
  await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-ink">Defina sua senha</h1>
          <p className="text-sm text-ink-soft mt-2">
            Por segurança, troque a senha temporária antes de continuar.
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-line shadow-sm p-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
