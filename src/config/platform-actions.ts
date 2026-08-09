import {
  BadgeDollarSign,
  Building2,
  FileClock,
  Flag,
  LifeBuoy,
  Megaphone,
  Receipt,
  Users,
} from "lucide-react";

import type { QuickAction } from "@/components/platform/QuickActions";

/**
 * Operator shortcuts surfaced on the executive overview.
 *
 * Counts are injected at render time from the live snapshot so the badge always
 * reflects real queue depth.
 */
export function platformQuickActions(counts: {
  pendingPayments?: number | undefined;
  openSupport?: number | undefined;
  trialBusinesses?: number | undefined;
}): QuickAction[] {
  return [
    {
      id: "review-payments",
      label: "Review pending payments",
      description: "Approve or reject manual transfers",
      icon: Receipt,
      to: "/super-admin/payments",
      count: counts.pendingPayments,
      permission: "platform.payments.view",
    },
    {
      id: "support",
      label: "Answer support requests",
      description: "Open workspace tickets",
      icon: LifeBuoy,
      to: "/super-admin/support",
      count: counts.openSupport,
      permission: "platform.support.view",
    },
    {
      id: "businesses",
      label: "Inspect businesses",
      description: "Segments, plans and lifecycle",
      icon: Building2,
      to: "/super-admin/businesses",
      count: counts.trialBusinesses,
      permission: "platform.tenants.view",
    },
    {
      id: "revenue",
      label: "Open revenue analytics",
      description: "MRR, ARR and collections",
      icon: BadgeDollarSign,
      to: "/super-admin/revenue",
      permission: "platform.revenue.view",
    },
    {
      id: "flags",
      label: "Manage feature flags",
      description: "Roll capabilities out safely",
      icon: Flag,
      to: "/super-admin/feature-flags",
      permission: "platform.flags.view",
    },
    {
      id: "announce",
      label: "Publish an announcement",
      description: "Broadcast to workspace owners",
      icon: Megaphone,
      to: "/super-admin/announcements",
      permission: "platform.announcements.view",
    },
    {
      id: "employees",
      label: "Manage platform staff",
      description: "Invite employees and set roles",
      icon: Users,
      to: "/super-admin/employees",
      permission: "platform.employees.view",
    },
    {
      id: "audit",
      label: "Inspect audit trail",
      description: "Every privileged action, immutable",
      icon: FileClock,
      to: "/super-admin/audit-logs",
      permission: "platform.audit.view",
    },
  ];
}
