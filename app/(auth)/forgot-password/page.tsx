import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <KeyRound size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Esqueceu sua senha?</h1>
          <p className="text-sm text-slate-500 mt-2">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <ForgotPasswordForm />
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
