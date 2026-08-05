import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  CallToAction,
  Faq,
  Features,
  Hero,
  LandingFooter,
  LandingNav,
  Pricing,
  SupportedBusinesses,
} from "@/components/landing/LandingSections";
import { APP } from "@/config/app";
import { billingService } from "@/services/billing.service";
import type { Plan } from "@/types/core";

const title = "Axiom — Modular Multi-Tenant ERP Platform";
const description =
  "Axiom is a modular, multi-tenant ERP platform. Isolated workspaces, dynamic roles and permissions, and modules you switch on as your business grows.";

export const Route = createFileRoute("/")({
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
  component: LandingPage,
});

function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    billingService.listPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <SupportedBusinesses />
        <Pricing plans={plans} />
        <Faq />
        <CallToAction />
      </main>
      <LandingFooter />
      <span className="sr-only">{APP.tagline}</span>
    </div>
  );
}
