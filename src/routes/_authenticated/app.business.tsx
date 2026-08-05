import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/business")({ component: BusinessPage });

function BusinessPage() {
  return (
    <>
      <PageHeader title="Business profile" description="Legal name, industry, address and branding for this workspace." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Business profile" description="Legal name, industry, address and branding for this workspace." />
      </Card>
    </>
  );
}
