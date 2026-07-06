import { requireAuth } from "@/lib/auth";
import { Lock } from "lucide-react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default async function ChangePasswordPage() {
  await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Defina sua senha</h1>
          <p className="text-sm text-slate-500 mt-2">
            Por segurança, troque a senha temporária antes de continuar.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
