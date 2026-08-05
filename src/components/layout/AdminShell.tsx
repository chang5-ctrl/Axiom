import { Outlet } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import {
  ShellSidebar,
  ShellSidebarMobile,
  SidebarCollapseButton,
  useShellState,
} from "@/components/layout/ShellSidebar";
import { ShellTopbar } from "@/components/layout/ShellTopbar";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/config/navigation";

/** Platform (super admin) shell — deliberately separate from the tenant shell. */
export function AdminShell() {
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useShellState();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ShellSidebar sections={ADMIN_NAV} subtitle="Platform" collapsed={collapsed} />
      <ShellSidebarMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sections={ADMIN_NAV}
        subtitle="Platform"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopbar
          onOpenMobileNav={() => setMobileOpen(true)}
          collapseButton={
            <SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
          }
          left={
            <Badge variant="outline" className="gap-1.5 border-transparent bg-primary-soft text-primary">
              <ShieldCheck className="size-3.5" /> Super Admin Console
            </Badge>
          }
          profileHref="/admin/settings"
          settingsHref="/admin/settings"
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
