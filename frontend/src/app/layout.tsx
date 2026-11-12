import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conliz | Construção Civil e Reformas em Sorocaba",
  description:
    "A confiança se constrói. Construtora em Sorocaba e região especializada em obras residenciais, reformas e projetos corporativos.",
  keywords: [
    "construtora sorocaba",
    "reformas sorocaba",
    "empreiteira sorocaba",
    "obras votorantim",
    "conliz",
  ],
  authors: [{ name: "Conliz Construções" }],
  openGraph: {
    title: "Conliz | A Confiança se Constrói",
    description: "Construção civil com qualidade em Sorocaba e região.",
    url: "https://conliz.com.br",
    siteName: "Conliz Construções",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('conliz-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-conliz-cream dark:bg-[#050F1A] flex flex-col text-conliz-charcoal dark:text-white font-sans antialiased selection:bg-[#0A2540]/15">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
