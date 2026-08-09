import { cn } from "@/lib/utils";

export interface UsageMeterItem {
  label: string;
  value: number;
  /** Quota for this line. Null means no quota is configured yet. */
  limit?: number | null;
  formattedValue?: string;
  detail?: string;
}

/**
 * Quota / consumption meter. Without a configured limit it shows the share of
 * the largest measured line instead of inventing a ceiling.
 */
export function UsageMeter({
  items,
  emptyMessage = "No usage recorded yet.",
}: {
  items: UsageMeterItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">{emptyMessage}</p>;

  const peak = items.reduce((max, item) => Math.max(max, item.value), 0);

  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const ceiling = item.limit ?? peak;
        const share = ceiling > 0 ? Math.min((item.value / ceiling) * 100, 100) : 0;
        const near = item.limit != null && share >= 80;

        return (
          <li key={item.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item.formattedValue ?? item.value.toLocaleString()}
                {item.limit != null && ` / ${item.limit.toLocaleString()}`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full", near ? "bg-warning" : "bg-primary")}
                style={{ width: `${Math.max(share, item.value > 0 ? 2 : 0)}%` }}
              />
            </div>
            {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
          </li>
        );
      })}
    </ul>
  );
}
