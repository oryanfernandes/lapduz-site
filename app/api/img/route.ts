import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy de imagens — resolve CORS pra assets de domínios externos (ex: WP do
 * Lapduz que não envia Access-Control-Allow-Origin).
 *
 * Uso: <img src={`/api/img?url=${encodeURIComponent("https://...")}`} />
 *
 * Só permite hosts da allowlist para evitar abuso (SSRF).
 */
const ALLOWED_HOSTS = new Set([
  "lapduz.com",
  "www.lapduz.com",
]);

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      // Revalida na origem semanalmente; o CDN do Next/Vercel pode cachear.
      next: { revalidate: 60 * 60 * 24 * 7 },
      headers: { "User-Agent": "Mozilla/5.0 lapduz-proxy" },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: upstream.status }
      );
    }
    const buf = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("[/api/img] erro", e);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
