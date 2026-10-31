import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { usePrefs } from "@/lib/astra/prefs";
import { useAuth } from "@/lib/auth";
import { AstraMark } from "@/components/astra/Mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { devSignIn } from "@/lib/astra/dev-access.functions";

import { useVisit, visitDestination } from "@/lib/console/visit";
import { ConsoleLogin } from "@/components/console/ConsoleLogin";
export function AuthPage() {
  const { session, user } = useAuth();
  const { send } = useVisit();
  const [initialUserId] = useState(user?.id ?? null);
  const [useOther, setUseOther] = useState(false);
  const p = usePrefs();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const enter = () => { send("account-confirmed"); void navigate({to:visitDestination(p),replace:true}); };
  useEffect(() => {
    // A restored session is not an instruction to skip this visit's login screen.
    if (session && (!initialUserId || (useOther && user?.id !== initialUserId))) enter();
  }, [session, user?.id]);
  const name = user?.user_metadata?.["full_name"] ?? user?.user_metadata?.["name"] ?? user?.email?.split("@")[0] ?? "Player";


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        enter();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your inbox to confirm your email.");
        else enter();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
  }

  const form = <>
        <div className="rounded-lg border bg-card/80 p-6 backdrop-blur">
          <Button type="button" variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="label-mono">or email</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
        </div>
        <AdminMode onSuccess={enter} />
  </>;
  if (p.console !== "off") return <ConsoleLogin name={String(name)} initial={String(name).slice(0,1).toUpperCase()} returning={!!session && !useOther} onContinue={enter} onOther={()=>setUseOther(true)} onBack={()=>send("restart")}>{form}</ConsoleLogin>;
  return <div className="relative flex min-h-dvh items-center justify-center bg-background px-5 sky"><div className="w-full max-w-sm animate-rise"><Button variant="ghost" onClick={()=>send("restart")} className="mb-6">Change layout</Button><div className="mb-10 text-center"><AstraMark className="mx-auto size-9"/><h1 className="mt-5 font-display text-5xl">BirchBlock</h1><p className="mt-3 text-sm text-muted-foreground">{session && !useOther ? "Welcome back" : "Sign in to your account"}</p></div>{session&&!useOther?<div className="space-y-3 rounded-lg border bg-card/80 p-6 text-center"><p className="text-lg">{String(name)}</p><Button className="w-full" onClick={enter}>Continue as {String(name)}</Button><Button variant="ghost" className="w-full" onClick={()=>setUseOther(true)}>Use another account</Button></div>:form}</div></div>;
}

function AdminMode({onSuccess}:{onSuccess:()=>void}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [account, setAccount] = useState<"qais" | "chance">("qais");
  const [busy, setBusy] = useState(false);
  const signIn = useServerFn(devSignIn);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await signIn({ data: { code, account } });
      if (!res.ok) throw new Error(res.error);
      const { error } = await supabase.auth.verifyOtp({ token_hash: res.tokenHash, type: "magiclink" });
      if (error) throw error;
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign in");
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mx-auto mt-6 block label-mono hover:text-foreground">
        Admin mode
      </button>
    );
  return (
    <form onSubmit={go} className="mt-6 space-y-3 rounded-lg border bg-card/80 p-4 backdrop-blur">
      <div className="flex gap-1.5">
        {(["qais", "chance"] as const).map((a) => (
          <button key={a} type="button" onClick={() => setAccount(a)}
            className={`flex-1 rounded-md border px-2 py-1.5 text-sm capitalize ${account === a ? "bg-accent" : ""}`}>
            {a} (dev)
          </button>
        ))}
      </div>
      <Input inputMode="numeric" autoFocus placeholder="Access code" value={code} onChange={(e) => setCode(e.target.value)} />
      <Button type="submit" className="w-full" disabled={busy || !code}>{busy ? "…" : "Enter admin mode"}</Button>
    </form>
  );
}
