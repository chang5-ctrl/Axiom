import { supabase, unwrap } from "./service-utils";

/** Platform (super admin) service. Reads are gated by platform-admin access rules. */
export const platformService = {
  async isPlatformAdmin(userId: string): Promise<boolean> {
    const row = unwrap(
      await supabase.from("platform_admins").select("user_id").eq("user_id", userId).maybeSingle(),
    );
    return Boolean(row);
  },

  async countTenants(): Promise<number> {
    const { count, error } = await supabase
      .from("tenants")
      .select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async listTenants(limit = 50) {
    return (
      unwrap(
        await supabase
          .from("tenants")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit),
      ) ?? []
    );
  },
};
