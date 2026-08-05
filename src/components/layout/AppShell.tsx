import { Outlet } from '@tanstack/react-router';
import { Building2, ChevronsUpDown } from 'lucide-react';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/common/StatusBadge';
import {
  ShellSidebar,
  ShellSidebarMobile,
  SidebarCollapseButton,
  useShellState,
} from '@/components/layout/ShellSidebar';
import { ShellTopbar } from '@/components/layout/ShellTopbar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDynamicNavigation } from '@/hooks/useDynamicNavigation';

function WorkspaceSwitcher() {
  const { memberships, membership, workspace, switchTenant } = useAuth();

  if (!membership) return <Skeleton className="h-9 w-44" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 max-w-[260px] gap-2 px-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-primary">
            <Building2 className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span className="max-w-[160px] truncate text-sm font-semibold">
              {membership.tenant.name}
            </span>
            <span className="text-[11px] capitalize text-muted-foreground">
              {membership.roleKey}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {memberships.map((item) => (
          <DropdownMenuItem
            key={item.tenantId}
            onSelect={() => switchTenant(item.tenantId)}
            className="flex items-center justify-between gap-2"
          >
            <span className="truncate">{item.tenant.name}</span>
            <StatusBadge status={item.tenant.status} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {workspace?.subscription?.plan?.name ?? 'No plan'} ·{' '}
          {workspace?.subscription?.status ?? 'inactive'}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Tenant workspace shell: sidebar, top navigation, notifications, profile. */
export function AppShell() {
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useShellState();
  const sections = useDynamicNavigation();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ShellSidebar sections={sections} subtitle="Workspace" collapsed={collapsed} />
      <ShellSidebarMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sections={sections}
        subtitle="Workspace"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopbar
          onOpenMobileNav={() => setMobileOpen(true)}
          collapseButton={
            <SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
          }
          left={<WorkspaceSwitcher />}
          profileHref="/app/profile"
          settingsHref="/app/settings"
          notificationsHref="/app/notifications"
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
