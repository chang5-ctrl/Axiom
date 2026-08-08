import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/platform/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { usePlatformRoleMatrix } from "@/hooks/usePlatformEmployees";

export const Route = createFileRoute("/super-admin/_app/access")({
  component: AccessPage,
});

function AccessPage() {
  const { role, permissions } = usePlatformAuth();
  const matrix = usePlatformRoleMatrix();

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Roles & access"
        description="Platform permissions are stored in the database, so access can change without a release."
      />

      <SectionCard title="Your access" description={role?.name ?? "No platform role"}>
        {permissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No permissions granted.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="font-mono text-[11px]">
                {permission}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Platform roles">
        {matrix.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-5">
            {(matrix.data?.roles ?? []).map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <Badge variant="outline">{(matrix.data?.assignments[item.key] ?? []).length} permissions</Badge>
                </div>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {(matrix.data?.assignments[item.key] ?? []).map((permission) => (
                    <Badge key={permission} variant="secondary" className="font-mono text-[11px]">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
