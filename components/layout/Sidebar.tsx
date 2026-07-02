"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  BarChart2,
  Palette,
  Users,
  Boxes,
} from "lucide-react";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lots", label: "Lotes", icon: Boxes },
  { href: "/movements", label: "Histórico", icon: ClipboardList },
  { href: "/reports", label: "Relatórios", icon: BarChart2 },
];

const STOCK_NAV: NavItem[] = [
  { href: "/stock/entry", label: "Entrada", icon: ArrowDownCircle },
  { href: "/stock/exit", label: "Saída (FIFO)", icon: ArrowUpCircle },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/products", label: "Produtos", icon: Palette, adminOnly: true },
  { href: "/users", label: "Usuários", icon: Users, adminOnly: true },
];

interface SidebarProps {
  role: UserRole;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
      {item.label}
    </Link>
  );
}

function NavSection({
  title,
  items,
  role,
  pathname,
}: {
  title: string;
  items: NavItem[];
  role: UserRole;
  pathname: string;
}) {
  const visible = items.filter((i) => !i.adminOnly || role === "admin");
  if (visible.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      {visible.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return <NavLink key={item.href} item={item} active={active} />;
      })}
    </div>
  );
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-slate-200 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Package size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-900 text-sm tracking-tight">
          Stock Manager
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <NavSection title="Geral" items={MAIN_NAV} role={role} pathname={pathname} />
        <NavSection title="Estoque" items={STOCK_NAV} role={role} pathname={pathname} />
        {role === "admin" && (
          <NavSection title="Administração" items={ADMIN_NAV} role={role} pathname={pathname} />
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-200">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              {role === "admin" ? "A" : "O"}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {role === "admin" ? "Administrador" : "Operador"}
          </span>
        </div>
      </div>
    </aside>
  );
}
