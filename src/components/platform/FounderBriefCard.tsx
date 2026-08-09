import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FounderBrief } from "@/types/platform";

const TONES = {
  neutral: "text-foreground",
  positive: "text-success",
  warning: "text-warning",
} as const;

/**
 * Executive summary surface. Content is generated from platform analytics on the
 * server; this component only renders what the brief provider reports.
 */
export function FounderBriefCard({
  brief,
  loading = false,
  compact = false,
  className,
}: {
  brief: FounderBrief | undefined;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}) {
  if (loading || !brief) {
    return (
      <Card className={cn("panel gap-4 p-6", className)}>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </Card>
    );
  }

  return (
    <Card className={cn("panel gap-5 p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="size-3.5" /> Founder Daily Brief
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight">{brief.greeting}</h2>
          <p className="text-xs text-muted-foreground">For {formatDate(brief.forDate)}</p>
        </div>
      </div>

      {brief.headlines.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {brief.headlines.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-surface/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </p>
              <p className={cn("mt-1 font-display text-lg font-semibold", TONES[item.tone])}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {brief.narrative.length > 0 && (
        <div className="space-y-1.5">
          {brief.narrative.map((line) => (
            <p key={line} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      )}

      {!compact && brief.recommendations.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Recommendations
          </p>
          <ul className="space-y-1.5">
            {brief.recommendations.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
