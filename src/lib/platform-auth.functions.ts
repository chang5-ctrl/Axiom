import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Platform staff identity RPC surface.
 *
 * Thin wrappers only. Every handler resolves the caller from the verified
 * bearer token and checks a platform permission before loading the privileged
 * data layer.
 */

const inviteSchema = z.object({
  email: z.string().trim().email().max(180),
  fullName: z.string().trim().min(2).max(120),
  department: z.string().trim().max(80).optional(),
  roleKey: z.enum([
    "platform_owner",
    "super_admin",
    "operations_manager",
    "finance_admin",
    "support_engineer",
    "developer",
    "security_auditor",
  ]),
});

const updateSchema = z.object({
  employeeId: z.string().uuid(),
  roleKey: inviteSchema.shape.roleKey.optional(),
  status: z.enum(["invited", "active", "suspended"]).optional(),
  department: z.string().trim().max(80).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  department: z.string().trim().max(80).optional(),
});

function temporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `Ax-${body}!7`;
}

export const getPlatformSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resolvePlatformSession } = await import("@/lib/platform-auth.server");
    const email = typeof context.claims['email'] === "string" ? context.claims['email'] : null;
    return resolvePlatformSession(context.userId, email);
  });

/** Called once immediately after a successful platform sign-in. */
export const recordPlatformSignIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resolvePlatformSession, recordLoginEvent, touchLastLogin } = await import(
      "@/lib/platform-auth.server"
    );
    const { getRequest } = await import("@tanstack/react-start/server");

    const email = typeof context.claims['email'] === "string" ? context.claims['email'] : null;
    const session = await resolvePlatformSession(context.userId, email);

    const request = getRequest();
    const headers = request?.headers;

    await recordLoginEvent({
      employeeId: session.employee?.id ?? null,
      userId: context.userId,
      email,
      event: session.isStaff ? "platform.signin" : "platform.signin.denied",
      ipAddress: headers?.get("cf-connecting-ip") ?? headers?.get("x-forwarded-for") ?? null,
      userAgent: headers?.get("user-agent") ?? null,
    });

    if (session.employee && session.isStaff) await touchLastLogin(session.employee.id);
    return session;
  });

export const getPlatformEmployees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requirePlatformPermission, listEmployees } = await import("@/lib/platform-auth.server");
    await requirePlatformPermission(context.userId, "platform.employees.view");
    return listEmployees();
  });

export const getPlatformRoleMatrix = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requirePlatformStaff, loadRoleMatrix } = await import("@/lib/platform-auth.server");
    await requirePlatformStaff(context.userId);
    return loadRoleMatrix();
  });

export const getPlatformLoginHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requirePlatformStaff, listLoginHistory } = await import("@/lib/platform-auth.server");
    const session = await requirePlatformStaff(context.userId);
    const allowed =
      session.permissions.includes("platform.employees.view") ||
      session.permissions.includes("platform.security.view");
    if (!allowed) throw new Error("Forbidden: missing permission platform.security.view");
    return listLoginHistory(100);
  });

export const invitePlatformEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { requirePlatformPermission, inviteEmployee, recordLoginEvent } = await import(
      "@/lib/platform-auth.server"
    );
    await requirePlatformPermission(context.userId, "platform.employees.manage");

    const password = temporaryPassword();
    const employee = await inviteEmployee({
      email: data.email,
      fullName: data.fullName,
      department: data.department ?? null,
      roleKey: data.roleKey,
      temporaryPassword: password,
      invitedBy: context.userId,
    });

    await recordLoginEvent({
      employeeId: employee.id,
      userId: context.userId,
      email: employee.email,
      event: "platform.employee.invited",
    });

    return { employee, temporaryPassword: password };
  });

export const updatePlatformEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { requirePlatformPermission, updateEmployee, recordLoginEvent } = await import(
      "@/lib/platform-auth.server"
    );
    await requirePlatformPermission(context.userId, "platform.employees.manage");

    const employee = await updateEmployee({
      employeeId: data.employeeId,
      actorUserId: context.userId,
      roleKey: data.roleKey,
      status: data.status,
      department: data.department,
      fullName: data.fullName,
    });

    await recordLoginEvent({
      employeeId: employee.id,
      userId: context.userId,
      email: employee.email,
      event: "platform.employee.updated",
    });

    return employee;
  });

export const resetPlatformEmployeePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ employeeId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { requirePlatformPermission, resetEmployeePassword, recordLoginEvent } = await import(
      "@/lib/platform-auth.server"
    );
    await requirePlatformPermission(context.userId, "platform.employees.manage");

    const password = temporaryPassword();
    await resetEmployeePassword({ employeeId: data.employeeId, temporaryPassword: password });
    await recordLoginEvent({
      employeeId: data.employeeId,
      userId: context.userId,
      email: null,
      event: "platform.employee.password_reset",
    });
    return { temporaryPassword: password };
  });

/** Called after the employee changes their own password in the dashboard. */
export const confirmPlatformPasswordChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requirePlatformStaff, clearMustChangePassword, recordLoginEvent } = await import(
      "@/lib/platform-auth.server"
    );
    const session = await requirePlatformStaff(context.userId);
    await clearMustChangePassword(context.userId);
    await recordLoginEvent({
      employeeId: session.employee?.id ?? null,
      userId: context.userId,
      email: session.employee?.email ?? null,
      event: "platform.password.changed",
    });
    return { ok: true };
  });

export const updatePlatformProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { requirePlatformStaff, updateOwnEmployeeProfile, resolvePlatformSession } = await import(
      "@/lib/platform-auth.server"
    );
    await requirePlatformStaff(context.userId);
    await updateOwnEmployeeProfile({
      userId: context.userId,
      fullName: data.fullName,
      department: data.department ?? null,
    });
    return resolvePlatformSession(context.userId, null);
  });
