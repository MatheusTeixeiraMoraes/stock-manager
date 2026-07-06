"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  title: string;
  userName: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, userName, onMenuClick }: TopBarProps) {
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
    <header className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 bg-surface border-b border-line flex-shrink-0 safe-top">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-ink-soft hover:text-ink p-1.5 -ml-1.5 flex-shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-ink-soft tracking-wide uppercase text-[11px] truncate hidden sm:block">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <Link href="/profile" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors hidden sm:block truncate max-w-[140px]">
            {userName}
          </span>
        </Link>
        <div className="w-px h-5 bg-line hidden sm:block" />
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
