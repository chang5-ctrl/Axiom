import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/tenants")({ component: AdminTenants });

function AdminTenants() {
  return (
    <>
      <PageHeader title="Tenants" description="Every business workspace on the platform, with status and plan." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Tenants" description="Every business workspace on the platform, with status and plan." />
      </Card>
    </>
  );
}
