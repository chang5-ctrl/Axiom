import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/billing")({ component: BillingPage });

function BillingPage() {
  return (
    <>
      <PageHeader title="Billing" description="Plan, subscription state and payment history. Payment provider integration comes later." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Billing" description="Plan, subscription state and payment history. Payment provider integration comes later." />
      </Card>
    </>
  );
}
