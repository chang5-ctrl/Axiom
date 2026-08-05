import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <>
      <PageHeader title="Workspace settings" description="Locale, currency, timezone and workspace-level preferences." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Workspace settings" description="Locale, currency, timezone and workspace-level preferences." />
      </Card>
    </>
  );
}
