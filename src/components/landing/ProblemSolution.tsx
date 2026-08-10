import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Card } from "@/components/ui/card";
import { PROBLEMS, SOLUTIONS } from "@/config/landing";

export function ProblemSection() {
  return (
    <section id="problem" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Most businesses run on software that was never shaped around them"
          description="Growing operations end up managing the tools instead of the business. The cost shows up as duplicated work, late numbers and decisions made on incomplete information."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <Reveal key={problem.title} delay={index * 80}>
              <div className="h-full bg-surface/60 p-8">
                <problem.icon className="size-5 text-muted-foreground" />
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug">
                  {problem.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{problem.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section id="solution" className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The solution"
          title="One platform that assembles itself around your operation"
          description="Rocdwels AI keeps a single, governed core — tenants, people, permissions, billing and audit — and composes the operational modules your business actually needs on top of it."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {SOLUTIONS.map((solution, index) => (
            <Reveal key={solution.title} delay={index * 80}>
              <Card className="panel h-full gap-4 p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <solution.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold leading-snug">
                  {solution.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{solution.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
