/**
 * Composição "Sales Page" (showcase LUMIVIE): vários elementos PNG posicionados
 * em cima do fundo, cada um como uma camada flutuante independente.
 *
 * - `style` (em %) posiciona cada elemento dentro da caixa de aspecto fixo.
 *   AJUSTE FINO: mexa nos números de top/left/right/bottom/width.
 * - `depth` controla quanto o elemento acompanha o shake (parallax floating):
 *   maior = flutua mais. O fundo flutua pouco; rótulos/botões flutuam mais.
 * - A animação de entrada (cada elemento aparecendo separadamente) e o shake
 *   são aplicados pelo Solucoes via as classes .sales-float-wrap / .sales-float.
 */

type SalesEl = {
  key: string;
  src: string;
  style: React.CSSProperties; // top/left/right/bottom/width em %
  depth: number;
};

export const SALES_ELEMENTS: SalesEl[] = [
  { key: "fundo",      src: "/solucoes/salespage/fundo.png",        style: { top: "0%",   left: "0%",  width: "100%" }, depth: 0.25 },
  { key: "logo",       src: "/solucoes/salespage/logo.png",         style: { top: "5%",   left: "10%", width: "80%"  }, depth: 0.55 },
  { key: "cirurgia",   src: "/solucoes/salespage/cirurgia.png",     style: { top: "4.5%", left: "6%",  width: "19%"  }, depth: 1.0  },
  { key: "saopaulo",   src: "/solucoes/salespage/saopaulo.png",     style: { top: "4.5%", right: "6%", width: "13%"  }, depth: 1.0  },
  { key: "resultados", src: "/solucoes/salespage/resultados.png",   style: { top: "46%",  right: "4%", width: "18%"  }, depth: 1.2  },
  { key: "headline",   src: "/solucoes/salespage/headline.png",     style: { top: "58%",  left: "6%",  width: "72%"  }, depth: 0.75 },
  { key: "btnA",       src: "/solucoes/salespage/btn-agendar.png",  style: { bottom: "1%", left: "5%",  width: "42%" }, depth: 1.4  },
  { key: "btnC",       src: "/solucoes/salespage/btn-conhecer.png", style: { bottom: "1%", left: "51%", width: "42%" }, depth: 1.4  },
];

/** Caixa da composição (aspecto fixo, centralizada). */
export default function SalesComposition() {
  return (
    <div className="sales-comp relative aspect-[785/1040] w-[min(76vw,50vh)] md:w-[min(94vw,65vh)]">
      {SALES_ELEMENTS.map((el) => (
        <div
          key={el.key}
          data-depth={el.depth}
          className="sales-float-wrap pointer-events-none absolute will-change-transform"
          style={el.style}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={el.src}
            alt=""
            aria-hidden
            draggable={false}
            className="sales-float block h-auto w-full"
          />
        </div>
      ))}
    </div>
  );
}
