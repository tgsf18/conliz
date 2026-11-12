"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "Orçamento e Dúvidas Gerais",
    mensagem: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedbackMessage("");

    try {
      const res = await fetch("/api/public/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setFeedbackMessage(data.message || "Mensagem enviada com sucesso!");
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          assunto: "Orçamento e Dúvidas Gerais",
          mensagem: "",
        });
      } else {
        setStatus("error");
        setFeedbackMessage(data.message || "Não foi possível enviar a mensagem.");
      }
    } catch (err) {
      setStatus("error");
      setFeedbackMessage("Falha na comunicação com o servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="pt-28 pb-24 bg-maison-cream">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <span className="editorial-sub block mb-3">Atendimento Direto</span>
        <h1 className="text-4xl sm:text-6xl font-serif text-maison-charcoal leading-tight">
          Fale com a <span className="italic font-normal text-maison-terracotta">Conliz</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg font-sans text-maison-muted max-w-2xl mx-auto leading-relaxed">
          Estamos prontos para atender a sua demanda com prontidão e sigilo técnico.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Contact Channels & Map */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-maison-linen p-8 border border-maison-hairline space-y-6">
              <h3 className="text-2xl font-serif text-maison-charcoal">
                Canais de Atendimento
              </h3>

              <div className="space-y-5 text-sm font-sans text-maison-charcoal">
                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-none bg-maison-cream flex items-center justify-center text-maison-terracotta shrink-0 border border-maison-hairline">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-editorial uppercase text-maison-muted font-bold">WhatsApp Direto</p>
                    <a
                      href="https://wa.me/5515997151520"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-maison-charcoal hover:text-maison-terracotta transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <span>(15) 99715-1520</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-maison-terracotta" />
                    </a>
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-none bg-maison-cream flex items-center justify-center text-maison-terracotta shrink-0 border border-maison-hairline">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-editorial uppercase text-maison-muted font-bold">E-mail Corporativo</p>
                    <p className="text-sm font-semibold text-maison-charcoal mt-0.5">contato@conliz.com.br</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-none bg-maison-cream flex items-center justify-center text-maison-terracotta shrink-0 border border-maison-hairline">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-editorial uppercase text-maison-muted font-bold">Área de Atuação</p>
                    <p className="text-sm font-semibold text-maison-charcoal mt-0.5">
                      Sorocaba, Votorantim, Itu, Salto e Região Metropolitana.
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-none bg-maison-cream flex items-center justify-center text-maison-terracotta shrink-0 border border-maison-hairline">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-editorial uppercase text-maison-muted font-bold">Horário de Expediente</p>
                    <p className="text-sm text-maison-charcoal mt-0.5">
                      Segunda a Sexta: 08h00 às 18h00<br />
                      Sábados (Plantão de Canteiro): 08h00 às 12h00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylized Map Frame */}
            <div className="border border-maison-hairline overflow-hidden shadow-sm aspect-[16/10] relative bg-maison-linen">
              <iframe
                title="Mapa de Atendimento Sorocaba Conliz"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117079.17646738914!2d-47.53488255953047!3d-23.50616335967262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c5f5117f739679%3A0xc6cb5a6c4068ef21!2sSorocaba%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "contrast(0.95) saturate(0.8)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-maison-cream p-8 sm:p-12 border border-maison-hairline shadow-sm">
              <span className="editorial-sub block mb-2">Mensagem Direta</span>
              <h2 className="text-3xl font-serif text-maison-charcoal mb-8">
                Envie uma solicitação
              </h2>

              {status === "success" && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Seu nome ou razão social"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                      E-mail *
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
                      Telefone / WhatsApp *
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

                <div>
                  <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                    Assunto
                  </label>
                  <select
                    value={formData.assunto}
                    onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta"
                  >
                    <option value="Orçamento e Dúvidas Gerais">Orçamento e Dúvidas Gerais</option>
                    <option value="Construção Residencial Alto Padrão">Construção Residencial Alto Padrão</option>
                    <option value="Reforma & Retrofit">Reforma & Retrofit</option>
                    <option value="Obra Comercial / Corporativa">Obra Comercial / Corporativa</option>
                    <option value="Parceria de Arquitetura e Engenharia">Parceria de Arquitetura e Engenharia</option>
                    <option value="Fornecedores e Suprimentos">Fornecedores e Suprimentos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-maison-hairline text-maison-charcoal text-sm focus:outline-none focus:border-maison-terracotta resize-none"
                    placeholder="Conte-nos sobre o seu projeto, prazos desejados, localização e características principais..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60 shadow-md"
                  >
                    <span>{status === "loading" ? "Enviando..." : "Enviar Mensagem"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
