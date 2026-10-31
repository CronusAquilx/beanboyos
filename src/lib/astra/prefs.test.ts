import { describe, expect, it } from "vitest";
import { setPrefs, setAppearance, resetPrefs } from "./prefs";

describe("persisted appearance switching", () => {
  it("restores each console accent and theme when switching back", () => {
    resetPrefs();
    setPrefs({ console: "sony" });
    setAppearance("sony", { accent: "rose", mode: "light", fontScale: 110 });
    setPrefs({ console: "series" });
    setAppearance("series", { accent: "mint", mode: "dark", fontScale: 95 });
    setPrefs({ console: "sony" });
    const saved = JSON.parse(localStorage.getItem("astra-prefs") || "{}");
    expect(saved.accent).toBe("rose");
    expect(saved.fontScale).toBe(110);
    expect(saved.appearances.series.accent).toBe("mint");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    setPrefs({ console: "series" });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.fontSize).toBe("95%");
  });
  it("editing an inactive layout does not change the current look", () => {
    resetPrefs();
    setPrefs({ console: "off", layout: "classic" });
    setAppearance("classic", { accent: "gold" });
    setAppearance("launcher", { accent: "sky", sidebarWidth: "wide" });
    expect(JSON.parse(localStorage.getItem("astra-prefs") || "{}").accent).toBe("gold");
    setPrefs({ layout: "launcher" });
    expect(JSON.parse(localStorage.getItem("astra-prefs") || "{}").accent).toBe("sky");
    expect(document.documentElement.dataset.sidebarWidth).toBe("wide");
  });
});