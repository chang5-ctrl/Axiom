import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/payments")({ component: AdminPayments });

function AdminPayments() {
  return (
    <>
      <PageHeader title="Payments" description="Recorded payments and their states. No gateway connected yet." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Payments" description="Recorded payments and their states. No gateway connected yet." />
      </Card>
    </>
  );
}
