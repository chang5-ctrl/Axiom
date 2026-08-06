import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

import heroImage from "@/assets/hero-operations.jpg";
import { Reveal } from "@/components/landing/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP } from "@/config/app";

const PILLARS = [
  {
    icon: Sparkles,
    term: "Described, not configured",
    detail: "Your workflow becomes a working system, not a setup project.",
  },
  {
    icon: Building2,
    term: "Isolated workspaces",
    detail: "Each business operates in its own tenant on one platform.",
  },
  {
    icon: ShieldCheck,
    term: "Governed access",
    detail: "Role-based permissions and a full audit trail on every action.",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <Reveal>
            <Badge
              variant="outline"
              className="gap-2 border-transparent bg-primary-soft py-1.5 pl-1.5 pr-3 text-primary"
            >
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                AI-powered
              </span>
              Multi-tenant ERP platform
            </Badge>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-[3.65rem]">
              Describe your business.
              <span className="mt-2 block text-gradient">
                Receive a business operating system.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {APP.name} turns a description of how your business runs into a working operating
              system — the modules, roles, permissions and records built around your workflow, in
              a workspace that belongs only to you.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
                <Link to="/register">
                  Create your workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <a href="#workspace-generation">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {APP.trialDays}-day trial on every workspace. No card required.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <dl className="mt-14 grid gap-7 border-t border-border pt-9 sm:grid-cols-3">
              {PILLARS.map((pillar) => (
                <div key={pillar.term}>
                  <pillar.icon className="size-4 text-primary" />
                  <dt className="mt-3 font-display text-sm font-semibold">{pillar.term}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {pillar.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <div className="panel relative overflow-hidden p-2">
            <img
              src={heroImage}
              alt="Business leaders reviewing live operational performance on a wall of dashboards"
              width={1600}
              height={1104}
              className="h-full w-full rounded-[calc(var(--radius)+2px)] object-cover"
            />
          </div>
          <div
            className="pointer-events-none absolute -inset-x-6 -bottom-8 h-24 bg-hero-glow blur-2xl"
            aria-hidden
          />
        </Reveal>
      </div>
    </section>
  );
}
