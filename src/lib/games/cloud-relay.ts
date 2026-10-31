import { AAA_GAMES } from "./aaa";

/**
 * Same-domain relay for big browser game ports (the AAA list). These need cross-origin isolation
 * (SharedArrayBuffer) and fetch large data folders with Range requests, which the in-page proxy
 * frame cannot provide. Only hosts from the fixed catalog are relayed.
 */
export const CLOUD_RELAY_PREFIX = "/api/public/cg";

const RELAY_HOSTS = new Set(
  AAA_GAMES.flatMap((g) => { try { return [new URL(g.url).hostname]; } catch { return []; } })
    .filter((h) => !["fiveplay.lol", "www.fiveplay.lol", "gta.deloskiyt.pl"].includes(h)),
);

export const isRelayHost = (host: string) => RELAY_HOSTS.has(host.toLowerCase());

/** `/api/public/cg/<scheme>/<host>/<path>` for a catalog game, otherwise null. */
export function cloudRelayUrl(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || !isRelayHost(u.hostname)) return null;
  return `${CLOUD_RELAY_PREFIX}/${u.protocol.slice(0, -1)}/${u.host}${u.pathname}${u.search}`;
}

/** Parses a relay path back into the upstream URL; null for anything outside the catalog. */
export function upstreamFromRelay(pathname: string, search: string): URL | null {
  const m = new RegExp(`^${CLOUD_RELAY_PREFIX}/(https?)/([^/]+)(/.*)?$`).exec(pathname);
  if (!m) return null;
  const [, scheme, host, rest = "/"] = m;
  if (rest.split("/").some((s) => s === ".." || s === ".")) return null;
  let u: URL;
  try { u = new URL(`${scheme}://${host}${rest}${search}`); } catch { return null; }
  return isRelayHost(u.hostname) ? u : null;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Points root-relative and absolute same-site URLs in text at the relay. */
export function rewriteRelayText(text: string, base: string, kind: "html" | "css" | "js", host: string): string {
  const abs = new RegExp(`(?:https?:)?//${esc(host)}(?=[/"'\`?#)\\s]|$)`, "gi");
  let out = text.replace(abs, base);
  if (kind === "html") out = out.replace(/(\s(?:src|href|action|poster|data)\s*=\s*["'])\/(?!\/|api\/public\/cg\/)/gi, `$1${base}/`);
  if (kind === "html" || kind === "css") out = out.replace(/url\(\s*(["']?)\/(?!\/|api\/public\/cg\/)/gi, `url($1${base}/`);
  return out;
}

/** Runtime shim: keeps fetch/XHR/Worker calls with root-relative URLs inside the relay. */
export function relayShim(base: string): string {
  return `<script>(function(){var B=${JSON.stringify(base)};function r(u){if(typeof u!=="string")return u;if(u.charAt(0)==="/"&&u.charAt(1)!=="/"&&u.indexOf(B)!==0&&u.indexOf("/api/public/cg/")!==0)return B+u;return u}
var f=window.fetch;if(f)window.fetch=function(i,o){try{if(typeof i==="string")i=r(i);else if(i instanceof URL)i=r(i.pathname.charAt(0)==="/"&&i.origin===location.origin?i.pathname+i.search:i.href)}catch(e){}return f.call(this,i,o)};
var x=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(){try{arguments[1]=r(String(arguments[1]))}catch(e){}return x.apply(this,arguments)};
["Worker","SharedWorker"].forEach(function(n){var W=window[n];if(!W)return;window[n]=function(u,o){return new W(r(String(u)),o)};window[n].prototype=W.prototype});})();</script>`;
}
