/**
 * Platform (internal staff) identity types.
 *
 * The platform application is a separate product surface from tenant
 * workspaces: platform staff have their own roles, permissions and login
 * experience and never inherit workspace membership.
 */

export type PlatformRoleKey =
  | "platform_owner"
  | "super_admin"
  | "operations_manager"
  | "finance_admin"
  | "support_engineer"
  | "developer"
  | "security_auditor";

export type PlatformEmployeeStatus = "invited" | "active" | "suspended";

export interface PlatformRole {
  key: string;
  name: string;
  description: string | null;
  level: number;
}

export interface PlatformEmployee {
  id: string;
  userId: string | null;
  email: string;
  fullName: string | null;
  department: string | null;
  roleKey: string;
  roleName: string;
  status: PlatformEmployeeStatus;
  isSeed: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Resolved identity for the signed-in platform employee. */
export interface PlatformSession {
  employee: PlatformEmployee | null;
  role: PlatformRole | null;
  permissions: string[];
  /** True when the signed-in account is an active platform employee. */
  isStaff: boolean;
}

export interface PlatformLoginEvent {
  id: string;
  employeeId: string | null;
  email: string | null;
  event: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PlatformRolePermissionMatrix {
  roles: PlatformRole[];
  permissions: { key: string; module: string; action: string; description: string | null }[];
  assignments: Record<string, string[]>;
}
