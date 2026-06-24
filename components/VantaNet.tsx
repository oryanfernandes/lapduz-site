"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Background Vanta.NET (rede de pontos/linhas).
 * Mesmo padrão do VantaFog: carrega o build sob demanda e injeta THREE no
 * escopo global (vanta espera window.THREE).
 *
 * Dica de uso pra deixar a rede "esmaecida": passe `backgroundAlpha={0}` (o
 * canvas fica transparente, revelando o fundo da própria seção) e envolva o
 * componente num container com `opacity-[0.2]` — assim só as linhas/pontos
 * ficam a ~20%, sem mexer na cor de fundo da seção.
 */
type Props = {
  color?: number;
  backgroundColor?: number;
  /** 0 = canvas transparente (deixa o fundo da seção aparecer) */
  backgroundAlpha?: number;
  points?: number;
  maxDistance?: number;
  spacing?: number;
  showDots?: boolean;
  /** quanto menor, mais lenta a animação */
  speed?: number;
  className?: string;
};

export default function VantaNet({
  color = 0x7cc59a,
  backgroundColor = 0x081512,
  backgroundAlpha = 0,
  points = 9,
  maxDistance = 22,
  spacing = 18,
  showDots = true,
  speed = 0.6,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: any = null;
    let cancelled = false;

    const init = async () => {
      if (typeof window !== "undefined") {
        (window as any).THREE = THREE;
      }
      const mod = await import("vanta/dist/vanta.net.min");
      if (cancelled || !ref.current) return;
      const NET = (mod as any).default ?? (mod as any);
      effect = NET({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color,
        backgroundColor,
        backgroundAlpha,
        points,
        maxDistance,
        spacing,
        showDots,
        speed,
      });
    };

    init().catch((e) => console.warn("[VantaNet] falhou", e));

    return () => {
      cancelled = true;
      if (effect) {
        try {
          effect.destroy();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 -z-10"}
    />
  );
}
