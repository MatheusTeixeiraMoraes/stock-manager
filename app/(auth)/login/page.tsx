"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Package, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — identidade */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] bg-ink flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Package size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-canvas font-bold text-lg tracking-tight">Stock Manager</span>
        </div>

        {/* Conteúdo central */}
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-accent-soft/80 text-sm font-semibold tracking-wider uppercase">Sistema de Estoque</p>
            <h2 className="text-4xl font-bold text-canvas leading-tight">
              Controle total<br />do seu estoque.
            </h2>
            <p className="text-canvas/60 text-base leading-relaxed max-w-xs">
              Rastreie lotes, registre movimentações e tome decisões com dados em tempo real.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              "Controle de lotes com validade",
              "Saída FIFO automática",
              "Alertas de estoque baixo",
              "Histórico completo de movimentações",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/25 border border-accent flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-soft" />
                </div>
                <span className="text-canvas/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-canvas/30 text-xs">© 2025 Stock Manager</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-surface px-8 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Package size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-ink text-base tracking-tight">Stock Manager</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-ink">Bem-vindo de volta</h1>
            <p className="text-ink-soft text-sm mt-2">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-line rounded-lg pl-10 pr-4 py-3 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label className="block text-sm font-medium text-ink">Senha</label>
                <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-line rounded-lg pl-10 pr-4 py-3 text-sm text-ink bg-surface placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
