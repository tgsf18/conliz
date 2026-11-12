"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, Instagram, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/gestao-conliz-acesso")) {
    return null;
  }

  return (
    <footer className="bg-[#071B2E] border-t border-white/10 pt-14 pb-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Logo theme="dark" showTagline />
            <p className="text-sm text-white/55 leading-relaxed">
              Construção civil, reformas e projetos sob medida em Sorocaba, Votorantim e região.
            </p>
            <a
              href="https://instagram.com/conliz_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-white/70 hover:text-white"
            >
              <Instagram className="w-4 h-4" />
              @conliz_
            </a>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] tracking-[0.16em] uppercase text-white/40 font-semibold">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {["/", "/solucoes", "/obras", "/contato", "/orcamento"].map((href, i) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {["Início", "Soluções", "Obras", "Contato", "Orçamento"][i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] tracking-[0.16em] uppercase text-white/40 font-semibold">
              Especialidades
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Residencial alto padrão</li>
              <li>Reformas e retrofit</li>
              <li>Obras comerciais</li>
              <li>Gestão turnkey</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] tracking-[0.16em] uppercase text-white/40 font-semibold">
              Contato
            </h4>
            <div className="space-y-2.5 text-sm text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                <span>Sorocaba, Votorantim, Itu e região</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 opacity-60" />
                <a href="https://wa.me/5515997151520" className="hover:text-white">
                  (15) 99715-1520
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 opacity-60" />
                <span>contato@conliz.com.br</span>
              </div>
            </div>
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-semibold text-white hover:underline mt-2"
            >
              Solicitar proposta <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Conliz Construções. Todos os direitos reservados.</p>
          <p>Sorocaba / SP</p>
        </div>
      </div>
    </footer>
  );
}
