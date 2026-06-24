"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Preloader — overlay creme com a animação Lottie carregando.
 * Substitui o logo estático anterior pelo loop animado.
 */
export default function Preloader() {
  const [hide, setHide] = useState(false);
  const [remove, setRemove] = useState(false);
  const lottieMountRef = useRef<HTMLDivElement>(null);

  // Carrega Lottie via dynamic import (não vai pro bundle inicial)
  useEffect(() => {
    let cancelled = false;
    let anim: { destroy: () => void } | null = null;

    const init = async () => {
      const mount = lottieMountRef.current;
      if (!mount) return;
      try {
        const mod = await import("lottie-web");
        const lottie = (mod.default ?? mod) as {
          loadAnimation: (opts: object) => { destroy: () => void };
        };
        if (cancelled) return;
        anim = lottie.loadAnimation({
          container: mount,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/preload.json",
        });
      } catch (e) {
        console.warn("[Preloader] Lottie não carregou", e);
      }
    };
    init();
    return () => {
      cancelled = true;
      try {
        anim?.destroy();
      } catch {
        /* */
      }
    };
  }, []);

  useEffect(() => {
    const lock = () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };
    const unlock = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
    lock();

    const minTime = window.setTimeout(() => setHide(true), 900);
    const unlockTime = window.setTimeout(unlock, 1500);
    const removeTime = window.setTimeout(() => setRemove(true), 1800);

    return () => {
      clearTimeout(minTime);
      clearTimeout(unlockTime);
      clearTimeout(removeTime);
      unlock();
    };
  }, []);

  if (remove) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-cream transition-opacity duration-700 ${
        hide ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={lottieMountRef}
        className={`h-40 w-40 transition-all duration-700 ${
          hide ? "scale-50 opacity-0" : "scale-100 opacity-100"
        }`}
      />
    </div>
  );
}
