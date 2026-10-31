import racing from "@/assets/console-racing.jpg";
import action from "@/assets/console-action.jpg";
import arcade from "@/assets/console-arcade.jpg";
import world from "@/assets/console-world.jpg";

/** Original genre illustrations, not official game covers or provider screenshots. */
export function consoleArtwork(title: string, kind: "cloud" | "arcade" | "app") {
  if (kind === "app") return undefined;
  if (/race|racing|rally|kart|drift|turismo|speed|burnout|midnight club|road rash|f1\b/i.test(title)) return racing;
  if (/craft|bloxd|voxel|island|sandbox|world/i.test(title)) return world;
  return kind === "arcade" ? arcade : action;
}