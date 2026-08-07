import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Platform control-centre RPC surface.
 *
 * Thin wrappers only: every handler verifies platform-admin membership through
 * the caller's own RLS client before loading the privileged data layer.
 */

const tenantFiltersSchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  industry: z.string().trim().max(120).optional(),
  plan: z.string().trim().max(60).optional(),
});

const paymentReviewSchema = z.object({
  paymentId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "request-info"]),
  notes: z.string().trim().max(1000).optional(),
});

const flagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9._-]+$/, "Use lowercase letters, numbers, dots, dashes or underscores"),
  label: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  isEnabled: z.boolean(),
});

const tenantFlagSchema = z.object({
  tenantId: z.string().uuid(),
  flagKey: z.string().trim().min(2).max(60),
  isEnabled: z.boolean(),
});

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(3).max(4000),
  audience: z.enum(["all", "owners", "admins"]),
  publish: z.boolean(),
});

const supportUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "pending", "resolved"]),
});

export const checkPlatformAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isPlatformAdmin } = await import("@/lib/platform.server");
    return { allowed: await isPlatformAdmin(context.supabase, context.userId) };
  });

export const getPlatformSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadPlatformSnapshot();
  });

export const getPlatformTenants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tenantFiltersSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listPlatformTenants(data);
  });

export const getPlatformTenantDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ tenantId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadTenantDetail(data.tenantId);
  });

export const getPlatformSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listPlatformSubscriptions();
  });

export const getPlatformPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ status: z.string().trim().max(40).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listPlatformPayments(data);
  });

export const reviewPlatformPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => paymentReviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.reviewPayment({ ...data, actorId: context.userId });
  });

export const getPlatformAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        action: z.string().trim().max(80).optional(),
        tenantId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listPlatformAuditLogs(data);
  });

export const getFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listFeatureFlags();
  });

export const saveFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => flagSchema.parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    await platform.upsertFeatureFlag({ ...data, actorId: context.userId });
    return { ok: true };
  });

export const saveTenantFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tenantFlagSchema.parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    await platform.setTenantFeatureFlag({ ...data, actorId: context.userId });
    return { ok: true };
  });

export const getAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listAnnouncements();
  });

export const publishAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => announcementSchema.parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    await platform.createAnnouncement({ ...data, actorId: context.userId });
    return { ok: true };
  });

export const getSupportRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ status: z.string().trim().max(40).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.listSupportRequests(data.status);
  });

export const updateSupportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => supportUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    await platform.updateSupportRequest({ ...data, actorId: context.userId });
    return { ok: true };
  });

export const getDatabaseUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadDatabaseUsage();
  });

export const getStorageUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadStorageUsage();
  });

export const getAiUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadAiUsage();
  });

export const getPlatformNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const platform = await import("@/lib/platform.server");
    await platform.assertPlatformAdmin(context.supabase, context.userId);
    return platform.loadPlatformNotifications();
  });
