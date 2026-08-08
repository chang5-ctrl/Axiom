import {
  BadgeDollarSign,
  Bell,
  Building2,
  CreditCard,
  Database,
  FileClock,
  Flag,
  Gauge,
  HardDrive,
  KeyRound,
  LifeBuoy,
  Megaphone,
  Receipt,
  Settings,
  ShieldCheck,
  Sunrise,
  UserCircle,
  Users,
} from "lucide-react";

import type { NavSection } from "@/config/navigation";
import type { PlatformRoleKey } from "@/types/platform-auth";

/**
 * Platform application navigation.
 *
 * Every destination declares the platform permission required to see it, so
 * the sidebar is derived from database-backed RBAC rather than hardcoded roles.
 */
export const PLATFORM_NAV: NavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { to: "/super-admin", label: "Overview", icon: Gauge, permission: "platform.overview.view" },
      { to: "/super-admin/brief", label: "Founder Daily Brief", icon: Sunrise, permission: "platform.brief.view" },
      { to: "/super-admin/notifications", label: "Notifications", icon: Bell, permission: "platform.notifications.view" },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    items: [
      { to: "/super-admin/revenue", label: "Revenue", icon: BadgeDollarSign, permission: "platform.revenue.view" },
      { to: "/super-admin/subscriptions", label: "Subscriptions", icon: CreditCard, permission: "platform.subscriptions.view" },
      { to: "/super-admin/payments", label: "Pending Payments", icon: Receipt, permission: "platform.payments.view" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { to: "/super-admin/tenants", label: "Workspaces", icon: Building2, permission: "platform.tenants.view" },
      { to: "/super-admin/support", label: "Support", icon: LifeBuoy, permission: "platform.support.view" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    items: [
      { to: "/super-admin/system-health", label: "System Health", icon: ShieldCheck, permission: "platform.health.view" },
      { to: "/super-admin/database", label: "Database", icon: Database, permission: "platform.database.view" },
      { to: "/super-admin/storage", label: "Storage", icon: HardDrive, permission: "platform.storage.view" },
      { to: "/super-admin/audit-logs", label: "Audit Logs", icon: FileClock, permission: "platform.audit.view" },
    ],
  },
  {
    id: "control",
    label: "Control",
    items: [
      { to: "/super-admin/feature-flags", label: "Feature Flags", icon: Flag, permission: "platform.flags.view" },
      { to: "/super-admin/announcements", label: "Announcements", icon: Megaphone, permission: "platform.announcements.view" },
    ],
  },
  {
    id: "organisation",
    label: "Organisation",
    items: [
      { to: "/super-admin/employees", label: "Employees", icon: Users, permission: "platform.employees.view" },
      { to: "/super-admin/access", label: "Roles & Access", icon: KeyRound },
      { to: "/super-admin/profile", label: "My Profile", icon: UserCircle },
      { to: "/super-admin/settings", label: "Settings", icon: Settings, permission: "platform.settings.view" },
    ],
  },
];

/** Landing page for each platform role after sign-in. */
export const PLATFORM_ROLE_HOME: Record<PlatformRoleKey, string> = {
  platform_owner: "/super-admin",
  super_admin: "/super-admin",
  operations_manager: "/super-admin/tenants",
  finance_admin: "/super-admin/revenue",
  support_engineer: "/super-admin/support",
  developer: "/super-admin/system-health",
  security_auditor: "/super-admin/audit-logs",
};

export function platformHomeFor(roleKey: string | null | undefined): string {
  if (!roleKey) return "/super-admin";
  return PLATFORM_ROLE_HOME[roleKey as PlatformRoleKey] ?? "/super-admin";
}

/** Nav sections visible to a permission set. */
export function visiblePlatformNav(permissions: string[]): NavSection[] {
  return PLATFORM_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || permissions.includes(item.permission)),
  })).filter((section) => section.items.length > 0);
}
