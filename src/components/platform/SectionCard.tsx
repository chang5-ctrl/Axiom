import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Consistent panel wrapper for every control-centre block. */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("panel gap-0 overflow-hidden p-0", className)}>
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h2 className="font-display text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}
