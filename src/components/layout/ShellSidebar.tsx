import { Link, useRouterState } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { NavSection } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface ShellNavProps {
  sections: NavSection[];
  subtitle: string;
  collapsed: boolean;
  onNavigate?: () => void;
  footer?: ReactNode;
}

function NavList({ sections, collapsed, onNavigate }: Omit<ShellNavProps, "subtitle" | "footer">) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {sections.map((section) => (
        <div key={section.id} className="space-y-1">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {section.label}
            </p>
          )}
          {section.items.map((item) => {
            const isActive =
              pathname === item.to ||
              (item.to !== "/app" && item.to !== "/admin" && pathname.startsWith(`${item.to}/`));
            return (
              <Link
                key={item.to}
                to={item.to as never}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className={cn("size-4 shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function ShellSidebar({ sections, subtitle, collapsed, footer }: ShellNavProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Logo compact={collapsed} subtitle={subtitle} />
      </div>
      <ScrollArea className="flex-1">
        <NavList sections={sections} collapsed={collapsed} />
      </ScrollArea>
      {footer && !collapsed && <div className="border-t border-sidebar-border p-3">{footer}</div>}
    </aside>
  );
}

export function ShellSidebarMobile({
  open,
  onOpenChange,
  sections,
  subtitle,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: NavSection[];
  subtitle: string;
  footer?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Logo subtitle={subtitle} />
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <NavList sections={sections} collapsed={false} onNavigate={() => onOpenChange(false)} />
          {footer && <div className="border-t border-sidebar-border p-3">{footer}</div>}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function SidebarCollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden lg:inline-flex"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
    </Button>
  );
}

export function useShellState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return {
    collapsed,
    mobileOpen,
    setMobileOpen,
    toggleCollapsed: () => setCollapsed((value) => !value),
  };
}
