import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Blocks,
  Building2,
  Check,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP } from "@/config/app";
import type { Plan } from "@/types/core";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Platform</a>
          <a href="#businesses" className="transition-colors hover:text-foreground">Businesses</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/register">Start free</Link></Button>
        </div>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Badge variant="outline" className="gap-1.5 border-transparent bg-primary-soft text-primary">
          <Cpu className="size-3.5" /> Phase 0 · Multi-tenant core
        </Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
          The operating system for <span className="text-gradient">modern businesses</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {APP.description} Isolated workspaces, dynamic roles and permissions, and a module
          registry built to carry your business for years — not a quarter.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/register">Create your workspace <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline"><Link to="/login">Sign in</Link></Button>
        </div>
        <dl className="mt-16 grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
          {[
            ["One deployment", "Unlimited isolated businesses"],
            ["Row-level isolation", "Enforced in the database, not the UI"],
            ["Modular by design", "Switch capabilities on as you grow"],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="font-display text-base font-semibold">{term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Building2, title: "True multi-tenancy", body: "Every business gets an isolated workspace. Tenant scoping is enforced by row-level security on every table." },
  { icon: ShieldCheck, title: "Dynamic roles & permissions", body: "Owner, Admin, Manager, Sales, Accountant and HR ship as templates. Custom roles and permissions are data, never code." },
  { icon: Blocks, title: "Module registry", body: "Inventory, CRM, Accounting, Payroll and verticals plug into a registry — no schema rewrites to add capability." },
  { icon: Lock, title: "Auth built to extend", body: "Email and password today; OTP, MFA and SSO drop in behind the same service boundary." },
  { icon: Workflow, title: "Audit everything", body: "Every meaningful action is recorded per tenant with actor, entity and metadata." },
  { icon: Layers, title: "Clean architecture", body: "Typed services, reusable layouts and hooks. No duplicated logic, no hardcoded business rules." },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Platform</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A foundation that scales for years</h2>
        <p className="mt-4 text-muted-foreground">
          Architecture first. Every layer is designed so new modules and future infrastructure plug
          in without a rewrite.
        </p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="panel gap-3 p-6">
            <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
              <feature.icon className="size-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

const BUSINESSES = [
  "Retail & Wholesale", "Vehicle Dealership", "Hospital & Clinic", "Restaurant", "Construction",
  "Law Firm", "School", "Logistics", "Manufacturing", "Real Estate", "Agency", "Professional Services",
];

export function SupportedBusinesses() {
  return (
    <section id="businesses" className="border-y border-border bg-surface/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Supported businesses</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Built for every kind of operation</h2>
          <p className="mt-4 text-muted-foreground">
            One platform, many verticals. Each workspace enables only the modules its business needs.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-2.5">
          {BUSINESSES.map((item) => (
            <span key={item} className="rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing({ plans }: { plans: Plan[] }) {
  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Pricing</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Simple plans, room to grow</h2>
        <p className="mt-4 text-muted-foreground">
          Every workspace starts with a {APP.trialDays}-day trial. No card required.
        </p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
          const highlighted = index === 1;
          return (
            <Card key={plan.id} className={highlighted ? "panel gap-4 p-6 ring-1 ring-primary/40" : "panel gap-4 p-6"}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                {highlighted && <Badge className="bg-primary-soft text-primary">Popular</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <p className="font-display text-3xl font-semibold">
                {Number(plan.price_monthly) === 0 ? "Custom" : `$${Number(plan.price_monthly)}`}
                {Number(plan.price_monthly) !== 0 && (
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                )}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant={highlighted ? "default" : "outline"} className="mt-auto">
                <Link to="/register">Get started</Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

const FAQS = [
  ["How does tenant isolation work?", "Every table carries a tenant reference and row-level security policies scoped to your membership. Isolation is enforced in the database, so no application bug can leak another business's data."],
  ["Can I add custom roles?", "Yes. Roles and permissions are stored as data. The six built-in roles are templates; you can create workspace-specific roles with any permission combination."],
  ["Which modules are available today?", "Phase 0 ships the multi-tenant core: workspaces, people, roles, billing structures and audit. Business modules are registered and switched on progressively."],
  ["Do you support MFA or single sign-on?", "Authentication sits behind a single service boundary, so OTP, MFA and SSO can be enabled later without changing your accounts or data."],
  ["How is billing handled?", "Plans, subscriptions and payment states are modelled in the platform. Payment provider integration is intentionally deferred."],
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map(([question, answer]) => (
            <AccordionItem key={question} value={question as string}>
              <AccordionTrigger className="text-left">{question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Card className="panel items-center gap-5 overflow-hidden px-6 py-16 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          Give your business an operating system
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Create your workspace in under a minute. Invite your team, choose your modules, and grow
          into the platform.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/register">Create your workspace <ArrowRight className="size-4" /></Link>
        </Button>
      </Card>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Logo subtitle="Multi-tenant ERP" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
