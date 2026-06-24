# Lapduz — site institucional

Refeito do zero em **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, substituindo a versão WordPress/Elementor de `https://lapduz.com/remake-2`.

## Stack

- **Next.js 14** (App Router, React Server Components onde possível)
- **TypeScript** (strict)
- **Tailwind CSS** com tema customizado (cores e tipografia da marca)
- **GSAP 3.12 + ScrollTrigger** — todas as animações de scroll
- **Lenis** — smooth scroll global, integrado ao ticker do GSAP
- **three.js 0.160** — esfera 3D de logos dos clientes (vanilla, sem r3f)
- **Neue Haas Display** — fonte da marca, servida como `@font-face` local

## Como rodar

```bash
npm install
cp .env.example .env.local        # edite CONTACT_WEBHOOK_URL se quiser
npm run dev
```

Acesse `http://localhost:3000`.

Build de produção:

```bash
npm run build
npm start
```

## Configuração do formulário

A rota `app/api/contact/route.ts` recebe o POST do formulário e repassa para `CONTACT_WEBHOOK_URL`. Sem essa env configurada, ela apenas loga no servidor e retorna sucesso (útil para dev).

Exemplos de webhook que funcionam imediatamente: Zapier, Make/Integromat, n8n, Pipedream, ou qualquer endpoint próprio que aceite JSON.

## Estrutura

```
app/
  layout.tsx              -- raiz, importa Preloader, SmoothScroll e Header
  page.tsx                -- monta as seções na ordem
  globals.css             -- @font-face Neue Haas + utilitários (Lenis, char-reveal, cta-pill)
  api/contact/route.ts    -- webhook do formulário
components/
  Header.tsx              -- navegação pill flutuante que some após 500vh
  Preloader.tsx           -- overlay creme com logo (substitui Lottie do original)
  SmoothScroll.tsx        -- Lenis ↔ GSAP bridge
  sections/
    Hero.tsx              -- headline rotativo + CTA
    VideoScroll.tsx       -- canvas com vídeo scrubbed por scroll (450vh, pin)
    Pillars.tsx           -- 4 colunas com reveal de texto char-by-char
    FrameCanvas.tsx       -- 179 PNGs do diamante (300vh sticky)
    Frases.tsx            -- 3 frases com parallax de diamantes (300vh)
    StackCards.tsx        -- 6 soluções empilhadas com rotação random
    LogoSphere.tsx        -- esfera 3D de logos com drag/hover/click
    ClientsAndReviews.tsx -- "Os grandes são Lapduz" + carrossel de reviews
    Legacy.tsx             -- timeline horizontal pinada
    ContactForm.tsx        -- form Trabalhe Conosco
    Footer.tsx             -- footer + rolar pra cima
lib/
  useGsap.ts              -- hook utilitário com gsap.context (cleanup auto)
public/
  fonts/                  -- Neue Haas Display .ttf
  logos/                  -- logos da marca PNG
```

## Notas de paridade com o original

- O original carrega assets pesados de outros domínios (vídeo do hero, 179 PNGs do diamante, logos dos clientes). Esses URLs são reaproveitados — basta migrá-los para um CDN próprio quando quiser parar de depender do WP antigo.
- A Lottie comparativa (`Lottiecomparativos7.json`) foi omitida nesta versão; o efeito do diamante já existe via FrameCanvas. Pode ser adicionada via `lottie-web` ou `@lottiefiles/dotlottie-react` se necessário.
- Vanta.js foi substituído por um gradient radial em CSS — mesmo visual sem o overhead de mais um runtime WebGL.

## Performance

- Imagens fora do `next/image` (URLs externas do WP) usam `loading="lazy"` por padrão.
- Sequência de frames PNG é pré-carregada em paralelo antes do ScrollTrigger iniciar.
- three.js renderiza só quando o canvas está no viewport (IntersectionObserver).
- Fontes locais com `font-display: swap`.
