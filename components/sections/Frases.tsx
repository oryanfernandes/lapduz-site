"use client";

import { useRef } from "react";
import { useGsap, gsap } from "@/lib/useGsap";
import { splitWordsAndChars } from "@/lib/splitText";

const FRASES = [
  "Somos o novo marketing",
  "Focados em colocar dinheiro no seu bolso",
  "Somos Lapduz",
];

/**
 * Diamantes parallax: começam GRANDES e DESFOCADOS embaixo,
 * sobem encolhendo e GANHANDO foco até saírem do topo nítidos.
 */
const DIAMOND_PROFILES = [
  { fromY: 80,  toY: -320, fromScale: 2.2, toScale: 0.4, fromBlur: 14, toBlur: 0, rotate:  280 },
  { fromY: 120, toY: -380, fromScale: 1.9, toScale: 0.3, fromBlur: 18, toBlur: 0, rotate: -220 },
  { fromY: 160, toY: -260, fromScale: 2.5, toScale: 0.5, fromBlur: 12, toBlur: 0, rotate:  340 },
];

export default function Frases() {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, () => {
    if (!ref.current) return;
    const stage = ref.current.querySelector<HTMLElement>(".frases-stage");

    // Crossfade das 3 frases conforme o scroll progride.
    // pin no stage interno: ele fica travado em viewport enquanto
    // a section de 300vh é percorrida; solta no final.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    const frases = ref.current.querySelectorAll<HTMLElement>(".frase");
    // estado inicial: container centrado (xPercent:-50) e invisível
    gsap.set(frases, { xPercent: -50, opacity: 0 });

    // mesmo char-reveal dos Pilares: cada letra acende com flash verde
    // fluorescente antes de assentar no verde-escuro.
    const charsByFrase = Array.from(frases).map((f) => {
      splitWordsAndChars(f);
      const chars = f.querySelectorAll<HTMLElement>(".char-reveal");
      gsap.set(chars, { opacity: 0.2, color: "#152b1f" });
      return chars;
    });

    frases.forEach((f, i) => {
      // entrada: mostra o container e revela as letras (verde → verde-escuro)
      tl.set(f, { opacity: 1 });
      tl.fromTo(
        charsByFrase[i],
        { opacity: 0.2, color: "#152b1f" },
        {
          keyframes: [
            { opacity: 1, color: "#39ff14", duration: 0.3 },
            { color: "#152b1f", duration: 0.7 },
          ],
          stagger: 0.05,
          ease: "none",
        }
      );
      // saída (menos a última): some o container pro próximo entrar
      if (i < frases.length - 1) tl.to(f, { opacity: 0, duration: 1 });
    });

    // Diamantes: posição + escala + blur + rotação animadas via CSS vars
    // (filter "blur(Xpx)" não tweena suavemente como string — usamos var
    //  --blur e setamos filter no estilo do elemento)
    const diamonds = ref.current.querySelectorAll<HTMLElement>(".diamond");
    diamonds.forEach((d, i) => {
      const p = DIAMOND_PROFILES[i % DIAMOND_PROFILES.length];

      d.style.filter = "blur(var(--blur, 0px))";
      d.style.transformOrigin = "50% 50%";
      d.style.willChange = "transform, filter";

      gsap.set(d, {
        y: p.fromY,
        scale: p.fromScale,
        rotation: 0,
        "--blur": `${p.fromBlur}px`,
      });

      gsap.to(d, {
        y: p.toY,
        scale: p.toScale,
        rotation: p.rotate,
        "--blur": `${p.toBlur}px`,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    });
  });

  return (
    <section
      ref={ref}
      data-theme="light"
      className="frases-section relative overflow-hidden bg-bone"
      style={{ height: "300vh" }}
    >
      {/* diamantes parallax decorativos — z-depth variada */}
      <div className="diamond pointer-events-none absolute left-[6%] top-[12vh] w-40 opacity-90 md:w-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/diamond.png" alt="" aria-hidden />
      </div>
      <div className="diamond pointer-events-none absolute right-[8%] top-[22vh] w-32 opacity-70 md:w-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/diamond.png" alt="" aria-hidden />
      </div>
      <div className="diamond pointer-events-none absolute left-[20%] top-[58vh] w-28 opacity-80 md:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/diamond.png" alt="" aria-hidden />
      </div>

      {/* stage que será pinado pelo GSAP */}
      <div className="frases-stage flex h-screen w-full items-center justify-center">
        <div className="relative flex w-full items-center justify-center px-8 text-center md:px-12">
          {FRASES.map((f) => (
            <h2
              key={f}
              className="frase absolute left-1/2 max-w-[calc(100%-2.5rem)] font-display text-2xl font-light leading-tight text-forest sm:text-3xl md:max-w-[80%] md:text-5xl lg:text-6xl"
              style={{ opacity: 0 }}
            >
              {f}
            </h2>
          ))}
        </div>
      </div>
    </section>
  );
}
