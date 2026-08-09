import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP } from "@/config/app";
import { authService } from "@/services/auth.service";
import type { RegistrationInput } from "@/types/core";

const title = "Create your workspace — Rocdwels AI";
const description =
  "Register your business on Rocdwels AI and get an isolated, modular ERP workspace in minutes.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const STEPS = ["Business", "Account", "Details"] as const;

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<RegistrationInput>({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    fullName: "",
    businessDescription: "",
  });

  const update = (key: keyof RegistrationInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setPending(true);
    const result = await authService.registerBusiness(form);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace created");
    navigate({ to: "/app" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center"><Logo subtitle="Multi-tenant ERP" /></div>
        <Card className="panel gap-6 p-7">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
            <h1 className="text-2xl font-semibold">Create your workspace</h1>
            <p className="text-sm text-muted-foreground">
              Includes a {APP.trialDays}-day trial. No card required.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input id="businessName" required value={form.businessName}
                    onChange={(event) => update("businessName")(event.target.value)}
                    placeholder="Northwind Trading Co." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your full name</Label>
                  <Input id="fullName" value={form.fullName ?? ""}
                    onChange={(event) => update("fullName")(event.target.value)} placeholder="Jane Doe" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" autoComplete="email" required value={form.email}
                    onChange={(event) => update("email")(event.target.value)} placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" required value={form.phone}
                    onChange={(event) => update("phone")(event.target.value)} placeholder="+1 555 000 1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete="new-password" required minLength={8}
                    value={form.password} onChange={(event) => update("password")(event.target.value)} />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business description</Label>
                <Textarea id="businessDescription" rows={5} value={form.businessDescription ?? ""}
                  onChange={(event) => update("businessDescription")(event.target.value)}
                  placeholder="Tell us what your business does — we use this to tailor your workspace." />
                <p className="text-xs text-muted-foreground">
                  Saved with your business profile for later classification.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? "Creating workspace…" : step === STEPS.length - 1 ? "Create workspace" : "Continue"}
              </Button>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
