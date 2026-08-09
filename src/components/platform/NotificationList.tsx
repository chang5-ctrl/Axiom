import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlatformNotification } from "@/types/platform";

const TONE_DOT: Record<PlatformNotification["tone"], string> = {
  neutral: "bg-muted-foreground",
  positive: "bg-success",
  warning: "bg-warning",
};

/** Shared notification list used by the overview and the notifications page. */
export function NotificationList({
  notifications,
  loading = false,
  limit,
  emptyMessage = "Nothing needs your attention right now.",
}: {
  notifications: PlatformNotification[] | undefined;
  loading?: boolean;
  limit?: number;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const items = limit ? (notifications ?? []).slice(0, limit) : (notifications ?? []);
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[item.tone])} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelative(item.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
