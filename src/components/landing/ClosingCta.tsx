import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";
import { APP } from "@/config/app";

export function ClosingCta() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="panel relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" aria-hidden />
          <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
            <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-[1.12] sm:text-4xl">
              Give your business an operating system it won&apos;t outgrow
            </h2>
            <p className="max-w-xl text-pretty text-muted-foreground">
              Describe how you work and your workspace is ready in minutes — with your modules,
              your roles and your team in place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
                <Link to="/register">
                  Create your workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/docs">Read the documentation</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {APP.trialDays}-day trial · Cancel whenever · Full data export
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
