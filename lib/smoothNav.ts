/**
 * Navegação suave compartilhada por Header e Footer.
 *
 * - `#home`           → sempre volta pro topo
 * - `#solucoes`       → entra 60vh dentro do pin pra mostrar os cards
 * - qualquer outro `#id` → scroll até o topo da section
 *
 * Usa Lenis (window.__lenis) quando disponível (desktop); fallback nativo
 * window.scrollTo no mobile.
 */
type LenisLike = {
  scrollTo: (target: number | string | HTMLElement, opts?: object) => void;
};

function getLenis(): LenisLike | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { __lenis?: LenisLike }).__lenis ?? null;
}

function scrollToY(top: number) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.2 });
  } else {
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export function smoothNav(href: string) {
  if (href === "#home" || href === "#" || href === "#top") {
    scrollToY(0);
    return;
  }
  const target = document.querySelector(href) as HTMLElement | null;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  let top = rect.top + window.scrollY;

  // Para Soluções: entra 60vh dentro do pin pra mostrar os cards já visíveis
  if (href === "#solucoes") {
    top += window.innerHeight * 0.6;
  }
  // Para Sobre (pilares): pula um pouco abaixo do topo pra cair direto no 1º pilar
  if (href === "#sobre") {
    top += window.innerHeight * 0.1;
  }

  scrollToY(top);
}
