import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  return (
    <>
      <PageHeader title="Platform settings" description="Global defaults, feature flags and administrator access." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Platform settings" description="Global defaults, feature flags and administrator access." />
      </Card>
    </>
  );
}
