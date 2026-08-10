import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { ADDITIONAL_INDUSTRIES, INDUSTRIES } from "@/config/landing";

export function Industries() {
  return (
    <section id="industries" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Industries"
          title="The same platform, shaped for very different businesses"
          description="Nothing here is a fixed vertical product. Each workspace is composed from the module registry, so a dealership, a clinic and a logistics operator each get a system that matches how they work."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry, index) => (
            <Reveal key={industry.name} delay={(index % 3) * 70}>
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-surface/60 transition-colors hover:border-border-strong">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={industry.image}
                    alt={industry.name}
                    loading="lazy"
                    width={1200}
                    height={912}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2.5">
                    <industry.icon className="size-4 text-primary" />
                    <h3 className="font-display text-base font-semibold">{industry.name}</h3>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {industry.summary}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Also operating on Rocdwels AI:</span>
          {ADDITIONAL_INDUSTRIES.map((item) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground"
            >
              <item.icon className="size-3.5 text-primary" />
              {item.name}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
