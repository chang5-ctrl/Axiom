import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, titleCase } from "@/lib/format";
import type { PlatformAuditRow } from "@/types/platform";

/** Audit-backed activity stream. Entries are immutable platform events. */
export function ActivityFeed({
  rows,
  loading = false,
  limit = 12,
  emptyMessage = "No platform activity recorded yet.",
}: {
  rows: PlatformAuditRow[] | undefined;
  loading?: boolean;
  limit?: number;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const items = (rows ?? []).slice(0, limit);
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <ol className="relative space-y-4 border-l border-border pl-4">
      {items.map((row) => (
        <li key={row.id} className="relative">
          <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">{titleCase(row.action)}</p>
            <span className="text-xs text-muted-foreground">{formatDateTime(row.createdAt)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {row.tenantName ?? "Platform"}
            {row.entityType ? ` · ${row.entityType}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
