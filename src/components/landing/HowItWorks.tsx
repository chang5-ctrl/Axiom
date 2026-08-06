import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { HOW_IT_WORKS } from "@/config/landing";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From registration to running operations"
          description="Four steps, measured in minutes rather than implementation cycles."
        />
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item, index) => (
            <Reveal as="li" key={item.step} delay={index * 80} className="relative">
              <span className="font-display text-sm font-semibold text-primary">{item.step}</span>
              <div className="mt-4 h-px w-full bg-border" aria-hidden />
              <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
