import { supabase, unwrap } from "./service-utils";
import type { Payment, Plan, Subscription } from "@/types/core";

/**
 * Billing service. Phase 0 is data + UI only — no payment gateway.
 * A provider adapter can be added behind these methods later.
 */
export const billingService = {
  async listPlans(): Promise<Plan[]> {
    return (
      unwrap(
        await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ) ?? []
    );
  },

  async listPayments(tenantId: string): Promise<Payment[]> {
    return (
      unwrap(
        await supabase
          .from("payments")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },

  async getSubscription(tenantId: string): Promise<(Subscription & { plan: Plan | null }) | null> {
    return unwrap(
      await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ) as (Subscription & { plan: Plan | null }) | null;
  },
};
