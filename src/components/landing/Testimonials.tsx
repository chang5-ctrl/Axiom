import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Card } from "@/components/ui/card";
import { TRUST_COMMITMENTS } from "@/config/landing";
import { Quote } from "lucide-react";

export interface CustomerStory {
  quote: string;
  author: string;
  role: string;
  company: string;
  industry: string;
}

/**
 * Customer stories are published here once they are collected and approved.
 * The section renders verified stories when present, and the platform's
 * trust commitments otherwise — no invented quotes.
 */
export const CUSTOMER_STORIES: CustomerStory[] = [];

export function Testimonials({ stories = CUSTOMER_STORIES }: { stories?: CustomerStory[] }) {
  const hasStories = stories.length > 0;

  return (
    <section id="trust" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={hasStories ? "Customer stories" : "Trust"}
          title={
            hasStories
              ? "What operators say about running on Axiom"
              : "Standards we hold before you trust us with your business"
          }
          description={
            hasStories
              ? "Verified accounts from businesses operating on the platform."
              : "Multi-tenancy is a security commitment before it is a feature. These are the guarantees the platform is engineered around."
          }
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {hasStories
            ? stories.map((story, index) => (
                <Reveal key={`${story.company}-${story.author}`} delay={index * 80}>
                  <Card className="panel h-full gap-5 p-7">
                    <Quote className="size-5 text-primary" />
                    <p className="text-pretty text-base leading-relaxed">{story.quote}</p>
                    <div className="mt-auto border-t border-border pt-4">
                      <p className="font-display text-sm font-semibold">{story.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {story.role}, {story.company}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-primary">
                        {story.industry}
                      </p>
                    </div>
                  </Card>
                </Reveal>
              ))
            : TRUST_COMMITMENTS.map((item, index) => (
                <Reveal key={item.title} delay={index * 80}>
                  <Card className="panel h-full gap-4 p-7">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                      <item.icon className="size-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </Card>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
