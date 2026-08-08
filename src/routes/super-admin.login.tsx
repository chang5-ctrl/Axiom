import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { platformHomeFor } from "@/config/platform-nav";
import { supabase } from "@/integrations/supabase/client";
import { recordPlatformSignIn } from "@/lib/platform-auth.functions";

const title = "Platform sign in — Axiom";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: "Authorised Axiom platform staff sign-in." },
      { property: "og:title", content: title },
      { property: "og:description", content: "Authorised Axiom platform staff sign-in." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PlatformLoginPage,
});

function PlatformLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setPending(false);
      toast.error("Those platform credentials were not accepted.");
      return;
    }

    try {
      const session = await recordPlatformSignIn();
      if (!session.isStaff) {
        await supabase.auth.signOut();
        setPending(false);
        toast.error("This account is not registered as Axiom platform staff.");
        return;
      }
      navigate({ to: platformHomeFor(session.employee?.roleKey) as never, replace: true });
    } catch {
      await supabase.auth.signOut();
      setPending(false);
      toast.error("Platform access could not be verified.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo subtitle="Platform Console" />
        </div>
        <Card className="panel gap-6 p-7">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <ShieldCheck className="size-4" /> Internal access
            </div>
            <h1 className="text-2xl font-semibold">Platform sign in</h1>
            <p className="text-sm text-muted-foreground">
              This console is for Axiom staff. Business owners sign in through the workspace login.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Staff email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@axiom.local"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Verifying…" : "Sign in to platform"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Passwords are changed from inside the console. Platform staff cannot self-register — accounts
            are issued by the Platform Owner.
          </p>
        </Card>
      </div>
    </div>
  );
}
