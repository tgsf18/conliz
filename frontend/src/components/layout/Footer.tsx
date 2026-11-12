"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, Instagram, ArrowUpRight } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Não renderiza o footer público nas rotas do painel admin
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/gestao-conliz-acesso")) {
    return null;
  }

  return (
    <footer className="bg-conliz-navy border-t border-conliz-navyLight pt-16 pb-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-conliz-gold flex items-center justify-center text-conliz-navy font-serif font-bold text-base">
                C
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                CONLIZ
              </span>
            </div>
            <p className="font-serif italic text-conliz-gold text-lg">
              A confiança se constrói.
            </p>
            <p className="text-sm font-sans text-white/70 leading-relaxed">
              Construção civil de excelência, reformas de alto padrão e projetos sob medida em Sorocaba, Votorantim e região.
            </p>
            <div className="pt-2">
              <a
                href="https://instagram.com/conliz_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-conliz-gold hover:text-white font-semibold transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>@conliz_</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs tracking-[0.18em] uppercase text-conliz-gold font-bold">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm font-sans text-white/70">
              <li>
                <Link href="/" className="hover:text-conliz-gold transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/solucoes" className="hover:text-conliz-gold transition-colors">
                  Soluções & Serviços
                </Link>
              </li>
              <li>
                <Link href="/obras" className="hover:text-conliz-gold transition-colors">
                  Obras Realizadas
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-conliz-gold transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="/orcamento" className="hover:text-conliz-gold transition-colors">
                  Solicitar Proposta
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Summary */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs tracking-[0.18em] uppercase text-conliz-gold font-bold">
              Especialidades
            </h4>
            <ul className="space-y-2.5 text-sm font-sans text-white/70">
              <li>Construção Residencial Alto Padrão</li>
              <li>Reformas & Retrofit Completo</li>
              <li>Obras Comerciais & Clínicas</li>
              <li>Gestão Turnkey & Empreitada</li>
              <li>Estrutura de Concreto e Acabamentos Nobres</li>
            </ul>
          </div>

          {/* Regional Contact */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs tracking-[0.18em] uppercase text-conliz-gold font-bold">
              Atendimento Regional
            </h4>
            <div className="space-y-3 text-sm font-sans text-white/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-conliz-gold shrink-0 mt-0.5" />
                <span>Atendimento presencial em Sorocaba, Votorantim, Itu e cidades vizinhas.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-conliz-gold shrink-0" />
                <a
                  href="https://wa.me/5515997151520"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-conliz-gold transition-colors"
                >
                  (15) 99715-1520 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-conliz-gold shrink-0" />
                <span>contato@conliz.com.br</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/orcamento"
                className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.18em] uppercase font-bold text-conliz-gold hover:underline"
              >
                <span>Fazer cotação online</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hairline Divider & Bottom Copyright */}
        <div className="pt-8 border-t border-conliz-navyLight flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/50">
          <p>© {new Date().getFullYear()} Conliz Construções e Reformas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Engenharia com Ética & Rigor Técnico</span>
            <span className="w-1 h-1 rounded-full bg-conliz-navyLight" />
            <span>Sorocaba/SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
