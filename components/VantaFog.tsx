"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Background Vanta.FOG.
 * Carrega vanta.fog.min sob demanda (dynamic import) e injeta THREE no escopo
 * (vanta espera window.THREE — então setamos manualmente antes de chamar).
 */
type Props = {
  /** Cores da névoa */
  highlightColor?: number;
  midtoneColor?: number;
  lowlightColor?: number;
  baseColor?: number;
  blurFactor?: number;
  speed?: number;
  zoom?: number;
  /** Estilo do container que fica no fundo absoluto */
  className?: string;
};

export default function VantaFog({
  highlightColor = 0xf2da92,
  midtoneColor = 0xe6c97a,
  lowlightColor = 0xa88b4a,
  baseColor = 0xffffff,
  blurFactor = 0.7,
  speed = 1.2,
  zoom = 1.0,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: any = null;
    let cancelled = false;

    const init = async () => {
      // Vanta espera THREE como global
      if (typeof window !== "undefined") {
        (window as any).THREE = THREE;
      }
      // dynamic import — não vai pro bundle inicial
      const mod = await import("vanta/dist/vanta.fog.min");
      if (cancelled || !ref.current) return;
      const FOG = (mod as any).default ?? (mod as any);
      effect = FOG({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        highlightColor,
        midtoneColor,
        lowlightColor,
        baseColor,
        blurFactor,
        speed,
        zoom,
      });
    };

    init().catch((e) => console.warn("[VantaFog] falhou", e));

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
