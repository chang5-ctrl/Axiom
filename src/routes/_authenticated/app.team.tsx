import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/team")({ component: TeamPage });

function TeamPage() {
  return (
    <>
      <PageHeader title="Team & roles" description="Invite people and assign roles. Roles and permissions are data, so custom roles need no code." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Team & roles" description="Invite people and assign roles. Roles and permissions are data, so custom roles need no code." />
      </Card>
    </>
  );
}
