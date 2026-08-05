import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/plans")({ component: AdminPlans });

function AdminPlans() {
  return (
    <>
      <PageHeader title="Plans" description="Pricing tiers, limits and feature lists." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Plans" description="Pricing tiers, limits and feature lists." />
      </Card>
    </>
  );
}
