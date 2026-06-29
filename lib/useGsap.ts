"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Mobile: a barra de endereço aparecendo/sumindo dispara um "resize" que faz
  // o ScrollTrigger recalcular os pins e te jogar pra outra seção (pulos ao
  // scrollar, principalmente pra cima). Ignorar o resize mobile elimina isso.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Primeira visita: vídeo do hero / imagens pesadas terminam de carregar
  // DEPOIS que os ScrollTriggers já calcularam suas posições, deslocando as
  // seções de baixo. Isso deixa a intro das Soluções "presa" no estado inicial
  // (fundo verde, letras invisíveis) até algo forçar um recálculo. Um refresh
  // após o load realinha tudo.
  const refreshAll = () => ScrollTrigger.refresh();
  if (document.readyState === "complete") {
    requestAnimationFrame(refreshAll);
  } else {
    window.addEventListener("load", refreshAll, { once: true });
  }
}

/**
 * Hook utilitário: roda `cb` dentro de um `gsap.context` ligado a `scope`
 * e faz cleanup automaticamente (mata tweens + ScrollTriggers criados).
 *
 * Uso:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGsap(ref, () => {
 *     gsap.to(".alvo", { ... });
 *   });
 */
export function useGsap(
  scope: React.RefObject<HTMLElement | null>,
  cb: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(cb, scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Roda um efeito apenas no client após mount. Evita SSR mismatch. */
export function useClientEffect(
  cb: () => void | (() => void),
  deps: React.DependencyList = []
) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return cb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger };
