import { usePrefs } from "@/lib/astra/prefs";
import { resolveSkin } from "@/lib/console/skins";
import { SonyHome } from "./sony/SonyHome";
import { SonyStore } from "./sony/SonyStore";
import { SonyLibrary } from "./sony/SonyLibrary";
import { SonySettings } from "./sony/SonySettings";
import { SonyProfile } from "./sony/SonyProfile";

export type ConsoleScreenName = "home" | "media" | "apps" | "store" | "library" | "settings" | "profile";

// Part A: only the Sony skin exists. Parts B and C add the Xbox skins here.
export function ConsoleScreen({ screen }: { screen: ConsoleScreenName }) {
  const skin = resolveSkin(usePrefs().console);
  void skin;
  if (screen === "media") return <SonyHome media />;
  if (screen === "apps") return <SonyLibrary apps />;
  if (screen === "store") return <SonyStore />;
  if (screen === "library") return <SonyLibrary />;
  if (screen === "settings") return <SonySettings />;
  if (screen === "profile") return <SonyProfile />;
  return <SonyHome />;
}