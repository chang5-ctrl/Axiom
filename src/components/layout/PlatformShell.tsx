import { Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, LogOut, Menu, ShieldAlert, ShieldCheck, UserCircle } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import {
  ShellSidebar,
  ShellSidebarMobile,
  SidebarCollapseButton,
  useShellState,
} from "@/components/layout/ShellSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { visiblePlatformNav } from "@/config/platform-nav";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";

function initials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "A";
  return source
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Platform application shell.
 *
 * Navigation is derived from the employee's database-backed permission set;
 * server functions enforce the same permissions independently.
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useShellState();
  const navigate = useNavigate();
  const { employee, role, permissions, isStaff, isLoading, signOut } = usePlatformAuth();

  const sections = visiblePlatformNav(permissions);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/super-admin/login", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ShellSidebar sections={sections} subtitle="Platform Console" collapsed={collapsed} />
      <ShellSidebarMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sections={sections}
        subtitle="Platform Console"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-4" />
          </Button>
          <SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
          <Badge variant="outline" className="gap-1.5 border-transparent bg-primary-soft text-primary">
            <ShieldCheck className="size-3.5" /> Axiom Platform
          </Badge>
          {role && (
            <Badge variant="outline" className="hidden sm:inline-flex">
              {role.name}
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[11px]">
                      {initials(employee?.fullName, employee?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[160px] truncate text-sm font-medium sm:inline">
                    {employee?.fullName ?? employee?.email ?? "Platform staff"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="truncate text-sm font-medium">{employee?.fullName ?? "Platform staff"}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{employee?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/super-admin/profile">
                    <UserCircle className="mr-2 size-4" /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/super-admin/access">
                    <KeyRound className="mr-2 size-4" /> Roles &amp; access
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {employee?.mustChangePassword && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                <span>Your password was issued by an administrator. Set a new password to secure your account.</span>
                <Button asChild size="sm" variant="outline">
                  <Link to="/super-admin/profile">Change password</Link>
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : isStaff ? (
              children
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="Platform access required"
                description="This console is restricted to Axiom platform staff. Your account is not registered as an internal employee."
                action={
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign out
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

/** Guard for pages that need a specific platform permission. */
export function PlatformPermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { can, isLoading } = usePlatformAuth();
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!can(permission)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Not permitted"
        description="Your platform role does not include access to this area. Contact the Platform Owner if you need it."
      />
    );
  }
  return <>{children}</>;
}
