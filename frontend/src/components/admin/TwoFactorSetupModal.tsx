"use client";

import React, { useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/http.mjs";
import { ShieldCheck, X, Check, Copy, AlertTriangle, Key } from "lucide-react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorSetupModal({ isOpen, onClose, onSuccess }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<"init" | "verify" | "recovery">("init");
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeBase64: string;
    recoveryCodes: string[];
  } | null>(null);

  const [confirmCode, setConfirmCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartSetup = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await apiFetch("/api/auth/2fa/setup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSetupData(data);
        setStep("verify");
      } else {
        setErrorMessage("Erro ao iniciar configuração de 2FA.");
      }
    } catch (e) {
      setErrorMessage("Erro de rede ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await apiFetch("/api/auth/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: setupData.secret,
          code: confirmCode.trim(),
        }),
      });

      if (res.ok) {
        setStep("recovery");
        onSuccess();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Código incorreto. Tente novamente.");
      }
    } catch (e) {
      setErrorMessage("Falha ao confirmar código.");
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    if (setupData?.recoveryCodes) {
      navigator.clipboard.writeText(setupData.recoveryCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-maison-hairline shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-maison-hairline pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-maison-terracotta" />
            <h3 className="font-serif text-xl font-bold text-maison-charcoal">
              Configuração de Duplo Fator (2FA TOTP)
            </h3>
          </div>
          <button onClick={onClose} className="text-maison-muted hover:text-maison-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: INIT */}
        {step === "init" && (
          <div className="space-y-4 text-center">
            <p className="text-sm font-sans text-maison-charcoal leading-relaxed">
              Proteja sua conta corporativa com verificação em duas etapas usando o Google Authenticator ou similar.
            </p>
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="px-6 py-3 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60"
            >
              {loading ? "Gerando QR Code..." : "Iniciar Configuração"}
            </button>
          </div>
        )}

        {/* STEP 2: VERIFY QR CODE */}
        {step === "verify" && setupData && (
          <form onSubmit={handleConfirmCode} className="space-y-4 text-center">
            <p className="text-xs font-sans text-maison-muted">
              1. Abra seu aplicativo autenticador (Google Authenticator) e escaneie o código abaixo:
            </p>

            <div className="p-3 bg-maison-linen border border-maison-hairline inline-block mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrCodeBase64}
                alt="QR Code TOTP"
                width={180}
                height={180}
                className="mx-auto"
              />
            </div>

            <p className="text-[11px] font-mono text-maison-muted">
              Chave manual: <strong className="text-maison-charcoal">{setupData.secret}</strong>
            </p>

            <div className="pt-2">
              <label className="block text-xs font-sans tracking-editorial uppercase text-maison-charcoal font-semibold mb-2">
                2. Digite o código de 6 dígitos gerado:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-48 mx-auto px-4 py-2 border border-maison-hairline text-center text-xl font-mono tracking-widest text-maison-charcoal focus:outline-none focus:border-maison-terracotta block"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-maison-terracotta text-white font-sans text-xs tracking-widest uppercase font-semibold hover:bg-maison-terracottaHover transition-all disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Ativar 2FA Agora"}
            </button>
          </form>
        )}

        {/* STEP 3: RECOVERY CODES */}
        {step === "recovery" && setupData && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>2FA Ativado com sucesso! Guarde os códigos de recuperação abaixo.</span>
            </div>

            <p className="text-xs font-sans text-maison-charcoal leading-relaxed">
              Se perder o acesso ao celular, estes 8 códigos únicos de recuperação permitirão acessar a conta:
            </p>

            <div className="grid grid-cols-2 gap-2 p-4 bg-maison-linen border border-maison-hairline font-mono text-xs text-maison-charcoal">
              {setupData.recoveryCodes.map((code, i) => (
                <div key={i} className="py-1 px-2 bg-white border border-maison-hairline text-center">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={copyRecoveryCodes}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans tracking-editorial uppercase font-semibold border border-maison-hairline hover:bg-maison-linen transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiados!" : "Copiar Códigos"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-maison-charcoal text-white text-xs font-sans tracking-widest uppercase font-semibold"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
