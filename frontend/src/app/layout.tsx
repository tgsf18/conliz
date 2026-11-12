import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conliz | Construção Civil, Reformas e Obras de Alto Padrão em Sorocaba",
  description:
    "A confiança se constrói. Construtora e empreiteira em Sorocaba e região especializada em obras residenciais alto padrão, reformas completas e projetos corporativos.",
  keywords: [
    "construtora sorocaba",
    "reformas sorocaba",
    "empreiteira sorocaba",
    "obras votorantim",
    "construção civil alphaville sorocaba",
    "reforma alto padrão",
    "conliz",
  ],
  authors: [{ name: "Conliz Construções" }],
  openGraph: {
    title: "Conliz | A Confiança se Constrói",
    description: "Construção civil com qualidade, reformas e projetos sob medida em Sorocaba e região.",
    url: "https://conliz.com.br",
    siteName: "Conliz Construções",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Conliz Construções - Alto Padrão",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-maison-cream flex flex-col justify-between text-maison-charcoal selection:bg-maison-terracotta/20 selection:text-maison-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
