"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface border-b border-line flex-shrink-0">
      <span className="text-sm font-semibold text-ink-soft tracking-wide uppercase text-[11px]">
        {title}
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <span className="text-sm font-medium text-ink">{userName}</span>
        </div>
        <div className="w-px h-5 bg-line" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}
