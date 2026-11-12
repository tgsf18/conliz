import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

async function getSolucoes() {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/public/solucoes`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {}
  return [
    {
      id: "construcao-residencial",
      titulo: "Construção Residencial de Alto Padrão",
      tagline: "A confiança que estrutura o seu lar.",
      descricao:
        "Execução completa de residências unifamiliares em condomínios fechados em Sorocaba, Votorantim e região. Gestão rigorosa de cronograma, transparência técnica e respeito minucioso ao projeto arquitetônico.",
      detalhes:
        "Fundações profundas, estruturas em concreto armado aparente, isolamento termoacústico, instalações hidrossanitárias e acabamentos nobres com paginação milimétrica.",
      imagem:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "reforma-retrofit",
      titulo: "Reformas & Retrofit Estrutural",
      tagline: "Renovação com inteligência construtiva e zero improviso.",
      descricao:
        "Transformação arquitetônica de apartamentos duplex, coberturas e residências consolidadas. Reforço estrutural, integração de ambientes e modernização de instalações.",
      detalhes:
        "Demolição controlada, reforços metálicos, nivelamento de contrapiso, impermeabilização de lajes e varandas, marcenaria integrada e automação predial.",
      imagem:
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "comercial-corporativo",
      titulo: "Obras Comerciais & Corporativas",
      tagline: "Espaços que traduzem autoridade e sofisticação.",
      descricao:
        "Construção e adequação de clínicas médicas, escritórios corporativos, restaurantes e lojas com prazos de entrega rigorosamente cumpridos para antecipar o retorno do investimento.",
      detalhes:
        "Adequações às normas da Anvisa e bombeiros, piso elevado, cabeamento estruturado de alta performance, drywall acústico e climatização central.",
      imagem:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "gestao-projetos",
      titulo: "Gestão de Obras & Empreitada Global",
      tagline: "Planejamento sob medida, previsibilidade total de custos.",
      descricao:
        "Modelo turnkey onde a Conliz gerencia fornecedores, cotações de materiais no atacado, equipe própria qualificada, diário de obra em tempo real e relatórios quinzenais de medição.",
      detalhes:
        "Orçamento paramétrico detalhado, controle rigoroso de perdas, suporte a financiamento bancário para construção e ART/RRT emitidos por engenheiros sêniores.",
      imagem:
        "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80",
    },
  ];
}

export const metadata = {
  title: "Soluções & Especialidades | Conliz Construções",
  description:
    "Construção residencial de alto padrão, reformas e retrofit, obras comerciais e gestão por empreitada global em Sorocaba e região.",
};

export default async function SolucoesPage() {
  const solucoes = await getSolucoes();

  return (
    <div className="pt-28 pb-24 bg-maison-cream">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="editorial-sub block mb-3">Especialidades Conliz</span>
        <h1 className="text-4xl sm:text-6xl font-serif text-maison-charcoal leading-tight">
          Nossas <span className="italic font-normal text-maison-terracotta">Soluções</span> em Engenharia
        </h1>
        <p className="mt-6 text-base sm:text-lg font-sans text-maison-muted max-w-2xl mx-auto leading-relaxed">
          Cada projeto é tratado como uma obra de autor: planejamento rigoroso, materiais certificados e acompanhamento executivo permanente.
        </p>
      </div>

      {/* Editorial Alternating Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {solucoes.map((item: any, idx: number) => {
          const isEven = idx % 2 === 1;
          return (
            <section
              key={item.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center p-8 md:p-12 border border-maison-hairline bg-maison-linen/40 ${
                isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Column */}
              <div className={`space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                <span className="font-sans text-xs tracking-widest uppercase text-maison-terracotta font-semibold">
                  0{idx + 1} / {item.tagline}
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-maison-charcoal">
                  {item.titulo}
                </h2>
                <p className="text-base font-sans text-maison-charcoal/80 leading-relaxed">
                  {item.descricao}
                </p>
                <div className="pt-4 border-t border-maison-hairline">
                  <h4 className="font-sans text-xs tracking-editorial uppercase text-maison-charcoal font-bold mb-2">
                    Diferenciais Técnicos
                  </h4>
                  <p className="text-sm font-sans text-maison-muted leading-relaxed">
                    {item.detalhes}
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href={`/orcamento?tipo=${encodeURIComponent(item.titulo)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all shadow-sm"
                  >
                    <span>Orçar esta solução</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Image Column */}
              <div className={`relative aspect-[16/10] w-full overflow-hidden border border-maison-hairline shadow-md ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <Image
                  src={item.imagem}
                  alt={item.titulo}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="mt-24 max-w-4xl mx-auto px-4 text-center">
        <div className="bg-maison-linen p-12 border border-maison-hairline space-y-6">
          <h3 className="text-3xl font-serif text-maison-charcoal">
            Tem um projeto com necessidades especiais?
          </h3>
          <p className="font-sans text-sm text-maison-muted max-w-lg mx-auto">
            Nossa equipe técnica analisa pranchas arquitetônicas, estruturais e complementares para formatar uma proposta personalizada.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-maison-charcoal text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-charcoal/90 transition-all"
          >
            <span>Falar com o Engenheiro</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
