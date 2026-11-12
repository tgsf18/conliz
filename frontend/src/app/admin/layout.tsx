"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TwoFactorSetupModal } from "@/components/admin/TwoFactorSetupModal";
import { ShieldCheck, ShieldAlert, Sun, Moon } from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        router.push("/gestao-conliz-acesso");
      }
    } catch (e) {
      router.push("/gestao-conliz-acesso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-conliz-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-conliz-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest uppercase text-conliz-muted">
            Carregando painel seguro Conliz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-conliz-cream flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar user={user || undefined} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Admin Top Header */}
        <header className="bg-conliz-navy border-b border-conliz-navyLight px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-white">
              Conliz Gestão Integrada
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-conliz-gold/40" />
            <span className="hidden sm:inline-block text-[11px] font-sans text-conliz-gold">
              Sorocaba & Região
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 2FA Badge & Modal Trigger */}
            {user?.twoFactorEnabled ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-sans font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>2FA Ativo</span>
              </div>
            ) : (
              <button
                onClick={() => setIs2faModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-sans font-semibold hover:bg-amber-500/25 transition-colors animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Ativar 2FA TOTP</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/60 hover:text-conliz-gold border border-conliz-navyLight transition-colors"
              title="Alternar Tema Claro/Escuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-conliz-gold" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-conliz-navyLight">
              <div className="w-7 h-7 rounded-full bg-conliz-gold text-conliz-navy flex items-center justify-center text-xs font-bold font-serif">
                {user?.nome ? user.nome.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-white">
                {user?.nome}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 bg-conliz-cream">
          {children}
        </main>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        onSuccess={() => {
          fetchProfile();
          setIs2faModalOpen(false);
        }}
      />
    </div>
  );
}
