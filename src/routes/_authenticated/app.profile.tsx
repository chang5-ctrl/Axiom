import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <>
      <PageHeader title="Your profile" description="Your name, contact details and account preferences." />
      <Card className="panel p-8">
        <EmptyState icon={Layers} title="Your profile" description="Your name, contact details and account preferences." />
      </Card>
    </>
  );
}
