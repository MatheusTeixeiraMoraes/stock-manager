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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-accent text-white shadow-sm"
          : "text-ink-soft hover:bg-surface hover:text-ink"
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
      <p className="px-3 py-1.5 text-[11px] font-semibold text-ink-soft/70 uppercase tracking-widest">
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
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-line flex flex-col">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-sm">
          <Package size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-bold text-ink text-sm tracking-tight leading-none block">
            Stock Manager
          </span>
          <span className="text-ink-soft text-[11px] mt-0.5 block">Gestão de estoque</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <NavSection title="Geral" items={MAIN_NAV} role={role} pathname={pathname} />
        <NavSection title="Estoque" items={STOCK_NAV} role={role} pathname={pathname} />
        {role === "admin" && (
          <NavSection title="Administração" items={ADMIN_NAV} role={role} pathname={pathname} />
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-line">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {role === "admin" ? "A" : "O"}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-ink block">
              {role === "admin" ? "Administrador" : "Operador"}
            </span>
            <span className="text-[11px] text-ink-soft">
              {role === "admin" ? "Acesso total" : "Acesso restrito"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
