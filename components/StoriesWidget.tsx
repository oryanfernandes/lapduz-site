"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Widget que imita a interface de Stories do Instagram.
 * - Barras de progresso segmentadas (uma por vídeo) que enchem com o tempo.
 * - Avatar + @username no topo: clicar abre o perfil em outra aba.
 * - Clicar na ÁREA DO STORY (vídeo) pula pro próximo; no último, volta pro 1º.
 * - Os vídeos avançam sozinhos ao terminar (loop infinito).
 * - Botãozinho de som (canto sup. direito) liga/desliga o áudio sem interferir
 *   nos outros cliques. Começa mudo (exigência de autoplay dos navegadores).
 */

const STORIES = [
  "/stories/novo-marketing.mp4",
  "/stories/acelera-conexoes.mp4",
  "/stories/clax.mp4",
  "/stories/lilian-glow.mp4",
];
const PROFILE_URL = "https://www.instagram.com/lapduz_/";
const AVATAR = "/logos/Avatar.png";
const USERNAME = "lapduz_";

export default function StoriesWidget({
  className = "",
}: {
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 do story atual
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ao trocar de story: reseta a barra e garante o play do novo vídeo
  useEffect(() => {
    setProgress(0);
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, [current]);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % STORIES.length),
    []
  );

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress(v.currentTime / v.duration);
  };

  const openProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(PROFILE_URL, "_blank", "noopener,noreferrer");
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((m) => !m);
  };

  return (
    <div
      className={`relative aspect-[9/16] w-full select-none overflow-hidden rounded-[24px] bg-black ${className}`}
    >
      {/* vídeo do story atual (key força recarregar/tocar ao trocar) */}
      <video
        key={STORIES[current]}
        ref={videoRef}
        src={STORIES[current]}
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onEnded={next}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* área de clique pra PULAR (cobre tudo; header fica por cima em z) */}
      <button
        type="button"
        aria-label="Próximo story"
        onClick={next}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
      />

      {/* gradiente no topo pra dar legibilidade às barras/header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/55 to-transparent" />

      {/* barras de progresso segmentadas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex gap-1 px-3 pt-3">
        {STORIES.map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"
          >
            <div
              className="h-full rounded-full bg-white"
              style={{
                width:
                  i < current
                    ? "100%"
                    : i === current
                    ? `${progress * 100}%`
                    : "0%",
                transition: i === current ? "width 0.1s linear" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* header: avatar + @username (abre o perfil) + botão de som */}
      <div className="absolute inset-x-0 top-0 z-40 flex items-center gap-2 px-3 pt-6">
        <button
          type="button"
          onClick={openProfile}
          aria-label={`Abrir o perfil @${USERNAME} no Instagram`}
          className="flex items-center gap-2 rounded-full pr-2 transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AVATAR}
            alt={USERNAME}
            draggable={false}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/80"
          />
          <span className="text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {USERNAME}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Ativar som" : "Desativar som"}
          className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.25-3.9v2.02l2.18 2.18c.04-.1.07-.2.07-.3zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.94 8.94 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
