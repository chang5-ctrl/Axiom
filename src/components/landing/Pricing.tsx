import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { APP } from "@/config/app";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/core";

function formatPrice(plan: Plan): string {
  const amount = Number(plan.price_monthly);
  if (!Number.isFinite(amount) || amount <= 0) return "Custom";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Pricing({ plans, loading = false }: { plans: Plan[]; loading?: boolean }) {
  return (
    <section id="pricing" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans that scale with the business, not the paperwork"
          description={`Every workspace begins with a ${APP.trialDays}-day trial. Move between plans at any time — your data, roles and modules stay exactly as they are.`}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading && plans.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="panel gap-4 p-7">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </Card>
              ))
            : plans.map((plan, index) => {
                const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
                const highlighted = index === 1;
                return (
                  <Reveal key={plan.id} delay={index * 70} className="h-full">
                    <Card
                      className={cn(
                        "panel h-full gap-5 p-7",
                        highlighted && "ring-1 ring-primary/45",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                        {highlighted && (
                          <Badge className="bg-primary-soft text-primary">Most chosen</Badge>
                        )}
                      </div>
                      <p className="font-display text-4xl font-semibold tracking-tight">
                        {formatPrice(plan)}
                        {Number(plan.price_monthly) > 0 && (
                          <span className="ml-1 text-sm font-normal text-muted-foreground">
                            /month
                          </span>
                        )}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {plan.description}
                      </p>
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        {features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        variant={highlighted ? "default" : "outline"}
                        className="mt-auto"
                      >
                        <Link to="/register">
                          {Number(plan.price_monthly) > 0 ? "Start trial" : "Talk to us"}
                        </Link>
                      </Button>
                    </Card>
                  </Reveal>
                );
              })}
        </div>
      </div>
    </section>
  );
}
