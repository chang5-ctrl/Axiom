import { supabase, unwrap } from "./service-utils";
import type {
  AuditLog,
  BusinessProfile,
  Membership,
  PlatformModule,
  Plan,
  Setting,
  Subscription,
  Tenant,
  TenantMembership,
  TenantModule,
} from "@/types/core";

export type { TenantMembership };

export interface TenantWorkspace {
  tenant: Tenant;
  businessProfile: BusinessProfile | null;
  subscription: (Subscription & { plan: Plan | null }) | null;
  modules: TenantModule[];
  permissions: string[];
}

/** Everything tenant-scoped goes through this service so isolation stays in one place. */
export const tenantService = {
  async listMemberships(userId: string): Promise<TenantMembership[]> {
    const rows = unwrap(
      await supabase
        .from("memberships")
        .select("id, tenant_id, role_id, role_key, status, tenants(id, name, slug, status)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    );

    return (rows ?? [])
      .filter((row) => row.tenants !== null)
      .map((row) => ({
        membershipId: row.id,
        tenantId: row.tenant_id,
        roleId: row.role_id,
        roleKey: row.role_key,
        status: row.status,
        tenant: row.tenants as TenantMembership["tenant"],
      }));
  },

  async loadWorkspace(tenantId: string, membership: TenantMembership): Promise<TenantWorkspace> {
    const [tenant, businessProfile, subscription, modules, permissions] = await Promise.all([
      supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle(),
      supabase.from("business_profiles").select("*").eq("tenant_id", tenantId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("tenant_modules").select("*").eq("tenant_id", tenantId),
      tenantService.listRolePermissions(membership.roleId),
    ]);

    const tenantRow = unwrap(tenant);
    if (!tenantRow) throw new Error("Workspace not found");

    return {
      tenant: tenantRow,
      businessProfile: unwrap(businessProfile),
      subscription: unwrap(subscription) as TenantWorkspace["subscription"],
      modules: unwrap(modules) ?? [],
      permissions,
    };
  },

  async listRolePermissions(roleId: string | null): Promise<string[]> {
    if (!roleId) return [];
    const rows = unwrap(
      await supabase.from("role_permissions").select("permissions(key)").eq("role_id", roleId),
    );
    return (rows ?? [])
      .map((row) => (row.permissions as { key: string } | null)?.key)
      .filter((key): key is string => Boolean(key));
  },

  async listMembers(tenantId: string): Promise<(Membership & { profile: unknown })[]> {
    return (
      unwrap(
        await supabase
          .from("memberships")
          .select("*, profile:profiles(id, full_name, email, phone, avatar_url)")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: true }),
      ) ?? []
    );
  },

  async listRoles(tenantId: string) {
    return (
      unwrap(
        await supabase
          .from("roles")
          .select("*")
          .or(`tenant_id.is.null,tenant_id.eq.${tenantId}`)
          .order("level", { ascending: true }),
      ) ?? []
    );
  },

  async listAvailableModules(): Promise<PlatformModule[]> {
    return (
      unwrap(await supabase.from("modules").select("*").order("sort_order", { ascending: true })) ??
      []
    );
  },

  async listAuditLogs(tenantId: string, limit = 25): Promise<AuditLog[]> {
    return (
      unwrap(
        await supabase
          .from("audit_logs")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false })
          .limit(limit),
      ) ?? []
    );
  },

  async listSettings(tenantId: string): Promise<Setting[]> {
    return unwrap(await supabase.from("settings").select("*").eq("tenant_id", tenantId)) ?? [];
  },

  async recordAudit(input: {
    tenantId: string;
    actorId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await supabase.from("audit_logs").insert({
      tenant_id: input.tenantId,
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  },
};
