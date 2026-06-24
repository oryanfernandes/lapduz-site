"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll global com Lenis e ponte com GSAP ScrollTrigger.
 * Renderizar uma vez no layout.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Evita refreshes em loop quando a barra de URL do iOS some/aparece
    ScrollTrigger.config({ ignoreMobileResize: true });

    // No mobile/touch, o scroll nativo já é suave e Lenis introduz jitter
    // em scrolls rápidos. Só ativa em telas desktop.
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // expõe globalmente pra links do menu usarem lenis.scrollTo
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    function update(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
