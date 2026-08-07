import {
  Activity,
  BadgeDollarSign,
  Bell,
  Blocks,
  Building2,
  CreditCard,
  Flag,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  UserCircle,
  Car,
  Calendar,
  Database,
  FileClock,
  HardDrive,
  HeartPulse,
  Receipt,
  Sparkles,
  Sunrise,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Route path, must match an existing route file. */
  to: string;
  label: string;
  icon: LucideIcon;
  /** Permission key required to see this item. Undefined = visible to all members. */
  permission?: string;
  /** Module key this item belongs to; hidden when the module is disabled for the tenant. */
  module?: string;
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/** Tenant workspace navigation. Future modules append sections here. */
export const TENANT_NAV: NavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
      { to: "/app/notifications", label: "Notifications", icon: Bell },
      { to: "/app/modules", label: "Modules", icon: Blocks, permission: "core.modules.view" },
    ],
  },
  {
    id: "organisation",
    label: "Organisation",
    items: [
      { to: "/app/team", label: "Team & Roles", icon: Users, permission: "core.members.view" },
      { to: "/app/business", label: "Business Profile", icon: Building2, permission: "core.tenant.view" },
      { to: "/app/billing", label: "Billing", icon: CreditCard, permission: "core.billing.view" },
      { to: "/app/activity", label: "Activity Log", icon: Activity, permission: "core.audit.view" },
    ],
  },
  {
    id: "automotive",
    label: "Automotive",
    items: [
      { to: "/app/automotive", label: "Overview", icon: Car, module: "automotive" },
      { to: "/app/automotive/vehicles", label: "Vehicles", icon: Car, module: "automotive", permission: "automotive.vehicles.view" },
      { to: "/app/automotive/customers", label: "Customers", icon: Users, module: "automotive", permission: "automotive.customers.manage" },
      { to: "/app/automotive/sales", label: "Sales", icon: BadgeDollarSign, module: "automotive", permission: "automotive.sales.manage" },
      { to: "/app/automotive/reservations", label: "Reservations", icon: Calendar, module: "automotive", permission: "automotive.reservations.manage" },
      { to: "/app/automotive/documents", label: "Documents", icon: ScrollText, module: "automotive", permission: "automotive.reports.view" },
      { to: "/app/automotive/reports", label: "Reports", icon: ScrollText, module: "automotive", permission: "automotive.reports.view" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { to: "/app/profile", label: "Profile", icon: UserCircle },
      { to: "/app/settings", label: "Settings", icon: Settings, permission: "core.settings.view" },
    ],
  },
];

/** Platform control-centre navigation (super admin only). */
export const SUPER_ADMIN_NAV: NavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { to: "/super-admin", label: "Overview", icon: Gauge },
      { to: "/super-admin/brief", label: "Founder Daily Brief", icon: Sunrise },
      { to: "/super-admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    items: [
      { to: "/super-admin/revenue", label: "Revenue", icon: BadgeDollarSign },
      { to: "/super-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { to: "/super-admin/payments", label: "Pending Payments", icon: Receipt },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { to: "/super-admin/tenants", label: "Tenants", icon: Building2 },
      { to: "/super-admin/business-health", label: "Business Health", icon: HeartPulse },
      { to: "/super-admin/support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { to: "/super-admin/analytics", label: "Platform Analytics", icon: Activity },
      { to: "/super-admin/active-users", label: "Active Users", icon: Users },
      { to: "/super-admin/modules", label: "Modules", icon: Blocks },
      { to: "/super-admin/ai-usage", label: "AI Usage", icon: Sparkles },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    items: [
      { to: "/super-admin/system-health", label: "System Health", icon: ShieldCheck },
      { to: "/super-admin/database", label: "Database", icon: Database },
      { to: "/super-admin/storage", label: "Storage", icon: HardDrive },
      { to: "/super-admin/logs", label: "Logs", icon: ScrollText },
      { to: "/super-admin/audit-logs", label: "Audit Logs", icon: FileClock },
    ],
  },
  {
    id: "control",
    label: "Control",
    items: [
      { to: "/super-admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/super-admin/feature-flags", label: "Feature Flags", icon: Flag },
      { to: "/super-admin/settings", label: "Settings", icon: Settings },
    ],
  },
];
