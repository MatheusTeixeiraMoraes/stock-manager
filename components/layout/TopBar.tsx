"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  title: string;
  userName: string;
}

export default function TopBar({ title, userName }: TopBarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{userName}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
