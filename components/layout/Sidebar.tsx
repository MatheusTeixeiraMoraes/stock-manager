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
  X,
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
  mobileOpen: boolean;
  onClose: () => void;
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-all ${
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
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  role: UserRole;
  pathname: string;
  onNavigate: () => void;
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
        return <NavLink key={item.href} item={item} active={active} onNavigate={onNavigate} />;
      })}
    </div>
  );
}

export default function Sidebar({ role, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay (mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-line flex flex-col transition-transform duration-200 ease-out safe-top safe-bottom
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="px-5 h-16 flex items-center justify-between gap-3 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-sm flex-shrink-0">
              <Package size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-ink text-sm tracking-tight leading-none block truncate">
                Stock Manager
              </span>
              <span className="text-ink-soft text-[11px] mt-0.5 block truncate">Gestão de estoque</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-ink-soft hover:text-ink p-1 -mr-1 flex-shrink-0"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          <NavSection title="Geral" items={MAIN_NAV} role={role} pathname={pathname} onNavigate={onClose} />
          <NavSection title="Estoque" items={STOCK_NAV} role={role} pathname={pathname} onNavigate={onClose} />
          {role === "admin" && (
            <NavSection title="Administração" items={ADMIN_NAV} role={role} pathname={pathname} onNavigate={onClose} />
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-line flex-shrink-0">
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
    </>
  );
}
