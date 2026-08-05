import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth.service';
import { tenantService } from '@/services/tenant.service';
import { moduleService } from '@/services/module.service';
import type { TenantMembership, TenantWorkspace } from '@/services/tenant.service';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  memberships: TenantMembership[];
  membership: TenantMembership | null;
  workspace: TenantWorkspace | null;
  can: (permission: string) => boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [membership, setMembership] = useState<TenantMembership | null>(null);
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser);

        if (currentUser) {
          const userMemberships = await tenantService.listMemberships(currentUser.id);
          setMemberships(userMemberships);

          if (userMemberships.length > 0) {
            const defaultMembership = userMemberships[0];
            setMembership(defaultMembership);
            const ws = await tenantService.loadWorkspace(
              defaultMembership.tenantId,
              defaultMembership,
            );
            setWorkspace(ws);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const switchTenant = async (tenantId: string) => {
    const targetMembership = memberships.find((m) => m.tenantId === tenantId);
    if (!targetMembership) return;

    setMembership(targetMembership);
    const ws = await tenantService.loadWorkspace(tenantId, targetMembership);
    setWorkspace(ws);
  };

  const can = (permission: string): boolean => {
    return workspace?.permissions?.includes(permission) ?? false;
  };

  const isModuleEnabled = (moduleKey: string): boolean => {
    return workspace?.modules?.some((m) => m.module_key === moduleKey) ?? false;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setMembership(null);
    setWorkspace(null);
    navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        memberships,
        membership,
        workspace,
        can,
        isModuleEnabled,
        switchTenant,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
