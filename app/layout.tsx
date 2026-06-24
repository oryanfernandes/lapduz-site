import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Lapduz — Faturamento real com estratégia, posicionamento, marketing e conteúdo",
  description:
    "Lapduz: a nova era do marketing. Estratégia, posicionamento, conteúdo e relacionamento para empresas que querem ser lapidadas.",
  metadataBase: new URL("https://lapduz.com"),
  openGraph: {
    title: "Lapduz — Somos o novo marketing",
    description:
      "Focados em colocar dinheiro no seu bolso. Estratégia + posicionamento + conteúdo + relacionamento.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Preloader />
        <SmoothScroll />
        <Header />
        {children}
      </body>
    </html>
  );
}
