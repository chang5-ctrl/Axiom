import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getPlatformSession } from "@/lib/platform-auth.functions";
import type { PlatformSession } from "@/types/platform-auth";

export interface PlatformAuthContextValue extends PlatformSession {
  isLoading: boolean;
  error: string | null;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const EMPTY: PlatformSession = { employee: null, role: null, permissions: [], isStaff: false };

export const PlatformAuthContext = createContext<PlatformAuthContextValue | null>(null);

/**
 * Resolves the signed-in platform employee, their role and their permission
 * set. Purely a rendering aid — every platform server function re-checks
 * permissions against the verified bearer token.
 */
export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<PlatformSession>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setSession(await getPlatformSession());
    } catch (cause) {
      setSession(EMPTY);
      setError(cause instanceof Error ? cause.message : "Unable to load platform session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setSession(EMPTY);
  }, [queryClient]);

  const value = useMemo<PlatformAuthContextValue>(() => {
    const permissions = session.permissions;
    return {
      ...session,
      isLoading,
      error,
      can: (permission: string) => permissions.includes(permission),
      canAny: (list: string[]) => list.some((permission) => permissions.includes(permission)),
      refresh: load,
      signOut,
    };
  }, [session, isLoading, error, load, signOut]);

  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>;
}
