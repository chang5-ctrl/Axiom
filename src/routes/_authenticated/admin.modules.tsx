import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/modules")({ component: AdminModules });

function AdminModules() {
  return (
    <>
      <PageHeader title="Module registry" description="Register and govern the modules tenants can enable." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Module registry" description="Register and govern the modules tenants can enable." />
      </Card>
    </>
  );
}
