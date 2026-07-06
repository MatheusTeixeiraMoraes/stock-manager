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
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/15" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-indigo-500/10" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-indigo-600/8" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Package size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Stock Manager</span>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p className="text-indigo-400 text-sm font-semibold tracking-wider uppercase">Sistema de Estoque</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Controle total<br />do seu estoque.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
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
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-700 text-xs">© 2025 Stock Manager</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Package size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">Stock Manager</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm mt-2">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-800">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label className="block text-sm font-medium text-zinc-800">Senha</label>
                <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-sm shadow-indigo-200"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
