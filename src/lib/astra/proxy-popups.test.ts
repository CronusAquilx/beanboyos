import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PREFS } from "./prefs";
import { attachProxiedPopups, resolvePopupTarget } from "./proxy-popups";

const mocks = vi.hoisted(() => ({ open: vi.fn().mockResolvedValue({}), init: new Map<HTMLIFrameElement, (win: Window) => void>() }));
vi.mock("./proxy", () => ({
  openProxied: mocks.open,
  onProxyFrameInit: (frame: HTMLIFrameElement, callback: (win: Window) => void) => {
    mocks.init.set(frame, callback);
    return () => mocks.init.delete(frame);
  },
}));
afterEach(() => { document.body.replaceChildren(); mocks.open.mockClear(); mocks.init.clear(); vi.restoreAllMocks(); });

describe("game sign-in routing", () => {
  const login = "https://accounts.google.com/o/oauth2/auth?client_id=game&redirect_uri=https%3A%2F%2F1v1.lol%2Fcallback&state=a%2Bb#login";
  it("decodes controller frame prefixes without stripping OAuth parameters", () => {
    expect(resolvePopupTarget(`/scramjet/p/frame123/${encodeURIComponent(login)}`, "https://1v1.lol/")).toBe(login);
  });
  it("rejects non-web popup destinations", () => {
    expect(resolvePopupTarget("javascript:alert(1)", "https://1v1.lol/")).toBeNull();
  });
  it("opens sign-in separately through the proxy before the game load event", () => {
    const game = document.createElement("iframe"); document.body.append(game);
    const separate = document.createElement("iframe"); document.body.append(separate);
    const gameWindow = game.contentWindow; const separateWindow = separate.contentWindow;
    if (!gameWindow || !separateWindow) throw new Error("Missing test windows");
    const close = vi.spyOn(separateWindow, "close").mockImplementation(() => {});
    const nativeOpen = vi.spyOn(window, "open").mockReturnValue(separateWindow);
    const detach = attachProxiedPopups(game, "https://1v1.lol/", DEFAULT_PREFS);
    mocks.init.get(game)?.(gameWindow);
    const original = gameWindow.location.href;
    const result = gameWindow.open(login, "_blank");
    expect(nativeOpen).toHaveBeenCalledWith("about:blank", "_blank");
    expect(mocks.open).toHaveBeenCalledWith(expect.any(HTMLIFrameElement), login, DEFAULT_PREFS);
    expect(gameWindow.location.href).toBe(original);
    expect(result?.opener).toBe(gameWindow);
    detach(); expect(close).toHaveBeenCalled();
  });
  it("routes sandboxed arcade messages without replacing the game", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const game = document.createElement("iframe"); document.body.append(game);
    const detach = attachProxiedPopups(game, "https://1v1.lol/", DEFAULT_PREFS);
    window.dispatchEvent(new MessageEvent("message", { source: game.contentWindow, data: { bbPopup: 1, url: login } }));
    expect(mocks.open).toHaveBeenCalledWith(expect.any(HTMLIFrameElement), login, DEFAULT_PREFS);
    expect(game.src).toBe("");
    detach();
  });
  it("ignores popup messages from unrelated frames", () => {
    const game = document.createElement("iframe"); document.body.append(game);
    const detach = attachProxiedPopups(game, "https://1v1.lol/", DEFAULT_PREFS);
    window.dispatchEvent(new MessageEvent("message", { source: window, data: { bbPopup: 1, url: login } }));
    expect(mocks.open).not.toHaveBeenCalled(); detach();
  });
});