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
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-ink">Defina sua nova senha</h1>
          {!invalid && (
            <p className="text-sm text-ink-soft mt-2">
              Escolha uma nova senha para acessar o sistema.
            </p>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-line shadow-sm p-8">
          {invalid ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">
                Este link é inválido ou expirou. Peça um novo link em &quot;Esqueceu a senha?&quot; na tela de login.
              </p>
              <a href="/forgot-password" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                Pedir novo link
              </a>
            </div>
          ) : !ready ? (
            <p className="text-sm text-ink-soft text-center py-4">Validando link de redefinição...</p>
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
                <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
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
