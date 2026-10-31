import type { CSSProperties, ReactNode } from "react";
import { usePrefs } from "@/lib/astra/prefs";
import landscape from "@/assets/console-landscape.jpg";
export function ConsoleShell({ hue = 210, children, bg }: { hue?: number; children: ReactNode; bg?: string }) {
  const p = usePrefs(); const image = p.consoleBg === "custom" && p.consoleCustomBg ? p.consoleCustomBg : landscape;
  return <div className="console-shell fixed inset-0 overflow-hidden bg-console-background text-console-foreground" style={{ "--console-hue": hue, "--console-secondary": (hue + 60) % 360 } as CSSProperties}>
    <div className="console-backdrop pointer-events-none absolute inset-0">{p.consoleBg !== "focused" && <img src={image} width={1920} height={1088} alt="" className="h-full w-full object-cover"/>}<div className="absolute inset-0 console-shade"/>{p.consoleBg === "focused" && <div className="absolute inset-0" style={{ background: bg ?? "var(--console-scene)" }}/>}</div>
    <div className="console-page relative h-full">{children}</div>
  </div>;
}
