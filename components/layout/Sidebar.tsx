"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/lots", label: "Lotes", icon: "📦" },
  { href: "/stock/entry", label: "Entrada", icon: "⬇️" },
  { href: "/stock/exit", label: "Saída (FIFO)", icon: "⬆️" },
  { href: "/movements", label: "Histórico", icon: "📋" },
  { href: "/reports", label: "Relatórios", icon: "📈" },
  { href: "/products", label: "Produtos", icon: "🎨", adminOnly: true },
  { href: "/users", label: "Usuários", icon: "👥", adminOnly: true },
];

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <span className="font-bold text-slate-900 text-base">Stock Manager</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        <span className="text-xs text-slate-400 px-3">
          {role === "admin" ? "Administrador" : "Operador"}
        </span>
      </div>
    </aside>
  );
}
