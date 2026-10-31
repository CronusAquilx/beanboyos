import type { Prefs } from "./prefs";

export const LAYOUT_NAMES = { sony: "PlayStation / PS5", series: "Xbox Series X", classic: "Classic", launcher: "Launcher" } as const;
export type AppearanceLayout = keyof typeof LAYOUT_NAMES;
export type AppearanceProfile = Pick<Prefs, "palette" | "accent" | "fontScale" | "radius" | "density" | "background" | "reduceMotion" | "showClock" | "consoleBg" | "consoleCustomBg" | "customBg" | "customBgDim"> & {
  mode: "dark" | "light";
  tileSize: "small" | "standard" | "large";
  artwork: boolean;
  sidebarWidth: "narrow" | "standard" | "wide";
};
export type AppearanceProfiles = Partial<Record<AppearanceLayout, AppearanceProfile>>;
export function activeLayout(p: Pick<Prefs, "console" | "layout">): AppearanceLayout {
  return p.console === "sony" || p.console === "series" ? p.console : p.layout;
}
export function initialAppearance(p: Prefs, mode: "dark" | "light" = "dark"): AppearanceProfile {
  return { palette: p.palette, accent: p.accent, fontScale: p.fontScale, radius: p.radius, density: p.density, background: p.background, reduceMotion: p.reduceMotion, showClock: p.showClock, consoleBg: p.consoleBg, consoleCustomBg: p.consoleCustomBg, customBg: p.customBg, customBgDim: p.customBgDim, mode, tileSize: "standard", artwork: true, sidebarWidth: "standard" };
}
export function updateAppearance(profiles: AppearanceProfiles, layout: AppearanceLayout, current: AppearanceProfile, patch: Partial<AppearanceProfile>): AppearanceProfiles {
  return { ...profiles, [layout]: { ...current, ...patch } };
}