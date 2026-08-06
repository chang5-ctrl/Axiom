import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { authService } from '@/services/auth.service';
import { tenantService } from '@/services/tenant.service';
import type { TenantMembership, TenantWorkspace } from '@/services/tenant.service';

export interface AuthContextValue {
  user: { id: string; email?: string | undefined } | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  memberships: TenantMembership[];
  membership: TenantMembership | null;
  workspace: TenantWorkspace | null;
  can: (permission: string) => boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  profile: { fullName: string | null; email: string | null } | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [membership, setMembership] = useState<TenantMembership | null>(null);
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser ? { id: currentUser.id, email: currentUser.email } : null);

      if (currentUser) {
        const userMemberships = await tenantService.listMemberships(currentUser.id);
        setMemberships(userMemberships);

        const defaultMembership = userMemberships[0];
        if (defaultMembership) {
          setMembership(defaultMembership);
          setWorkspace(
            await tenantService.loadWorkspace(defaultMembership.tenantId, defaultMembership),
          );
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTenant = async (tenantId: string) => {
    const targetMembership = memberships.find((m) => m.tenantId === tenantId);
    if (!targetMembership) return;

    setMembership(targetMembership);
    setWorkspace(await tenantService.loadWorkspace(tenantId, targetMembership));
  };

  const can = (permission: string): boolean =>
    workspace?.permissions?.includes(permission) ?? false;

  const isModuleEnabled = (moduleKey: string): boolean =>
    workspace?.modules?.some((m) => m.module_key === moduleKey) ?? false;

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setMemberships([]);
    setMembership(null);
    setWorkspace(null);
    navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        error,
        memberships,
        membership,
        workspace,
        can,
        isModuleEnabled,
        switchTenant,
        refresh: load,
        logout,
        signOut: logout,
        profile: user ? { fullName: null, email: user.email ?? null } : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
