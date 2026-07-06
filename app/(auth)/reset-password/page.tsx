"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        window.history.replaceState(null, "", window.location.pathname);
      }
    });

    // fallback: se a sessão já foi processada antes deste efeito montar
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
        window.history.replaceState(null, "", window.location.pathname);
      }
    });

    // se depois de alguns segundos nada chegou, o link é inválido/expirado
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) setInvalid(true);
        return current;
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.rpc("mark_password_changed");

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Defina sua nova senha</h1>
          {!invalid && (
            <p className="text-sm text-slate-500 mt-2">
              Escolha uma nova senha para acessar o sistema.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          {invalid ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                Este link é inválido ou expirou. Peça um novo link em &quot;Esqueceu a senha?&quot; na tela de login.
              </p>
              <a href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Pedir novo link
              </a>
            </div>
          ) : !ready ? (
            <p className="text-sm text-slate-500 text-center py-4">Validando link de redefinição...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Nova senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass()}
                  placeholder="Mínimo 6 caracteres"
                />
              </FormField>

              <FormField label="Confirmar nova senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass()}
                  placeholder="Repita a senha"
                />
              </FormField>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
