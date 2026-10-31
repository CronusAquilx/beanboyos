import type { CSSProperties } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getConsoleArcade } from "./catalog.functions";
import { CLOUD_GAMES } from "@/lib/games/cloud-catalog";
import { STREAMING_APPS } from "./streaming";

export type ConsoleGame = {
  id: string; title: string; tagline: string; genre: string; hue: number;
  badge: "Free" | "Included" | "New";
  kind: "cloud" | "arcade" | "app"; url?: string; file?: string;
  /** Thumbnail from the game's own source site. */
  cover?: string | undefined;
  /** Streaming apps must be downloaded from the store before they open. */
  installable?: boolean;
};
export type ArcadeGame = { id: number; name: string; author: string; file: string; cover: string };
export const APPS: ConsoleGame[] = [
  { id: "app-music", title: "Music", tagline: "Your sound. Your next favorite.", genre: "Media", hue: 160, badge: "Included", kind: "app", url: "/music" },
  { id: "app-movies", title: "Movies", tagline: "A little escape. A whole new world.", genre: "Media", hue: 35, badge: "Included", kind: "app", url: "/movies" },
  { id: "app-ai", title: "AI", tagline: "A conversation worth starting.", genre: "Apps", hue: 235, badge: "Included", kind: "app", url: "/chat" },
  { id: "app-web", title: "Web", tagline: "Beyond your home screen.", genre: "Apps", hue: 200, badge: "Included", kind: "app", url: "/web" },
  { id: "app-voice", title: "Voice", tagline: "Talk it through.", genre: "Apps", hue: 310, badge: "Included", kind: "app", url: "/voice" },
  { id: "app-memory", title: "Memory", tagline: "Keep what matters.", genre: "Apps", hue: 85, badge: "Included", kind: "app", url: "/memory" },
  ...STREAMING_APPS.map((a): ConsoleGame => ({ id: `app-${a.slug}`, title: a.title, tagline: a.tagline, genre: "Media", hue: a.hue, badge: "Free", kind: "app", url: `/console/stream/${a.slug}`, installable: true })),
];
export function tileHue(title: string) { return [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0); }
export const CATALOG: ConsoleGame[] = CLOUD_GAMES.map(g => ({ id: `cloud:${g.url}:${g.name}`, title: g.name, tagline: "Ready when you are.", genre: "Cloud games", hue: tileHue(g.name), badge: "Free", kind: "cloud", url: g.url, cover: siteThumbnail(g.url) }));
/** Live screenshot of the game's own website, used as its thumbnail. */
export function siteThumbnail(url: string) { return `https://image.thum.io/get/width/640/crop/800/noanimate/${url}`; }
export function fromArcade(g: ArcadeGame): ConsoleGame { return { id: `arcade:${g.file}`, title: /^1v1\.lol$/i.test(g.name.trim()) ? `${g.name} (Offline)` : g.name, tagline: g.author, genre: "Arcade", hue: tileHue(g.name), badge: "Free", kind: "arcade", file: g.file, cover: g.cover ? `/api/public/games/cover/${g.cover}` : undefined }; }
export const consoleCatalogOptions = queryOptions({
  queryKey: ["console-catalog"], staleTime: 60 * 60 * 1000,
  queryFn: async () => {
    const raw: unknown = await getConsoleArcade();
    if (!Array.isArray(raw)) throw new Error("Arcade games couldn't load. Try again.");
    const arcade = raw.filter((g): g is ArcadeGame => !!g && typeof g.id === "number" && typeof g.name === "string" && typeof g.file === "string" && /^[A-Za-z0-9._-]+\.html?$/.test(g.file));
    return { arcade, games: [...CATALOG, ...arcade.map(fromArcade), ...APPS] };
  },
});
export const useCatalog = () => useSuspenseQuery(consoleCatalogOptions).data;
export const gameById = (id: string | null | undefined, games: ConsoleGame[] = [...CATALOG, ...APPS]) => games.find(g => g.id === id);
export function launchPath(g: ConsoleGame) {
  if (g.kind === "arcade" && g.file) return `/console/arcade?game=${encodeURIComponent(g.file)}`;
  if (g.kind === "cloud" && g.url) return `/play?url=${encodeURIComponent(g.url)}&name=${encodeURIComponent(g.title)}`;
  return g.kind === "app" && g.url?.startsWith("/") ? g.url : "/console";
}
export function artStyle(hue: number): CSSProperties { return { "--console-art-hue": hue, "--console-art-secondary": (hue + 50) % 360 } as CSSProperties; }
