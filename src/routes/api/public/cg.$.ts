import { createFileRoute } from "@tanstack/react-router";
import { CLOUD_RELAY_PREFIX, isRelayHost, relayShim, rewriteRelayText, upstreamFromRelay } from "@/lib/games/cloud-relay";

/**
 * Relay for big browser game ports (same approach as the GTA V relay): serves each catalog game from
 * Astra's domain as a top-level page with cross-origin isolation, passing Range requests through so
 * large game folders download in parallel. Public on purpose: only fixed public catalog hosts.
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const PASS = ["content-type", "content-range", "accept-ranges", "cache-control", "etag", "last-modified", "content-disposition"];
const ISOLATION = {
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-embedder-policy": "credentialless",
  "cross-origin-resource-policy": "cross-origin",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
  "access-control-allow-headers": "Range, Content-Type",
  "access-control-expose-headers": "Content-Range, Content-Length, Accept-Ranges",
};

const relayBase = (u: URL) => `${CLOUD_RELAY_PREFIX}/${u.protocol.slice(0, -1)}/${u.host}`;

async function relay(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: ISOLATION });
  const url = new URL(request.url);
  const target = upstreamFromRelay(url.pathname, url.search);
  if (!target) return new Response("Not found", { status: 404, headers: ISOLATION });

  const fwd: Record<string, string> = { "user-agent": UA };
  for (const h of ["range", "if-none-match", "if-modified-since", "content-type", "accept"]) { const v = request.headers.get(h); if (v) fwd[h] = v; }
  const hasBody = request.method === "POST";
  let upstream: Response;
  try {
    upstream = await fetch(target, { method: request.method === "HEAD" ? "HEAD" : hasBody ? "POST" : "GET", headers: fwd, body: hasBody ? await request.arrayBuffer() : null, redirect: "manual" });
  } catch {
    return new Response("Game server unreachable", { status: 502, headers: ISOLATION });
  }

  const headers = new Headers(ISOLATION);
  if (upstream.status >= 300 && upstream.status < 400) {
    const loc = upstream.headers.get("location");
    if (!loc) return new Response(null, { status: upstream.status, headers });
    const next = new URL(loc, target);
    headers.set("location", isRelayHost(next.hostname) ? `${relayBase(next)}${next.pathname}${next.search}` : next.href);
    return new Response(null, { status: upstream.status, headers });
  }
  for (const h of PASS) { const v = upstream.headers.get(h); if (v) headers.set(h, v); }
  const type = (upstream.headers.get("content-type") ?? "").toLowerCase();
  const kind = type.includes("text/html") ? "html" : type.includes("css") ? "css" : type.includes("javascript") ? "js" : null;
  if (kind && request.method !== "HEAD" && upstream.status === 200) {
    const base = relayBase(target);
    let body = rewriteRelayText(await upstream.text(), base, kind, target.host);
    if (kind === "html") {
      const shim = relayShim(base);
      body = /<head[^>]*>/i.test(body) ? body.replace(/<head[^>]*>/i, (m) => m + shim) : shim + body;
      headers.set("cache-control", "no-store");
    }
    return new Response(body, { status: 200, headers });
  }
  const len = upstream.headers.get("content-length");
  if (len && !upstream.headers.get("content-encoding")) headers.set("content-length", len);
  return new Response(request.method === "HEAD" ? null : upstream.body, { status: upstream.status, headers });
}

export const Route = createFileRoute("/api/public/cg/$")({
  server: {
    handlers: {
      GET: ({ request }) => relay(request),
      HEAD: ({ request }) => relay(request),
      POST: ({ request }) => relay(request),
      OPTIONS: ({ request }) => relay(request),
    },
  },
});
