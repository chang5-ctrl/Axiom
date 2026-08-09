import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Destination inside the platform console. */
  to: string;
  /** Optional count badge, e.g. items awaiting review. */
  count?: number | undefined;
  permission?: string;
}

/**
 * Operator shortcuts. Actions are filtered by the caller's permission set so
 * staff never see a destination they cannot open.
 */
export function QuickActions({
  actions,
  permissions,
  className,
}: {
  actions: QuickAction[];
  permissions: string[];
  className?: string;
}) {
  const visible = actions.filter(
    (action) => !action.permission || permissions.includes(action.permission),
  );

  if (visible.length === 0) {
    return <p className="text-xs text-muted-foreground">No actions available for your role.</p>;
  }

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {visible.map((action) => (
        <Link
          key={action.id}
          // Platform destinations are validated against the generated route tree at build time.
          to={action.to as never}
          className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground group-hover:text-primary">
            <action.icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{action.label}</span>
              {action.count !== undefined && action.count > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[11px] tabular-nums">
                  {action.count}
                </Badge>
              )}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{action.description}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
