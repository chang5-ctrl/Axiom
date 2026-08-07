import { createFileRoute } from "@tanstack/react-router";

import { SuperAdminShell } from "@/components/layout/SuperAdminShell";

export const Route = createFileRoute("/_authenticated/super-admin")({
  component: SuperAdminShell,
});
