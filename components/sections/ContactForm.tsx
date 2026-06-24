"use client";

import { useRef, useState } from "react";
import { useGsap, gsap } from "@/lib/useGsap";

type State = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState<string | null>(null);

  useGsap(ref, () => {
    if (!ref.current) return;
    const elements = ref.current.querySelectorAll(".reveal-up");
    gsap.from(elements, {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 75%",
      },
    });
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      nome: fd.get("nome"),
      empresa: fd.get("empresa"),
      telefone: fd.get("telefone"),
      email: fd.get("email"),
      origem: "lapduz.com (form Trabalhe conosco)",
      enviado_em: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState("success");
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(e?.message ?? "Erro desconhecido");
      setState("error");
    }
  }

  return (
    <section
      id="trabalhe"
      ref={ref}
      data-theme="light"
      className="relative bg-bone py-32"
    >
      <div className="mx-auto grid max-w-page items-center gap-12 px-6 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="reveal-up text-xs uppercase tracking-[0.4em] text-fawn">
            Trabalhe com a gente
          </p>
          <h2 className="reveal-up mt-4 font-display text-4xl font-light leading-tight text-forest md:text-5xl">
            Sua empresa é um <em className="font-light not-italic text-fawn">diamante bruto</em> esperando para ser lapidado?
          </h2>
          <p className="reveal-up mt-6 max-w-md font-display text-base font-medium leading-relaxed text-forest/75 md:text-lg">
            Conte sobre sua marca. Respondemos no mesmo dia útil com os próximos
            passos.
          </p>

          <ul className="reveal-up mt-8 space-y-3 text-sm text-forest/70">
            <li>✓ Diagnóstico estratégico gratuito</li>
            <li>✓ Plano sob medida em até 7 dias</li>
            <li>✓ Equipe sênior dedicada</li>
          </ul>
        </div>

        <form
          id="contato"
          onSubmit={onSubmit}
          className="reveal-up grid gap-4 rounded-3xl border border-forest/10 bg-white/70 p-8 shadow-xl backdrop-blur md:p-10"
        >
          <Field label="Nome" name="nome" required autoComplete="name" />
          <Field label="Empresa" name="empresa" required autoComplete="organization" />
          <Field
            label="Número"
            name="telefone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="(00) 00000-0000"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@empresa.com"
          />

          <button
            type="submit"
            disabled={state === "loading"}
            className="cta-pill mt-2 justify-center disabled:opacity-60"
          >
            <span>
              {state === "loading"
                ? "Enviando…"
                : state === "success"
                ? "Enviado! ✓"
                : "Enviar"}
            </span>
            <span className="cta-icon" aria-hidden>
              →
            </span>
          </button>

          {state === "success" && (
            <p className="text-sm text-teal">
              Recebemos sua mensagem. Em breve um humano entra em contato.
            </p>
          )}
          {state === "error" && (
            <p className="text-sm text-red-600">
              Tivemos um problema enviando. {err}
            </p>
          )}
          <p className="text-xs text-forest/50">
            Ao enviar, você concorda em ser contatado por nossa equipe. Não
            enviamos spam.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-forest/70">
        {label}
      </span>
      <input
        name={name}
        type={type}
        className="w-full rounded-xl border border-forest/15 bg-white/80 px-4 py-3 text-sm text-forest placeholder:text-forest/30 focus:border-fawn focus:outline-none focus:ring-2 focus:ring-fawn/30"
        {...rest}
      />
    </label>
  );
}
