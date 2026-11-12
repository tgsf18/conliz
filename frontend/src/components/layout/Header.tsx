"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/gestao-conliz-acesso")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    // sync dark mode from html class
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("conliz-theme", next ? "dark" : "light");
    } catch {}
  };

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Soluções", href: "/solucoes" },
    { name: "Obras", href: "/obras" },
    { name: "Contato", href: "/contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#071B2E]/95 dark:bg-[#050F1A]/95 backdrop-blur-md shadow-lg border-b border-white/10 py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <Logo theme="dark" showTagline={!isScrolled} className="scale-90 sm:scale-100 origin-left" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-colors relative py-1 ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white/80" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href="/orcamento"
            className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-white text-[#071B2E] font-sans text-[11px] tracking-[0.12em] uppercase font-semibold hover:bg-white/90 transition-colors"
          >
            <span>Orçamento</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleDark}
            className="p-2 text-white/80"
            aria-label="Tema"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071B2E] border-t border-white/10 px-4 py-5 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-sans text-sm tracking-[0.12em] uppercase text-white/90 hover:text-white py-3 border-b border-white/5"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/orcamento"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#071B2E] font-sans text-xs tracking-[0.12em] uppercase font-semibold"
          >
            Solicitar Orçamento
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
