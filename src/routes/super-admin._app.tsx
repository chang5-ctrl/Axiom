import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { PlatformShell } from "@/components/layout/PlatformShell";
import { supabase } from "@/integrations/supabase/client";
import { PlatformAuthProvider } from "@/providers/PlatformAuthProvider";

/**
 * Platform application gate.
 *
 * Client-only because the Supabase session lives in browser storage. Access is
 * additionally enforced inside every platform server function.
 */
export const Route = createFileRoute("/super-admin/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/super-admin/login" });
    return { user: data.user };
  },
  component: () => (
    <PlatformAuthProvider>
      <PlatformShell>
        <Outlet />
      </PlatformShell>
    </PlatformAuthProvider>
  ),
});
