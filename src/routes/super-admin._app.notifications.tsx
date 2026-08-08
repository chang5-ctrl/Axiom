import { createFileRoute } from "@tanstack/react-router";

import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/platform/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformNotifications } from "@/hooks/usePlatform";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data, isPending } = usePlatformNotifications();
  return (
    <>
      <PageHeader eyebrow="Command" title="Notifications" description="Platform events that need a human decision." />
      <PlatformPermissionGate permission="platform.notifications.view">
        <SectionCard title="Recent events">
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(data ?? []).map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
