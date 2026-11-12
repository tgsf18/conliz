"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Building2,
  Ruler,
  MapPin,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  ShieldCheck,
  Phone,
} from "lucide-react";

export default function OrcamentoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    tipoObra: "Construção Residencial Alto Padrão",
    areaM2: "250",
    cidade: "Sorocaba",
    estado: "SP",
    prazoInicio: "Em até 3 meses",
    descricao: "",
    anexosUrls: "",
    nome: "",
    email: "",
    telefone: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [protocoloCodigo, setProtocoloCodigo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        tipoObra: formData.tipoObra,
        areaM2: formData.areaM2 ? parseFloat(formData.areaM2) : null,
        cidade: formData.cidade,
        estado: formData.estado,
        descricao: formData.descricao || "Solicitação de orçamento com análise técnica prévia.",
        anexosUrls: formData.anexosUrls,
      };

      const res = await fetch("/api/public/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setProtocoloCodigo(data.codigo || "ORC-2026-NOVO");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Houve uma falha ao registrar o orçamento. Verifique os dados.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Erro de conexão ao enviar o orçamento. Tente novamente.");
    }
  };

  return (
    <div className="pt-28 pb-24 bg-maison-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="editorial-sub block mb-3">Planejamento & Engenharia</span>
          <h1 className="text-4xl sm:text-5xl font-serif text-maison-charcoal">
            Solicitação de <span className="italic font-normal text-maison-terracotta">Orçamento</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base font-sans text-maison-muted max-w-xl mx-auto">
            Preencha as etapas abaixo para receber um estudo preliminar e estimativa de custos paramétricos para sua obra.
          </p>
        </div>

        {/* Success View */}
        {status === "success" ? (
          <div className="bg-maison-linen p-8 sm:p-12 border border-maison-hairline text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-none bg-maison-terracotta text-white flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="editorial-sub block">Protocolo Registrado</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-maison-charcoal">
              Orçamento Cadastrado com Sucesso!
            </h2>

            <div className="inline-block px-6 py-3 bg-maison-cream border border-maison-hairline">
              <p className="text-xs font-sans tracking-widest uppercase text-maison-muted">Código de Acompanhamento</p>
              <p className="text-2xl font-mono font-bold text-maison-terracotta mt-1">{protocoloCodigo}</p>
            </div>

            <p className="text-sm font-sans text-maison-muted max-w-lg mx-auto leading-relaxed">
              Recebemos sua solicitação. O registro já foi indexado ao nosso painel de engenharia em tempo real
              e nosso departamento comercial entrará em contato em até 24 horas úteis para alinhar os detalhes técnicos.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/5515997151520?text=${encodeURIComponent(
                  `Olá Conliz! Acabei de registrar a proposta ${protocoloCodigo} no site e gostaria de agilizar a análise técnica.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-maison-charcoal text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-charcoal/90 transition-all"
              >
                <Phone className="w-4 h-4 text-maison-terracotta" />
                <span>Notificar via WhatsApp</span>
              </a>

              <Link
                href="/obras"
                className="inline-flex items-center gap-2 px-6 py-3 bg-maison-cream border border-maison-hairline text-maison-charcoal text-xs font-sans tracking-widest uppercase font-semibold hover:border-maison-terracotta transition-all"
              >
                <span>Explorar Obras Concluídas</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-Step Form Container */
          <div className="bg-maison-cream border border-maison-hairline p-6 sm:p-12 shadow-sm">
            
            {/* Step Indicator Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3 text-xs font-sans tracking-editorial uppercase">
                <span className="font-semibold text-maison-terracotta">
                  Etapa 0{currentStep} de 0{totalSteps}
                </span>
                <span className="text-maison-muted">
                  {currentStep === 1 && "Tipo de Obra e Dimensões"}
                  {currentStep === 2 && "Localização e Prazos"}
                  {currentStep === 3 && "Memorial Descritivo e Pranchas"}
                  {currentStep === 4 && "Dados de Contato e Envio"}
                </span>
              </div>
              <div className="w-full h-1 bg-maison-linen overflow-hidden">
                <div
                  className="h-full bg-maison-terracotta transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {status === "error" && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Typology & Area */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-3">
                      Tipo de Intervenção ou Construção *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Construção Residencial Alto Padrão",
                        "Reforma Residencial Completa",
                        "Obra Comercial / Corporativa",
                        "Retrofit Predial / Condomínios",
                        "Projetos de Arquitetura & Engenharia",
                        "Outro Escopo Sob Medida",
                      ].map((tipo) => (
                        <button
                          type="button"
                          key={tipo}
                          onClick={() => setFormData({ ...formData, tipoObra: tipo })}
                          className={`p-4 text-left border text-xs font-sans tracking-wider transition-all ${
                            formData.tipoObra === tipo
                              ? "bg-maison-linen border-maison-terracotta text-maison-charcoal font-semibold shadow-sm"
                              : "bg-white border-maison-hairline text-maison-muted hover:border-maison-terracotta"
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      Área Estimada da Obra (m²) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="20000"
                        required
                        value={formData.areaM2}
                        onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta pr-12"
                        placeholder="Ex: 350"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-maison-muted font-bold">
                        m²
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Timing */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                        Cidade da Obra *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                        placeholder="Ex: Sorocaba, Votorantim, Itu..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                        Estado (UF) *
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                      >
                        <option value="SP">São Paulo (SP)</option>
                        <option value="RJ">Rio de Janeiro (RJ)</option>
                        <option value="MG">Minas Gerais (MG)</option>
                        <option value="PR">Paraná (PR)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      Previsão de Início das Obras
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        "Imediato (em até 30 dias)",
                        "Em até 3 meses",
                        "Apenas planejamento futuro (6+ meses)",
                      ].map((prazo) => (
                        <button
                          type="button"
                          key={prazo}
                          onClick={() => setFormData({ ...formData, prazoInicio: prazo })}
                          className={`p-3.5 text-center border text-xs font-sans tracking-wider transition-all ${
                            formData.prazoInicio === prazo
                              ? "bg-maison-linen border-maison-terracotta text-maison-charcoal font-semibold"
                              : "bg-white border-maison-hairline text-maison-muted hover:border-maison-terracotta"
                          }`}
                        >
                          {prazo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Description & Attachments */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      Descrição Detalhada do Projeto ou Reforma *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta resize-none"
                      placeholder="Descreva as peculiaridades da obra: padrão de acabamento desejado, se já possui projeto arquitetônico aprovado, número de pavimentos, etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      Link para Pranchas / Projetos / Fotos (Opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.anexosUrls}
                      onChange={(e) => setFormData({ ...formData, anexosUrls: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                      placeholder="https://drive.google.com/drive/folders/... ou Dropbox / WeTransfer"
                    />
                    <p className="mt-1 text-[11px] font-sans text-maison-muted">
                      Caso já possua pranchas em DWG/PDF, cole o link público compartilhável acima para acelerar o cálculo.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Contact & Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                      placeholder="Ex: Dra. Juliana Menezes"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                        E-mail para Recebimento da Proposta *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                        WhatsApp / Celular *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                        placeholder="(15) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-maison-linen border border-maison-hairline text-xs font-sans text-maison-muted space-y-1">
                    <p className="font-semibold text-maison-charcoal">Resumo da sua solicitação:</p>
                    <p>• {formData.tipoObra} ({formData.areaM2} m²) em {formData.cidade}/{formData.estado}</p>
                    <p>• Previsão: {formData.prazoInicio}</p>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="mt-10 pt-6 border-t border-maison-hairline flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-sans tracking-widest uppercase font-semibold text-maison-charcoal border border-maison-hairline hover:border-maison-charcoal transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-maison-charcoal text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-charcoal/90 transition-all shadow-sm"
                  >
                    <span>Avançar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-maison-terracotta text-white text-xs font-sans tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60 shadow-md"
                  >
                    <span>{status === "loading" ? "Processando..." : "Confirmar & Enviar Orçamento"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
