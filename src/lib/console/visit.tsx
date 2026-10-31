import { createContext, useContext, useState, type ReactNode } from "react";
import type { Prefs } from "@/lib/astra/prefs";
export type VisitStage = "setup" | "login" | "ready";
export function initialVisitStage(): VisitStage { return "setup"; }
export function nextVisitStage(stage: VisitStage, event: "choices-complete" | "account-confirmed" | "restart"): VisitStage {
  if (event === "restart") return "setup";
  if (stage === "setup" && event === "choices-complete") return "login";
  if (stage === "login" && event === "account-confirmed") return "ready";
  return stage;
}
export function visitDestination(p: Pick<Prefs,"console"|"focus">): "/console"|"/console/media"|"/home"|"/games"|"/movies"|"/music"|"/web"|"/chat" {
  if (p.console !== "off") return ["music","movies","ai","web"].includes(p.focus) ? "/console/media" : "/console";
  return ({games:"/games",movies:"/movies",music:"/music",web:"/web",ai:"/chat",all:"/home","":"/home"} as const)[p.focus];
}
const VisitContext = createContext({stage: "setup" as VisitStage, send: (_event: "choices-complete"|"account-confirmed"|"restart") => {}});
export function VisitProvider({children}:{children:ReactNode}) {
  // Deliberately document-scoped: reload/new tab/new visit always asks again. Never stored with the auth session.
  const [stage,setStage]=useState<VisitStage>(initialVisitStage);
  return <VisitContext.Provider value={{stage,send:event=>setStage(s=>nextVisitStage(s,event))}}>{children}</VisitContext.Provider>;
}
export const useVisit=()=>useContext(VisitContext);
