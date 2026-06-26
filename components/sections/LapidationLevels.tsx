"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/useGsap";
import VantaNet from "@/components/VantaNet";

type Level = {
  name: string;
  /** faturamento (usado em alt/aria; a arte da placa já o exibe) */
  value: string;
  /** PNG da placa em /public/placas (498x625, fundo transparente) */
  img: string;
};

const LEVELS: Level[] = [
  { name: "Peridoto", value: "R$ 500 mil", img: "/placas/Peridoto.png" },
  { name: "Turmalina", value: "R$ 1 milhão", img: "/placas/Turmalina.png" },
  { name: "Jade Imperial", value: "R$ 2 milhões", img: "/placas/Jade%20Imperial.png" },
  { name: "Esmeralda", value: "R$ 5 milhões", img: "/placas/Esmeralda.png" },
];

const CREAM = "#f2ead5"; // fundo sólido da seção
const INK = 0x152b1f; // cor da rede Vanta (textos usam #152b1f via classe)

/** Placa — PNG transparente renderizado inteiro (object-contain) */
function PlaqueCard({ l }: { l: Level }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={l.img}
      alt={`Placa ${l.name} — faturamento ${l.value}`}
      draggable={false}
      loading="lazy"
      className="h-full w-full select-none object-contain"
    />
  );
}

export default function LapidationLevels() {
  const sectionRef = useRef<HTMLElement>(null);
  const camOuterRef = useRef<HTMLDivElement>(null); // parallax do mouse
  const camInnerRef = useRef<HTMLDivElement>(null); // shake idle

  // aviso que segue o cursor ("Clique nas plaquinhas")
  const hintRef = useRef<HTMLDivElement>(null);
  const hintDoneRef = useRef(false); // true após clicar numa placa ou sair da seção
  const dismissHintRef = useRef<(() => void) | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // carrossel mobile (1 placa por vez)
  const carouselRef = useRef<HTMLDivElement>(null);
  const [mobileIdx, setMobileIdx] = useState(0);

  // espelho de `expanded` pro handler de mousemove ler sem re-bind
  const expandedRef = useRef(expanded);
  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  // "câmera": shake idle + parallax do mouse. Só na visão das 4 placas; vive
  // nos wrappers cam*, que NÃO contêm o título nem a visão ampliada.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let removeMove: (() => void) | undefined;

    const ctx = gsap.context(() => {
      // shake idle bem levinho (wrapper interno)
      const inner = camInnerRef.current;
      if (inner) {
        gsap
          .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
          .to(inner, { x: 4, y: -3, rotation: 0.25, duration: 2.6 })
          .to(inner, { x: -3, y: 4, rotation: -0.2, duration: 2.8 })
          .to(inner, { x: 3, y: 2, rotation: 0.15, duration: 2.4 });
      }

      // parallax do mouse, bem sutil (wrapper externo) — pausa quando ampliado
      const outer = camOuterRef.current;
      if (outer) {
        const xTo = gsap.quickTo(outer, "x", { duration: 0.9, ease: "power3" });
        const yTo = gsap.quickTo(outer, "y", { duration: 0.9, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          if (expandedRef.current) return;
          const r = section.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          xTo(nx * 26);
          yTo(ny * 18);
        };
        section.addEventListener("mousemove", onMove);
        removeMove = () => section.removeEventListener("mousemove", onMove);
      }
    }, section);

    return () => {
      removeMove?.();
      ctx.revert();
    };
  }, []);

  // aviso que segue o cursor: "Clique nas plaquinhas". Some ao clicar em
  // qualquer placa OU ao sair da seção no scroll. Só em ponteiro fino (mouse).
  useEffect(() => {
    const el = hintRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    el.style.display = "block";
    gsap.set(el, { yPercent: -50, autoAlpha: 0 });

    const xTo = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (hintDoneRef.current) return;
      xTo(e.clientX + 18);
      yTo(e.clientY);
      if (!shown) {
        shown = true;
        gsap.to(el, { autoAlpha: 1, duration: 0.2 });
      }
    };
    const onLeave = () => {
      shown = false;
      if (!hintDoneRef.current) gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    };

    const dismiss = () => {
      if (hintDoneRef.current) return;
      hintDoneRef.current = true;
      gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    };
    dismissHintRef.current = dismiss;

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    // some de vez ao sair da seção no scroll (pra baixo ou voltando pra cima)
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onLeave: dismiss,
      onLeaveBack: dismiss,
    });

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      st.kill();
      dismissHintRef.current = null;
    };
  }, []);

  // dots do carrossel: marca a placa mais centralizada
  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((it, i) => {
      const node = it as HTMLElement;
      const c = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (best !== mobileIdx) setMobileIdx(best);
  };

  const goToMobile = (i: number) => {
    const el = carouselRef.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({
      left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const cur = LEVELS[active];

  return (
    <section
      id="niveis"
      ref={sectionRef}
      data-theme="light"
      className="relative flex h-screen min-h-[640px] w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: CREAM }}
    >
      {/* Fundo Vanta NET — linhas #152b1f a ~22% sobre o creme */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <VantaNet
          color={INK}
          className="absolute inset-0 h-full w-full opacity-[0.22]"
        />
      </div>

      {/* TÍTULO — fora da câmera, não sofre shake */}
      <div
        className={`lap-title pointer-events-none absolute inset-x-0 top-[11vh] z-20 flex flex-col items-center px-6 text-center transition-opacity duration-500 md:top-[10vh] ${
          expanded ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#152b1f]/50 md:text-xs">
          Recompensas
        </p>
        <h2 className="mt-3 font-display text-4xl font-light text-[#152b1f] md:text-7xl">
          Níveis de Lapidação
        </h2>
      </div>

      {/* VISÃO DAS 4 PLACAS — dentro da câmera */}
      <div
        ref={camOuterRef}
        className={`absolute inset-0 z-30 flex items-start justify-center transition-opacity duration-500 md:items-center md:px-6 ${
          expanded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div ref={camInnerRef} className="w-full">
          {/* placas — carrossel (1 por vez) no mobile, grid de 4 no desktop.
              No desktop desce um pouco (translate-y) pra afastar do título. */}
          <div
            ref={carouselRef}
            onScroll={onCarouselScroll}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[16vw] pb-[2vh] pt-[22vh] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:grid md:w-[min(1400px,96vw)] md:translate-y-[6vh] md:grid-cols-4 md:gap-9 md:overflow-visible md:px-0 md:pb-0 md:pt-0"
          >
            {LEVELS.map((l, i) => (
              <div
                key={l.name}
                className="w-[68vw] shrink-0 snap-center md:w-full"
              >
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    dismissHintRef.current?.();
                    setActive(i);
                    setExpanded(true);
                  }}
                  aria-label={`${l.name} — recebida após faturar ${l.value}`}
                  className={`relative block aspect-[4/5] w-full transition duration-300 ease-out ${
                    hovered === i
                      ? "z-10 -translate-y-3 scale-[1.05] md:-translate-y-4"
                      : ""
                  } ${
                    hovered !== null && hovered !== i
                      ? "brightness-[0.45]"
                      : "brightness-100"
                  }`}
                >
                  <PlaqueCard l={l} />
                </button>
              </div>
            ))}
          </div>

          {/* indicadores (dots) — só mobile */}
          <div className="mt-5 flex justify-center gap-2 md:hidden">
            {LEVELS.map((l, i) => (
              <button
                key={l.name}
                type="button"
                onClick={() => goToMobile(i)}
                aria-label={`Ir para ${l.name}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  mobileIdx === i ? "w-6 bg-[#152b1f]" : "w-2 bg-[#152b1f]/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* detalhe abaixo das placas */}
        <p className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-[1] mx-auto max-w-md px-6 text-center font-display text-base font-light text-[#152b1f]/70 md:bottom-[8vh] md:text-xl">
          Qual será seu próximo nível de lapidação com a Lapduz?
        </p>
      </div>

      {/* VISÃO AMPLIADA — fora da câmera, sem shake */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center px-6 pt-[6vh] transition-opacity duration-500 ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="absolute left-6 top-[11vh] z-30 inline-flex items-center gap-2 rounded-full border border-[#152b1f]/25 bg-[#152b1f]/5 px-4 py-2 text-sm text-[#152b1f] backdrop-blur transition hover:bg-[#152b1f]/10 md:left-10"
        >
          <span aria-hidden>←</span> Voltar
        </button>

        <div
          className={`flex w-full max-w-6xl flex-col items-center gap-7 transition-all duration-500 md:flex-row md:justify-center md:gap-12 ${
            expanded ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* headline — esquerda (desktop) / topo (mobile) */}
          <div className="text-center md:w-[26%] md:text-right">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#152b1f]/50">
              Nível
            </p>
            <h3 className="mt-2 font-display text-4xl font-light text-[#152b1f] md:text-6xl">
              {cur.name}
            </h3>
          </div>

          {/* placa ampliada — centro */}
          <div className="aspect-[4/5] w-[min(340px,72vw)] flex-shrink-0 md:w-[400px]">
            <PlaqueCard l={cur} />
          </div>

          {/* descritivo — direita (desktop) / base (mobile) */}
          <div className="max-w-xs text-center md:w-[26%] md:text-left">
            <p className="font-display text-lg font-light leading-relaxed text-[#152b1f]/80 md:text-xl">
              Recebida após faturar{" "}
              <span className="text-[#152b1f]">{cur.value}</span>, estando em
              período de lapidação com a Lapduz.
            </p>
          </div>
        </div>
      </div>

      {/* aviso que segue o cursor — habilitado via JS só em ponteiro fino */}
      <div
        ref={hintRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[99999] hidden whitespace-nowrap text-[15px] font-medium text-white"
        style={{ mixBlendMode: "difference" }}
      >
        Clique nas plaquinhas
      </div>
    </section>
  );
}
