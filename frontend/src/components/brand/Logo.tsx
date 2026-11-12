import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark" | "wordmark";
  theme?: "light" | "dark" | "gold";
  showTagline?: boolean;
}

/**
 * Logo oficial Conliz
 * - mark: ícone de edificações
 * - wordmark: CONLIZ
 * - full: ícone + texto + tagline opcional
 */
export function Logo({
  className,
  variant = "full",
  theme = "light",
  showTagline = true,
}: LogoProps) {
  const textColor =
    theme === "dark"
      ? "text-white"
      : theme === "gold"
      ? "text-conliz-gold"
      : "text-conliz-navy";

  const markColor =
    theme === "dark" || theme === "gold" ? "#C9A227" : "#0A2540";

  const Mark = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      {/* Edifícios estilizados */}
      <rect x="6" y="22" width="10" height="20" rx="1" fill={markColor} />
      <rect x="18" y="12" width="12" height="30" rx="1" fill={markColor} />
      <rect x="32" y="18" width="10" height="24" rx="1" fill={markColor} />
      {/* Janelas */}
      <rect x="8" y="26" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="11.5" y="26" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="8" y="31" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="11.5" y="31" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="21" y="16" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="25" y="16" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="21" y="21" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="25" y="21" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="34" y="22" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
      <rect x="37.5" y="22" width="2.5" height="2.5" fill="#0A2540" opacity="0.35" />
    </svg>
  );

  if (variant === "mark") {
    return (
      <div className={cn("w-9 h-9", className)} aria-label="Conliz">
        {Mark}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-9 h-9">{Mark}</div>
      {(variant === "full" || variant === "wordmark") && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-sans text-xl font-bold tracking-[0.12em] uppercase",
              textColor
            )}
          >
            CONLIZ
          </span>
          {showTagline && (
            <span
              className={cn(
                "font-sans text-[9px] tracking-[0.16em] uppercase mt-1 font-medium opacity-80",
                theme === "dark" ? "text-white/70" : "text-conliz-muted"
              )}
            >
              A confiança se constrói
            </span>
          )}
        </div>
      )}
    </div>
  );
}
