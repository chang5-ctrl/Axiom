import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Settings, UserCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export interface ShellTopbarProps {
  onOpenMobileNav: () => void;
  collapseButton?: ReactNode;
  left?: ReactNode;
  profileHref: "/app/profile" | "/admin/settings";
  settingsHref: "/app/settings" | "/admin/settings";
  notificationsHref?: "/app/notifications";
}

function initials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "U";
  return source
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ShellTopbar({
  onOpenMobileNav,
  collapseButton,
  left,
  profileHref,
  settingsHref,
  notificationsHref,
}: ShellTopbarProps) {
  const { profile, user, membership, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
        <Menu className="size-4" />
      </Button>
      {collapseButton}
      <div className="flex min-w-0 flex-1 items-center gap-3">{left}</div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">Workspace and platform activity</p>
          </div>
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </div>
          {notificationsHref && (
            <div className="border-t border-border p-2">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to={notificationsHref as never}>View all</Link>
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("h-10 gap-2 px-2")}>
            <Avatar className="size-7">
              <AvatarFallback className="bg-secondary text-xs font-semibold">
                {initials(profile?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">
              {profile?.full_name ?? user?.email ?? "Account"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="space-y-0.5">
            <span className="block truncate text-sm">{profile?.full_name ?? "Account"}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user?.email}
            </span>
            {membership && (
              <span className="block text-xs font-normal capitalize text-primary">
                {membership.roleKey}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={profileHref as never} className="flex items-center gap-2">
              <UserCircle className="size-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={settingsHref as never} className="flex items-center gap-2">
              <Settings className="size-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleSignOut()} className="gap-2">
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
