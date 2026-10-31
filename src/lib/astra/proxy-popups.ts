import type { Prefs } from "./prefs";
import { openProxied } from "./proxy";

const PREFIX = "/scramjet/p/";

/** Turn whatever a proxied page passed to window.open into a real target address. */
export function resolvePopupTarget(raw: string, base: string): string | null {
  const value = raw.trim();
  if (!value || value === "about:blank") return null;
  try {
    const u = new URL(value, base);
    // Already-proxied addresses carry the real address after the proxy prefix.
    if (u.pathname.startsWith(PREFIX)) {
      const inner = decodeURIComponent(u.pathname.slice(PREFIX.length) + u.search + u.hash);
      return /^https?:\/\//i.test(inner) ? inner : null;
    }
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Keep sign-in popups (Google, Discord, etc.) opened by a proxied page inside the proxy:
 * the popup becomes an overlay frame that also goes through the proxy, and it can talk
 * back to the page that opened it.
 */
export function attachProxiedPopups(iframe: HTMLIFrameElement, baseUrl: string, prefs: Prefs) {
  let overlay: HTMLDivElement | null = null;
  const close = () => { overlay?.remove(); overlay = null; };
  const patch = () => {
    let w: (Window & { open: typeof window.open }) | null = null;
    try { w = iframe.contentWindow as typeof w; } catch { return; }
    if (!w) return;
    const opener = w;
    try {
      w.open = ((u?: string | URL) => {
        let current = baseUrl;
        try { current = resolvePopupTarget(opener.location.href, baseUrl) ?? baseUrl; } catch { /* ignore */ }
        const target = resolvePopupTarget(String(u ?? ""), current);
        close();
        overlay = document.createElement("div");
        overlay.className = "proxy-popup";
        const box = document.createElement("div");
        box.className = "proxy-popup-box";
        const bar = document.createElement("div");
        bar.className = "proxy-popup-bar";
        bar.textContent = "Sign in";
        const x = document.createElement("button");
        x.type = "button"; x.textContent = "Close"; x.onclick = close;
        bar.appendChild(x);
        const frame = document.createElement("iframe");
        frame.className = "proxy-popup-frame";
        frame.allow = "fullscreen; autoplay; clipboard-read; clipboard-write";
        box.append(bar, frame);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        const wireUp = () => {
          try {
            const pw = frame.contentWindow as Window & { close: () => void };
            Object.defineProperty(pw, "opener", { value: opener, configurable: true });
            pw.close = close;
          } catch { /* ignore */ }
        };
        wireUp();
        frame.addEventListener("load", wireUp);
        if (target) openProxied(frame, target, prefs).catch(close);
        return frame.contentWindow;
      }) as typeof window.open;
    } catch { /* page blocked patching */ }
  };
  iframe.addEventListener("load", patch);
  return () => { iframe.removeEventListener("load", patch); close(); };
}
