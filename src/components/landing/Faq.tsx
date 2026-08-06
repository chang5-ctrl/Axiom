import { SectionHeading } from "@/components/landing/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/config/landing";

export function Faq() {
  return (
    <section id="faq" className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions operators ask before they move"
          description="If something here is unresolved, the documentation goes deeper into architecture, security and module behaviour."
        />
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
