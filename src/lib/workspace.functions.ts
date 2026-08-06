import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const provisionSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  industry: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  fullName: z.string().trim().max(120).optional(),
});

export type ProvisionWorkspaceInput = z.infer<typeof provisionSchema>;

/**
 * Provisions a workspace for the authenticated caller.
 *
 * The underlying SECURITY DEFINER routine is not executable by signed-in
 * users; it is only reachable through this server function, which derives the
 * user id from the verified bearer token instead of trusting client input.
 */
export const provisionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => provisionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const args: {
      _user_id: string;
      _name: string;
      _description?: string;
      _industry?: string;
      _phone?: string;
      _full_name?: string;
    } = { _user_id: context.userId, _name: data.name };
    if (data.description) args._description = data.description;
    if (data.industry) args._industry = data.industry;
    if (data.phone) args._phone = data.phone;
    if (data.fullName) args._full_name = data.fullName;

    const { data: tenantId, error } = await supabaseAdmin.rpc("provision_tenant_workspace", args);

    if (error) {
      console.error("provision_tenant_workspace failed", error);
      throw new Error("Unable to create your workspace");
    }

    return { tenantId: tenantId as string };
  });
