import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/modules")({ component: ModulesPage });

function ModulesPage() {
  return (
    <>
      <PageHeader title="Modules" description="Switch capabilities on for this workspace as they become available." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Modules" description="Switch capabilities on for this workspace as they become available." />
      </Card>
    </>
  );
}
