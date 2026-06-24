"use client";

import { useEffect, useRef, useState } from "react";
import { smoothNav } from "@/lib/smoothNav";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#solucoes" },
  { label: "Trabalhe conosco", href: "#trabalhe" },
];

const INSTAGRAM_URL = "https://www.instagram.com/lapduz_/";

type Theme = "dark" | "light";

export default function Header() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  // na seção #niveis o menu se esconde pra cima (deixa só uma sobra); hover revela
  const [hideForNiveis, setHideForNiveis] = useState(false);
  const [hovered, setHovered] = useState(false);

  /**
   * Detecta qual section está atrás do menu lendo o data-theme do elemento
   * sob um ponto fixo no topo da viewport. Roda em cada scroll.
   * elementsFromPoint pula o próprio menu (que está acima).
   */
  useEffect(() => {
    const update = () => {
      const header = headerRef.current;
      if (!header) return;
      // ponto fixo logo abaixo do topo — não depende da posição do menu (que
      // agora se move pra esconder na seção #niveis).
      const els = document.elementsFromPoint(window.innerWidth / 2, 70);
      let nextTheme: Theme | null = null;
      let niveis = false;
      for (const el of els) {
        if (header.contains(el)) continue; // pula o menu
        const node = (el as HTMLElement).closest("[data-theme]") as HTMLElement | null;
        if (node?.dataset.theme === "dark" || node?.dataset.theme === "light") {
          nextTheme = node.dataset.theme as Theme;
          niveis = node.id === "niveis" || node.id === "legado";
          break;
        }
      }
      if (nextTheme) setTheme(nextTheme);
      setHideForNiveis(niveis);
    };

    // chama no mount e em todo scroll/resize
    update();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // trava scroll do body quando o overlay do menu mobile está aberto
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  // cores e classes derivadas do tema
  const textColor = theme === "dark" ? "#f2da92" : "#152b1f";
  const glassBg =
    theme === "dark"
      ? "rgba(21, 43, 31, 0.28)"
      : "rgba(255, 255, 255, 0.28)";
  const glassBorder =
    theme === "dark"
      ? "rgba(242, 218, 146, 0.25)"
      : "rgba(21, 43, 31, 0.15)";

  return (
    <>
      <header
        ref={headerRef}
        id="home"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed left-1/2 top-6 z-[1000] flex w-[min(1180px,calc(100%-32px))] items-center justify-between gap-6 rounded-full px-5 py-3 md:px-7 md:py-3.5"
        style={{
          backgroundColor: glassBg,
          border: `1px solid ${glassBorder}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          transition:
            "color 0.4s ease, background-color 0.4s ease, border-color 0.4s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
          color: textColor,
          // escondido pra cima (deixa ~20px de sobra) na seção #niveis; hover
          // (ou menu mobile aberto) traz de volta pra posição original.
          transform:
            hideForNiveis && !hovered && !menuOpen
              ? "translateX(-50%) translateY(calc(-100% - 4px))"
              : "translateX(-50%) translateY(0)",
        }}
      >
        <a
          href="#home"
          className="flex items-center"
          aria-label="Lapduz"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            smoothNav("#home");
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-horizontal-yellow.png"
            alt="Lapduz"
            className="block h-10 w-auto flex-shrink-0 object-contain md:h-10"
            style={{ aspectRatio: "1024 / 361" }}
          />
        </a>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                smoothNav(item.href);
              }}
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: "inherit" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA desktop — wrapper externo controla visibilidade (cta-pill tem
            display:inline-flex próprio no globals.css que sobrescreve `hidden`) */}
        <div className="hidden lg:block">
          <a
            href="#trabalhe"
            onClick={(e) => {
              e.preventDefault();
              smoothNav("#trabalhe");
            }}
            className="cta-pill text-xs md:text-sm"
          >
            <span>Aumentar meu faturamento</span>
            <span className="cta-icon" aria-hidden>
              →
            </span>
          </a>
        </div>

        {/* Hamburger mobile */}
        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative h-9 w-9 lg:hidden"
        >
          <span
            className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 rounded-full transition-transform duration-300"
            style={{
              backgroundColor: "currentColor",
              transform: menuOpen
                ? "translate(-50%, -50%) rotate(45deg)"
                : "translate(-50%, calc(-50% - 6px))",
            }}
          />
          <span
            className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: "currentColor",
              opacity: menuOpen ? 0 : 1,
              transform: "translate(-50%, -50%)",
            }}
          />
          <span
            className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 rounded-full transition-transform duration-300"
            style={{
              backgroundColor: "currentColor",
              transform: menuOpen
                ? "translate(-50%, -50%) rotate(-45deg)"
                : "translate(-50%, calc(-50% + 6px))",
            }}
          />
        </button>
      </header>

      {/* Overlay mobile fullscreen */}
      <div
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 transition-all duration-500 lg:hidden"
        style={{
          backgroundColor: "#152b1f",
          color: "#f2da92",
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? "visible" : "hidden",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        aria-hidden={!menuOpen}
      >
        {NAV.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              // pequeno delay pra dar tempo do overlay fechar antes do scroll
              setTimeout(() => smoothNav(item.href), 350);
            }}
            className="font-display text-3xl font-light"
            style={{
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: menuOpen ? 1 : 0,
              transition: `transform 600ms ease ${i * 70 + 100}ms, opacity 600ms ease ${i * 70 + 100}ms`,
            }}
          >
            {item.label}
          </a>
        ))}

        {/* Instagram só no mobile */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
          className="mt-4 flex items-center gap-3 font-display text-2xl font-light"
          style={{
            transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: menuOpen ? 1 : 0,
            transition: `transform 600ms ease ${NAV.length * 70 + 100}ms, opacity 600ms ease ${NAV.length * 70 + 100}ms`,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Instagram
        </a>

        {/* CTA principal abaixo de tudo */}
        <a
          href="#trabalhe"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            setTimeout(() => smoothNav("#trabalhe"), 350);
          }}
          className="cta-pill mt-8"
          style={{
            transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: menuOpen ? 1 : 0,
            transition: `transform 600ms ease ${(NAV.length + 1) * 70 + 200}ms, opacity 600ms ease ${(NAV.length + 1) * 70 + 200}ms`,
          }}
        >
          <span>Aumentar meu faturamento</span>
          <span className="cta-icon" aria-hidden>
            →
          </span>
        </a>
      </div>
    </>
  );
}
