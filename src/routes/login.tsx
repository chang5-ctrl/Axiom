import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

const title = "Sign in — Axiom";
const description = "Sign in to your Axiom workspace to manage your business.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const result = await authService.signIn({ email, password });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    navigate({ to: "/app" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center"><Logo subtitle="Multi-tenant ERP" /></div>
        <Card className="panel gap-6 p-7">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your workspace.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            New to Axiom?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create a workspace
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
