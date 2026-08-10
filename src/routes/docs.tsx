import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Blocks,
  Building2,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { Card } from "@/components/ui/card";
import { APP } from "@/config/app";

const title = "Documentation — Rocdwels Administration";
const description =
  "Architecture, tenancy model, roles and permissions, modules and audit behaviour for the Rocdwels AI multi-tenant ERP platform.";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});

const TOPICS = [
  {
    icon: Building2,
    title: "Tenancy model",
    body: "Each business is a tenant. Every record carries a tenant reference, and row-level security policies scope access to workspace membership. A single deployment serves any number of businesses without shared data paths.",
  },
  {
    icon: KeyRound,
    title: "Authentication",
    body: "Owners register with business name, contact details and a password, which provisions the workspace, the owner membership and a trial subscription in one verified server operation. One-time codes, MFA and SSO extend the same service boundary.",
  },
  {
    icon: Users,
    title: "Roles & permissions",
    body: "Owner, Admin, Manager, Sales, Accountant and HR ship as templates. Roles and permissions are stored as data, so workspaces define their own roles and permission sets without code changes.",
  },
  {
    icon: Blocks,
    title: "Modules",
    body: "Capability is delivered as registered modules, each with its own permissions, navigation and lifecycle. Modules are activated per workspace and governed centrally from the platform control centre.",
  },
  {
    icon: ScrollText,
    title: "Audit & activity",
    body: "Every meaningful action records actor, entity, action and metadata within the workspace, giving compliance reviews and internal investigations a single reliable trail.",
  },
  {
    icon: ShieldCheck,
    title: "Security model",
    body: "Privileged operations execute only inside verified server functions with service-role access. Client applications never hold elevated credentials, and policies are reviewed with every schema change.",
  },
];

function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <section className="border-b border-border bg-hero-glow">
          <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Documentation
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
              How the {APP.name} platform works
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              A reference for the architecture behind your workspace: how tenancy is enforced, how
              access is governed, how modules are delivered and how activity is recorded.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            {TOPICS.map((topic) => (
              <Card key={topic.title} className="panel gap-3.5 p-7">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <topic.icon className="size-5" />
                </span>
                <h2 className="font-display text-lg font-semibold">{topic.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{topic.body}</p>
              </Card>
            ))}
          </div>

          <Card className="panel mt-10 gap-3 p-7">
            <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
              <LayoutDashboard className="size-5" />
            </span>
            <h2 className="font-display text-lg font-semibold">Get into a workspace</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Create a workspace to explore the platform against your own operation, or sign in to
              continue where you left off. Questions the reference does not answer can go to{" "}
              <a href={`mailto:${APP.supportEmail}`} className="text-primary hover:underline">
                {APP.supportEmail}
              </a>
              .
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <Link to="/register" className="text-primary hover:underline">
                Create your workspace
              </Link>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </Card>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
