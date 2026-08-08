import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { usePlatformRoleMatrix } from "@/hooks/usePlatformEmployees";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/super-admin/_app/settings")({
  component: PlatformSettingsPage,
});

function PlatformSettingsPage() {
  const matrix = usePlatformRoleMatrix();
  const { role } = usePlatformAuth();

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Platform settings"
        description="Configuration that applies to the whole platform rather than a single workspace."
      />
      <PlatformPermissionGate permission="platform.settings.view">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Platform roles" value={formatNumber(matrix.data?.roles.length ?? 0)} />
          <StatCard label="Permissions" value={formatNumber(matrix.data?.permissions.length ?? 0)} />
          <StatCard label="Your role" value={role?.name ?? "—"} tone="primary" />
        </div>

        <SectionCard
          title="Access model"
          description="Platform staff and workspace members are separate identity systems."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Platform staff sign in at /super-admin/login and never inherit workspace membership.</li>
            <li>Workspace owners and their teams sign in at /login and never gain platform access.</li>
            <li>Permissions are stored in the database and enforced on every platform server call.</li>
            <li>Staff accounts are issued by the Platform Owner; there is no self-registration.</li>
          </ul>
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
