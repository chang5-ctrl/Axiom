import { cn } from "@/lib/utils";
import type { HealthProbe } from "@/types/platform";

const STATUS_STYLES: Record<HealthProbe["status"], { dot: string; label: string; text: string }> = {
  operational: { dot: "bg-success", label: "Operational", text: "text-success" },
  degraded: { dot: "bg-warning", label: "Degraded", text: "text-warning" },
  down: { dot: "bg-destructive", label: "Down", text: "text-destructive" },
  unmonitored: { dot: "bg-muted-foreground", label: "Not monitored", text: "text-muted-foreground" },
};

/** Renders live probe results; unmonitored dependencies say so rather than faking green. */
export function HealthProbeList({ probes }: { probes: HealthProbe[] }) {
  if (probes.length === 0) {
    return <p className="text-xs text-muted-foreground">No probes registered.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {probes.map((probe) => {
        const style = STATUS_STYLES[probe.status];
        return (
          <li key={probe.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-start gap-3">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", style.dot)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{probe.label}</p>
                <p className="truncate text-xs text-muted-foreground">{probe.detail}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn("text-xs font-semibold", style.text)}>{style.label}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {probe.latencyMs === null ? "—" : `${probe.latencyMs} ms`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
