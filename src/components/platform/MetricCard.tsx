import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { Sparkline } from "@/components/platform/Sparkline";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TimeSeriesPoint } from "@/types/platform";

export type MetricTone = "default" | "primary" | "success" | "warning" | "danger";

export interface MetricDelta {
  /** Signed change. Null means "not measurable yet" and renders as a dash. */
  value: number | null;
  label: string;
  /** Set when a decrease is the desirable direction (e.g. pending payments). */
  invert?: boolean;
}

export interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: MetricTone;
  delta?: MetricDelta;
  /** Optional inline trend rendered under the value. */
  series?: TimeSeriesPoint[];
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
}

const ICON_TONES: Record<MetricTone, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

function DeltaBadge({ delta }: { delta: MetricDelta }) {
  if (delta.value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="size-3" />
        {delta.label}
      </span>
    );
  }

  const improved = delta.invert ? delta.value < 0 : delta.value > 0;
  const flat = delta.value === 0;
  const Icon = flat ? ArrowRight : delta.value > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        flat ? "text-muted-foreground" : improved ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3" />
      <span className="tabular-nums">{`${delta.value > 0 ? "+" : ""}${delta.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}`}</span>
      <span className="font-normal text-muted-foreground">{delta.label}</span>
    </span>
  );
}

/**
 * The single metric primitive for the control centre: value, optional
 * comparison and optional inline trend. Every input comes from backend data —
 * unavailable values are passed as "—" rather than substituted.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delta,
  series,
  footer,
  loading = false,
  className,
}: MetricCardProps) {
  if (loading) return <Skeleton className={cn("h-[132px] w-full rounded-xl", className)} />;

  return (
    <Card className={cn("panel gap-0 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className={cn("grid size-8 place-items-center rounded-md bg-secondary", ICON_TONES[tone])}>
            <Icon className="size-4" />
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums">{value}</p>

      {(hint || delta) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {delta && <DeltaBadge delta={delta} />}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}

      {series && series.length > 0 && (
        <div className="mt-3 -mx-1">
          <Sparkline data={series} tone={tone === "warning" ? "warning" : tone === "success" ? "success" : "primary"} />
        </div>
      )}

      {footer && <div className="mt-3 text-xs text-muted-foreground">{footer}</div>}
    </Card>
  );
}

/** Responsive metric grid with a matching skeleton state. */
export function MetricGrid({
  children,
  columns = 4,
  loading = false,
  skeletonCount,
  className,
}: {
  children?: ReactNode;
  columns?: 2 | 3 | 4;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}) {
  const columnClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4", columnClass, className)}>
      {loading
        ? Array.from({ length: skeletonCount ?? columns * 2 }).map((_, index) => (
            <Skeleton key={index} className="h-[132px] w-full rounded-xl" />
          ))
        : children}
    </div>
  );
}
