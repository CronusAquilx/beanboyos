import { describe, expect, it } from "vitest";
import { cloudRelayUrl, rewriteRelayText, upstreamFromRelay } from "./cloud-relay";

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
  it("keeps GTA V on its tuned relay", () => {
    expect(cloudRelayUrl("https://fiveplay.lol/")).toBeNull();
  });
  it("points root-relative game files at the relay", () => {
    const html = rewriteRelayText('<script src="/b/main.js"></script><img src="https://csjs.live/x.png">', "/api/public/cg/https/csjs.live", "html", "csjs.live");
    expect(html).toBe('<script src="/api/public/cg/https/csjs.live/b/main.js"></script><img src="/api/public/cg/https/csjs.live/x.png">');
  });
});
