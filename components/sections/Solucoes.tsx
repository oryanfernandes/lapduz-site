"use client";

import { useEffect, useRef } from "react";
import { useGsap, gsap } from "@/lib/useGsap";

type Corner = "bl" | "br" | "bc";
type Align = "left" | "center" | "right";

type Solution = {
  key: string;
  title: string;
  bg: string;
  /** elemento por cima do fundo; opcional (soluções só-fundo não têm) */
  el?: string;
  /** origem da entrada do elemento (a saída é o inverso); só com `el` */
  enter?: { x?: string; y?: string };
  align: Align; // alinhamento do título grande
  corner: Corner; // canto do descritivo
  /** desenha a linha-gráfico (trim path em loop) atrás do título; só Tráfego */
  line?: boolean;
  desc: JSX.Element;
};

// Path do "gráfico" do Tráfego — sobe e desce de ponta a ponta (0→1200).
// pathLength=100 normaliza o comprimento pro tracinho percorrer via CSS.
const GRAPH_D =
  "M0,210 L90,150 L180,182 L270,96 L360,140 L450,72 L540,158 L630,108 L720,196 L810,80 L900,150 L990,64 L1080,168 L1170,118 L1200,150";

const SOLUTIONS: Solution[] = [
  {
    key: "branding",
    title: "Branding",
    bg: "/solucoes/fundo-branding.png",
    el: "/solucoes/branding.png",
    enter: { x: "12%" }, // direita -> esquerda
    align: "left",
    corner: "bl",
    desc: (
      <>
        Construir a <strong>identidade de uma marca</strong>: seu{" "}
        <strong>propósito</strong>, <strong>voz</strong> e{" "}
        <strong>percepção</strong>. O que faz ser{" "}
        <strong>reconhecida</strong>, <strong>lembrada</strong> e{" "}
        <strong>desejada</strong>.
      </>
    ),
  },
  {
    key: "audiovisual",
    title: "Audiovisual",
    bg: "/solucoes/fundo-audiovisual.jpg",
    el: "/solucoes/audiovisual.png",
    enter: { y: "12%" }, // baixo -> cima
    align: "right",
    corner: "br",
    desc: (
      <>
        Conteúdo <strong>premium</strong>, <strong>estratégico</strong> e feito
        para gerar <strong>impacto real</strong>.
      </>
    ),
  },
  {
    key: "treinamento",
    title: "Treinamento Comercial",
    bg: "/solucoes/fundo-treinamento.png",
    el: "/solucoes/treinamento.png",
    enter: { x: "12%" }, // igual ao branding
    align: "center",
    corner: "bl",
    desc: (
      <>
        Eleva a performance da equipe:{" "}
        <strong>Habilidade de vendas de alto valor agregado</strong>,{" "}
        <strong>funis</strong>, <strong>comunicação</strong> e{" "}
        <strong>negociação</strong>.
      </>
    ),
  },
  {
    key: "salespage",
    title: "Sales Page",
    bg: "/solucoes/salespage-fundo.png",
    el: "/solucoes/salespage.png",
    enter: { x: "12%" }, // direita -> esquerda
    align: "right",
    corner: "br",
    desc: (
      <>
        Páginas <strong>interativas</strong>, <strong>premium</strong> e focadas
        em <strong>conversão</strong> e elevar o{" "}
        <strong>valor da sua marca</strong>.
      </>
    ),
  },
  {
    key: "trafego",
    title: "Tráfego",
    bg: "/solucoes/fundo-trafego.jpg",
    // só-fundo (sem elemento por cima) + linha-gráfico animada atrás do título
    line: true,
    align: "center",
    corner: "bc",
    // RASCUNHO — revisar/substituir pelo texto final do Tráfego
    desc: (
      <>
        Campanhas de <strong>mídia paga</strong> que levam a marca às{" "}
        <strong>pessoas certas</strong>. <strong>Alcance</strong>,{" "}
        <strong>leads</strong> e <strong>vendas</strong> com{" "}
        <strong>previsibilidade</strong>.
      </>
    ),
  },
  {
    key: "crm",
    title: "CRM",
    bg: "/solucoes/crmfundo.png",
    el: "/solucoes/crm.png",
    enter: { y: "12%" }, // baixo -> cima
    align: "center",
    corner: "bc",
    // RASCUNHO — revisar/substituir pelo texto final do CRM
    desc: (
      <>
        Gestão de relacionamento que transforma <strong>contatos</strong> em{" "}
        <strong>clientes</strong>. <strong>Organização</strong>,{" "}
        <strong>automação</strong> e <strong>follow-up</strong> que aumentam suas{" "}
        <strong>vendas</strong>.
      </>
    ),
  },
];

const ALIGN: Record<Align, { justify: string; text: string }> = {
  left: { justify: "justify-start", text: "text-left" },
  center: { justify: "justify-center", text: "text-center" },
  right: { justify: "justify-end", text: "text-right" },
};

// Tempo (em "unidades" de timeline) de cada fase. As transições são
// ENCADEADAS (sem sobreposição): a próxima só entra depois que a anterior sai.
const ENTER = 1; // duração da entrada
const EXIT = 1; // duração da saída
const HOLD = 1; // respiro parado, totalmente visível
const GAP = 0.3; // respiro entre "anterior sumiu" e "próxima entra"
const SPREAD = 22; // px de "tracking" inicial por letra, por distância do centro
// translateZ inicial do título "Soluções". Maior que a perspective (900px do
// .sol-intro) → começa ATRÁS da câmera (invisível) e atravessa o plano vindo
// pra frente, dando a sensação de passar pela câmera antes de assentar.
const INTRO_Z = 1100;

export default function Solucoes() {
  const ref = useRef<HTMLDivElement>(null);

  // ---- timeline pinada controlada por scroll ----
  useGsap(ref, () => {
    const root = ref.current;
    if (!root) return;
    const pinEl = root.querySelector<HTMLElement>(".sol-pin");
    const slides = gsap.utils.toArray<HTMLElement>(".sol-slide", root);
    const introChars = gsap.utils.toArray<HTMLElement>(".intro-char", root);
    if (!pinEl || !slides.length) return;

    const layers = slides.map((slide) => ({
      bg: slide.querySelector<HTMLElement>(".sol-bg"),
      el: slide.querySelector<HTMLElement>(".sol-el"),
      desc: slide.querySelector<HTMLElement>(".sol-desc"),
      line: slide.querySelector<HTMLElement>(".sol-line"),
      chars: gsap.utils.toArray<HTMLElement>(".char", slide),
    }));

    const isMobile = window.innerWidth < 768;
    const origin = (i: number) => {
      const s = SOLUTIONS[i];
      // mobile: a Sales Page entra DE BAIXO PRA CIMA (workaround do corte
      // lateral do shake em X). A saída é o inverso (volta pra baixo).
      if (isMobile && s.key === "salespage") return { x: 0, y: "12%" };
      return { x: s.enter?.x ?? 0, y: s.enter?.y ?? 0 };
    };
    // x de cada letra = distância (com sinal) do centro da palavra (tracking)
    const charX = (chars: HTMLElement[]) => {
      const center = (chars.length - 1) / 2;
      return (idx: number) => (idx - center) * SPREAD;
    };

    // estado inicial: só o fundo do branding visível; títulos/elementos zerados.
    layers.forEach((L, i) => {
      gsap.set(L.bg, { opacity: i === 0 ? 1 : 0 });
      gsap.set(L.desc, { opacity: 0 });
      gsap.set(L.chars, { opacity: 0 });
      if (L.el) gsap.set(L.el, { opacity: 0, ...origin(i) });
      if (L.line) gsap.set(L.line, { opacity: 0 });
    });
    gsap.set(introChars, { z: INTRO_Z }); // entra pelo zoom 3D via ST própria (antes do pin)

    // ENTRADA do "Soluções": zoom 3D (z alto -> 0) numa ScrollTrigger PRÓPRIA,
    // que começa ANTES do pin — assim o título já vem entrando enquanto a seção
    // ainda está chegando, em vez de só quando pina.
    gsap.fromTo(
      introChars,
      { z: INTRO_Z },
      {
        z: 0,
        ease: "power3.out",
        stagger: { each: 0.06, from: "start" },
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => "+=" + tl.duration() * window.innerHeight * 0.4,
        scrub: true,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1, // pré-engata o pin pra não "travar" ao chegar na seção
        invalidateOnRefresh: true,
      },
    });

    // ENTRADA de cada solução: fundo (crossfade) + título char-by-char (tracking
    // fecha do centro) + descritivo + elemento (desliza da origem ao centro)
    const enter = (i: number, t: number) => {
      const L = layers[i];
      if (i !== 0) tl.to(L.bg, { opacity: 1, duration: 1, ease: "none" }, t);
      tl.fromTo(
        L.chars,
        { opacity: 0, x: charX(L.chars) },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: { each: 0.05, from: "center" },
        },
        t
      );
      tl.to(L.desc, { opacity: 1, duration: 1, ease: "none" }, t);
      if (L.line) tl.to(L.line, { opacity: 1, duration: 1, ease: "none" }, t);
      if (L.el)
        tl.fromTo(
          L.el,
          { opacity: 0, ...origin(i) },
          { opacity: 1, x: 0, y: 0, duration: 1, ease: "power2.out" },
          t
        );
    };

    // SAÍDA = inverso: tracking reabre + tudo some; elemento volta pra origem
    const exit = (i: number, t: number) => {
      const L = layers[i];
      // NÃO some o fundo: o próximo fundo entra POR CIMA (z maior), evitando um
      // flash do verde entre as transições. Só o conteúdo (título/desc/el) sai.
      tl.to(
        L.chars,
        {
          opacity: 0,
          x: charX(L.chars),
          duration: 0.6,
          ease: "power3.in",
          stagger: { each: 0.05, from: "edges" },
        },
        t
      );
      tl.to(L.desc, { opacity: 0, duration: 1, ease: "none" }, t);
      if (L.line) tl.to(L.line, { opacity: 0, duration: 1, ease: "none" }, t);
      if (L.el)
        tl.to(L.el, { opacity: 0, ...origin(i), duration: 1, ease: "power2.in" }, t);
    };

    // SEQUÊNCIA encadeada (sem sobreposição): segura o intro, ele SAI por
    // completo, só então a 1ª solução ENTRA — e assim por diante.
    let t = HOLD; // segura o "Soluções" antes de sair

    // intro "Soluções" sai COM tracking (o z já foi resolvido pela ST pré-pin)
    tl.to(
      introChars,
      {
        opacity: 0,
        x: charX(introChars),
        duration: 0.6,
        ease: "power3.in",
        stagger: { each: 0.05, from: "edges" },
      },
      t
    );
    t += EXIT + GAP; // espera o intro sumir + respiro

    SOLUTIONS.forEach((_, i) => {
      enter(i, t);
      t += ENTER + HOLD; // entra e segura visível
      if (i < SOLUTIONS.length - 1) {
        exit(i, t);
        t += EXIT + GAP; // espera sair por completo + respiro antes da próxima
      }
    });
    // respiro final antes de soltar o pin
    tl.to({}, { duration: HOLD });
  });

  // ---- shake idle + mouse tracking com PARALLAX por profundidade ----
  // Um único valor de shake/mouse é aplicado a cada camada com um multiplicador
  // diferente: elemento (muito) > textos (médio) > fundo (pouco). Assim deixa
  // de parecer uma imagem chapada.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const bgs = gsap.utils.toArray<HTMLElement>(".sol-bg", root);
    const texts = gsap.utils.toArray<HTMLElement>(
      ".sol-title, .sol-desc, .sol-intro",
      root
    );
    const elWraps = gsap.utils.toArray<HTMLElement>(".sol-el-wrap", root);
    if (!elWraps.length) return;

    // mobile: shake horizontal quase nulo (o movimento em X é o que revela o
    // corte lateral das imagens). Y fica normal.
    const isMobile = window.innerWidth < 768;
    const SHAKE_X_MUL = isMobile ? 0.12 : 1;

    // profundidade (quanto cada camada acompanha o shake/mouse)
    const DEPTH = { bg: 0.18, text: 0.55, el: 1 };
    const proxy = { sx: 0, sy: 0, mx: 0, my: 0 };

    const setters = (els: HTMLElement[]) =>
      els.map((el) => ({
        x: gsap.quickSetter(el, "x", "px"),
        y: gsap.quickSetter(el, "y", "px"),
      }));
    const bgS = setters(bgs);
    const textS = setters(texts);
    const elS = setters(elWraps);

    let removeMove: (() => void) | undefined;
    let tick: (() => void) | undefined;

    const ctx = gsap.context(() => {
      // overscan no fundo (que se move e poderia revelar a borda)
      gsap.set(bgs, { scale: 1.06, transformOrigin: "center" });
      // overscan também nos elementos: eles se movem MAIS que o fundo
      // (DEPTH.el=1), então sem folga o shake revela a borda da imagem (corte
      // seco). A escala dá margem pra imagem cobrir o deslocamento.
      gsap.set(elWraps, { scale: 1.08, transformOrigin: "center" });

      // shake idle (amplitude-base; cada camada multiplica pela profundidade)
      gsap
        .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(proxy, { sx: 7, sy: -6, duration: 3 })
        .to(proxy, { sx: -6, sy: 7, duration: 3.2 })
        .to(proxy, { sx: 6, sy: 5, duration: 2.8 });

      // mouse (suavizado) — também amplitude-base
      const mxTo = gsap.quickTo(proxy, "mx", { duration: 1, ease: "power3" });
      const myTo = gsap.quickTo(proxy, "my", { duration: 1, ease: "power3" });
      const onMove = (e: MouseEvent) => {
        mxTo((e.clientX / window.innerWidth - 0.5) * 34);
        myTo((e.clientY / window.innerHeight - 0.5) * 26);
      };
      window.addEventListener("mousemove", onMove);
      removeMove = () => window.removeEventListener("mousemove", onMove);

      // aplica o offset-base a cada camada com seu multiplicador
      tick = () => {
        const bx = (proxy.sx + proxy.mx) * SHAKE_X_MUL;
        const by = proxy.sy + proxy.my;
        bgS.forEach((s) => (s.x(bx * DEPTH.bg), s.y(by * DEPTH.bg)));
        textS.forEach((s) => (s.x(bx * DEPTH.text), s.y(by * DEPTH.text)));
        elS.forEach((s) => (s.x(bx * DEPTH.el), s.y(by * DEPTH.el)));
      };
      gsap.ticker.add(tick);
    }, root);

    return () => {
      if (tick) gsap.ticker.remove(tick);
      removeMove?.();
      ctx.revert();
    };
  }, []);

  return (
    <section id="solucoes" ref={ref} data-theme="dark" className="relative">
      <div className="sol-pin relative h-screen w-full overflow-hidden bg-forest">
        <div className="sol-cam-outer absolute inset-0 will-change-transform">
          <div className="sol-cam-inner absolute inset-0 will-change-transform">
            {SOLUTIONS.map((s, i) => (
              <div
                key={s.key}
                className="sol-slide absolute inset-0"
                style={{ zIndex: i + 1 }}
              >
                {/* fundo (z0) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.bg}
                  alt=""
                  aria-hidden
                  draggable={false}
                  decoding="async"
                  className="sol-bg absolute inset-0 z-0 h-full w-full object-cover"
                />

                {/* linha-gráfico (trim path em loop) — acima do fundo (z0,
                    depois do bg no DOM) e abaixo do título (z1). Full-width de
                    ponta a ponta; no mobile mantém o tamanho e corta as laterais. */}
                {s.line && (
                  <div
                    aria-hidden
                    className="sol-line pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
                  >
                    <svg
                      className="block h-[38vh] w-full min-w-[1100px] md:min-w-0"
                      viewBox="0 0 1200 300"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      {/* trilho fraco (o "gráfico") */}
                      <path
                        d={GRAPH_D}
                        pathLength={100}
                        stroke="#ddb962"
                        strokeOpacity="0.18"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* tracinho que percorre o path em loop */}
                      <path
                        className="sol-line-dash"
                        d={GRAPH_D}
                        pathLength={100}
                        stroke="#f2da92"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}

                {/* título grande ao fundo (z1) — char by char */}
                <div
                  className={`sol-title pointer-events-none absolute inset-0 z-[1] flex items-center px-[6vw] ${
                    ALIGN[s.align].justify
                  }`}
                >
                  <h3
                    aria-label={s.title}
                    className={`font-display text-[16vw] font-light leading-none text-cream/90 md:text-[13vw] ${
                      ALIGN[s.align].text
                    }`}
                  >
                    {/* quebra só ENTRE palavras: cada palavra é um bloco nowrap
                        (as letras não quebram no meio); o espaço entre palavras
                        é o único ponto de quebra. As letras seguem .char p/ animar. */}
                    {s.title.split(" ").flatMap((word, wi, words) => {
                      const w = (
                        <span
                          key={`w${wi}`}
                          className="inline-block whitespace-nowrap"
                        >
                          {word.split("").map((ch, j) => (
                            <span
                              key={j}
                              aria-hidden
                              className="char inline-block"
                            >
                              {ch}
                            </span>
                          ))}
                        </span>
                      );
                      return wi < words.length - 1 ? [w, " "] : [w];
                    })}
                  </h3>
                </div>

                {/* elemento que passa por cima do título (z2). O wrapper recebe
                    o parallax; a <img> recebe a animação de entrada do scroll.
                    Soluções só-fundo (sem `el`) não renderizam esta camada. */}
                {s.el && (
                  <div className="sol-el-wrap pointer-events-none absolute inset-0 z-[2] will-change-transform">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.el}
                      alt={s.title}
                      draggable={false}
                      className="sol-el absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* descritivo no canto (z3) */}
                <div
                  className={`sol-desc absolute z-[3] max-w-[16rem] md:max-w-sm ${
                    s.corner === "bl"
                      ? "bottom-[9vh] left-[6vw] text-left"
                      : s.corner === "br"
                      ? "bottom-[9vh] right-[6vw] text-right"
                      : // bc: centralizado horizontal (mx-auto, sem transform) na
                        // mesma linha de baixo dos demais
                        "bottom-[9vh] left-0 right-0 mx-auto text-center"
                  }`}
                >
                  <p className="font-display text-sm font-medium leading-relaxed text-cream/85 md:text-base">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* INTRO da seção — só fundo + "Soluções" (z acima de tudo) */}
            <div
              className="sol-intro pointer-events-none absolute inset-0 z-[20] flex items-center justify-center px-[6vw]"
              style={{ perspective: "900px" }}
            >
              <h3
                aria-label="Soluções"
                className="whitespace-nowrap text-center font-display text-[16vw] font-light leading-none text-cream/90 md:text-[13vw]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {"Soluções".split("").map((ch, j) => (
                  <span
                    key={j}
                    aria-hidden
                    className="intro-char inline-block"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {ch}
                  </span>
                ))}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
