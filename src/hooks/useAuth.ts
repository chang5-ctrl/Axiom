import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/providers/AuthProvider";

/** Access session, tenant context and permissions. Must be used inside AuthProvider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** Convenience wrapper for permission checks in components. */
export function usePermission(permission: string): boolean {
  return useAuth().can(permission);
}

/** Active workspace helpers. */
export function useWorkspace() {
  const { workspace, membership, isLoading, error, refresh } = useAuth();
  return {
    tenant: workspace?.tenant ?? null,
    businessProfile: workspace?.businessProfile ?? null,
    subscription: workspace?.subscription ?? null,
    modules: workspace?.modules ?? [],
    roleKey: membership?.roleKey ?? null,
    isLoading,
    error,
    refresh,
  };
}
