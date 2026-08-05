import type { Database } from "@/integrations/supabase/types";

/**
 * Domain types for the Axiom platform core.
 *
 * Everything is derived from the generated database types so schema changes
 * surface as compile errors instead of runtime surprises.
 */

export type Tables = Database["public"]["Tables"];
export type Row<T extends keyof Tables> = Tables[T]["Row"];
export type Insert<T extends keyof Tables> = Tables[T]["Insert"];
export type Update<T extends keyof Tables> = Tables[T]["Update"];
export type Enums = Database["public"]["Enums"];

export type Tenant = Row<"tenants">;
export type TenantStatus = Enums["tenant_status"];
export type BusinessProfile = Row<"business_profiles">;
export type Profile = Row<"profiles">;
export type Membership = Row<"memberships">;
export type MembershipStatus = Enums["membership_status"];
export type Role = Row<"roles">;
export type Permission = Row<"permissions">;
export type Plan = Row<"plans">;
export type Subscription = Row<"subscriptions">;
export type SubscriptionStatus = Enums["subscription_status"];
export type Payment = Row<"payments">;
export type PaymentStatus = Enums["payment_status"];
export type PlatformModule = Row<"modules">;
export type TenantModule = Row<"tenant_modules">;
export type Setting = Row<"settings">;
export type AuditLog = Row<"audit_logs">;

/** Built-in role keys. Custom roles may add any other key at runtime. */
export const SYSTEM_ROLE_KEYS = [
  "owner",
  "admin",
  "manager",
  "sales",
  "accountant",
  "hr",
] as const;
export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];
export type RoleKey = SystemRoleKey | (string & {});

/** A membership joined with its tenant — the unit the app switches between. */
export interface TenantMembership {
  membershipId: string;
  tenantId: string;
  roleKey: RoleKey;
  roleId: string | null;
  status: MembershipStatus;
  tenant: Pick<Tenant, "id" | "name" | "slug" | "status">;
}

export interface RegistrationInput {
  businessName: string;
  email: string;
  phone: string;
  password: string;
  fullName?: string;
  businessDescription?: string;
  industry?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

/** Result shape used by every service call so callers never throw blindly. */
export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };
