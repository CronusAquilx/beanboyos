import { describe, expect, it } from "vitest";
import { cloudRelayUrl, needsIsolation, rewriteRelayText, rewriteSetCookie, upstreamFromRelay } from "./cloud-relay";

describe("cloud game relay", () => {
  it("relays catalog game ports through Astra's own domain", () => {
    expect(cloudRelayUrl("https://csjs.live/?map=dust2")).toBe("/api/public/cg/https/csjs.live/?map=dust2");
    expect(upstreamFromRelay("/api/public/cg/https/csjs.live/data/a.bin", "")?.href).toBe("https://csjs.live/data/a.bin");
  });
  it("never relays sites outside the game catalog", () => {
    expect(cloudRelayUrl("https://evil.example/")).toBeNull();
    expect(upstreamFromRelay("/api/public/cg/https/evil.example/", "")).toBeNull();
    expect(upstreamFromRelay("/api/public/cg/https/csjs.live/../x", "")).toBeNull();
  });
  it("relays every regular cloud game, isolating only the big ports", () => {
    expect(cloudRelayUrl("https://krunker.io/")).toBe("/api/public/cg/https/krunker.io/");
    expect(cloudRelayUrl("https://games.crazygames.com/en_US/1v1-lol/index.html")).not.toBeNull();
    expect(needsIsolation("csjs.live")).toBe(true);
    expect(needsIsolation("krunker.io")).toBe(false);
  });
  it("leaves account-based streaming services on the full proxy", () => {
    expect(cloudRelayUrl("https://play.geforcenow.com/")).toBeNull();
  });
  it("scopes game login cookies to the game's relay path", () => {
    expect(rewriteSetCookie("sid=1; Domain=.krunker.io; Path=/; Secure; SameSite=None", "/api/public/cg/https/krunker.io")).toBe("sid=1; Secure; Path=/api/public/cg/https/krunker.io/; SameSite=Lax");
  });
  it("keeps GTA V on its tuned relay", () => {
    expect(cloudRelayUrl("https://fiveplay.lol/")).toBeNull();
  });
  it("points root-relative game files at the relay", () => {
    const html = rewriteRelayText('<script src="/b/main.js"></script><img src="https://csjs.live/x.png">', "/api/public/cg/https/csjs.live", "html", "csjs.live");
    expect(html).toBe('<script src="/api/public/cg/https/csjs.live/b/main.js"></script><img src="/api/public/cg/https/csjs.live/x.png">');
  });
});
