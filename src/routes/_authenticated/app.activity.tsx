import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/activity")({ component: ActivityPage });

function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity log" description="Every meaningful action in this workspace with actor, entity and metadata." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Activity log" description="Every meaningful action in this workspace with actor, entity and metadata." />
      </Card>
    </>
  );
}
