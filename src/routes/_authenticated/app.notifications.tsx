import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Workspace alerts and system messages." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Notifications" description="Workspace alerts and system messages." />
      </Card>
    </>
  );
}
