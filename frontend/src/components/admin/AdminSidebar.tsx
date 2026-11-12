"use client";

import { apiFetch } from "@/lib/http.mjs";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Users,
  HardHat,
  Package,
  DollarSign,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface AdminSidebarProps {
  user?: {
    nome: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orçamentos", href: "/admin/orcamentos", icon: FileSpreadsheet },
    { name: "Contratos", href: "/admin/contratos", icon: FileText },
    { name: "RH & Equipe", href: "/admin/rh", icon: Users },
    { name: "Obras & Canteiro", href: "/admin/obras", icon: HardHat },
    { name: "Estoque & Materiais", href: "/admin/estoque", icon: Package },
    { name: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
    { name: "Auditoria & Logs", href: "/admin/auditoria", icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/gestao-conliz-acesso");
  };

  return (
    <aside className="w-64 bg-[#071B2E] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        <div className="p-5 border-b border-white/10">
          <Logo theme="dark" showTagline={false} />
          <p className="mt-2 text-[10px] tracking-[0.14em] uppercase text-white/40 font-medium">
            Painel de Gestão
          </p>
        </div>

        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-sans tracking-wide transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-semibold border-l-2 border-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-white text-[#071B2E] flex items-center justify-center font-bold text-xs">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.nome || "Diretoria"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 bg-white/10 text-white/70 font-semibold">
                {user?.role || "ADMIN"}
              </span>
              {user?.twoFactorEnabled ? (
                <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> 2FA
                </span>
              ) : (
                <span className="text-[9px] text-amber-400">2FA pendente</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs tracking-widest uppercase font-semibold text-rose-300/90 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}
