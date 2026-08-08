import { createFileRoute } from "@tanstack/react-router";

import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { useFeatureFlags, useSaveFeatureFlag } from "@/hooks/usePlatform";

export const Route = createFileRoute("/super-admin/_app/feature-flags")({
  component: FeatureFlagsPage,
});

function FeatureFlagsPage() {
  const { data, isPending } = useFeatureFlags();
  const save = useSaveFeatureFlag();
  const { can } = usePlatformAuth();

  return (
    <>
      <PageHeader eyebrow="Control" title="Feature flags" description="Roll capabilities out platform-wide or per workspace." />
      <PlatformPermissionGate permission="platform.flags.view">
        <SectionCard title="Flags">
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature flags defined yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(data ?? []).map((flag) => (
                <li key={flag.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{flag.label}</p>
                    <p className="text-xs text-muted-foreground">{flag.description ?? flag.key}</p>
                  </div>
                  <Switch
                    checked={flag.isEnabled}
                    disabled={!can("platform.flags.manage") || save.isPending}
                    onCheckedChange={(checked) =>
                      save.mutate(
                        { key: flag.key, label: flag.label, isEnabled: checked },
                        { onSuccess: () => toast.success("Feature flag updated") },
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
