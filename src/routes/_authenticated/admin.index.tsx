import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, Layers, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/_authenticated/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  return (
    <>
      <PageHeader title="Platform overview" description="Cross-tenant health, billing and module governance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tenants" value="—" icon={Building2} />
        <StatCard label="Users" value="—" icon={Users} />
        <StatCard label="Subscriptions" value="—" icon={CreditCard} />
        <StatCard label="Modules" value="—" icon={Layers} />
      </div>
      <Card className="panel p-8">
        <EmptyState
          icon={Layers}
          title="Platform analytics land in Phase 1"
          description="The super admin console is intentionally separate from tenant workspaces and reads aggregate data through platform-admin policies."
        />
      </Card>
    </>
  );
}
