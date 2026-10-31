import { describe, expect, it } from "vitest";
import { CLOUD_GAMES } from "./cloud-catalog";
import { cloudRelayUrl } from "./cloud-relay";

describe("Fortnite browser options", () => {
  it("includes EMX Freebuild as a separate proxied browser simulator", () => {
    const url = "https://freebuild.emxtweaks.com/";
    expect(CLOUD_GAMES.find(game => game.url === url)?.name).toBe("EMX Freebuild (browser simulator)");
    expect(cloudRelayUrl(url)).toBe("/api/public/cg/https/freebuild.emxtweaks.com/");
  });
  it("includes the requested Retrora domain separately from official Fortnite", () => {
    expect(CLOUD_GAMES.find(game => game.url === "https://retrora.lol/")?.name).toBe("Fortnite Season 1 — Retrora (community port)");
  });
  it("offers the official Fortnite Xbox launch through the full proxy", () => {
    const url = "https://www.xbox.com/play/games/fortnite/BT5P2X999VH2";
    expect(CLOUD_GAMES.find(game => game.url === url)?.name).toBe("Fortnite — Xbox Cloud (official)");
    expect(cloudRelayUrl(url)).toBeNull();
  });
});