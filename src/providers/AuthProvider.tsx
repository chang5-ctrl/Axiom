import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";
import { tenantService, type TenantWorkspace } from "@/services/tenant.service";
import type { Profile, TenantMembership } from "@/types/core";

const ACTIVE_TENANT_KEY = "axiom.activeTenantId";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  memberships: TenantMembership[];
  membership: TenantMembership | null;
  workspace: TenantWorkspace | null;
  permissions: Set<string>;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  can: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  switchTenant: (tenantId: string) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredTenant(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_TENANT_KEY);
}

/**
 * Owns session, tenant context and permissions for the whole app.
 * Every tenant-scoped read downstream derives its tenant id from here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContext = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      setMemberships([]);
      setWorkspace(null);
      setActiveTenantId(null);
      setIsPlatformAdmin(false);
      setIsLoading(false);
      return;
    }

    const userId = currentSession.user.id;
    setIsLoading(true);
    setError(null);

    try {
      const [profileResponse, membershipList, admin] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        tenantService.listMemberships(userId),
        platformService.isPlatformAdmin(userId).catch(() => false),
      ]);

      setProfile(profileResponse.data ?? null);
      setMemberships(membershipList);
      setIsPlatformAdmin(admin);

      const stored = readStoredTenant();
      const selected =
        membershipList.find((item) => item.tenantId === stored) ?? membershipList[0] ?? null;

      if (!selected) {
        setActiveTenantId(null);
        setWorkspace(null);
        return;
      }

      setActiveTenantId(selected.tenantId);
      window.localStorage.setItem(ACTIVE_TENANT_KEY, selected.tenantId);
      setWorkspace(await tenantService.loadWorkspace(selected.tenantId, selected));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your workspace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void loadContext(nextSession);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void loadContext(data.session);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadContext]);

  const switchTenant = useCallback(
    (tenantId: string) => {
      const target = memberships.find((item) => item.tenantId === tenantId);
      if (!target) return;
      window.localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
      setActiveTenantId(tenantId);
      setIsLoading(true);
      tenantService
        .loadWorkspace(tenantId, target)
        .then(setWorkspace)
        .catch((switchError: unknown) =>
          setError(switchError instanceof Error ? switchError.message : "Unable to switch workspace"),
        )
        .finally(() => setIsLoading(false));
    },
    [memberships],
  );

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await loadContext(data.session);
  }, [loadContext]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    window.localStorage.removeItem(ACTIVE_TENANT_KEY);
  }, []);

  const membership = useMemo(
    () => memberships.find((item) => item.tenantId === activeTenantId) ?? null,
    [memberships, activeTenantId],
  );

  const permissions = useMemo(() => new Set(workspace?.permissions ?? []), [workspace]);

  const value = useMemo<AuthContextValue>(() => {
    const enabledModules = new Set(
      (workspace?.modules ?? []).filter((item) => item.enabled).map((item) => item.module_key),
    );

    return {
      session,
      user: session?.user ?? null,
      profile,
      memberships,
      membership,
      workspace,
      permissions,
      isPlatformAdmin,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      error,
      can: (permission: string) =>
        membership?.roleKey === "owner" || permissions.has(permission),
      hasRole: (...roles: string[]) => Boolean(membership && roles.includes(membership.roleKey)),
      isModuleEnabled: (moduleKey: string) => enabledModules.has(moduleKey),
      switchTenant,
      refresh,
      signOut,
    };
  }, [
    session,
    profile,
    memberships,
    membership,
    workspace,
    permissions,
    isPlatformAdmin,
    isLoading,
    error,
    switchTenant,
    refresh,
    signOut,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
