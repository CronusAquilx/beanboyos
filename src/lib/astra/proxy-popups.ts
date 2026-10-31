import type { Prefs } from "./prefs";
import { gamePopupUrl, onProxyFrameInit, openProxied } from "./proxy";

const PREFIX = "/scramjet/p/";

/** Turn whatever a proxied page passed to window.open into a real target address. */
export function resolvePopupTarget(raw: string, base: string): string | null {
  const value = raw.trim();
  if (!value || value === "about:blank") return null;
  try {
    const u = new URL(value, base);
    // Already-proxied addresses carry the real address after the proxy prefix.
    if (u.pathname.startsWith(PREFIX)) {
      const path = u.pathname.slice(PREFIX.length);
      // Controller prefixes include a frame ID before the encoded destination.
      const encoded = path.match(/(?:^|\/)(https?%3A.*)$/i)?.[1];
      if (!encoded) return null;
      const inner = decodeURIComponent(encoded) + u.search + u.hash;
      return /^https?:\/\//i.test(inner) ? inner : null;
    }
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Keep sign-in popups (Google, Discord, etc.) opened by a proxied page inside the proxy:
 * the popup becomes a separate proxied window (overlay fallback), and it can talk
 * back to the page that opened it.
 */
export function attachProxiedPopups(iframe: HTMLIFrameElement, baseUrl: string, prefs: Prefs) {
  let overlay: HTMLDivElement | null = null;
  let popup: Window | null = null;
  let detachPopup = () => {};
  const close = () => { detachPopup(); detachPopup = () => {}; popup?.close(); popup = null; overlay?.remove(); overlay = null; };
  const patch = (initializedWindow?: Window) => {
    type Win = Window & { open: typeof window.open };
    let w: Win | null = null;
    try { w = (initializedWindow ?? iframe.contentWindow) as Win | null; } catch { return; }
    if (!w) return;
    const opener = iframe.contentWindow ?? w;
    try {
      w.open = ((u?: string | URL) => {
        let current = baseUrl;
        try { current = resolvePopupTarget(opener.location.href, baseUrl) ?? baseUrl; } catch { /* ignore */ }
        const target = resolvePopupTarget(String(u ?? ""), current);
        if (!target && String(u ?? "") && String(u) !== "about:blank") return null;
        close();
        // Open synchronously while user activation is still available.
        popup = window.open("about:blank", "_blank");
        const sharedUrl = target ? gamePopupUrl(iframe, target) : null;
        // Firebase polls the returned window's closed state and uses its top-level
        // opener/postMessage. An iframe masquerading as a popup breaks that contract.
        if (popup && (sharedUrl || !target && gamePopupUrl(iframe, baseUrl))) {
          const nativePopup = popup;
          nativePopup.opener = opener;
          const navigate = (raw: string | URL) => {
            const next = resolvePopupTarget(String(raw), current);
            const proxied = next ? gamePopupUrl(iframe, next) : null;
            if (proxied) nativePopup.location.href = proxied;
          };
          if (sharedUrl) nativePopup.location.href = sharedUrl;
          const locationHandle = {
            get href() { try { return nativePopup.location.href; } catch { return ""; } },
            set href(value: string) { navigate(value); },
            assign: navigate, replace: navigate,
          };
          return new Proxy(nativePopup, {
            get(win, key) {
              if (key === "location") return locationHandle;
              const value = Reflect.get(win, key, win);
              return typeof value === "function" ? value.bind(win) : value;
            },
            set(win, key, value) {
              if (key === "location") { navigate(value); return true; }
              return Reflect.set(win, key, value, win);
            },
          });
        }
        const owner = popup?.document ?? document;
        if (popup) {
          owner.title = "Game sign-in — Astra";
          owner.documentElement.style.height = "100%";
          owner.body.style.cssText = "margin:0;height:100%";
        }
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
        const frame = owner.createElement("iframe");
        frame.title = "Game sign-in";
        frame.className = "proxy-popup-frame";
        if (popup) frame.style.cssText = "width:100%;height:100%;border:0";
        frame.allow = "fullscreen; autoplay; clipboard-read; clipboard-write";
        box.append(bar, frame);
        overlay.appendChild(box);
        if (popup) { owner.body.appendChild(frame); overlay = null; }
        else document.body.appendChild(overlay);
        const wireUp = () => {
          try {
            const pw = frame.contentWindow as Window & { close: () => void };
            Object.defineProperty(pw, "opener", { value: opener, configurable: true });
            pw.close = close;
          } catch { /* ignore */ }
        };
        wireUp();
        frame.addEventListener("load", wireUp);
        detachPopup = onProxyFrameInit(frame, wireUp);
        if (target) openProxied(frame, target, prefs).catch((error) => {
          const message = owner.createElement("p");
          message.textContent = `Sign-in couldn't load: ${error instanceof Error ? error.message : "Connection failed"}`;
          owner.body.appendChild(message);
        });
        return frame.contentWindow;
      }) as typeof window.open;
      w.document.addEventListener("click", (event) => {
        const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
        if (!link) return;
        const target = resolvePopupTarget(link.href, baseUrl);
        const isLogin = target && /^(accounts\.google\.com|accounts\.youtube\.com|discord\.com|login\.microsoftonline\.com)$/.test(new URL(target).hostname);
        if (link.target && link.target !== "_self" || isLogin) {
          event.preventDefault(); event.stopImmediatePropagation(); w?.open(link.href, "_blank");
        }
      }, true);
    } catch { /* page blocked patching */ }
  };
  const onLoad = () => patch();
  const detachInit = onProxyFrameInit(iframe, patch);
  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow || event.data?.bbPopup !== 1 || typeof event.data.url !== "string") return;
    // Sandboxed arcade games cannot expose their window to the parent. Use the same popup path.
    const target = resolvePopupTarget(event.data.url, baseUrl);
    if (target) {
      const bridge = document.createElement("iframe");
      bridge.hidden = true; document.body.appendChild(bridge);
      patch(bridge.contentWindow ?? undefined);
      bridge.contentWindow?.open(target, "_blank");
      bridge.remove();
    }
  };
  iframe.addEventListener("load", onLoad);
  window.addEventListener("message", onMessage);
  return () => { detachInit(); iframe.removeEventListener("load", onLoad); window.removeEventListener("message", onMessage); close(); };
}
