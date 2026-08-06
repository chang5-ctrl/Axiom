import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Card } from "@/components/ui/card";
import { CAPABILITIES } from "@/config/landing";

export function Capabilities() {
  return (
    <section id="capabilities" className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Built to carry a business for years"
          description="Every layer of Axiom is designed so new capability arrives without a rebuild: tenancy, identity, permissions, modules, reporting and audit are part of the core, not add-ons."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) * 70}>
              <Card className="panel h-full gap-3.5 p-7 transition-colors hover:border-border-strong">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="font-display text-base font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
