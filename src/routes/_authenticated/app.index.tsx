import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, ShieldCheck, Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/")({ component: TenantDashboard });

function TenantDashboard() {
  const { membership, workspace } = useAuth();

  return (
    <>
      <PageHeader
        title={membership?.tenant.name ?? "Workspace"}
        description="Your workspace shell is ready. Business modules activate here as they ship."
        actions={membership ? <StatusBadge status={membership.tenant.status} /> : null}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team members" value={workspace?.members?.length ?? 0} icon={Users} />
        <StatCard label="Your role" value={membership?.roleKey ?? "—"} icon={ShieldCheck} />
        <StatCard label="Plan" value={workspace?.subscription?.plan?.name ?? "Trial"} icon={CreditCard} />
        <StatCard label="Active modules" value={workspace?.modules?.length ?? 0} icon={Building2} />
      </div>
      <Card className="panel p-8">
        <EmptyState
          icon={Building2}
          title="Modules coming online"
          description="Phase 0 delivers the multi-tenant core: workspaces, people, roles, billing structures and audit. CRM, Accounting, Inventory and HR plug into this shell without schema changes."
        />
      </Card>
    </>
  );
}
