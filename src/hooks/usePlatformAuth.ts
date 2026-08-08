import { useContext } from "react";

import { PlatformAuthContext, type PlatformAuthContextValue } from "@/providers/PlatformAuthProvider";

/** Access the signed-in platform employee, role and permissions. */
export function usePlatformAuth(): PlatformAuthContextValue {
  const context = useContext(PlatformAuthContext);
  if (!context) throw new Error("usePlatformAuth must be used inside <PlatformAuthProvider>");
  return context;
}

/** Permission check for conditional platform UI. */
export function usePlatformPermission(permission: string): boolean {
  return usePlatformAuth().can(permission);
}
