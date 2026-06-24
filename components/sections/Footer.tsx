"use client";

import { smoothNav } from "@/lib/smoothNav";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#sobre" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Clientes", href: "#clientes" },
  { label: "Trabalhe conosco", href: "#trabalhe" },
];

export default function Footer() {
  return (
    <footer data-theme="dark" className="relative bg-forest pb-10 pt-20 text-cream">
      <div className="mx-auto grid max-w-page gap-12 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-horizontal-yellow.png"
            alt="Lapduz"
            className="block h-10 w-auto object-contain"
            style={{ aspectRatio: "1024 / 361" }}
          />
          <p className="mt-6 max-w-sm font-display text-sm font-light leading-relaxed text-cream/70">
            Somos o novo marketing. Focados em colocar dinheiro no seu bolso —
            com estratégia, posicionamento, marketing e conteúdo.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-cream/50">
            Navegar
          </h3>
          <ul className="mt-5 space-y-3 text-sm font-light">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothNav(item.href);
                  }}
                  className="hover:text-fawn"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-cream/50">
            Contato
          </h3>
          <ul className="mt-5 space-y-3 text-sm font-light">
            <li>
              <a
                href="#trabalhe"
                onClick={(e) => {
                  e.preventDefault();
                  smoothNav("#trabalhe");
                }}
                className="hover:text-fawn"
              >
                Formulário
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/lapduz_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fawn"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-page flex-col-reverse items-center justify-between gap-4 border-t border-cream/10 px-6 pt-6 text-xs font-light text-cream/50 md:flex-row">
        <p>© {new Date().getFullYear()} Lapduz. Todos os direitos reservados.</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            smoothNav("#home");
          }}
          className="rounded-full border border-cream/20 px-4 py-2 transition-colors hover:bg-cream/10"
        >
          ↑ Rolar para cima
        </button>
      </div>
    </footer>
  );
}
