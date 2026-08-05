import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-border bg-secondary text-secondary-foreground",
  primary: "border-transparent bg-primary-soft text-primary",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning",
  danger: "border-transparent bg-destructive/15 text-destructive",
};

const STATUS_TONES: Record<string, Tone> = {
  active: "success",
  approved: "success",
  trial: "primary",
  trialing: "primary",
  pending: "warning",
  invited: "warning",
  past_due: "warning",
  suspended: "danger",
  rejected: "danger",
  expired: "danger",
  cancelled: "neutral",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: string;
}

/** Single place that maps any lifecycle status to a visual tone. */
export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md text-[11px] font-medium capitalize", TONE_CLASS[tone], className)}
    >
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
