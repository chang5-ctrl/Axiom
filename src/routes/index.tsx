import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Capabilities } from "@/components/landing/Capabilities";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { Faq } from "@/components/landing/Faq";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Industries } from "@/components/landing/Industries";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { Pricing } from "@/components/landing/Pricing";
import { ProblemSection, SolutionSection } from "@/components/landing/ProblemSolution";
import { Testimonials } from "@/components/landing/Testimonials";
import { WorkspaceGeneration } from "@/components/landing/WorkspaceGeneration";
import { billingService } from "@/services/billing.service";

const title = "Axiom — AI-Powered Multi-Tenant ERP Platform";
const description =
  "Describe your business and receive a business operating system built around your workflow. Axiom composes modules, roles and permissions into an isolated workspace for every business.";

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
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["public", "plans"],
    queryFn: () => billingService.listPlans(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <WorkspaceGeneration />
        <Capabilities />
        <Industries />
        <HowItWorks />
        <Pricing plans={plans} loading={isLoading} />
        <Testimonials />
        <Faq />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
