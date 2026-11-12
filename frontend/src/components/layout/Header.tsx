"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Não renderiza o header público nas rotas do painel admin
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/gestao-conliz-acesso")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Soluções", href: "/solucoes" },
    { name: "Obras Realizadas", href: "/obras" },
    { name: "Fale Conosco", href: "/contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-conliz-navy/95 backdrop-blur-md shadow-md border-b border-conliz-navyLight py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-sm bg-conliz-gold flex items-center justify-center text-conliz-navy font-serif font-bold text-lg group-hover:bg-conliz-goldHover transition-colors">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight leading-none text-white">
              CONLIZ
            </span>
            <span className="font-sans text-[9px] tracking-[0.18em] uppercase font-medium mt-0.5 text-conliz-gold">
              A confiança se constrói
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-xs tracking-[0.18em] uppercase transition-colors relative py-1 ${
                  isActive
                    ? "text-conliz-gold font-semibold"
                    : "text-white/90 hover:text-conliz-gold"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-conliz-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/orcamento"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-conliz-gold text-conliz-navy font-sans text-xs tracking-widest uppercase font-semibold hover:bg-conliz-goldHover transition-all shadow-sm"
          >
            <span>Orçamento</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-conliz-gold transition-colors focus:outline-none"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-conliz-navy border-b border-conliz-navyLight px-6 py-6 space-y-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-sans text-sm tracking-[0.18em] uppercase text-white hover:text-conliz-gold font-medium"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/orcamento"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-conliz-gold text-conliz-navy font-sans text-xs tracking-widest uppercase font-semibold"
            >
              <span>Solicitar Orçamento</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
