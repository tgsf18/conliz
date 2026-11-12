"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function HiddenAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1 = Password, 2 = 2FA TOTP

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      if (data.requires2fa) {
        setPreAuthToken(data.preAuthToken);
        setStep(2);
        setLoading(false);
      } else {
        // Direct authenticated (HttpOnly cookies set by backend)
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setErrorMessage("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preAuthToken, code: totpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Código de verificação incorreto.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setErrorMessage("Erro na verificação de 2FA.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-maison-cream flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-maison-hairline p-8 sm:p-10 shadow-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-maison-charcoal text-white flex items-center justify-center font-serif text-2xl font-bold">
            C
          </div>
          <h1 className="text-2xl font-serif text-maison-charcoal font-bold tracking-tight">
            Portal Corporativo Conliz
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-maison-linen text-[10px] font-sans font-semibold tracking-editorial uppercase text-maison-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-maison-terracotta" />
            <span>Acesso Restrito & Auditado</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Email & Password */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-[11px] font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-maison-cream/50 border border-maison-hairline text-sm text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
                  placeholder="admin@conliz.com.br"
                />
                <Mail className="w-4 h-4 text-maison-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-maison-cream/50 border border-maison-hairline text-sm text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-maison-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60 shadow-sm"
            >
              <span>{loading ? "Autenticando..." : "Entrar no Sistema"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 2: 2FA TOTP */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4 animate-in fade-in">
            <div className="text-center pb-2">
              <span className="editorial-sub block mb-1">Duplo Fator (2FA)</span>
              <p className="text-xs font-sans text-maison-muted">
                Insira o código de 6 dígitos do Google Authenticator ou um código de recuperação de 8 dígitos.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-1.5">
                Código TOTP / Recuperação
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={9}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-maison-cream/50 border border-maison-hairline text-center text-lg font-mono tracking-widest font-bold text-maison-charcoal focus:outline-none focus:border-maison-terracotta"
                  placeholder="000000"
                />
                <KeyRound className="w-4 h-4 text-maison-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60 shadow-sm"
            >
              <span>{loading ? "Validando..." : "Confirmar Código 2FA"}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-maison-muted hover:text-maison-charcoal transition-colors pt-2"
            >
              ← Voltar ao login
            </button>
          </form>
        )}

        {/* Security Notice */}
        <div className="pt-4 border-t border-maison-hairline text-[11px] font-sans text-maison-muted text-center space-y-1">
          <p>Sessão protegida por tokens criptográficos rotativos.</p>
          <p>Rate limit e bloqueio anti força bruta ativos.</p>
        </div>
      </div>
    </div>
  );
}
