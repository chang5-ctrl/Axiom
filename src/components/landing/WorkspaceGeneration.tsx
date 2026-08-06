import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import generationImage from "@/assets/workspace-generation.jpg";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Button } from "@/components/ui/button";
import { WORKSPACE_GENERATION_STEPS } from "@/config/landing";

export function WorkspaceGeneration() {
  return (
    <section id="workspace-generation" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI workspace generation"
          title="Your description becomes your operating system"
          description="Axiom reads how your business works — what you sell, how work moves, who approves what — and composes a workspace around it. Modules, roles, permissions and record structures are assembled for your operation, then remain yours to adjust."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <ol className="space-y-8">
            {WORKSPACE_GENERATION_STEPS.map((item, index) => (
              <Reveal as="li" key={item.step} delay={index * 90} className="flex gap-5">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary font-display text-sm font-semibold text-primary">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </Reveal>
            ))}
            <Reveal as="li" delay={280}>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/register">
                  Describe your business <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
          </ol>

          <Reveal delay={140} className="panel overflow-hidden p-2">
            <img
              src={generationImage}
              alt="A business owner explaining how their operation runs during a workspace planning session"
              loading="lazy"
              width={1408}
              height={768}
              className="w-full rounded-[calc(var(--radius)+2px)] object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
