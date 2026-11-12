"use client";

import { apiFetch } from "@/lib/http.mjs";
import React, { useState } from "react";
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
  Building,
} from "lucide-react";

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
    } catch (e) {}
    router.push("/gestao-conliz-acesso");
  };

  return (
    <aside className="w-64 bg-white border-r border-maison-hairline flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-maison-hairline flex items-center gap-3">
          <div className="w-8 h-8 bg-maison-charcoal text-white flex items-center justify-center font-serif text-lg font-bold">
            C
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-maison-charcoal leading-none block">
              CONLIZ
            </span>
            <span className="font-sans text-[9px] tracking-editorial uppercase text-maison-terracotta font-semibold">
              Painel de Gestão
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-sans tracking-wide transition-colors ${
                  isActive
                    ? "bg-maison-linen text-maison-terracotta font-bold border-l-2 border-maison-terracotta"
                    : "text-maison-charcoal hover:bg-maison-cream hover:text-maison-terracotta"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-maison-terracotta" : "text-maison-muted"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-maison-terracotta" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-maison-hairline bg-maison-cream/40 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-maison-linen border border-maison-hairline flex items-center justify-center font-bold text-xs text-maison-charcoal">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-maison-charcoal truncate">{user?.nome || "Diretoria Conliz"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-sans tracking-widest uppercase px-1.5 py-0.5 bg-maison-terracotta/10 text-maison-terracotta font-bold">
                {user?.role || "ADMIN"}
              </span>
              {user?.twoFactorEnabled ? (
                <span className="text-[9px] text-emerald-700 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> 2FA
                </span>
              ) : (
                <span className="text-[9px] text-amber-700 font-medium">2FA Pendente</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-sans tracking-widest uppercase font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
