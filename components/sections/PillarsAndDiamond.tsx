"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/useGsap";
import { splitWordsAndChars } from "@/lib/splitText";

const PILLARS = [
  {
    n: "01",
    title: "Branding",
    text: "Elevamos a percepção de valor da sua marca, posicionando sua empresa como a escolha óbvia para o cliente certo.",
  },
  {
    n: "02",
    title: "Vendas",
    text: "Transformamos autoridade em demanda, atraindo leads qualificados e criando oportunidades de negócio de forma previsível.",
  },
  {
    n: "03",
    title: "Automação",
    text: "Após validar os processos, implementamos automações que aumentam a eficiência e reduzem gargalos operacionais.",
  },
  {
    n: "04",
    title: "Escala",
    text: "Com uma operação estruturada e previsível, sua empresa ganha capacidade para crescer sem perder qualidade ou oportunidades.",
  },
];

const FRAME_PATH = "https://lapduz.com/wp-content/uploads/2025/sequence/seq2/";
const FRAME_PREFIX = "dima2_i2_";
const FRAME_EXT = ".png";
const TOTAL_FRAMES = 179;
const ZERO_PAD = 5;

/**
 * Pilares (esquerda) + canvas do diamante (direita, sticky CSS puro).
 * Barra de progresso + contador 1→4 ficam FIXED na borda esquerda da tela,
 * visíveis só enquanto a seção está em viewport.
 */
export default function PillarsAndDiamond() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollUiRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const digitTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const progressBar = progressBarRef.current;
    const digitTrack = digitTrackRef.current;
    const scrollUi = scrollUiRef.current;
    if (!section || !canvas || !progressBar || !digitTrack || !scrollUi) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = (n: number, size: number) => String(n).padStart(size, "0");
    const urlFor = (i: number) =>
      `${FRAME_PATH}${FRAME_PREFIX}${pad(i, ZERO_PAD)}${FRAME_EXT}`;

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loaded = 0;
    let lastDrawn = -1;
    const sequence = { frame: 0 };
    let scrubTween: gsap.core.Tween | null = null;
    let digitTween: gsap.core.Tween | null = null;
    let visTrigger: ScrollTrigger | null = null;
    let centerTween: gsap.core.Tween | null = null;
    const charTweens: gsap.core.Tween[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * DPR);
      canvas.height = Math.round(rect.height * DPR);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.imageSmoothingEnabled = true;
    };

    const drawFrame = (i: number) => {
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / DPR;
      const ch = canvas.height / DPR;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      // zoom 1.6 pra preencher mais — sem cortar (contain * zoom)
      const scale = Math.min(cw / iw, ch / ih) * 1.6;
      const w = iw * scale;
      const h = ih * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, w, h);
      lastDrawn = i;
    };

    const initAnimations = () => {
      resize();
      drawFrame(0);

      // tween principal: scrubba sequence.frame
      scrubTween = gsap.to(sequence, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        snap: "frame",
        onUpdate: () => {
          const f = Math.round(sequence.frame);
          if (f !== lastDrawn) drawFrame(f);
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const pct = Math.max(0, Math.min(1, self.progress));
            progressBar.style.height = `${pct * 100}%`;
          },
        },
      });

      // contador 1 → 4
      digitTween = gsap.to(digitTrack, {
        y: -18 * 3,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // UI fica visível só quando a seção está em viewport
      visTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          gsap.to(scrollUi, {
            autoAlpha: self.isActive ? 1 : 0,
            duration: 0.3,
            overwrite: true,
          });
        },
      });

      // char-reveal — verde fluorescente como no original
      section.querySelectorAll<HTMLElement>(".reveal-text").forEach((el) => {
        splitWordsAndChars(el);
        const chars = el.querySelectorAll<HTMLElement>(".char-reveal");
        const tw = gsap.fromTo(
          chars,
          { opacity: 0.2, color: "#152b1f" },
          {
            keyframes: [
              { opacity: 1, color: "#39ff14", duration: 0.3 },
              { color: "#152b1f", duration: 0.7 },
            ],
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        charTweens.push(tw);
      });

      // FINAL: depois que o último texto passa, o diamante amplia e desliza pro
      // centro da tela pra dar mais impacto (desktop — o canvas é lg only).
      centerTween = gsap.fromTo(
        canvas,
        { x: 0, scale: 1 },
        {
          // x = distância horizontal até centralizar o canvas na viewport
          // (offsetLeft ignora transform/scroll, então é estável no scrub)
          x: () => {
            let l = 0;
            let n: HTMLElement | null = canvas;
            while (n) {
              l += n.offsetLeft;
              n = n.offsetParent as HTMLElement | null;
            }
            return window.innerWidth / 2 - (l + canvas.offsetWidth / 2);
          },
          scale: 1.35,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "bottom 140%", // últimos ~40vh, depois do 4º texto passar
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      ScrollTrigger.refresh();
    };

    // pré-carrega todos os frames
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = urlFor(i);
      const done = () => {
        images[i - 1] = img;
        loaded++;
        if (loaded === TOTAL_FRAMES) initAnimations();
      };
      img.onload = done;
      img.onerror = done;
    }

    const onResize = () => {
      resize();
      if (lastDrawn >= 0) drawFrame(lastDrawn);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scrubTween?.scrollTrigger?.kill();
      scrubTween?.kill();
      digitTween?.scrollTrigger?.kill();
      digitTween?.kill();
      visTrigger?.kill();
      centerTween?.scrollTrigger?.kill();
      centerTween?.kill();
      charTweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      data-theme="light"
      className="relative bg-bone lg:!h-[430vh]"
      // mobile: altura natural (sem canvas precisa de bem menos)
      // desktop: 430vh (4 pilares * 100vh + buffer) via classe lg:!h-[430vh]
    >
      {/* shape divider — triângulo no topo (1px de overlap pra esconder hairline) */}
      <svg
        aria-hidden
        className="absolute left-0 right-0 z-10 block w-full text-bone"
        style={{ top: "-6vh", height: "calc(6vh + 2px)" }}
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
      >
        <path d="M500.2,94.7L0,0v100h1000V0L500.2,94.7z" fill="currentColor" />
      </svg>

      {/* UI lateral FIXED à esquerda — só desktop (no mobile os 01-04 já indicam progresso) */}
      <div
        ref={scrollUiRef}
        className="pointer-events-none fixed left-[60px] top-1/2 z-[60] hidden -translate-y-1/2 items-center gap-5 opacity-0 lg:flex"
        style={{ visibility: "hidden" }}
      >
        <div className="h-[40vh] w-[6px] overflow-hidden rounded-full bg-forest/15">
          <div
            ref={progressBarRef}
            className="w-full origin-top rounded-full bg-forest"
            style={{ height: "0%" }}
          />
        </div>
        <div className="flex font-mono text-base font-medium leading-none text-forest">
          <span className="mr-0.5">0</span>
          <div className="relative h-[18px] overflow-hidden">
            <div ref={digitTrackRef} className="flex flex-col">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className="flex h-[18px] items-center">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid h-full max-w-page grid-cols-1 px-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* ESQUERDA — textos. Gap menor no mobile pra não ter vão morto */}
        <div className="relative z-10 flex flex-col gap-[12vh] py-[14vh] lg:gap-[60vh] lg:py-[30vh]">
          {PILLARS.map((p) => (
            <article key={p.n} className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-fawn">
                {p.n}
              </p>
              <h2
                className="reveal-text mt-4 font-display text-4xl font-light leading-tight md:text-5xl lg:text-6xl"
                style={{ color: "#152b1f" }}
              >
                {p.title}
              </h2>
              <h3
                className="reveal-text mt-6 font-display text-lg font-medium leading-relaxed md:text-xl"
                style={{ color: "#152b1f" }}
              >
                {p.text}
              </h3>
              <div className="mt-8 h-px w-32 bg-forest/20" />
            </article>
          ))}
        </div>

        {/* DIREITA — canvas pinado via CSS sticky (não GSAP pin).
            self-start + altura < seção faz o sticky liberar antes do fim,
            então o diamante "despina" e sobe um pouco antes no scroll. */}
        <div className="relative hidden self-start lg:block lg:h-[415vh]">
          <div className="sticky top-0 flex h-screen items-center justify-center">
            <canvas
              ref={canvasRef}
              className="block h-screen w-full"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
