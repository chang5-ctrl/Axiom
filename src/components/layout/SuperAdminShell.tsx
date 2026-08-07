import { Link, Outlet } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import {
  ShellSidebar,
  ShellSidebarMobile,
  SidebarCollapseButton,
  useShellState,
} from "@/components/layout/ShellSidebar";
import { ShellTopbar } from "@/components/layout/ShellTopbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPER_ADMIN_NAV } from "@/config/navigation";
import { usePlatformAccess } from "@/hooks/usePlatform";

/**
 * Platform control centre shell. Access is enforced server-side on every
 * platform server function; this gate only decides what to render.
 */
export function SuperAdminShell() {
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useShellState();
  const access = usePlatformAccess();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ShellSidebar sections={SUPER_ADMIN_NAV} subtitle="Control Centre" collapsed={collapsed} />
      <ShellSidebarMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sections={SUPER_ADMIN_NAV}
        subtitle="Control Centre"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopbar
          onOpenMobileNav={() => setMobileOpen(true)}
          collapseButton={<SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />}
          left={
            <Badge variant="outline" className="gap-1.5 border-transparent bg-primary-soft text-primary">
              <ShieldCheck className="size-3.5" /> Platform Control Centre
            </Badge>
          }
          profileHref="/super-admin/settings"
          settingsHref="/super-admin/settings"
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {access.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : access.data?.allowed ? (
              <Outlet />
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="Platform access required"
                description="This console is restricted to Axiom platform administrators. Your account is not registered as one."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app">Return to workspace</Link>
                  </Button>
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
