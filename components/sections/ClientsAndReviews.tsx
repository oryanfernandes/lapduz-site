"use client";

import { useEffect, useRef, useState } from "react";
import LogoSphere from "./LogoSphere";
import VantaFog from "@/components/VantaFog";
import { useGsap, gsap } from "@/lib/useGsap";

type Review = {
  name: string;
  text: string;
  date: string;
  rating: number;
};

const REVIEWS: Review[] = [
  {
    name: "Departamento Contábil",
    date: "04 Nov 2025",
    rating: 5,
    text: "Foi uma experiência excepcional trabalhar com a equipe da Lapduz. Atenciosos, pacientes e prestativos em cada etapa. Os vídeos de depoimentos produzidos ficaram simplesmente incríveis!",
  },
  {
    name: "Elen Theodoro",
    date: "17 Out 2025",
    rating: 5,
    text: "Toda equipe sempre muito comprometida em entregar o melhor planejamento, execução e resultado. Sou cliente há muitos anos e tenho grande admiração pela LapDuz.",
  },
  {
    name: "Luam Oliveira",
    date: "17 Out 2025",
    rating: 5,
    text: "A equipe é profissional, atenciosa e realmente se preocupa em entender o negócio. Comunicação excelente e entregas sempre dentro do prazo. Recomendo.",
  },
  {
    name: "Maria Julia Bocchio",
    date: "17 Out 2025",
    rating: 5,
    text: "Equipe atenciosa e que nos deixa à vontade no momento da gravação, trazendo leveza e naturalidade.",
  },
  {
    name: "Giovani Bagliotti",
    date: "17 Out 2025",
    rating: 5,
    text: "Excelentes profissionais, responsáveis e de muita qualidade!",
  },
  {
    name: "Diego Moreira",
    date: "17 Out 2025",
    rating: 5,
    text: "Lapduz é uma empresa que sempre admirei. Quando iniciamos o projeto tive bons retornos — sem dúvidas um investimento que alavanca sua empresa!",
  },
  {
    name: "Janderson R Cafola",
    date: "17 Out 2025",
    rating: 5,
    text: "Equipe jovem, criativa e altamente profissional. Realmente entendem o que fazem: escutam com atenção, trazem ideias inovadoras e entregam com excelência.",
  },
];

export default function ClientsAndReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);

  // texto que segue o mouse "Gire os logos"
  useEffect(() => {
    const el = cursorTextRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX + 20;
      mouse.y = e.clientY;
    };
    const tick = () => {
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;
      gsap.set(el, { x: pos.x, y: pos.y });
    };
    gsap.ticker.add(tick);
    window.addEventListener("pointermove", onMove);

    const enter = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    const sphere = section.querySelector(".three-sphere");
    sphere?.addEventListener("mouseenter", enter);
    sphere?.addEventListener("mouseleave", leave);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      sphere?.removeEventListener("mouseenter", enter);
      sphere?.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section
      id="clientes"
      ref={sectionRef}
      data-theme="light"
      className="relative overflow-hidden py-32"
    >
      {/* Vanta.FOG como background animado */}
      <VantaFog className="pointer-events-none absolute inset-0 z-0" />

      {/* cursor follower */}
      <div
        ref={cursorTextRef}
        className="pointer-events-none fixed left-0 top-0 z-[99998] -translate-y-1/2 whitespace-nowrap font-display text-sm text-forest opacity-0"
      >
        Gire os logos
      </div>

      <div className="relative z-10 mx-auto grid max-w-page items-center gap-12 px-6 md:grid-cols-[5fr_7fr]">
        <div>
          <h2 className="font-display text-4xl font-light leading-tight text-forest md:text-6xl">
            Os grandes são <span className="text-forest">Lapduz</span>
          </h2>
          <p className="mt-6 max-w-md font-display text-base font-medium leading-relaxed text-forest/75 md:text-lg">
            Nossos clientes <strong>não são apenas parceiros</strong> — são
            marcas que <strong>confiam no poder da imagem</strong> para se
            destacar e ocupar seu espaço com autoridade.
          </p>
          <a href="#trabalhe" className="cta-pill mt-8">
            <span>Quero ser Lapidado</span>
            <span className="cta-icon" aria-hidden>
              →
            </span>
          </a>
        </div>

        <div className="flex justify-center">
          <LogoSphere />
        </div>
      </div>

      {/* Reviews carrossel */}
      <ReviewsCarousel reviews={REVIEWS} />

      {/* Degradê creme no fim — z alto (acima do Vanta) pra transição gradual
          com a seção Níveis (fundo #f2ead5) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[38vh] bg-gradient-to-b from-transparent to-[#f2ead5]"
      />
    </section>
  );
}

function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGsap(wrapperRef, () => {
    // simples auto-scroll horizontal infinito por CSS animation
    // (mantido em CSS no className abaixo)
  });

  // duplicamos para loop perfeito
  const items = [...reviews, ...reviews];

  return (
    <div
      ref={wrapperRef}
      className="relative z-10 mt-24 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div className="flex w-max gap-6 animate-marquee">
        {items.map((r, i) => (
          <article
            key={i}
            className="w-[320px] shrink-0 rounded-2xl border border-forest/10 bg-white/70 p-6 backdrop-blur md:w-[380px]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-medium text-cream">
                {r.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-forest">{r.name}</p>
                <p className="text-xs text-forest/50">{r.date}</p>
              </div>
              <div className="ml-auto flex text-fawn">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <span key={k}>★</span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-forest/80">
              {r.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
