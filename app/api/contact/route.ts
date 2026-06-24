import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint do formulário "Trabalhe conosco".
 * Faz POST do JSON recebido para CONTACT_WEBHOOK_URL (Zapier, Make, n8n etc).
 *
 * Configure CONTACT_WEBHOOK_URL em .env.local. Sem essa env, o endpoint
 * apenas registra no console e retorna sucesso — útil em dev.
 */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 }
    );
  }

  // Validação mínima
  const data = payload as Record<string, unknown>;
  const required = ["nome", "email"] as const;
  for (const key of required) {
    if (!data[key] || String(data[key]).trim() === "") {
      return NextResponse.json(
        { ok: false, error: `Campo obrigatório ausente: ${key}` },
        { status: 422 }
      );
    }
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    // Placeholder dev — só loga e devolve 200
    console.log("[contact] CONTACT_WEBHOOK_URL não configurado.", payload);
    return NextResponse.json({
      ok: true,
      delivered: false,
      note: "Configure CONTACT_WEBHOOK_URL para entregar o lead.",
    });
  }

  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error("[contact] webhook respondeu", r.status, body);
      return NextResponse.json(
        { ok: false, error: `Webhook retornou ${r.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (e) {
    console.error("[contact] erro de rede ao chamar webhook", e);
    return NextResponse.json(
      { ok: false, error: "Falha ao chamar webhook" },
      { status: 502 }
    );
  }
}
