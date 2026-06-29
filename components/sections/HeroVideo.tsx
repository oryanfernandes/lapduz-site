"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/useGsap";

const ROTATING = ["estratégia", "posicionamento", "marketing", "conteúdo"];
const VIDEO_DESKTOP = "/fundosite-allkey.mp4";
const VIDEO_MOBILE = "/mobilefundosite-allkey.mp4";

/**
 * Hero unificado desktop + mobile.
 *
 * Estratégia:
 *  - section 450vh + inner sticky 100vh (CSS sticky nativo — sem GSAP pin
 *    porque pin com transform pode atrapalhar o render de <video> em
 *    alguns browsers e gerar branco no topo / piscadas)
 *  - <video autoPlay muted playsInline> como elemento visível
 *  - ScrollTrigger só observa o scroll e atualiza video.currentTime
 *  - na primeira atualização do scroll, pausamos o vídeo (até lá ele toca
 *    sozinho, sem deixar a tela em branco)
 *  - fallback gradient permanente atrás do vídeo, cobre qualquer flicker
 */
export default function HeroVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const darkenRef = useRef<HTMLDivElement>(null);

  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // headline rotativo
  useEffect(() => {
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % ROTATING.length),
      1800
    );
    return () => clearInterval(id);
  }, []);

  // detecta mobile pós-mount; só então renderiza o <video> (evita
  // baixar o desktop antes e trocar)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    setMounted(true);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ScrollTrigger pro scrub do vídeo e fade do conteúdo
  useEffect(() => {
    if (!mounted) return;
    const section = sectionRef.current;
    const content = contentRef.current;
    const video = videoRef.current;
    if (!section || !content || !video) return;

    let lastTarget = -1;

    // iOS é preguiçoso com preload="auto" — força o load explicitamente
    try {
      video.load();
    } catch {
      /* */
    }

    // aplica no vídeo o frame correspondente ao progress (0..1) do scroll
    const setFrame = (progress: number) => {
      if (!video.duration) return;
      const target = Math.max(0, Math.min(1, progress)) * video.duration;
      if (Math.abs(target - lastTarget) < 0.015) return;
      lastTarget = target;
      try {
        video.currentTime = target;
      } catch {
        /* */
      }
    };

    /**
     * Setup das ScrollTriggers — feito IMEDIATAMENTE, sem esperar o vídeo
     * carregar. Assim a fade do conteúdo funciona mesmo se o vídeo demorar
     * (ou nunca carregar, em devices muito restritos).
     *
     * onRefresh sincroniza o frame com a posição ATUAL do scroll — resolve o
     * caso de recarregar no meio do site: ao voltar pra hero o vídeo já mostra
     * o frame certo (o último, se a viewport está depois da hero), em vez de
     * piscar o primeiro frame até o primeiro onUpdate.
     */
    const scrubTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.15,
      invalidateOnRefresh: true,
      onUpdate: (self) => setFrame(self.progress),
      onRefresh: (self) => setFrame(self.progress),
    });

    const fadeTrigger = gsap.fromTo(
      content,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=70%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    ).scrollTrigger!;

    // mobile: escurecimento do fundo some junto com a headline (devolve o
    // destaque ao vídeo). Só ativa no mobile — no desktop a camada é display:none.
    let darkenTween: gsap.core.Tween | null = null;
    const darken = darkenRef.current;
    if (darken && isMobile) {
      darkenTween = gsap.fromTo(
        darken,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=70%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    /**
     * Warmup do vídeo independente das ScrollTriggers — só pra destravar
     * o seek via currentTime em iOS Safari (play() + pause() + reset).
     */
    let warmedUp = false;
    const warmup = async () => {
      if (warmedUp) return;
      warmedUp = true;
      try {
        if (video.paused) await video.play();
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        video.pause();
      } catch {
        /* autoplay bloqueado — segue mesmo assim */
      }
      // sincroniza com o scroll atual (não zera): se recarregou depois da
      // hero, fixa o último frame em vez do primeiro.
      setFrame(scrubTrigger.progress);
    };

    // assim que a duração é conhecida, já sincroniza o frame com o scroll
    const onMeta = () => setFrame(scrubTrigger.progress);
    video.addEventListener("loadedmetadata", onMeta);

    if (video.readyState >= 2) {
      warmup();
    } else {
      video.addEventListener("loadeddata", warmup, { once: true });
      // fallback iOS: se loadeddata demorar muito, tenta o warmup mesmo assim
      // (play() força o load em iOS)
      window.setTimeout(warmup, 1500);
    }

    return () => {
      video.removeEventListener("loadeddata", warmup);
      video.removeEventListener("loadedmetadata", onMeta);
      scrubTrigger.kill();
      fadeTrigger?.kill();
      darkenTween?.scrollTrigger?.kill();
      darkenTween?.kill();
    };
  }, [mounted, isMobile]);

  // cursor text — só pointer:fine (mouse)
  useEffect(() => {
    const el = cursorRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    el.style.display = "block";

    const onMove = (e: PointerEvent) => {
      gsap.to(el, {
        x: e.clientX + 16,
        y: e.clientY,
        duration: 0.15,
        ease: "power3.out",
      });
    };
    window.addEventListener("pointermove", onMove);

    const chars = el.querySelectorAll("span");
    const tween = gsap.to(chars, {
      opacity: 0,
      stagger: 0.04,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const cursorText = "Scrolle para se lapidar";

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="relative w-full"
      style={{ height: "450vh" }}
    >
      {/* sticky container — CSS nativo, sem pin GSAP */}
      <div className="hero-sticky sticky top-0 h-screen w-full overflow-hidden">
        {/* fallback gradient PERMANENTE */}
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 40%, #1e5c3d, #0b1f17 70%, #050d09 100%)",
          }}
        />

        {/* vídeo visível — só renderiza após detectar viewport pra escolher arquivo certo */}
        {mounted && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            src={isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP}
            key={isMobile ? "m" : "d"}
            className="absolute inset-0 z-[1] block h-full w-full object-cover"
            style={{ backgroundColor: "#050d09" }}
            muted
            playsInline
            preload="auto"
            autoPlay
            aria-hidden
            {...({ "webkit-playsinline": "" } as Record<string, string>)}
          />
        )}

        {/* mobile: escurece o fundo pra leitura da headline; some no scroll
            (mesma janela do fade do conteúdo) devolvendo destaque ao vídeo */}
        <div
          ref={darkenRef}
          aria-hidden
          className="absolute inset-0 z-[2] md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        />

        {/* conteúdo */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-[3] flex flex-col items-start justify-center px-6 text-left md:px-16 lg:px-24"
        >
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.4em] text-cream/70">
            somos lapduz
          </p>

          <h1 className="font-display text-[clamp(2.4rem,7vw,5.5rem)] font-light leading-[1.05] text-cream">
            <span className="block">Faturamento real</span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <span>com</span>
              <RotatingWord word={ROTATING[idx]} />
            </span>
          </h1>

          <a href="#trabalhe" className="cta-pill mt-10">
            <span>Aumentar faturamento</span>
            <span className="cta-icon" aria-hidden>
              →
            </span>
          </a>

          <div className="absolute bottom-10 left-6 text-[11px] font-medium uppercase tracking-[0.4em] text-cream/50 md:left-16 lg:left-24">
            ↓ scroll
          </div>
        </div>
      </div>

      {/* cursor text — habilitado via JS só em pointer:fine */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] hidden whitespace-pre text-[15px] font-medium text-white"
        style={{
          mixBlendMode: "difference",
          transform: "translate(10px, -50%)",
        }}
      >
        {cursorText.split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </section>
  );
}

/** Palavra rotativa com width adaptativa */
function RotatingWord({ word }: { word: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-fawn">
      <span aria-hidden className="invisible">
        {word}
      </span>
      <span
        key={word}
        className="absolute left-0 top-0 whitespace-nowrap"
        style={{
          animation: "rotateWordIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {word}
      </span>
      <style jsx>{`
        @keyframes rotateWordIn {
          0% {
            opacity: 0;
            transform: translateY(40%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </span>
  );
}
