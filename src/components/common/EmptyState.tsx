import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  dashed?: boolean;
}

/** Reusable empty/placeholder surface used by every not-yet-built area. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  dashed = true,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "items-center justify-center gap-3 border-border bg-surface/40 px-6 py-12 text-center",
        dashed && "border-dashed",
        className,
      )}
    >
      {Icon && (
        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
      )}
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </Card>
  );
}
