"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TwoFactorSetupModal } from "@/components/admin/TwoFactorSetupModal";
import { ShieldCheck, ShieldAlert, Bell, Sun, Moon, Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-maison-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-maison-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest uppercase text-maison-muted">
            Carregando painel seguro Conliz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maison-cream flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar user={user || undefined} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Admin Top Header */}
        <header className="bg-white border-b border-maison-hairline px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-maison-charcoal">
              Conliz Gestão Integrada
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-maison-hairline" />
            <span className="hidden sm:inline-block text-[11px] font-sans text-maison-muted">
              Sorocaba & Região
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 2FA Badge & Modal Trigger */}
            {user?.twoFactorEnabled ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-sans font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2FA Ativo</span>
              </div>
            ) : (
              <button
                onClick={() => setIs2faModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-sans font-semibold hover:bg-amber-100 transition-colors animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Ativar 2FA TOTP</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-maison-muted hover:text-maison-charcoal border border-maison-hairline transition-colors"
              title="Alternar Tema Claro/Escuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-maison-hairline">
              <div className="w-7 h-7 rounded-full bg-maison-terracotta text-white flex items-center justify-center text-xs font-bold font-serif">
                {user?.nome ? user.nome.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-maison-charcoal">
                {user?.nome}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 bg-maison-cream">
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
