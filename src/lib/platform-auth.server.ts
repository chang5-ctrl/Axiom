import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  PlatformEmployee,
  PlatformEmployeeStatus,
  PlatformLoginEvent,
  PlatformRole,
  PlatformRolePermissionMatrix,
  PlatformSession,
} from "@/types/platform-auth";

/**
 * Platform staff identity data layer.
 *
 * Runs with service-role privileges, so every exported entry point is only
 * reachable through a server function that has already resolved the caller's
 * verified user id and checked the relevant platform permission.
 */

type EmployeeRow = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  department: string | null;
  role_key: string;
  status: PlatformEmployeeStatus;
  is_seed: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
};

const EMPLOYEE_COLUMNS =
  "id, user_id, email, full_name, department, role_key, status, is_seed, must_change_password, last_login_at, created_at";

function mapEmployee(row: EmployeeRow, roleName: string): PlatformEmployee {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    department: row.department,
    roleKey: row.role_key,
    roleName,
    status: row.status,
    isSeed: row.is_seed,
    mustChangePassword: row.must_change_password,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

async function loadRoles(): Promise<PlatformRole[]> {
  const { data, error } = await supabaseAdmin
    .from("platform_roles")
    .select("key, name, description, level")
    .order("level", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function loadPermissionsForRole(roleKey: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("platform_role_permissions")
    .select("permission_key")
    .eq("role_key", roleKey);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.permission_key).sort();
}

/**
 * Resolve the platform identity of a verified auth user.
 *
 * Staff records may be provisioned before the account exists (invites and
 * development seeds). The first successful sign-in binds the record to the
 * verified auth user id — the email comes from the validated token, never from
 * client input.
 */
export async function resolvePlatformSession(
  userId: string,
  email: string | null,
): Promise<PlatformSession> {
  const empty: PlatformSession = { employee: null, role: null, permissions: [], isStaff: false };

  let { data: row, error } = await supabaseAdmin
    .from("platform_employees")
    .select(EMPLOYEE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (!row && email) {
    const { data: pending, error: pendingError } = await supabaseAdmin
      .from("platform_employees")
      .select(EMPLOYEE_COLUMNS)
      .ilike("email", email)
      .is("user_id", null)
      .maybeSingle();
    if (pendingError) throw new Error(pendingError.message);

    if (pending) {
      const { data: bound, error: bindError } = await supabaseAdmin
        .from("platform_employees")
        .update({ user_id: userId, status: pending.status === "invited" ? "active" : pending.status })
        .eq("id", pending.id)
        .select(EMPLOYEE_COLUMNS)
        .single();
      if (bindError) throw new Error(bindError.message);
      row = bound;
    }
  }

  if (!row) return empty;

  const roles = await loadRoles();
  const role = roles.find((item) => item.key === row!.role_key) ?? null;
  const permissions = row.status === "active" ? await loadPermissionsForRole(row.role_key) : [];

  return {
    employee: mapEmployee(row, role?.name ?? row.role_key),
    role,
    permissions,
    isStaff: row.status === "active",
  };
}

/** Throw unless the verified user is active staff holding `permission`. */
export async function requirePlatformPermission(userId: string, permission: string): Promise<PlatformSession> {
  const session = await resolvePlatformSession(userId, null);
  if (!session.isStaff) throw new Error("Forbidden: platform access required");
  if (!session.permissions.includes(permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
  return session;
}

/** Throw unless the verified user is active platform staff. */
export async function requirePlatformStaff(userId: string): Promise<PlatformSession> {
  const session = await resolvePlatformSession(userId, null);
  if (!session.isStaff) throw new Error("Forbidden: platform access required");
  return session;
}

export async function recordLoginEvent(input: {
  employeeId: string | null;
  userId: string | null;
  email: string | null;
  event: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await supabaseAdmin.from("platform_login_events").insert({
    employee_id: input.employeeId,
    user_id: input.userId,
    email: input.email,
    event: input.event,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  });
}

export async function touchLastLogin(employeeId: string): Promise<void> {
  await supabaseAdmin
    .from("platform_employees")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", employeeId);
}

export async function listEmployees(): Promise<PlatformEmployee[]> {
  const [roles, { data, error }] = await Promise.all([
    loadRoles(),
    supabaseAdmin
      .from("platform_employees")
      .select(EMPLOYEE_COLUMNS)
      .order("created_at", { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  const roleName = new Map(roles.map((role) => [role.key, role.name]));
  return (data ?? []).map((row) => mapEmployee(row, roleName.get(row.role_key) ?? row.role_key));
}

export async function loadRoleMatrix(): Promise<PlatformRolePermissionMatrix> {
  const [roles, permissionsResult, assignmentsResult] = await Promise.all([
    loadRoles(),
    supabaseAdmin
      .from("platform_permissions")
      .select("key, module, action, description")
      .order("module", { ascending: true }),
    supabaseAdmin.from("platform_role_permissions").select("role_key, permission_key"),
  ]);
  if (permissionsResult.error) throw new Error(permissionsResult.error.message);
  if (assignmentsResult.error) throw new Error(assignmentsResult.error.message);

  const assignments: Record<string, string[]> = {};
  for (const row of assignmentsResult.data ?? []) {
    (assignments[row.role_key] ??= []).push(row.permission_key);
  }

  return { roles, permissions: permissionsResult.data ?? [], assignments };
}

export async function inviteEmployee(input: {
  email: string;
  fullName: string;
  department: string | null;
  roleKey: string;
  temporaryPassword: string;
  invitedBy: string;
}): Promise<PlatformEmployee> {
  const email = input.email.trim().toLowerCase();

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.temporaryPassword,
    email_confirm: true,
    user_metadata: { platform_staff: true, full_name: input.fullName },
  });

  let userId = created?.user?.id ?? null;
  if (createError) {
    // Existing auth account: reuse it instead of failing the invite.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = list?.users.find((user) => user.email?.toLowerCase() === email)?.id ?? null;
    if (!userId) throw new Error(createError.message);
  }

  const { data, error } = await supabaseAdmin
    .from("platform_employees")
    .upsert(
      {
        email,
        full_name: input.fullName,
        department: input.department,
        role_key: input.roleKey,
        status: "active",
        user_id: userId,
        must_change_password: true,
        invited_by: input.invitedBy,
      },
      { onConflict: "email" },
    )
    .select(EMPLOYEE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  const roles = await loadRoles();
  return mapEmployee(data, roles.find((role) => role.key === data.role_key)?.name ?? data.role_key);
}

export async function updateEmployee(input: {
  employeeId: string;
  actorUserId: string;
  roleKey?: string | undefined;
  status?: PlatformEmployeeStatus | undefined;
  department?: string | null | undefined;
  fullName?: string | undefined;
}): Promise<PlatformEmployee> {
  const { data: target, error: targetError } = await supabaseAdmin
    .from("platform_employees")
    .select(EMPLOYEE_COLUMNS)
    .eq("id", input.employeeId)
    .maybeSingle();
  if (targetError) throw new Error(targetError.message);
  if (!target) throw new Error("Employee not found");

  // Nobody may re-role or suspend their own staff record.
  if (target.user_id && target.user_id === input.actorUserId) {
    throw new Error("You cannot change your own platform role or status");
  }

  const patch: {
    role_key?: string;
    status?: PlatformEmployeeStatus;
    department?: string | null;
    full_name?: string | null;
  } = {};
  if (input.roleKey !== undefined) patch.role_key = input.roleKey;
  if (input.status !== undefined) patch.status = input.status;
  if (input.department !== undefined) patch.department = input.department;
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (Object.keys(patch).length === 0) {
    const roles = await loadRoles();
    return mapEmployee(target, roles.find((r) => r.key === target.role_key)?.name ?? target.role_key);
  }

  const { data, error } = await supabaseAdmin
    .from("platform_employees")
    .update(patch)
    .eq("id", input.employeeId)
    .select(EMPLOYEE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  const roles = await loadRoles();
  return mapEmployee(data, roles.find((role) => role.key === data.role_key)?.name ?? data.role_key);
}

export async function resetEmployeePassword(input: {
  employeeId: string;
  temporaryPassword: string;
}): Promise<void> {
  const { data: employee, error } = await supabaseAdmin
    .from("platform_employees")
    .select("id, user_id")
    .eq("id", input.employeeId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!employee?.user_id) throw new Error("This staff member has not signed in yet");

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(employee.user_id, {
    password: input.temporaryPassword,
  });
  if (updateError) throw new Error(updateError.message);

  await supabaseAdmin
    .from("platform_employees")
    .update({ must_change_password: true })
    .eq("id", employee.id);
}

export async function clearMustChangePassword(userId: string): Promise<void> {
  await supabaseAdmin
    .from("platform_employees")
    .update({ must_change_password: false })
    .eq("user_id", userId);
}

export async function updateOwnEmployeeProfile(input: {
  userId: string;
  fullName: string;
  department: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("platform_employees")
    .update({ full_name: input.fullName, department: input.department })
    .eq("user_id", input.userId);
  if (error) throw new Error(error.message);
}

export async function listLoginHistory(limit = 50): Promise<PlatformLoginEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("platform_login_events")
    .select("id, employee_id, email, event, ip_address, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    email: row.email,
    event: row.event,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }));
}
