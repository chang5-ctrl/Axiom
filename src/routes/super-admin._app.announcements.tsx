import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/usePlatform";
import { formatDateTime, titleCase } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { data, isPending } = useAnnouncements();
  return (
    <>
      <PageHeader eyebrow="Control" title="Announcements" description="Messages published to workspace owners and admins." />
      <PlatformPermissionGate permission="platform.announcements.view">
        <SectionCard title="Published & drafts">
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(data ?? []).map((item) => (
                <li key={item.id} className="space-y-1 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge variant="outline">{item.publishedAt ? "Published" : "Draft"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {titleCase(item.audience)} · {formatDateTime(item.publishedAt ?? item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
