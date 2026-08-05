import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({ component: AdminSubscriptions });

function AdminSubscriptions() {
  return (
    <>
      <PageHeader title="Subscriptions" description="Plan assignments, trial states and renewals across tenants." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Subscriptions" description="Plan assignments, trial states and renewals across tenants." />
      </Card>
    </>
  );
}
