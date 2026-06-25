"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/useGsap";

type Item = {
  img?: string;
  date?: string;
  title: string;
  featured?: boolean;
  /** card-convite no fim do mural (sem imagem/data) */
  cta?: boolean;
};

const ITEMS: Item[] = [
  {
    img: "/legado/fachada.png",
    date: "17 de Dezembro, 2024",
    title: "A Lapduz se estabelece em Araraquara",
    featured: true, // marco — recebe brilho em volta
  },
  {
    img: "https://lapduz.com/wp-content/uploads/2026/04/Alguns-cliques-do-Evento-Governe-com-@pablomarcal1-em-Joinville-Um-evento-pra-quem-quer-realment.jpg",
    date: "20 de Abril, 2025",
    title: "Evento Governar — Pablo Marçal",
  },
  {
    img: "/legado/pbr.jpg",
    date: "Agosto, 2025",
    title: "Cobrimos o Rodeio de Araras, PBR",
  },
  {
    img: "/legado/conemag.jpg",
    date: "Setembro, 2025",
    title: "VFX desafiador para Conemag",
  },
  {
    img: "/legado/sofer.png",
    date: "Outubro, 2025",
    title: "Possibilitamos uma venda de 8 milhões para Sofer",
    featured: true, // marco — recebe brilho em volta
  },
  {
    img: "/legado/interlagos.webp",
    date: "24 de Novembro, 2025",
    title: "Lapduz chega em Interlagos",
  },
  {
    img: "/legado/transface.png",
    date: "11 de Fevereiro, 2026",
    title: "Parceria com a Transface, empresa com 36 anos de mercado",
    featured: true, // marco — recebe brilho em volta
  },
  {
    img: "/legado/arthur-clax.jpg",
    date: "01 de Março, 2026",
    title: "Arthur Aguiar no evento Clax Club",
  },
  {
    img: "/legado/medicina-estetica.jpg",
    date: "01 de Abril, 2026",
    title: "Entramos no jogo com a Medicina Estética",
  },
  {
    cta: true,
    title: "Seja você parte do nosso legado também",
  },
];

const Y_OFFSETS = [-90, 110, -60, 130];

/**
 * Métricas que se adaptam ao viewport — largura E altura.
 *
 * A largura define o tier base (mobile / tablet / desktop). Em seguida a
 * ALTURA é levada em conta: como os cards são centralizados verticalmente e
 * têm tamanho fixo + deslocamento vertical (Y_OFFSETS), numa tela baixa
 * (notebook) o conjunto "card + offset" estoura os 100vh e os descritivos
 * vazam pra fora. Para evitar isso a gente:
 *   1) achata a onda (reduz o yScale) até um piso;
 *   2) se ainda não couber, encolhe o card pela altura disponível.
 * gap e sidePad acompanham o card pra manter a proporção horizontal.
 */
function getMetrics(w: number, h: number) {
  let cardW: number, gap: number, sidePad: number, yScale: number;
  if (w < 768) {
    cardW = 200; gap = 140; sidePad = 200; yScale = 0.6;
  } else if (w < 1024) {
    cardW = 280; gap = 220; sidePad = 360; yScale = 0.8;
  } else {
    cardW = 360; gap = 320; sidePad = 480; yScale = 1;
  }

  const tierCardW = cardW;
  const CAPTION = 72; // altura aprox. de data + título (até 2 linhas) + gap
  const MARGIN = 80; // respiro vertical topo/baixo
  const MAX_OFFSET = 130; // maior |Y_OFFSET|
  const halfBudget = h / 2 - MARGIN;
  // meia-altura ocupada pelo card mais baixo = MAX_OFFSET*yScale + cardH/2
  const fits = (cw: number, ys: number) =>
    MAX_OFFSET * ys + (cw * 1.25 + CAPTION) / 2 <= halfBudget;

  // 1) achata a onda até caber (piso 0.35 pra não virar linha reta)
  while (!fits(cardW, yScale) && yScale > 0.35) {
    yScale = Math.max(0.35, +(yScale - 0.05).toFixed(2));
  }
  // 2) se ainda estoura, reduz o card pela altura disponível
  if (!fits(cardW, yScale)) {
    const cardHalf = halfBudget - MAX_OFFSET * yScale; // = cardH/2
    cardW = Math.max(150, (cardHalf * 2 - CAPTION) / 1.25);
  }
  // mantém a proporção horizontal quando o card encolhe por altura
  const ratio = cardW / tierCardW;
  if (ratio < 1) {
    gap = Math.max(120, gap * ratio);
    sidePad = Math.max(140, sidePad * ratio);
  }

  return {
    cardW: Math.round(cardW),
    gap: Math.round(gap),
    sidePad: Math.round(sidePad),
    yScale,
  };
}

export default function Legacy() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [m, setM] = useState({
    cardW: 360,
    gap: 320,
    sidePad: 480,
    yScale: 1,
  });

  // recalcula métricas no mount e no resize
  useEffect(() => {
    const update = () => setM(getMetrics(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalWidth = m.sidePad * 2 + ITEMS.length * m.cardW + (ITEMS.length - 1) * m.gap;

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!section || !track || !path || !svg) return;

    const buildPath = () => {
      const height = window.innerHeight;
      const cy = height / 2;
      const pts = ITEMS.map((it, i) => ({
        x: m.sidePad + m.cardW / 2 + i * (m.cardW + m.gap),
        y: cy + (it.cta ? 0 : Y_OFFSETS[i % Y_OFFSETS.length]) * m.yScale,
      }));
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const mx = (prev.x + cur.x) / 2;
        d += ` C ${mx} ${prev.y}, ${mx} ${cur.y}, ${cur.x} ${cur.y}`;
      }
      path.setAttribute("d", d);
      svg.setAttribute("viewBox", `0 0 ${totalWidth} ${height}`);
      svg.setAttribute("width", String(totalWidth));
      svg.setAttribute("height", String(height));
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      return length;
    };

    buildPath();
    const dist = totalWidth - window.innerWidth;

    const moveTween = gsap.to(track, {
      x: -dist,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${dist}`,
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    const lineTween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${dist}`,
        scrub: 0.4,
      },
    });

    const onResize = () => {
      const newLen = buildPath();
      gsap.set(path, {
        strokeDasharray: newLen,
        strokeDashoffset: newLen * (1 - (lineTween.progress() || 0)),
      });
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      moveTween.scrollTrigger?.kill();
      moveTween.kill();
      lineTween.scrollTrigger?.kill();
      lineTween.kill();
    };
  }, [totalWidth, m]);

  return (
    <section
      id="legado"
      ref={sectionRef}
      data-theme="dark"
      className="relative h-screen w-full overflow-hidden bg-forest text-cream"
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[18vw] font-thin opacity-[0.06]">
        Legado
      </span>

      <div className="absolute left-6 top-28 z-10 md:left-8 min-[1700px]:top-8">
        <p className="text-xs uppercase tracking-[0.4em] text-cream/60">
          Legado
        </p>
        <h2 className="mt-2 font-display text-3xl font-light md:text-5xl">
          Mural de conquistas
        </h2>
      </div>

      <div
        ref={trackRef}
        className="relative h-screen will-change-transform"
        style={{ width: totalWidth }}
      >
        <svg
          ref={svgRef}
          className="absolute left-0 top-0 z-[1]"
          fill="none"
          aria-hidden
        >
          <path
            ref={pathRef}
            stroke="#ddb962"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </svg>

        {ITEMS.map((it, i) => {
          const x = m.sidePad + i * (m.cardW + m.gap);
          const yOff = it.cta ? 0 : Y_OFFSETS[i % Y_OFFSETS.length];
          return (
            <article
              key={i}
              className="absolute z-[2] flex flex-col gap-3"
              style={{
                left: x,
                top: `calc(50% + ${yOff * m.yScale}px)`,
                width: m.cardW,
                transform: "translateY(-50%)",
              }}
            >
              {it.cta ? (
                // convite final do mural — sem imagem, fecha a linha dourada
                <div className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-xl border border-dashed border-fawn/50 bg-fawn/[0.06] px-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fawn">
                    O próximo capítulo
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-light leading-snug text-cream md:text-3xl">
                    {it.title}
                  </h3>
                  <span aria-hidden className="mt-6 text-2xl text-fawn">
                    →
                  </span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    {/* marco importante: halo dourado pulsante atrás do card */}
                    {it.featured && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-fawn/40 blur-2xl animate-glow"
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.img}
                      alt={it.title}
                      className={`aspect-[4/5] w-full rounded-xl object-cover shadow-2xl ${
                        it.featured
                          ? "ring-2 ring-fawn shadow-[0_0_40px_rgba(221,185,98,0.45)]"
                          : "ring-1 ring-cream/10"
                      }`}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-fawn">
                      {it.date}
                    </p>
                    <h3 className="mt-1 font-display text-base font-light leading-snug md:text-lg">
                      {it.title}
                    </h3>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>


    </section>
  );
}
