import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/logs")({ component: AdminLogs });

function AdminLogs() {
  return (
    <>
      <PageHeader title="Platform logs" description="Cross-tenant audit trail for platform administrators." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Platform logs" description="Cross-tenant audit trail for platform administrators." />
      </Card>
    </>
  );
}
