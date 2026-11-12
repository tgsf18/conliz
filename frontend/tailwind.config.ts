import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Conliz Official Palette (Navy + Gold)
        conliz: {
          navy: "#0A2540",          // Azul oficial profundo
          navyLight: "#0F3460",     // Azul um pouco mais claro
          navyDark: "#061828",      // Quase preto azul
          gold: "#C9A227",          // Dourado oficial
          goldHover: "#B8911F",     // Dourado hover
          goldLight: "#E8D48B",     // Dourado claro
          cream: "#F8F6F2",         // Fundo claro
          slate: "#F1F3F5",         // Alternativa clara
          muted: "#6B7C8F",         // Texto secundário
          charcoal: "#1A2332",      // Texto principal escuro
        },
        // Mantém aliases antigos temporariamente para não quebrar tudo de uma vez
        maison: {
          cream: "#F8F6F2",
          linen: "#F1F3F5",
          charcoal: "#1A2332",
          muted: "#6B7C8F",
          terracotta: "#C9A227",    // agora aponta para gold
          hairline: "#E2E6EB",
          sand: "#E8D48B",
          terracottaHover: "#B8911F",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        widest: "0.25em",
        editorial: "0.2em",
      },
      lineHeight: {
        editorial: "0.92",
      },
    },
  },
  plugins: [],
};

export default config;
