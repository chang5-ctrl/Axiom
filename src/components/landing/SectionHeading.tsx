import type { ReactNode } from "react";

import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Shared marketing section heading — one hierarchy across the whole page. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
